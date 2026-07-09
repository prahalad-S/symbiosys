import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const fixes = [
  ['sym-sym-z-0', 'sym-z-0'],
  ['sym-sym-leading-relaxed', 'sym-leading-relaxed'],
  ['position-absolute top-50 start-50 translate-middle w-[800px] h-[800px] bg-cyan-600/10 rounded-pill blur-[200px]', 'sym-orb sym-orb-cyan-xl'],
  ['position-absolute top-50 start-50 translate-middle w-[600px] h-[600px] bg-purple-600/10 rounded-pill blur-[200px]', 'sym-orb sym-orb-purple-lg'],
  ['position-absolute top-0 start-0 end-0 bottom-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 opacity-60', 'position-absolute top-0 start-0 end-0 bottom-0 sym-gradient-fade-up sym-z-10 sym-opacity-60'],
  ['d-flex flex-column items-center gap-2', 'd-flex flex-column align-items-center gap-2'],
  ['d-flex flex-column md:flex-row items-center justify-between gap-4', 'd-flex flex-column flex-md-row align-items-center justify-content-between gap-3'],
  ['d-flex flex-column md:flex-row items-center justify-between', 'd-flex flex-column flex-md-row align-items-center justify-content-between'],
  ['text-base', 'sym-text-lg'],
  ['text-xl md:text-2xl text-slate-300', 'sym-text-xl-md text-slate-300'],
  ['glass rounded-3xl p-8 md:p-12 border', 'glass sym-rounded-3xl sym-p-card-lg border'],
  ['text-4xl md:text-[64px] fw-medium tracking-[-0.01em] sym-leading-tight sym-mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent sym-max-w-4xl reveal-up', 'sym-about-hero-title sym-max-w-4xl sym-mb-6 reveal-up'],
  ['sym-text-lg-md text-slate-400 sym-max-w-2xl mx-auto sym-mb-12 sym-sym-leading-relaxed', 'sym-text-lg-md text-slate-400 sym-max-w-2xl mx-auto sym-mb-12 sym-leading-relaxed'],
  ['justify-between', 'justify-content-between'],
  ['items-center', 'align-items-center'],
  ['items-start', 'align-items-start'],
];

['index.html', 'about.html', 'contact.html'].forEach((f) => {
  const fp = path.join(dir, f);
  let html = fs.readFileSync(fp, 'utf8');
  for (const [a, b] of fixes) html = html.split(a).join(b);
  fs.writeFileSync(fp, html);
  console.log('Fixed', f);
});
