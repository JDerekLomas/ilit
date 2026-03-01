import { NextRequest, NextResponse } from "next/server";
import { getSessionStudent } from "@/lib/lti/session";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/student/data — Load student data from Postgres
 * Requires valid LTI session cookie.
 */
export async function GET() {
  const sessionData = await getSessionStudent();
  if (!sessionData) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { student } = sessionData;

  // Return the full data blob if it exists, otherwise return null
  // so the client knows to use localStorage defaults
  return NextResponse.json({
    data: student.data ?? null,
    studentName: student.name,
    currentLexile: student.currentLexile,
    irLevel: student.irLevel,
    totalWords: student.totalWords,
    totalPages: student.totalPages,
    totalBooks: student.totalBooks,
  });
}

/**
 * PUT /api/student/data — Save student data to Postgres
 * Requires valid LTI session cookie.
 * Accepts full StudentData blob in request body.
 */
export async function PUT(request: NextRequest) {
  const sessionData = await getSessionStudent();
  if (!sessionData) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { student } = sessionData;
  const body = await request.json();

  // Extract top-level progress fields for the indexed columns
  const progress = body.progress;

  await db
    .update(students)
    .set({
      data: body as Record<string, unknown>,
      currentLexile: progress?.currentLexile ?? student.currentLexile,
      irLevel: progress?.irLevel ?? student.irLevel,
      totalWords: progress?.totalWords ?? student.totalWords,
      totalPages: progress?.totalPages ?? student.totalPages,
      totalBooks: progress?.totalBooks ?? student.totalBooks,
      completedPassages: progress?.completedPassages ?? student.completedPassages,
      bookProgress: progress?.bookProgress ?? student.bookProgress,
      updatedAt: new Date(),
    })
    .where(eq(students.id, student.id));

  return NextResponse.json({ ok: true });
}
