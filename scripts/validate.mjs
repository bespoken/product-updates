// Checks the repo against what the dashboard expects. Run: node scripts/validate.mjs
// No dependencies, so CI only needs Node.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_IMAGE_BYTES = 500 * 1024;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;
// Same rules as the dashboard (updatesContent.ts).
const ENTRY_RE = /^posts\/(\d{4})\/([^/]+)\/post\.md$/;
const ID_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// Same minimal reader as the dashboard: single-line `key: value` pairs.
function readFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const meta = {};
  for (const line of text.slice(4, end).split('\n')) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(line.trim());
    if (match) meta[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return { meta, body: text.slice(end + 4) };
}

function checkImages(entry, postDir, body) {
  const imageRe = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const [, src] of body.matchAll(imageRe)) {
    if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(src)) {
      if (src.includes('raw.githubusercontent.com/bespoken/product-updates')) {
        warn(`${entry}: "${src}" points at a fixed branch; use a relative path like ![](image.png)`);
      }
      continue;
    }
    if (src.startsWith('/')) {
      fail(`${entry}: "${src}" is root-absolute; use a path relative to the post folder`);
      continue;
    }
    const file = normalize(join(postDir, decodeURIComponent(src.split(/[?#]/)[0])));
    if (!file.startsWith(postDir + sep)) {
      fail(`${entry}: "${src}" points outside the post folder`);
    } else if (!existsSync(file)) {
      fail(`${entry}: image "${src}" not found`);
    }
  }
}

// index.json
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(ROOT, 'index.json'), 'utf8'));
} catch (err) {
  fail(`index.json: not valid JSON (${err.message})`);
}
if (manifest !== undefined && !Array.isArray(manifest)) fail('index.json: must be a JSON array');

const listed = new Set();
for (const entry of Array.isArray(manifest) ? manifest : []) {
  const match = typeof entry === 'string' ? ENTRY_RE.exec(entry) : null;
  if (!match || !ID_RE.test(match[2]) || !match[2].startsWith(`${match[1]}-`)) {
    fail(`index.json: ${JSON.stringify(entry)} must be posts/YYYY/YYYY-MM-DD-slug/post.md (year folder = post year)`);
    continue;
  }
  if (listed.has(entry)) fail(`index.json: ${entry} is listed twice`);
  listed.add(entry);

  const file = join(ROOT, entry);
  if (!existsSync(file)) {
    fail(`index.json: ${entry} does not exist`);
    continue;
  }
  const parsed = readFrontmatter(readFileSync(file, 'utf8'));
  if (!parsed) {
    fail(`${entry}: missing frontmatter (must start with a --- block)`);
    continue;
  }
  if (!parsed.meta.title) fail(`${entry}: frontmatter needs a title`);
  if (!parsed.meta.description) fail(`${entry}: frontmatter needs a description`);
  checkImages(entry, dirname(file), parsed.body);
}

// Every file under posts/
for (const file of walk(join(ROOT, 'posts'))) {
  const path = relative(ROOT, file).split(sep).join('/');
  if (path.endsWith('/post.md') && !listed.has(path)) {
    warn(`${path} is not in index.json, so it won't show in the dashboard`);
  }
  if (IMAGE_EXT.test(path)) {
    const kb = Math.round(statSync(file).size / 1024);
    if (statSync(file).size > MAX_IMAGE_BYTES) fail(`${path}: ${kb} KB, images must be under 500 KB`);
  }
}

for (const msg of warnings) console.log(`warning: ${msg}`);
for (const msg of errors) console.log(`error: ${msg}`);
if (errors.length) {
  console.log(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`OK: ${listed.size} post(s) checked`);
