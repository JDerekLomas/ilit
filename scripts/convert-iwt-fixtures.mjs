#!/usr/bin/env node
/**
 * Convert IWT fixture files (Savvas CMS export format) into our Passage JSON schema.
 *
 * Input:  content/iwt-fixtures/<id>.json (Savvas IWT format)
 * Output: content/passages/<slug>.json   (our Passage schema)
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Helpers ──

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u2014/g, "—")
    .replace(/\u2013/g, "–")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")  // collapse 3+ newlines to 2
    .replace(/^\n+|\n+$/g, "")   // trim leading/trailing newlines
    .trim();
}

function stripHtmlInline(html) {
  // Like stripHtml but preserve single line (no newlines)
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/ +/g, " ")
    .trim();
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Split text into sentences. Handles quotes properly. */
function splitSentences(text) {
  // Flatten to single line for splitting
  const flat = text.replace(/\n+/g, " ").replace(/ +/g, " ").trim();
  // Split on sentence-ending punctuation, allowing trailing quotes/parens
  const raw = flat.match(/[^.!?]*[.!?]+["'\u201d\u2019)]*(?:\s|$)/g) || [];
  const result = raw.map((s) => s.trim()).filter(Boolean);
  // If nothing matched, return the whole text as one sentence
  return result.length > 0 ? result : [flat];
}

/** Extract heading from interactive_text (bold text at start) */
function extractHeading(html) {
  const match = html.match(/<strong>([^<]+)<\/strong>/);
  if (match) return match[1].trim();
  return null;
}

/** Extract just the question/skill from the question HTML */
function extractPromptParts(questionHtml) {
  const text = stripHtml(questionHtml);
  // Extract skill name (usually bold, first line)
  const lines = text.split("\n").filter(Boolean);
  let skill = "";
  let prompt = "";

  if (lines.length >= 2) {
    skill = lines[0].trim();
    prompt = lines.slice(1).join(" ").trim();
  } else if (lines.length === 1) {
    prompt = lines[0].trim();
  }
  return { skill, prompt };
}

// ── Conversion ──

function convertFixture(fixture) {
  const slug = slugify(fixture.title);
  const passage = {
    id: slug,
    title: fixture.title,
    author: "I-LIT Staff",
    lexileLevel: levelToLexile(fixture.level),
    backgroundImage: `/images/passages/${slug}-bg.jpg`,
    slides: [],
  };

  for (const slide of fixture.slides) {
    if (slide.type === "highlight") {
      // Highlight slides have interactive_text (the reading) + question + highlightAnswers
      const heading = extractHeading(slide.interactive_text) || slide.slide_title;
      const plainText = stripHtml(slide.interactive_text);
      // Remove heading from text if it's the first line
      const headingClean = heading ? heading.trim() : "";
      let bodyText = plainText;
      if (headingClean && bodyText.startsWith(headingClean)) {
        bodyText = bodyText.slice(headingClean.length).trim();
      }

      const sentences = splitSentences(bodyText);
      const { skill, prompt } = extractPromptParts(slide.question);

      // Get correct answers
      const correctAnswers = (slide.highlightAnswers || []).map((a) =>
        stripHtmlInline(a.text)
      );

      // Build checkpoint slide (combines reading + checkpoint)
      const checkpointSlide = {
        type: "checkpoint",
        checkpoint: {
          type: "highlight",
          skill: skill || "Comprehension",
          prompt,
          correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : correctAnswers,
          feedback: {
            correct: stripHtml(slide.pass_text),
            incorrect: stripHtml(slide.fail_text),
            incorrectFinal: stripHtml(slide.fail_again_text) || undefined,
          },
        },
        sentences,
      };

      // If there's a heading, add a reading slide before the checkpoint
      if (headingClean) {
        // We include the reading text as a reading slide, then the checkpoint
        passage.slides.push({
          type: "reading",
          heading: headingClean,
          text: bodyText,
        });
      }

      passage.slides.push(checkpointSlide);
    } else if (slide.type === "text-answer") {
      const hasQuestion = slide.question && stripHtml(slide.question).length > 0;
      const hasStaticText = slide.static_text && stripHtml(slide.static_text).length > 0;

      if (!hasQuestion && hasStaticText) {
        // Pure reading slide
        const heading = extractHeading(slide.static_text) || null;
        let bodyText = stripHtml(slide.static_text);
        if (heading && bodyText.startsWith(heading)) {
          bodyText = bodyText.slice(heading.length).trim();
        }
        passage.slides.push({
          type: "reading",
          heading: heading || undefined,
          text: bodyText,
        });
      } else if (hasQuestion && !hasStaticText) {
        // Summary/critical thinking question (no text to read, just a question)
        const { skill, prompt } = extractPromptParts(slide.question);
        passage.slides.push({
          type: "summary",
          summaryPrompt: prompt || stripHtml(slide.question),
          expectedKeyConcepts: [],
        });
      } else if (hasQuestion && hasStaticText) {
        // Reading + question combo — add reading slide then summary
        const heading = extractHeading(slide.static_text) || null;
        let bodyText = stripHtml(slide.static_text);
        if (heading && bodyText.startsWith(heading)) {
          bodyText = bodyText.slice(heading.length).trim();
        }
        passage.slides.push({
          type: "reading",
          heading: heading || undefined,
          text: bodyText,
        });
        passage.slides.push({
          type: "summary",
          summaryPrompt: stripHtml(slide.question),
          expectedKeyConcepts: [],
        });
      }
    } else if (slide.type === "drag-and-drop") {
      // Drag-and-drop — interactive_text is the reading, no explicit question in this fixture
      const heading = extractHeading(slide.interactive_text) || slide.slide_title;
      const plainText = stripHtml(slide.interactive_text);
      let bodyText = plainText;
      const headingClean = heading ? heading.trim() : "";
      if (headingClean && bodyText.startsWith(headingClean)) {
        bodyText = bodyText.slice(headingClean.length).trim();
      }

      // Add reading slide for the text
      passage.slides.push({
        type: "reading",
        heading: headingClean || undefined,
        text: bodyText,
      });

      // The drag-and-drop in this fixture doesn't have explicit options/template,
      // so we convert it to a highlight-style checkpoint using the fail_again_text hint
      // Actually, looking at the data more carefully, this is missing drag-drop data.
      // We'll just include the reading slide since the checkpoint data is incomplete.
    }
  }

  // Clean up undefined fields
  passage.slides = passage.slides.map((s) => {
    const clean = {};
    for (const [k, v] of Object.entries(s)) {
      if (v !== undefined) clean[k] = v;
    }
    if (clean.checkpoint) {
      const cf = {};
      for (const [k, v] of Object.entries(clean.checkpoint.feedback || {})) {
        if (v !== undefined) cf[k] = v;
      }
      clean.checkpoint = { ...clean.checkpoint, feedback: cf };
    }
    return clean;
  });

  return passage;
}

function levelToLexile(level) {
  // IWT levels: 1 = easiest (lower lexile), 2 = mid, 3 = harder
  const map = { 1: 400, 2: 600, 3: 800 };
  return map[level] || 500;
}

// ── Main ──

const index = JSON.parse(
  readFileSync(join(ROOT, "content/iwt-fixtures/index.json"), "utf-8")
);

const results = [];

for (const entry of index) {
  const fixturePath = join(
    ROOT,
    "content/iwt-fixtures",
    `${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`
  );

  let fixture;
  try {
    fixture = JSON.parse(readFileSync(fixturePath, "utf-8"));
  } catch {
    console.warn(`Skipping ${entry.title} — file not found at ${fixturePath}`);
    continue;
  }

  const passage = convertFixture(fixture);
  const outPath = join(ROOT, "content/passages", `${passage.id}.json`);
  writeFileSync(outPath, JSON.stringify(passage, null, 2) + "\n");
  results.push({ slug: passage.id, title: passage.title, slides: passage.slides.length });
  console.log(`Converted: ${passage.title} → ${passage.id}.json (${passage.slides.length} slides)`);
}

console.log(`\nDone: ${results.length} passages converted.`);
