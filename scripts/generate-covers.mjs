/**
 * Generate placeholder SVG cover images for books.
 * Creates colored gradient covers with title text.
 */
import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('content/books/catalog.json', 'utf-8'));
const outDir = 'public/images/covers';
fs.mkdirSync(outDir, { recursive: true });

// Color palettes by lexile band
const palettes = [
  // Beginning (0-200L) - warm, inviting
  ['#FF6B6B', '#EE5A24', '#F0932B'],
  ['#E74C3C', '#C0392B', '#D35400'],
  ['#FF4757', '#FF6348', '#FFA502'],
  // Early (200-400L) - nature
  ['#2ecc71', '#27ae60', '#1abc9c'],
  ['#00b894', '#00cec9', '#0984e3'],
  ['#6c5ce7', '#a29bfe', '#74b9ff'],
  // Developing (400-600L) - rich
  ['#9b59b6', '#8e44ad', '#6c5ce7'],
  ['#3498db', '#2980b9', '#2c3e50'],
  ['#1B1464', '#0c2461', '#0a3d62'],
  ['#2c2c54', '#474787', '#40407a'],
  ['#4b6584', '#778ca3', '#596275'],
  // Intermediate (600-800L) - dramatic
  ['#1e3799', '#0c2461', '#4a69bd'],
  ['#6F1E51', '#833471', '#B53471'],
  ['#2d3436', '#636e72', '#b2bec3'],
  ['#0a3d62', '#3c6382', '#60a3bc'],
  // Proficient (800-1000L) - classic
  ['#2c3e50', '#34495e', '#7f8c8d'],
  ['#192a56', '#273c75', '#40739e'],
  ['#2c2c54', '#474787', '#706fd3'],
  ['#1B1464', '#3B3B98', '#182C61'],
  ['#2c003e', '#3d0066', '#590099'],
  ['#44236f', '#1C1C3B', '#2E1F5E'],
  ['#1a1a2e', '#16213e', '#0f3460'],
  ['#1a1a2e', '#2b2d42', '#3d405b'],
  // Advanced (1000+) - distinguished
  ['#0c0c0c', '#1a1a1a', '#333333'],
  ['#2c003e', '#1a0033', '#330066'],
  ['#1B1464', '#0C0032', '#190061'],
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line.length + word.length + 1 > maxChars) {
      lines.push(line.trim());
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

catalog.forEach((book, i) => {
  const palette = palettes[i % palettes.length];
  const titleLines = wrapText(book.title, 16);
  const authorLines = wrapText(book.author, 20);

  const titleY = 120 - (titleLines.length - 1) * 16;
  const authorY = 230;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette[0]}"/>
      <stop offset="50%" stop-color="${palette[1]}"/>
      <stop offset="100%" stop-color="${palette[2]}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="420" fill="url(#bg)" rx="4"/>
  <!-- Decorative border -->
  <rect x="12" y="12" width="276" height="396" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" rx="2"/>
  <rect x="18" y="18" width="264" height="384" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5" rx="2"/>
  <!-- Decorative line -->
  <line x1="50" y1="195" x2="250" y2="195" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <!-- Title -->
  ${titleLines.map((line, idx) =>
    `<text x="150" y="${titleY + idx * 34}" text-anchor="middle" fill="white" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="bold">${escapeXml(line)}</text>`
  ).join('\n  ')}
  <!-- Author -->
  ${authorLines.map((line, idx) =>
    `<text x="150" y="${authorY + idx * 22}" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="Georgia, 'Times New Roman', serif" font-size="16">${escapeXml(line)}</text>`
  ).join('\n  ')}
  <!-- Lexile badge -->
  <text x="150" y="360" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="Arial, sans-serif" font-size="13">${book.lexileLevel}L</text>
</svg>`;

  // Write as SVG (Next.js Image can handle SVGs fine)
  const outPath = `${outDir}/${book.id}.svg`;
  fs.writeFileSync(outPath, svg);
  console.log(`OK ${book.id}.svg`);
});

console.log(`\nGenerated ${catalog.length} cover images`);
