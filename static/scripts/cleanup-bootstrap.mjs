/**
 * Second-pass cleanup: remaining Tailwind remnants → Bootstrap/sym-*
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, '..');

const replacements = [
  ['hover:text-white', 'sym-hover-white'],
  ['group-hover:shadow-blue-500/30 transition-shadow duration-300', 'sym-logo-hover-shadow sym-transition-shadow'],
  ['group-hover:scale-110 group-hover:shadow-lg shadow-blue-500/20 transition-all duration-300', 'sym-group-hover-scale sym-shadow-blue sym-transition-fast'],
  ['group-hover:scale-110 group-hover:shadow-lg shadow-purple-500/20 transition-all duration-300', 'sym-group-hover-scale sym-shadow-purple sym-transition-fast'],
  ['group-hover:scale-110 group-hover:shadow-lg shadow-amber-500/20 transition-all duration-300', 'sym-group-hover-scale sym-shadow-amber sym-transition-fast'],
  ['group-hover:scale-110 group-hover:shadow-lg shadow-pink-500/20 transition-all duration-300', 'sym-group-hover-scale sym-shadow-pink sym-transition-fast'],
  ['group-hover:scale-110 group-hover:shadow-lg shadow-indigo-500/20 transition-all duration-300', 'sym-group-hover-scale sym-shadow-indigo sym-transition-fast'],
  ['group-hover:scale-110 group-hover:shadow-lg shadow-emerald-500/20 transition-all duration-300', 'sym-group-hover-scale sym-shadow-emerald sym-transition-fast'],
  ['group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300', 'sym-client-icon-blue sym-transition-fast'],
  ['group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300', 'sym-client-icon-purple sym-transition-fast'],
  ['group-hover:text-white sym-transition-colors', 'sym-group-hover-white sym-transition-colors'],
  ['bg-gradient-to-br from-indigo-500 to-blue-500', 'sym-icon-indigo'],
  ['bg-gradient-to-br from-pink-500 to-rose-500', 'sym-icon-pink'],
  ['bg-gradient-to-br from-blue-500 to-cyan-500', 'sym-icon-blue'],
  ['bg-gradient-to-br from-purple-500 to-violet-500', 'sym-icon-purple'],
  ['bg-gradient-to-br from-amber-500 to-orange-500', 'sym-icon-amber'],
  ['bg-gradient-to-br from-emerald-500 to-teal-500', 'sym-icon-emerald'],
  ['bg-gradient-to-br from-slate-700 to-slate-800', 'sym-bg-slate-800-solid'],
  ['bg-gradient-to-br from-blue-500 to-purple-600', 'sym-gradient-avatar'],
  ['bg-blue-500/20', 'sym-icon-bg-blue'],
  ['bg-purple-500/20', 'sym-icon-bg-purple'],
  ['bg-cyan-500/20', 'sym-icon-bg-cyan'],
  ['w-16 h-16 sym-rounded-2xl sym-icon-bg-blue', 'sym-w-16 sym-h-16 sym-rounded-2xl sym-icon-bg-blue'],
  ['w-16 h-16 sym-rounded-2xl bg-blue-500/20', 'sym-w-16 sym-h-16 sym-rounded-2xl sym-icon-bg-blue'],
  ['w-16 h-16 sym-rounded-2xl bg-purple-500/20', 'sym-w-16 sym-h-16 sym-rounded-2xl sym-icon-bg-purple'],
  ['w-16 h-16 sym-rounded-2xl bg-cyan-500/20', 'sym-w-16 sym-h-16 sym-rounded-2xl sym-icon-bg-cyan'],
  ['w-14 h-14 sym-rounded-xl', 'sym-w-14 sym-h-14 sym-rounded-xl'],
  ['w-8 h-8', 'sym-w-8 sym-h-8'],
  ['w-8 h-8 rounded-pill bg-white text-black', 'sym-w-8 sym-h-8 rounded-pill bg-white text-dark'],
  ['hover:bg-white/90', 'sym-hover-bg-white'],
  ['flex-1', 'flex-fill'],
  ['flex-shrink-0', 'flex-shrink-0'],
  ['max-w-7xl mx-auto', 'container-xl sym-container mx-auto'],
  ['max-w-5xl mx-auto', 'sym-max-w-5xl mx-auto'],
  ['max-w-4xl', 'sym-max-w-4xl'],
  ['min-h-[50px]', 'sym-min-h-50'],
  ['px-6 pt-24 pb-12', 'sym-hero-pad'],
  ['p-10 md:p-16', 'sym-p-section'],
  ['text-white/80 text-[10px] md:text-[11px] fw-medium tracking-[0.2em] text-uppercase', 'sym-about-eyebrow'],
  ['text-4xl md:text-[64px] fw-medium tracking-[-0.01em] leading-[1.1] sym-mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl', 'sym-about-hero-title sym-max-w-4xl'],
  ['bg-transparent text-white placeholder-white/45 outline-none flex-fill sym-min-w-0', 'bg-transparent text-white sym-placeholder outline-none flex-fill sym-min-w-0'],
  ['px-10 py-3 text-[14px] fw-medium border border-white/10 rounded-pill', 'sym-btn-pad small fw-medium border sym-border-white-10 rounded-pill'],
  ['pl-5 pr-1.5 py-1.5 text-[14px] fw-medium border border-white/20 rounded-pill', 'sym-email-form-pad small fw-medium border sym-border-white-20 rounded-pill'],
  ['text-white/80 hover:text-white/40 sym-transition-colors duration-300 text-[13px] fw-medium tracking-wide', 'sym-about-demo-link'],
  ['leading-relaxed', 'sym-leading-relaxed'],
  ['leading-[1.1]', 'sym-leading-tight'],
  ['z-0', 'sym-z-0'],
  ['pointer-events-none', 'pe-none'],
  ['gap-12', 'gap-5'],
  ['text-slate-400 small sym-leading-relaxed', 'text-slate-400 small sym-leading-relaxed'],
  ['absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500', 'position-absolute top-0 start-0 end-0 bottom-0 sym-shimmer'],
  ['absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent', 'sym-shimmer-inner'],
  ['absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl', 'sym-gradient-br sym-icon-indigo'],
  ['absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl', 'sym-gradient-br sym-icon-pink'],
  ['absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl', 'sym-gradient-br sym-icon-blue'],
  ['absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl', 'sym-gradient-br sym-icon-purple'],
  ['absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl', 'sym-gradient-br sym-icon-amber'],
  ['absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl', 'sym-gradient-br sym-icon-emerald'],
  ['li class="d-flex align-items-center gap-2 small text-slate-500"', 'li class="d-flex align-items-center gap-2 small text-slate-500"'],
];

function clean(html) {
  let result = html;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }
  result = result.replace(/\s+/g, ' ');
  // Fix double col classes
  result = result.replace(/col-md-6 col-lg-4 col-md-6 col-lg-4/g, 'col-md-6 col-lg-4');
  result = result.replace(/col-lg-6 col-lg-6/g, 'col-lg-6');
  return result;
}

['index.html', 'about.html', 'contact.html'].forEach((f) => {
  const fp = path.join(staticDir, f);
  let html = fs.readFileSync(fp, 'utf8');
  html = clean(html);
  // Fix service card rows - ensure col classes
  html = html.replace(
    /<div class="row g-4 stagger-reveal">\s*<div class="col-md-6 col-lg-4 sym-group position-relative">/g,
    '<div class="row g-4 stagger-reveal">\n              <div class="col-md-6 col-lg-4 sym-group position-relative">'
  );
  // About strategy cards
  html = html.replace(
    /<div class="row g-4 stagger-reveal">\s*<div class="sym-group position-relative">/g,
    '<div class="row g-4 stagger-reveal">\n                  <div class="col-md-6 col-lg-4 sym-group position-relative">'
  );
  // Two col layouts
  html = html.replace(/<div class="row sym-gap-16 align-items-center">\s*<div class="reveal-left">/g,
    '<div class="row sym-gap-16 align-items-center">\n              <div class="col-lg-6 reveal-left">');
  html = html.replace(/<div class="row sym-gap-16 align-items-center">([\s\S]*?)<div class="position-relative reveal-right">/g,
    '<div class="row sym-gap-16 align-items-center">$1<div class="col-lg-6 position-relative reveal-right">');
  html = html.replace(/<div class="row sym-gap-16">([\s\S]*?)<div class="col-lg-6 reveal-left">/g,
    '<div class="row sym-gap-16">$1<div class="col-lg-6 reveal-left">');
  html = html.replace(/<div class="row sym-gap-16">([\s\S]*?)<div class="glass sym-rounded-3xl/g,
    (m, pre) => {
      if (pre.includes('col-lg-6 reveal-left')) return m;
      return m.replace('<div class="glass sym-rounded-3xl', '<div class="col-lg-6 glass sym-rounded-3xl');
    });
  // Footer first col
  html = html.replace(
    '<div class="row sym-gap-12 sym-mb-16">\n          <div class="col-lg-4">',
    '<div class="row sym-gap-12 sym-mb-16">\n          <div class="col-md-6 col-lg-4">'
  );
  // Stats row children
  html = html.replace(
    /<div class="row g-4">\s*<div class="text-center/g,
    '<div class="row g-4">\n                    <div class="col-6 text-center'
  );
  fs.writeFileSync(fp, html, 'utf8');
  console.log('Cleaned', f);
});
