import { NextRequest, NextResponse } from "next/server";
import { getSessionStudent } from "@/lib/lti/session";
import { createServiceToken } from "@/lib/lti/jwt";
import { db } from "@/lib/db";
import { ltiPlatforms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * LTI AGS Grade Passback
 *
 * POST /api/lti/grades
 * Body: { score, maxScore, comment?, activityProgress, gradingProgress }
 *
 * Sends a score back to the LMS for the current student's launch context.
 */
export async function POST(request: NextRequest) {
  const sessionData = await getSessionStudent();
  if (!sessionData) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { student, session } = sessionData;

  if (!session.agsLineitemUrl) {
    return NextResponse.json(
      { error: "No AGS lineitem URL -- grade passback not available for this launch" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const {
    score,
    maxScore,
    comment,
    activityProgress = "Completed",
    gradingProgress = "FullyGraded",
  } = body as {
    score: number;
    maxScore: number;
    comment?: string;
    activityProgress?: string;
    gradingProgress?: string;
  };

  if (typeof score !== "number" || typeof maxScore !== "number") {
    return NextResponse.json(
      { error: "score and maxScore are required numbers" },
      { status: 400 }
    );
  }

  // Look up platform for token endpoint
  const [platform] = await db
    .select()
    .from(ltiPlatforms)
    .where(eq(ltiPlatforms.id, session.platformId))
    .limit(1);

  if (!platform) {
    return NextResponse.json(
      { error: "Platform not found" },
      { status: 500 }
    );
  }

  // Get an access token for AGS
  const scopes = session.agsScopes || [
    "https://purl.imsglobal.org/spec/lti-ags/scope/score",
  ];

  let accessToken: string;
  try {
    accessToken = await createServiceToken(
      platform.clientId,
      platform.tokenEndpoint,
      scopes
    );
  } catch (err) {
    console.error("Failed to get AGS access token:", err);
    return NextResponse.json(
      { error: "Failed to authenticate with platform for grade passback" },
      { status: 502 }
    );
  }

  // POST score to the lineitem's scores endpoint
  const scoreUrl = session.agsLineitemUrl.replace(/\/$/, "") + "/scores";
  const scorePayload = {
    userId: student.ltiSub,
    scoreGiven: score,
    scoreMaximum: maxScore,
    comment,
    activityProgress,
    gradingProgress,
    timestamp: new Date().toISOString(),
  };

  const agsResponse = await fetch(scoreUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/vnd.ims.lis.v1.score+json",
    },
    body: JSON.stringify(scorePayload),
  });

  if (!agsResponse.ok) {
    const errText = await agsResponse.text();
    console.error(`AGS score POST failed (${agsResponse.status}):`, errText);
    return NextResponse.json(
      { error: "Grade passback failed", details: errText },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, score, maxScore });
}
