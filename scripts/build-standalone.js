import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read base HTML and CSS files
const baseHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
const baseCss = fs.readFileSync(path.join(projectRoot, 'styles/base.css'), 'utf-8');
const hudCss = fs.readFileSync(path.join(projectRoot, 'styles/hud.css'), 'utf-8');
const overlaysCss = fs.readFileSync(path.join(projectRoot, 'styles/overlays.css'), 'utf-8');

// Combine CSS
const combinedCss = `<style>\n${baseCss}\n${hudCss}\n${overlaysCss}\n</style>`;

// Find the most recently built JS file in dist/assets
let jsBundle = '';
const distAssets = path.join(distDir, 'assets');
if (fs.existsSync(distAssets)) {
  const jsFiles = fs.readdirSync(distAssets)
    .filter(f => f.endsWith('.js'))
    .map(f => ({ name: f, time: fs.statSync(path.join(distAssets, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  if (jsFiles.length > 0) {
    jsBundle = fs.readFileSync(path.join(distAssets, jsFiles[0].name), 'utf-8');
    console.log(`[build-standalone] Inlining latest bundle: ${jsFiles[0].name}`);
  }
}

// Replace stylesheets and script with inline versions
let standalone = baseHtml
  .replace(/<link rel="stylesheet" href="\.\/styles\/[^"]+">\s*/g, '')
  .replace(/<link rel="manifest"[^>]*>\s*/g, '')
  .replace('</head>', `${combinedCss}\n</head>`)
  .replace(/<script type="module" src="\.\/src\/main\.ts"><\/script>/, `<script>\n${jsBundle}\n</script>`);

const standalonePath = path.join(distDir, 'token-survivor-standalone.html');
fs.writeFileSync(standalonePath, standalone, 'utf-8');
console.log(`[build-standalone] Standalone HTML generated: ${standalonePath}`);
