/**
 * Convert raw Savvas book content into our Book format.
 * Pure string manipulation — no filesystem I/O.
 */
import type { Book, CatalogBook } from "@/lib/types";

/** Strip Savvas HTML markup to plain text */
export function htmlToPlainText(html: string): string {
  return (
    html
      // Convert block elements to newlines
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, "")
      // Decode HTML entities
      .replace(/&#x201C;/g, "\u201C")
      .replace(/&#x201D;/g, "\u201D")
      .replace(/&#x2018;/g, "\u2018")
      .replace(/&#x2019;/g, "\u2019")
      .replace(/&#x2014;/g, "\u2014")
      .replace(/&#x2013;/g, "\u2013")
      .replace(/&#x2026;/g, "\u2026")
      .replace(/&#xA0;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lsquo;/g, "\u2018")
      .replace(/&rsquo;/g, "\u2019")
      .replace(/&ldquo;/g, "\u201C")
      .replace(/&rdquo;/g, "\u201D")
      .replace(/&mdash;/g, "\u2014")
      .replace(/&ndash;/g, "\u2013")
      .replace(/&hellip;/g, "\u2026")
      .replace(/&nbsp;/g, " ")
      // Decode numeric entities
      .replace(/&#(\d+);/g, (_, code) =>
        String.fromCharCode(parseInt(code as string))
      )
      .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
        String.fromCharCode(parseInt(code as string, 16))
      )
      // Clean up whitespace
      .replace(/\t/g, " ")
      .replace(/ +/g, " ")
      .replace(/\n +/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

interface SavvasToc {
  title: string;
  order: number;
}

interface SavvasSentence {
  content_type: string;
  sentence_text: string;
}

interface SavvasPage {
  sentences: SavvasSentence[];
}

interface SavvasContent {
  Toc: Record<string, SavvasToc>;
  Pages: Record<string, SavvasPage>;
}

/** Parse the `var content = {...}` format from Savvas CDN */
export function parseSavvasJs(raw: string): SavvasContent {
  const json = raw.replace(/^var\s+content\s*=\s*/, "");
  return JSON.parse(json);
}

const FRONT_MATTER = new Set([
  "cover",
  "title page",
  "copyright",
  "contents",
  "also available",
  "about the publisher",
]);

const WORDS_PER_PAGE = 250;

/** Convert raw Savvas content + catalog metadata into our Book format */
export function convertSavvasBook(
  content: SavvasContent,
  meta: CatalogBook
): Book {
  // Build sorted ToC entries
  const tocEntries = Object.entries(content.Toc)
    .map(([id, toc]) => ({ id, title: toc.title, order: toc.order }))
    .sort((a, b) => a.order - b.order);

  // Identify front matter to skip
  const skipIds = new Set<string>();
  for (const entry of tocEntries) {
    if (FRONT_MATTER.has(entry.title.toLowerCase())) {
      skipIds.add(entry.id);
    }
  }

  // Build chapters with pages
  const chapters: Book["chapters"] = [];
  let globalPageNum = 1;

  for (const tocEntry of tocEntries) {
    if (skipIds.has(tocEntry.id)) continue;

    const pageData = content.Pages[tocEntry.id];
    if (!pageData?.sentences) continue;

    // Collect text sentences
    const textParts: string[] = [];
    for (const sentence of pageData.sentences) {
      if (sentence.content_type === "text") {
        const plain = htmlToPlainText(sentence.sentence_text);
        if (plain) textParts.push(plain);
      }
    }
    if (textParts.length === 0) continue;

    // Split into paragraphs, then into ~250 word pages
    const paragraphs = textParts.join("\n\n").split("\n\n").filter((p) => p.trim());
    const pages: { pageNumber: number; text: string }[] = [];
    let currentParagraphs: string[] = [];
    let currentWordCount = 0;

    for (const para of paragraphs) {
      const paraWords = para.split(/\s+/).filter(Boolean).length;

      if (currentWordCount > 0 && currentWordCount + paraWords > WORDS_PER_PAGE) {
        pages.push({
          pageNumber: globalPageNum++,
          text: currentParagraphs.join("\n\n"),
        });
        currentParagraphs = [];
        currentWordCount = 0;
      }

      currentParagraphs.push(para);
      currentWordCount += paraWords;
    }

    if (currentParagraphs.length > 0) {
      pages.push({
        pageNumber: globalPageNum++,
        text: currentParagraphs.join("\n\n"),
      });
    }

    if (pages.length > 0) {
      chapters.push({
        title: htmlToPlainText(tocEntry.title),
        pages,
      });
    }
  }

  const totalPages = chapters.reduce((sum, ch) => sum + ch.pages.length, 0);

  return {
    id: meta.id,
    title: meta.title,
    author: meta.author,
    coverImage: meta.coverImage,
    lexileLevel: meta.lexileLevel,
    genre: meta.genre,
    summary: meta.summary,
    totalPages,
    chapters,
  };
}
