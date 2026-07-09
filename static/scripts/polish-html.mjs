/**
 * Final polish pass: fix typos and migration artifacts in HTML
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const replacements = [
  ['max-w-2hxl', 'max-w-2xl'],
  ['border-slate-800/50-800', 'border-slate-800/50'],
  ['group-hover-translate', 'group-hover:translate-x-1 transition-transform'],
  ['group-hover-blue transition-colors', 'group-hover:text-blue-400 transition-colors'],
  ['text-lg font-bold font-display text-white mb-3 group-hover:text-blue-400', 'text-xl font-bold font-display text-white mb-3 group-hover:text-blue-400'],
  ['pe-none', 'pointer-events-none'],
  ['text-sm text-slate-500 text-slate-400 hover:text-white', 'text-sm text-slate-400 hover:text-white'],
  ['lg:col-span-2 group relative', 'group relative'],
  [
    'class="hero-dot transition-all duration-300 rounded-full w-2.5 h-2.5 bg-slate-600 hover:bg-slate-400 transition-all duration-300 rounded-full w-2.5 h-2.5 bg-slate-600 hover:bg-slate-400"',
    'class="hero-dot w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-slate-400 transition-all duration-300"',
  ],
  ['gap-5">', 'gap-12">'],
];

const clientMarqueeScript = `<script>
// Populate client marquees
const clients = ['Google','AMD','Trimble','FIS','CSC','Kentz','Cambridge Systems','Reliance','L&T','Technip','Disney India','Prime Focus','Reel FX','Sony Television','Titmouse','Zagtoon','Framebreed','Grid Animation'];
const clientsReversed = [...clients].reverse();
function createClientCard(name, gradient) {
  return '<div class="shrink-0 glass px-8 py-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center ' + gradient + ' transition-all duration-300"><span class="text-sm font-bold text-white">' + name.charAt(0) + '</span></div><span class="text-lg font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">' + name + '</span></div></div>';
}
const m1 = document.getElementById('clients-marquee-1');
const m2 = document.getElementById('clients-marquee-2');
if (m1) m1.innerHTML = [...clients, ...clients].map(c => createClientCard(c, 'group-hover:from-blue-600 group-hover:to-purple-600')).join('');
if (m2) m2.innerHTML = [...clientsReversed, ...clientsReversed].map(c => createClientCard(c, 'group-hover:from-purple-600 group-hover:to-pink-600')).join('');
</script>`;

function polish(html, filename) {
  let result = html;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }

  if (filename === 'index.html') {
    result = result.replace(/<script>\s*\/\/ Populate client marquees[\s\S]*?<\/script>/, clientMarqueeScript);
  }

  // Restore footer lg:col-span-2 (removed by service card fix)
  result = result.replace(
    '<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">\n<div class="group relative">',
    '<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">\n<div class="lg:col-span-2">'
  );
  // Fix if already broken - footer first child should be lg:col-span-2
  result = result.replace(
    /(<footer[\s\S]*?<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">\s*)<div class="group relative">/,
    '$1<div class="lg:col-span-2">'
  );

  return result;
}

['index.html', 'about.html', 'contact.html'].forEach((f) => {
  const fp = path.join(dir, f);
  let html = fs.readFileSync(fp, 'utf8');
  html = polish(html, f);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('Polished', f);
});
