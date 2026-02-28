import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { ltiSessions, students } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

const SESSION_COOKIE = "ilit_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

/** Create a new session after successful LTI launch */
export async function createSession(opts: {
  studentId: string;
  platformId: string;
  resourceLinkId?: string;
  agsLineitemUrl?: string;
  agsScopes?: string[];
  launchClaims?: Record<string, unknown>;
}): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(ltiSessions).values({
    token,
    studentId: opts.studentId,
    platformId: opts.platformId,
    resourceLinkId: opts.resourceLinkId,
    agsLineitemUrl: opts.agsLineitemUrl,
    agsScopes: opts.agsScopes,
    launchClaims: opts.launchClaims,
    expiresAt,
  });

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // Required for LTI iframe embedding
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return token;
}

/** Get the current student from session cookie. Returns null if no valid session. */
export async function getSessionStudent() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      session: ltiSessions,
      student: students,
    })
    .from(ltiSessions)
    .innerJoin(students, eq(ltiSessions.studentId, students.id))
    .where(
      and(eq(ltiSessions.token, token), gt(ltiSessions.expiresAt, new Date()))
    )
    .limit(1);

  if (rows.length === 0) return null;

  return {
    student: rows[0].student,
    session: rows[0].session,
  };
}

/** Destroy the current session */
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;

  await db.delete(ltiSessions).where(eq(ltiSessions.token, token));
  cookieStore.delete(SESSION_COOKIE);
}
