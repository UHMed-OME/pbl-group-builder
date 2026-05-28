// Build the single-file, emailable distributable.
//
// Reads index.html, replaces the external <script src="vendor/xlsx.full.min.js">
// with an inline <script> containing the library, and writes
// dist/pbl-group-builder.html — one fully self-contained, offline file.
//
// Run:  node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const lib = readFileSync('vendor/xlsx.full.min.js', 'utf8');

const tag = '<script src="vendor/xlsx.full.min.js"></script>';
if (!html.includes(tag)) {
  console.error('Could not find the vendor <script src> tag in index.html — aborting.');
  process.exit(1);
}

// Guard against an accidental </script> inside the library text breaking the tag.
// NOTE: pass a *function* to replace() so `$&`/`$'`/`$\`` sequences inside the minified
// library are inserted verbatim, not treated as special replacement patterns (which would
// silently corrupt SheetJS's own .replace() calls).
const safeLib = lib.replace(/<\/script>/gi, '<\\/script>');
let inlined = html.replace(tag, () => `<script>\n${safeLib}\n</script>`);

// Inline the logo as a data URI so the single file stays self-contained offline.
// (index.html references it relatively, which works on Pages / via file://.)
const logoRef = 'src="vendor/jabsom-logo.svg"';
if (inlined.includes(logoRef)) {
  const svg = readFileSync('vendor/jabsom-logo.svg', 'utf8');
  const dataUri = 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
  inlined = inlined.replace(logoRef, () => `src="${dataUri}"`);
} else {
  console.warn('Note: logo <img src="vendor/jabsom-logo.svg"> not found — skipping logo inline.');
}

mkdirSync('dist', { recursive: true });
writeFileSync('dist/pbl-group-builder.html', inlined);

const kb = Math.round(Buffer.byteLength(inlined) / 1024);
console.log(`Wrote dist/pbl-group-builder.html (${kb} KB) — single self-contained file.`);
