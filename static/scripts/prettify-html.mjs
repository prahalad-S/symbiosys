/**
 * Prettify minified HTML and fix remaining Tailwind class remnants
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, '..');

const classFixes = [
  ['group-hover:opacity-10 sym-rounded-2xl transition-opacity duration-500 blur-xl', 'sym-card-glow sym-rounded-2xl'],
  ['opacity-0 group-hover:opacity-10 sym-rounded-2xl transition-opacity duration-500 blur-xl', 'sym-card-glow sym-rounded-2xl'],
  ['opacity-0 group-hover:opacity-100 transition-opacity duration-500', 'sym-shimmer'],
  ['group-hover:opacity-100 transition-opacity duration-300', 'sym-fade-hover'],
  ['group-hover:opacity-10', ''],
  ['transition-opacity duration-500', 'sym-transition-opacity-slow'],
  ['transition-opacity duration-300', 'sym-transition-opacity'],
  ['transition-all duration-300', 'sym-transition-fast'],
  ['transition-all duration-500', 'sym-transition'],
  ['blur-xl', ''],
  ['outline-none', ''],
  ['duration-300', ''],
  ['duration-500', ''],
  ['duration-1000', ''],
];

function prettify(html) {
  return html
    .replace(/>\s+</g, '>\n<')
    .replace(/(<\/(?:section|main|footer|nav|head|body|html|div|form|ul|li|script)>)/g, '$1\n')
    .replace(/(<!--[^>]*-->)/g, '\n$1\n')
    .replace(/\n{3,}/g, '\n\n');
}

function fixClasses(html) {
  let result = html;
  for (const [from, to] of classFixes) {
    result = result.split(from).join(to);
  }
  // Clean empty class attributes and double spaces in classes
  result = result.replace(/class="([^"]*)"/g, (_, cls) => {
    const cleaned = cls.replace(/\s+/g, ' ').trim();
    return cleaned ? `class="${cleaned}"` : '';
  });
  return result;
}

function fixClientMarquee(html) {
  return html.replace(
    /function createClientCard\(name, gradient\) \{[\s\S]*?\}/,
    `function createClientCard(name, hoverClass) {
      return '<div class="flex-shrink-0 glass sym-card-pad sym-rounded-xl border sym-border-slate-800 sym-hover-border-slate sym-transition-colors sym-group"><div class="d-flex align-items-center gap-3"><div class="sym-w-10 sym-h-10 rounded-3 sym-client-icon d-flex align-items-center justify-content-center ' + hoverClass + '"><span class="small fw-bold text-white">' + name.charAt(0) + '</span></div><span class="sym-text-lg fw-semibold text-slate-300 sym-group-hover-white sym-transition-colors text-nowrap">' + name + '</span></div></div>';
    }`
  ).replace(
    "createClientCard(c, 'group-hover:from-blue-600 group-hover:to-purple-600')",
    "createClientCard(c, 'sym-client-icon-blue')"
  ).replace(
    "createClientCard(c, 'group-hover:from-purple-600 group-hover:to-pink-600')",
    "createClientCard(c, 'sym-client-icon-purple')"
  );
}

['index.html', 'about.html', 'contact.html'].forEach((f) => {
  const fp = path.join(staticDir, f);
  let html = fs.readFileSync(fp, 'utf8');
  html = fixClasses(html);
  if (f === 'index.html') html = fixClientMarquee(html);
  html = prettify(html);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('Formatted', f);
});
