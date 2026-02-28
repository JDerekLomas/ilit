/**
 * Validates all content JSON files against expected structure.
 * Run with: npx tsx scripts/validate-content.ts
 */

import fs from "fs";
import path from "path";
import type { Passage, Book, VocabularyWord } from "../lib/types";

let errors: string[] = [];
let warnings: string[] = [];

function err(msg: string) { errors.push(msg); }
function warn(msg: string) { warnings.push(msg); }

// ── Validate Passages ──
const passageDir = path.join(__dirname, "../content/passages");
const passageFiles = fs.readdirSync(passageDir).filter(f => f.endsWith(".json"));

for (const file of passageFiles) {
  const p: Passage = JSON.parse(fs.readFileSync(path.join(passageDir, file), "utf8"));
  const label = `passage/${file}`;

  if (!p.id) err(`${label}: missing id`);
  if (!p.title) err(`${label}: missing title`);
  if (!p.slides || p.slides.length === 0) err(`${label}: no slides`);

  let wordCount = 0;
  const allReadingText: string[] = [];

  for (let i = 0; i < p.slides.length; i++) {
    const s = p.slides[i];
    const slabel = `${label} slide[${i}]`;

    if (!["reading", "checkpoint", "summary"].includes(s.type)) {
      err(`${slabel}: invalid type "${s.type}"`);
    }

    if (s.type === "reading" && s.text) {
      wordCount += s.text.split(/\s+/).length;
      allReadingText.push(s.text);
    }

    if (s.type === "checkpoint") {
      if (!s.checkpoint) {
        err(`${slabel}: checkpoint slide missing checkpoint data`);
        continue;
      }
      const cp = s.checkpoint;
      if (!cp.type) err(`${slabel}: checkpoint missing type`);
      if (!cp.skill) err(`${slabel}: checkpoint missing skill`);
      if (!cp.prompt) err(`${slabel}: checkpoint missing prompt`);
      if (!cp.correctAnswer) err(`${slabel}: checkpoint missing correctAnswer`);
      if (!cp.feedback?.correct) err(`${slabel}: checkpoint missing feedback.correct`);
      if (!cp.feedback?.incorrect) err(`${slabel}: checkpoint missing feedback.incorrect`);

      // Validate highlight checkpoints
      if (cp.type === "highlight") {
        if (!s.sentences || s.sentences.length === 0) {
          err(`${slabel}: highlight checkpoint needs sentences array`);
        } else {
          const answer = typeof cp.correctAnswer === "string" ? cp.correctAnswer : cp.correctAnswer[0];
          if (!s.sentences.includes(answer)) {
            err(`${slabel}: correctAnswer not found in sentences array`);
          }
        }
      }

      // Validate drag-drop
      if (cp.type === "drag-drop") {
        if (!cp.options || cp.options.length === 0) {
          err(`${slabel}: drag-drop needs options`);
        }
        if (!cp.template) {
          warn(`${slabel}: drag-drop missing template`);
        }
        const answer = typeof cp.correctAnswer === "string" ? cp.correctAnswer : cp.correctAnswer[0];
        if (cp.options && !cp.options.includes(answer)) {
          err(`${slabel}: drag-drop correctAnswer not in options`);
        }
      }

      // Validate MC
      if (cp.type === "multiple-choice") {
        if (!cp.options || cp.options.length < 2) {
          err(`${slabel}: MC needs at least 2 options`);
        }
        const answer = typeof cp.correctAnswer === "string" ? cp.correctAnswer : cp.correctAnswer[0];
        if (cp.options && !cp.options.includes(answer)) {
          err(`${slabel}: MC correctAnswer not in options`);
        }
      }
    }

    if (s.type === "summary") {
      if (!s.summaryPrompt) warn(`${slabel}: summary missing summaryPrompt`);
      if (!s.expectedKeyConcepts || s.expectedKeyConcepts.length === 0) {
        warn(`${slabel}: summary missing expectedKeyConcepts`);
      }
    }
  }

  // Check word count
  if (wordCount < 500) warn(`${label}: only ${wordCount} words (target 800-1200)`);
  if (wordCount > 1500) warn(`${label}: ${wordCount} words seems high`);

  console.log(`${label}: ${p.slides.length} slides, ${wordCount} words ✓`);
}

