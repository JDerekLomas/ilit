/**
 * Convert raw Savvas book JS files into our Book JSON format.
 *
 * Input: content/books/raw/{book_id}.js (Savvas format)
 * Output: public/content/books/{slug}.json (our Book format)
 *
 * Also generates content/books/catalog.json with the full catalog.
 */
import fs from 'fs';
import path from 'path';

// Parse library metadata
const libSrc = fs.readFileSync('docs/g4_library.js', 'utf-8');
const libData = JSON.parse(libSrc.replace('var objBookList = ', ''));
const bookset = libData.bookset[0];
const metaLookup = {};
for (const [key, val] of Object.entries(bookset)) {
  if (key === 'categorylist') continue;
  if (val && val.book_id) metaLookup[val.book_id] = val;
}

/**
 * Strip Savvas HTML markup to plain text.
 * Handles <z class="w"> word tags, HTML entities, paragraph/heading tags.
 */
function htmlToPlainText(html) {
  return html
    // Remove all HTML tags
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&#x201C;/g, '\u201C')  // left double quote
    .replace(/&#x201D;/g, '\u201D')  // right double quote
    .replace(/&#x2018;/g, '\u2018')  // left single quote
    .replace(/&#x2019;/g, '\u2019')  // right single quote
    .replace(/&#x2014;/g, '\u2014')  // em dash
    .replace(/&#x2013;/g, '\u2013')  // en dash
    .replace(/&#x2026;/g, '\u2026')  // ellipsis
    .replace(/&#xA0;/g, ' ')         // non-breaking space
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&nbsp;/g, ' ')
    // Decode numeric entities
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    // Clean up whitespace
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n +/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate a URL-friendly slug from a book title
 */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

// Process each raw book
const rawDir = 'content/books/raw';
const outDir = 'public/content/books';
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.js'));
const catalog = [];
const slugMap = {}; // track used slugs to avoid collision

for (const file of files) {
  const bookId = file.replace('.js', '');
  const meta = metaLookup[bookId];
  if (!meta) { console.log('SKIP: No metadata for', bookId); continue; }

  const src = fs.readFileSync(path.join(rawDir, file), 'utf-8');
  let content;
  try {
    content = JSON.parse(src.replace('var content = ', ''));
  } catch (e) {
    console.log('SKIP: Parse error for', meta.book_title);
    continue;
  }

  // Clean title
  const title = meta.book_title
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D');

  // Generate unique slug
  let slug = slugify(title);
  if (slugMap[slug]) {
    slug = slug + '-' + meta.lexile_level + 'l';
  }
  slugMap[slug] = true;

  // Build sorted ToC entries
  const tocEntries = Object.entries(content.Toc)
    .map(([key, toc]) => ({ id: key, title: toc.title, order: toc.order }))
    .sort((a, b) => a.order - b.order);

  // Skip front matter entries
  const skipIds = new Set();
  for (const entry of tocEntries) {
    const t = entry.title.toLowerCase();
    if (['cover', 'title page', 'copyright', 'contents', 'also available', 'about the publisher'].includes(t)) {
      skipIds.add(entry.id);
    }
  }

  // Build chapters with pages
  const chapters = [];
  let globalPageNum = 1;
  const WORDS_PER_PAGE = 250; // Split long chapters into ~250 word pages

  for (const tocEntry of tocEntries) {
    if (skipIds.has(tocEntry.id)) continue;

    const pageData = content.Pages[tocEntry.id];
    if (!pageData || !pageData.sentences) continue;

    // Collect all text sentences for this chapter
    const textParts = [];
    for (const sentence of pageData.sentences) {
      if (sentence.content_type === 'text') {
        const plain = htmlToPlainText(sentence.sentence_text);
        if (plain) textParts.push(plain);
      }
    }

    if (textParts.length === 0) continue;

    // Join all text, splitting into paragraphs
    const fullText = textParts.join('\n\n');
    const paragraphs = fullText.split('\n\n').filter(p => p.trim());

    // Split into pages of ~WORDS_PER_PAGE words
    const pages = [];
    let currentPageParagraphs = [];
    let currentWordCount = 0;

    for (const para of paragraphs) {
      const paraWords = para.split(/\s+/).filter(Boolean).length;

      if (currentWordCount > 0 && currentWordCount + paraWords > WORDS_PER_PAGE) {
        // Flush current page
        pages.push({
          pageNumber: globalPageNum++,
          text: currentPageParagraphs.join('\n\n'),
        });
        currentPageParagraphs = [];
        currentWordCount = 0;
      }

      currentPageParagraphs.push(para);
      currentWordCount += paraWords;
    }

    // Flush remaining
    if (currentPageParagraphs.length > 0) {
      pages.push({
        pageNumber: globalPageNum++,
        text: currentPageParagraphs.join('\n\n'),
      });
    }

    if (pages.length > 0) {
      chapters.push({
        title: htmlToPlainText(tocEntry.title),
        pages,
      });
    }
  }

  if (chapters.length === 0) {
    console.log('SKIP: No chapters for', title);
    continue;
  }

  // Build the Book object matching our types.ts interface
  const totalPages = chapters.reduce((sum, ch) => sum + ch.pages.length, 0);
  const description = (meta.book_desc || '')
    .replace(/\r\n/g, ' ')
    .replace(/\r/g, ' ')
    .trim();

  const book = {
    id: slug,
    title,
    author: meta.author_name,
    coverImage: `/images/covers/${slug}.jpg`,
    lexileLevel: meta.lexile_level || 0,
    genre: meta.category_name || meta.book_genre || '',
    summary: description,
    totalPages,
    chapters,
  };

  // Write the book JSON
  const outPath = path.join(outDir, `${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(book, null, 2));

  // Add to catalog (without full chapter content)
  catalog.push({
    id: slug,
    savvasId: bookId,
    title,
    author: meta.author_name,
    coverImage: `/images/covers/${slug}.jpg`,
    lexileLevel: meta.lexile_level || 0,
    genre: meta.category_name || meta.book_genre || '',
    summary: description.substring(0, 200),
    totalPages,
    chapterCount: chapters.length,
    wordCount: meta.word_count || 0,
  });

  const size = fs.statSync(outPath).size;
  console.log(`OK ${slug} (${chapters.length} ch, ${totalPages} pg, ${(size/1024).toFixed(0)}KB)`);
}

// Sort catalog by lexile
catalog.sort((a, b) => a.lexileLevel - b.lexileLevel);

// Save catalog
fs.writeFileSync('content/books/catalog.json', JSON.stringify(catalog, null, 2));
console.log(`\nDone: ${catalog.length} books converted`);
console.log('Catalog saved to content/books/catalog.json');

// Print slug list for library page
console.log('\nBook slugs:');
catalog.forEach(b => console.log(`  "${b.id}",  // ${b.title} (${b.lexileLevel}L)`));
