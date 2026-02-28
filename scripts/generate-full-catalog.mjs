/**
 * Generate the full 1,493-book catalog from g4_library.js metadata.
 * Output: public/content/books/catalog.json
 *
 * Run: node scripts/generate-full-catalog.mjs
 * Then: node scripts/generate-covers.mjs
 */
import fs from "fs";

// Parse library metadata
const libSrc = fs.readFileSync("docs/g4_library.js", "utf-8");
const libData = JSON.parse(libSrc.replace("var objBookList = ", ""));
const bookset = libData.bookset[0];

// Collect all book entries
const entries = Object.entries(bookset)
  .filter(([k]) => k !== "categorylist")
  .map(([, val]) => val)
  .filter((v) => v && v.book_id);

console.log(`Found ${entries.length} books in g4_library.js`);

/** Clean HTML entities from a string */
function cleanTitle(title) {
  return title
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
}

/** Generate a URL-friendly slug from a title */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

// Build catalog with unique slugs
const slugMap = {};
const catalog = [];

// Sort by lexile first so slug collisions resolve deterministically
entries.sort((a, b) => (a.lexile_level || 0) - (b.lexile_level || 0));

for (const meta of entries) {
  const title = cleanTitle(meta.book_title || "");
  if (!title) continue;

  // Generate unique slug
  let slug = slugify(title);
  if (slugMap[slug]) {
    // Append lexile level to disambiguate
    slug = `${slug}-${meta.lexile_level || 0}l`;
    if (slugMap[slug]) {
      // Still colliding — append numeric suffix
      let n = 2;
      while (slugMap[`${slug}-${n}`]) n++;
      slug = `${slug}-${n}`;
    }
  }
  slugMap[slug] = true;

  const description = (meta.book_desc || "")
    .replace(/\r\n/g, " ")
    .replace(/\r/g, " ")
    .trim();

  const genre =
    meta.category_name ||
    meta.book_genre ||
    "";

  catalog.push({
    id: slug,
    savvasId: meta.book_id,
    title,
    author: meta.author_name || "Unknown",
    coverImage: `/images/covers/${slug}.svg`,
    lexileLevel: meta.lexile_level || 0,
    genre,
    summary: description.substring(0, 200),
    totalPages: meta.no_of_page || 0,
    chapterCount: 0, // Unknown without fetching content
    wordCount: meta.word_count || 0,
  });
}

// Save catalog
const outDir = "public/content/books";
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/catalog.json`, JSON.stringify(catalog, null, 2));

// Also save to content/books for the cover generator
fs.mkdirSync("content/books", { recursive: true });
fs.writeFileSync("content/books/catalog.json", JSON.stringify(catalog, null, 2));

console.log(`Catalog: ${catalog.length} books saved to ${outDir}/catalog.json`);
console.log(`Lexile range: ${catalog[0].lexileLevel}L – ${catalog[catalog.length - 1].lexileLevel}L`);

// Stats
const byLexile = {};
for (const b of catalog) {
  const band = Math.floor(b.lexileLevel / 200) * 200;
  byLexile[band] = (byLexile[band] || 0) + 1;
}
console.log("\nBy Lexile band:");
for (const [band, count] of Object.entries(byLexile).sort(([a], [b]) => a - b)) {
  console.log(`  ${band}-${parseInt(band) + 199}L: ${count} books`);
}
