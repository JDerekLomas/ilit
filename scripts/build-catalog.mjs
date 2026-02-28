import fs from 'fs';

// Parse library metadata
const libSrc = fs.readFileSync('docs/g4_library.js', 'utf-8');
const libJson = libSrc.replace('var objBookList = ', '');
const libData = JSON.parse(libJson);
const bookset = libData.bookset[0];
const metaLookup = {};
for (const [key, val] of Object.entries(bookset)) {
  if (key === 'categorylist') continue;
  if (val && val.book_id) metaLookup[val.book_id] = val;
}

// Process each downloaded book
const rawDir = 'content/books/raw';
const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.js'));

const catalog = [];

for (const file of files) {
  const bookId = file.replace('.js', '');
  const meta = metaLookup[bookId];
  if (!meta) { console.log('No metadata for', bookId); continue; }

  const src = fs.readFileSync(rawDir + '/' + file, 'utf-8');
  let content;
  try {
    content = JSON.parse(src.replace('var content = ', ''));
  } catch(e) {
    console.log('Parse error for', meta.book_title, e.message.substring(0, 50));
    continue;
  }

  // Build chapter list from ToC, sorted by order
  const chapters = Object.entries(content.Toc)
    .map(([key, toc]) => ({
      id: key,
      title: toc.title,
      order: toc.order,
      playOrder: parseInt(toc.playOrder)
    }))
    .filter(c => c.title !== 'Cover' && c.title !== 'Title Page' && c.title !== 'Copyright' && c.title !== 'CONTENTS')
    .sort((a, b) => a.order - b.order);

  // Extract plain text from all pages to count actual words
  let totalWords = 0;
  let totalSentences = 0;
  const pageCount = Object.keys(content.Pages).length;

  for (const [pageId, page] of Object.entries(content.Pages)) {
    if (page.sentences) {
      for (const s of page.sentences) {
        if (s.content_type === 'text') {
          const plain = s.sentence_text.replace(/<[^>]*>/g, '');
          totalWords += plain.split(/\s+/).filter(w => w.length > 0).length;
          totalSentences++;
        }
      }
    }
  }

  catalog.push({
    id: bookId,
    title: meta.book_title.replace(/&lsquo;/g, "'").replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"'),
    author: meta.author_name,
    lexile: meta.lexile_level,
    wordCount: totalWords,
    pageCount: pageCount,
    chapterCount: chapters.length,
    sentenceCount: totalSentences,
    description: (meta.book_desc || '').replace(/\r\n/g, ' ').replace(/\r/g, ' '),
    genre: meta.book_genre || '',
    category: meta.category_name || '',
    coverImage: meta.book_image,
    chapters: chapters.map(c => ({ id: c.id, title: c.title })),
    fileSize: fs.statSync(rawDir + '/' + file).size
  });
}

catalog.sort((a, b) => (a.lexile || 0) - (b.lexile || 0));

console.log('Processed', catalog.length, 'books');
console.log('\nCatalog summary:');
for (const b of catalog) {
  console.log(`${b.lexile}L | ${b.title} | ${b.author} | ${b.wordCount}w | ${b.chapterCount} ch`);
}

// Save catalog
fs.writeFileSync('content/books/catalog.json', JSON.stringify(catalog, null, 2));
console.log('\nSaved content/books/catalog.json');
