import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { db } from "@/lib/db";
import { ltiPlatforms, oidcNonces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

/**
 * LTI 1.3 Deep Linking Response
 *
 * POST /api/lti/deeplink
 *
 * When a teacher configures an assignment in the LMS, they launch this
 * endpoint to browse and select I-LIT content. We return the selected
 * content items as an LTI Deep Linking Response JWT.
 */

interface ContentItem {
  type: string;
  title: string;
  url: string;
  lineItem?: { scoreMaximum: number; label: string };
}

/** List all available content for deep linking selection */
function getAvailableContent(baseUrl: string): ContentItem[] {
  const items: ContentItem[] = [];

  // Passages (Interactive Reading) — scored activities
  const passagesDir = path.join(process.cwd(), "content/passages");
  if (fs.existsSync(passagesDir)) {
    const files = fs.readdirSync(passagesDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(passagesDir, file), "utf-8"));
        items.push({
          type: "ltiResourceLink",
          title: `Interactive Reading: ${data.title}`,
          url: `${baseUrl}/interactive/${data.id}`,
          lineItem: {
            scoreMaximum: 100,
            label: `Interactive Reading: ${data.title}`,
          },
        });
      } catch {
        // skip malformed files
      }
    }
  }

  // Authored books (Digital Library) — not scored
  const booksDir = path.join(process.cwd(), "content/books");
  if (fs.existsSync(booksDir)) {
    const files = fs
      .readdirSync(booksDir)
      .filter((f) => f.endsWith(".json") && f !== "catalog.json");
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(booksDir, file), "utf-8"));
        items.push({
          type: "ltiResourceLink",
          title: `Library: ${data.title}`,
          url: `${baseUrl}/reader/${data.id}`,
        });
      } catch {
        // skip malformed files
      }
    }
  }

  // Dashboard landing (general assignment)
  items.push({
    type: "ltiResourceLink",
    title: "I-LIT Dashboard",
    url: `${baseUrl}/dashboard/assignments`,
  });

  return items;
}

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

  // Validate state
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

  // Delete nonce (single-use)
  await db.delete(oidcNonces).where(eq(oidcNonces.id, nonceRow.id));

  // Decode JWT to get issuer
  let payload: Record<string, unknown>;
  try {
    const parts = idToken.split(".");
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    return NextResponse.json(
      { error: "Malformed id_token" },
      { status: 400 }
    );
  }

  const issuer = payload.iss as string;
  const [platform] = await db
    .select()
    .from(ltiPlatforms)
    .where(eq(ltiPlatforms.issuer, issuer))
    .limit(1);

  if (!platform) {
    return NextResponse.json(
      { error: `Unknown platform: ${issuer}` },
      { status: 403 }
    );
  }

  // Build the Deep Linking response
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    new URL("/", request.url).origin;

  const contentItems = getAvailableContent(baseUrl);

  // Get the deep linking settings from the launch claims
  const dlSettings =
    payload[
      "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"
    ] as {
      deep_link_return_url: string;
      accept_types: string[];
      accept_multiple?: boolean;
      data?: string;
    } | undefined;

  if (!dlSettings?.deep_link_return_url) {
    // If no deep linking settings, return JSON list of content items
    return NextResponse.json({ items: contentItems });
  }

  // Sign the response JWT
  const privateKeyPem = process.env.LTI_PRIVATE_KEY;
  if (!privateKeyPem) {
    return NextResponse.json(
      { error: "LTI_PRIVATE_KEY not configured" },
      { status: 500 }
    );
  }

  const privateKey = await jose.importPKCS8(privateKeyPem, "RS256");

  const responseJwt = await new jose.SignJWT({
    "https://purl.imsglobal.org/spec/lti/claim/message_type":
      "LtiDeepLinkingResponse",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    "https://purl.imsglobal.org/spec/lti-dl/claim/content_items":
      contentItems,
    "https://purl.imsglobal.org/spec/lti-dl/claim/data": dlSettings.data,
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id":
      payload[
        "https://purl.imsglobal.org/spec/lti/claim/deployment_id"
      ] as string,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(platform.clientId)
    .setAudience(issuer)
    .setIssuedAt()
    .setExpirationTime("5m")
    .setSubject(payload.sub as string)
    .setJti(crypto.randomUUID())
    .sign(privateKey);

  // Return an auto-submitting form that POSTs back to the platform
  const html = `<!DOCTYPE html>
<html><body>
<form id="dl" method="POST" action="${dlSettings.deep_link_return_url}">
<input type="hidden" name="JWT" value="${responseJwt}" />
</form>
<script>document.getElementById('dl').submit();</script>
</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
