import * as jose from "jose";

/**
 * Verify an LTI 1.3 id_token JWT.
 *
 * 1. Fetches the platform's JWKS from their published endpoint
 * 2. Verifies signature, expiration, audience, issuer
 * 3. Returns the decoded payload with LTI claims
 */
export async function verifyLtiToken(
  idToken: string,
  jwksUri: string,
  expectedIssuer: string,
  expectedClientId: string
): Promise<jose.JWTPayload & LtiClaims> {
  const jwks = jose.createRemoteJWKSet(new URL(jwksUri));

  const { payload } = await jose.jwtVerify(idToken, jwks, {
    issuer: expectedIssuer,
    audience: expectedClientId,
    clockTolerance: 30, // 30s clock skew tolerance
  });

  // Validate required LTI 1.3 claims
  const messageType =
    payload["https://purl.imsglobal.org/spec/lti/claim/message_type"];
  const validTypes = ["LtiResourceLinkRequest", "LtiDeepLinkingRequest"];
  if (!validTypes.includes(messageType as string)) {
    throw new Error(`Unsupported LTI message type: ${messageType}`);
  }

  const version =
    payload["https://purl.imsglobal.org/spec/lti/claim/version"];
  if (version !== "1.3.0") {
    throw new Error(`Unsupported LTI version: ${version}`);
  }

  return payload as jose.JWTPayload & LtiClaims;
}

/** Generate a signed JWT for AGS grade passback requests */
export async function createServiceToken(
  clientId: string,
  tokenEndpoint: string,
  scopes: string[]
): Promise<string> {
  // For AGS, we need to use client_credentials grant with a JWT assertion
  // The private key should be stored securely
  const privateKeyPem = process.env.LTI_PRIVATE_KEY;
  if (!privateKeyPem) {
    throw new Error("LTI_PRIVATE_KEY environment variable is required for grade passback");
  }

  const privateKey = await jose.importPKCS8(privateKeyPem, "RS256");

  const jwt = await new jose.SignJWT({
    scopes: scopes.join(" "),
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setSubject(clientId)
    .setIssuer(clientId)
    .setAudience(tokenEndpoint)
    .setIssuedAt()
    .setExpirationTime("5m")
    .setJti(crypto.randomUUID())
    .sign(privateKey);

  // Exchange JWT for access token
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: jwt,
      scope: scopes.join(" "),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token endpoint returned ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

// -- LTI Claim Types --

export interface LtiClaims {
  sub: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  "https://purl.imsglobal.org/spec/lti/claim/message_type": string;
  "https://purl.imsglobal.org/spec/lti/claim/version": string;
  "https://purl.imsglobal.org/spec/lti/claim/deployment_id": string;
  "https://purl.imsglobal.org/spec/lti/claim/target_link_uri"?: string;
  "https://purl.imsglobal.org/spec/lti/claim/resource_link"?: {
    id: string;
    title?: string;
  };
  "https://purl.imsglobal.org/spec/lti/claim/roles"?: string[];
  "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"?: {
    scope: string[];
    lineitems?: string;
    lineitem?: string;
  };
  "https://purl.imsglobal.org/spec/lti/claim/context"?: {
    id: string;
    label?: string;
    title?: string;
  };
}