// ── Validate Books ──
const bookDir = path.join(__dirname, "../content/books");
const bookFiles = fs.readdirSync(bookDir).filter(f => f.endsWith(".json"));

for (const file of bookFiles) {
  const b: Book = JSON.parse(fs.readFileSync(path.join(bookDir, file), "utf8"));
  const label = `book/${file}`;

  if (!b.id) err(`${label}: missing id`);
  if (!b.title) err(`${label}: missing title`);
  if (!b.chapters || b.chapters.length === 0) err(`${label}: no chapters`);

  let totalPages = 0;
  let totalWords = 0;
  let pageNumbers: number[] = [];

  for (const ch of b.chapters) {
    if (!ch.title) err(`${label}: chapter missing title`);
    for (const pg of ch.pages) {
      totalPages++;
      totalWords += pg.text.split(/\s+/).length;
      pageNumbers.push(pg.pageNumber);
    }
  }

  // Check sequential page numbers
  const sorted = [...pageNumbers].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) {
      err(`${label}: page numbers not sequential (expected ${i + 1}, got ${sorted[i]})`);
      break;
    }
  }

  if (b.totalPages !== totalPages) {
    warn(`${label}: totalPages (${b.totalPages}) doesn't match actual page count (${totalPages})`);
  }

  console.log(`${label}: ${b.chapters.length} chapters, ${totalPages} pages, ${totalWords} words ✓`);
}

// ── Validate Vocabulary ──
const vocabPath = path.join(__dirname, "../content/vocabulary/vocabulary.json");
const vocab: VocabularyWord[] = JSON.parse(fs.readFileSync(vocabPath, "utf8"));
const passageIds = passageFiles.map(f => f.replace(".json", ""));

for (let i = 0; i < vocab.length; i++) {
  const v = vocab[i];
  const label = `vocab[${i}] "${v.word}"`;
  if (!v.word) err(`${label}: missing word`);
  if (!v.definition) err(`${label}: missing definition`);
  if (!v.exampleSentence) err(`${label}: missing exampleSentence`);
  if (!v.passageId) err(`${label}: missing passageId`);
  if (!passageIds.includes(v.passageId)) {
    warn(`${label}: passageId "${v.passageId}" not found in passage files`);
  }
}

console.log(`vocabulary: ${vocab.length} words ✓`);

// ── Collect image references ──
const imageRefs = new Set<string>();
for (const file of passageFiles) {
  const p: Passage = JSON.parse(fs.readFileSync(path.join(passageDir, file), "utf8"));
  if (p.backgroundImage) imageRefs.add(p.backgroundImage);
}
for (const file of bookFiles) {
  const b: Book = JSON.parse(fs.readFileSync(path.join(bookDir, file), "utf8"));
  if (b.coverImage) imageRefs.add(b.coverImage);
  for (const ch of b.chapters) {
    for (const pg of ch.pages) {
      if (pg.image) imageRefs.add(pg.image);
    }
  }
}
for (const v of vocab) {
  if (v.image) imageRefs.add(v.image);
}

console.log(`\nImage references (${imageRefs.size}):`);
for (const ref of imageRefs) {
  const fullPath = path.join(__dirname, "../public", ref);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? "✓" : "✗"} ${ref}`);
  if (!exists) warn(`Missing image: ${ref}`);
}

// ── Report ──
console.log("\n" + "=".repeat(50));
if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} ERRORS:`);
  errors.forEach(e => console.log(`  - ${e}`));
}
if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} WARNINGS:`);
  warnings.forEach(w => console.log(`  - ${w}`));
}
if (errors.length === 0 && warnings.length === 0) {
  console.log("\n✅ All content valid!");
}

process.exit(errors.length > 0 ? 1 : 0);
