/**
 * Register an LTI platform (LMS) in the database.
 *
 * Usage:
 *   set -a; source .env.production.local; set +a; npx tsx scripts/register-platform.ts
 *
 * For Canvas:
 *   npx tsx scripts/register-platform.ts canvas
 *
 * For Savvas Realize (update URLs when provided):
 *   npx tsx scripts/register-platform.ts realize
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

interface Platform {
  name: string;
  issuer: string;
  clientId: string;
  authEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
}

// Known platform configurations
const PLATFORMS: Record<string, Platform> = {
  canvas: {
    name: "Canvas (Instructure)",
    issuer: "https://canvas.instructure.com",
    clientId: "REPLACE_WITH_DEVELOPER_KEY_ID",
    authEndpoint: "https://canvas.instructure.com/api/lti/authorize_redirect",
    tokenEndpoint: "https://canvas.instructure.com/login/oauth2/token",
    jwksUri: "https://canvas.instructure.com/api/lti/security/jwks",
  },
  realize: {
    name: "Savvas Realize",
    issuer: "https://realize.savvas.com",
    clientId: "REPLACE_WITH_REALIZE_CLIENT_ID",
    authEndpoint: "https://realize.savvas.com/api/lti/authorize",
    tokenEndpoint: "https://realize.savvas.com/api/lti/token",
    jwksUri: "https://realize.savvas.com/api/lti/jwks",
  },
  // For local testing with a tool like https://lti-ri.imsglobal.org
  "ims-reference": {
    name: "IMS Reference Implementation",
    issuer: "https://lti-ri.imsglobal.org",
    clientId: "REPLACE_WITH_CLIENT_ID",
    authEndpoint:
      "https://lti-ri.imsglobal.org/platforms/default/authorizations/new",
    tokenEndpoint:
      "https://lti-ri.imsglobal.org/platforms/default/access_tokens",
    jwksUri: "https://lti-ri.imsglobal.org/platforms/default/platform_keys.json",
  },
};

async function main() {
  const target = process.argv[2] || "canvas";
  const platform = PLATFORMS[target];

  if (!platform) {
    console.error(
      `Unknown platform: ${target}. Available: ${Object.keys(PLATFORMS).join(", ")}`
    );
    process.exit(1);
  }

  console.log(`Registering platform: ${platform.name}`);
  console.log(`  Issuer: ${platform.issuer}`);
  console.log(`  Client ID: ${platform.clientId}`);

  try {
    await sql`
      INSERT INTO lti_platforms (id, issuer, client_id, auth_endpoint, token_endpoint, jwks_uri, name, created_at)
      VALUES (gen_random_uuid(), ${platform.issuer}, ${platform.clientId}, ${platform.authEndpoint}, ${platform.tokenEndpoint}, ${platform.jwksUri}, ${platform.name}, now())
      ON CONFLICT (issuer) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        auth_endpoint = EXCLUDED.auth_endpoint,
        token_endpoint = EXCLUDED.token_endpoint,
        jwks_uri = EXCLUDED.jwks_uri,
        name = EXCLUDED.name
    `;
    console.log("Done! Platform registered.");
  } catch (err) {
    console.error("Failed to register platform:", err);
    process.exit(1);
  }
}

main();
