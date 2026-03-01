import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// -- LTI Platforms (registered LMS instances) --

export const ltiPlatforms = pgTable("lti_platforms", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Platform issuer URL (e.g., https://canvas.instructure.com) */
  issuer: text("issuer").notNull().unique(),
  /** OAuth2 client ID assigned by the platform */
  clientId: text("client_id").notNull(),
  /** Platform's OIDC auth endpoint */
  authEndpoint: text("auth_endpoint").notNull(),
  /** Platform's token endpoint (for AGS grade passback) */
  tokenEndpoint: text("token_endpoint").notNull(),
  /** Platform's JWKS URI for verifying id_tokens */
  jwksUri: text("jwks_uri").notNull(),
  /** Human-readable name (e.g., "Springfield USD Canvas") */
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -- Students --

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** LTI subject claim -- unique per platform */
    ltiSub: text("lti_sub").notNull(),
    /** Platform this student belongs to */
    platformId: uuid("platform_id")
      .references(() => ltiPlatforms.id)
      .notNull(),
    /** Display name from LTI claims */
    name: text("name").notNull(),
    /** Email from LTI claims (may be absent) */
    email: text("email"),
    /** Current Lexile level */
    currentLexile: integer("current_lexile").default(700),
    /** IR difficulty level: L1 (hardest), L2 (default), L3 (easiest) */
    irLevel: text("ir_level").default("L2"),
    /** Cumulative reading stats */
    totalWords: integer("total_words").default(0),
    totalPages: integer("total_pages").default(0),
    totalBooks: integer("total_books").default(0),
    /** Passage completion IDs */
    completedPassages: jsonb("completed_passages").$type<string[]>().default([]),
    /** Book progress: bookId -> last page read */
    bookProgress: jsonb("book_progress")
      .$type<Record<string, number>>()
      .default({}),
    /** Full student data blob (synced from client localStorage) */
    data: jsonb("data").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("students_platform_sub_idx").on(table.platformId, table.ltiSub),
  ]
);

// -- LTI Sessions --

export const ltiSessions = pgTable("lti_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Opaque session token stored in HTTP-only cookie */
  token: text("token").notNull().unique(),
  studentId: uuid("student_id")
    .references(() => students.id)
    .notNull(),
  platformId: uuid("platform_id")
    .references(() => ltiPlatforms.id)
    .notNull(),
  /** LTI resource link ID -- which assignment/activity was launched */
  resourceLinkId: text("resource_link_id"),
  /** AGS lineitem URL for grade passback (if provided) */
  agsLineitemUrl: text("ags_lineitem_url"),
  /** AGS access token scope URLs */
  agsScopes: jsonb("ags_scopes").$type<string[]>(),
  /** Full LTI launch claims (for reference) */
  launchClaims: jsonb("launch_claims").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// -- OIDC Nonces (replay protection) --

export const oidcNonces = pgTable("oidc_nonces", {
  id: uuid("id").defaultRandom().primaryKey(),
  nonce: text("nonce").notNull().unique(),
  state: text("state").notNull().unique(),
  /** Where to redirect after successful launch */
  targetLinkUri: text("target_link_uri"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
