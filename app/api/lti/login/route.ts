import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ltiPlatforms, oidcNonces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * LTI 1.3 OIDC Login Initiation (Step 1)
 *
 * The platform (Canvas, Schoology, etc.) redirects here first.
 * We validate the request, generate a nonce + state, then redirect
 * back to the platform's auth endpoint so it can issue an id_token.
 */
export async function POST(request: NextRequest) {
  const body = await request.formData();

  const iss = body.get("iss") as string | null;
  const loginHint = body.get("login_hint") as string | null;
  const targetLinkUri = body.get("target_link_uri") as string | null;
  const ltiMessageHint = body.get("lti_message_hint") as string | null;

  if (!iss || !loginHint) {
    return NextResponse.json(
      { error: "Missing required parameters: iss, login_hint" },
      { status: 400 }
    );
  }

  // Look up the platform by issuer
  const [platform] = await db
    .select()
    .from(ltiPlatforms)
    .where(eq(ltiPlatforms.issuer, iss))
    .limit(1);

  if (!platform) {
    return NextResponse.json(
      { error: `Unknown platform issuer: ${iss}` },
      { status: 403 }
    );
  }

  // Generate nonce and state for OIDC flow
  const nonce = crypto.randomUUID();
  const state = crypto.randomUUID();

  // Store nonce for validation in the launch callback
  await db.insert(oidcNonces).values({
    nonce,
    state,
    targetLinkUri,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min TTL
  });

  // Build the auth request URL
  const redirectUri = new URL("/api/lti/launch", request.url).toString();
  const authParams = new URLSearchParams({
    scope: "openid",
    response_type: "id_token",
    client_id: platform.clientId,
    redirect_uri: redirectUri,
    login_hint: loginHint,
    state,
    response_mode: "form_post",
    nonce,
    prompt: "none",
  });

  if (ltiMessageHint) {
    authParams.set("lti_message_hint", ltiMessageHint);
  }

  const authUrl = `${platform.authEndpoint}?${authParams.toString()}`;
  return NextResponse.redirect(authUrl);
}

/** Some platforms use GET for login initiation */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const formData = new FormData();
  url.searchParams.forEach((value, key) => formData.set(key, value));

  const newRequest = new NextRequest(request.url, {
    method: "POST",
    body: formData,
  });
  return POST(newRequest);
}
