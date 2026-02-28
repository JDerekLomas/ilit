import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ltiPlatforms, students, oidcNonces } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyLtiToken } from "@/lib/lti/jwt";
import { createSession } from "@/lib/lti/session";

/**
 * LTI 1.3 Launch Callback (Step 3)
 *
 * The platform POSTs back with an id_token (JWT) after the student
 * authenticates. We verify the JWT, upsert the student, create a
 * session, and redirect into the app.
 */
export async function POST(request: NextRequest) {
  const body = await request.formData();

  const idToken = body.get("id_token") as string | null;
  const state = body.get("state") as string | null;

  if (!idToken || !state) {
    return NextResponse.json(
      { error: "Missing id_token or state" },
      { status: 400 }
    );
  }

  // -- Validate state + consume nonce --

  const [nonceRow] = await db
    .select()
    .from(oidcNonces)
    .where(eq(oidcNonces.state, state))
    .limit(1);

  if (!nonceRow || nonceRow.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired state" },
      { status: 403 }
    );
  }

  // Delete nonce immediately (single-use)
  await db.delete(oidcNonces).where(eq(oidcNonces.id, nonceRow.id));

  // -- Decode JWT header to get issuer for platform lookup --

  let issuer: string;
  try {
    const parts = idToken.split(".");
    const payloadRaw = JSON.parse(
      Buffer.from(parts[1], "base64url").toString()
    );
    issuer = payloadRaw.iss;
  } catch {
    return NextResponse.json(
      { error: "Malformed id_token" },
      { status: 400 }
    );
  }

  const [platform] = await db
    .select()
    .from(ltiPlatforms)
    .where(eq(ltiPlatforms.issuer, issuer))
    .limit(1);

  if (!platform) {
    return NextResponse.json(
      { error: `Unknown platform issuer: ${issuer}` },
      { status: 403 }
    );
  }

  // -- Verify JWT signature + claims --

  let claims;
  try {
    claims = await verifyLtiToken(
      idToken,
      platform.jwksUri,
      platform.issuer,
      platform.clientId
    );
  } catch (err) {
    console.error("LTI JWT verification failed:", err);
    return NextResponse.json(
      { error: "JWT verification failed" },
      { status: 403 }
    );
  }

  // Verify nonce matches
  if (claims.nonce !== nonceRow.nonce) {
    return NextResponse.json(
      { error: "Nonce mismatch" },
      { status: 403 }
    );
  }

  // -- Upsert student --

  const displayName =
    claims.name ||
    [claims.given_name, claims.family_name].filter(Boolean).join(" ") ||
    "Student";

  const [existing] = await db
    .select()
    .from(students)
    .where(
      and(
        eq(students.platformId, platform.id),
        eq(students.ltiSub, claims.sub)
      )
    )
    .limit(1);

  let studentId: string;

  if (existing) {
    await db
      .update(students)
      .set({
        name: displayName,
        email: claims.email || existing.email,
        updatedAt: new Date(),
      })
      .where(eq(students.id, existing.id));
    studentId = existing.id;
  } else {
    const [newStudent] = await db
      .insert(students)
      .values({
        ltiSub: claims.sub,
        platformId: platform.id,
        name: displayName,
        email: claims.email,
      })
      .returning({ id: students.id });
    studentId = newStudent.id;
  }

  // -- Extract AGS endpoint info --

  const agsEndpoint =
    claims["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"];
  const resourceLink =
    claims["https://purl.imsglobal.org/spec/lti/claim/resource_link"];

  // -- Create session --

  await createSession({
    studentId,
    platformId: platform.id,
    resourceLinkId: resourceLink?.id,
    agsLineitemUrl: agsEndpoint?.lineitem,
    agsScopes: agsEndpoint?.scope,
    launchClaims: claims as unknown as Record<string, unknown>,
  });

  // -- Redirect to the app --

  const targetUri =
    nonceRow.targetLinkUri ||
    claims["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"];

  let redirectPath = "/dashboard/assignments";

  if (targetUri) {
    try {
      const targetUrl = new URL(targetUri);
      redirectPath = targetUrl.pathname;
    } catch {
      redirectPath = targetUri;
    }
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
