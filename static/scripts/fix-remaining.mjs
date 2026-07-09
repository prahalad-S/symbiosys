/**
 * Second-pass fix: restore mangled/partial sym-* classes to Tailwind shim classes
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const replacements = [
  // Logo hover (mangled by partial restore)
  ['sym-logo-hover-shadow transition-all duration-500-shadow', 'group-hover:shadow-blue-500/30 transition-shadow duration-300'],

  // Duplicate relative
  ['relative relative', 'relative'],

  // Mobile menu backdrop
  ['sym-bg-slate-950 sym-backdrop-blur', 'bg-slate-950/95 backdrop-blur-xl'],

  // Hero carousel nav buttons
  ['sym-w-12 sym-h-12 rounded-full glass rounded-full glass border', 'w-12 h-12 rounded-full glass border'],
  ['sym-w-12 sym-h-12 rounded-full glass border', 'w-12 h-12 rounded-full glass border'],

  // Scroll indicator
  ['sym-w-6 sym-h-10 rounded-full rounded-full border-2', 'w-6 h-10 rounded-full border-2'],
  ['sym-w-1.5 sym-h-1.5 rounded-full', 'w-1.5 h-1.5 rounded-full'],

  // Service card glow overlays (partial restore left sym-icon-* without position-absolute)
  ['absolute inset-0 sym-icon-indigo opacity-0 sym-card-glow rounded-2xl', 'absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl'],
  ['absolute inset-0 sym-icon-pink opacity-0 sym-card-glow rounded-2xl', 'absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl'],
  ['absolute inset-0 sym-icon-blue opacity-0 sym-card-glow rounded-2xl', 'absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl'],
  ['absolute inset-0 sym-icon-purple opacity-0 sym-card-glow rounded-2xl', 'absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl'],
  ['absolute inset-0 sym-icon-amber opacity-0 sym-card-glow rounded-2xl', 'absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl'],
  ['absolute inset-0 sym-icon-emerald opacity-0 sym-card-glow rounded-2xl', 'absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl'],

  // Service card icons
  ['sym-w-14 sym-h-14 rounded-xl sym-icon-indigo flex items-center justify-center mb-6 group-hover-scale sym-shadow-indigo transition-all duration-300', 'w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg shadow-indigo-500/20 transition-all duration-300'],
  ['sym-w-14 sym-h-14 rounded-xl sym-icon-pink flex items-center justify-center mb-6 group-hover-scale sym-shadow-pink transition-all duration-300', 'w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg shadow-pink-500/20 transition-all duration-300'],
  ['sym-w-14 sym-h-14 rounded-xl sym-icon-blue flex items-center justify-center mb-6 group-hover-scale sym-shadow-blue transition-all duration-300', 'w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg shadow-blue-500/20 transition-all duration-300'],
  ['sym-w-14 sym-h-14 rounded-xl sym-icon-purple flex items-center justify-center mb-6 group-hover-scale sym-shadow-purple transition-all duration-300', 'w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg shadow-purple-500/20 transition-all duration-300'],
  ['sym-w-14 sym-h-14 rounded-xl sym-icon-amber flex items-center justify-center mb-6 group-hover-scale sym-shadow-amber transition-all duration-300', 'w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg shadow-amber-500/20 transition-all duration-300'],
  ['sym-w-14 sym-h-14 rounded-xl sym-icon-emerald flex items-center justify-center mb-6 group-hover-scale sym-shadow-emerald transition-all duration-300', 'w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg shadow-emerald-500/20 transition-all duration-300'],

  // About section gradient card
  ['absolute inset-0 sym-gradient-card', 'absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20'],

  // Stats boxes
  ['sym-bg-slate-800-solid/50', 'bg-slate-800/50'],

  // Section headings (partial sym-text-*)
  ['sym-text-heading font-bold font-display', 'text-4xl md:text-5xl font-bold font-display'],
  ['sym-text-xl-md text-slate-300 leading-relaxed mb-8 relative z-10', 'text-xl md:text-2xl text-slate-300 leading-relaxed mb-8 relative z-10'],

  // Testimonial avatars
  ['rounded-full sym-gradient-avatar flex', 'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex'],

  // Contact section gradient
  ['position-absolute bottom-0 start-0 end-0 sym-gradient-blue-up', 'absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-blue-600/10 to-transparent'],
  ['absolute inset-0 sym-gradient-blue-up', 'absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-blue-600/10 to-transparent'],

  // Contact info icons
  ['sym-w-12 sym-h-12 rounded-xl sym-bg-slate-800-solid flex', 'w-12 h-12 rounded-xl bg-slate-800 flex'],

  // Form inputs - broken focus:
  ['focus: focus:border-blue-500', 'focus:outline-none focus:border-blue-500'],

  // Footer grid
  ['row sym-gap-5 mb-16', 'grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16'],
  ['row sym-gap-12 mb-16', 'grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16'],

  // Footer social links
  ['sym-w-10 sym-h-10 rounded-3 sym-bg-slate-800-solid flex items-center justify-center text-slate-400 sym-hover-white', 'w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white'],

  // About page - containers
  ['container-xl sym-container mx-auto', 'max-w-7xl mx-auto px-6 lg:px-8'],
  ['container-xl sym-container', 'max-w-7xl mx-auto px-6 lg:px-8'],

  // About page - sections padding
  ['glass sym-p-section relative', 'glass p-10 md:p-16 relative'],
  ['mb-40 glass sym-p-section relative', 'mb-40 glass p-10 md:p-16 relative'],

  // About page - gradients
  ['absolute inset-0 sym-gradient-blue-section', 'absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent'],
  ['absolute inset-0 sym-gradient-fade-up z-10 opacity-60', 'absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 opacity-60'],

  // About page - icon boxes
  ['sym-w-16 sym-h-16 rounded-2xl sym-icon-bg-blue flex', 'w-16 h-16 rounded-2xl bg-blue-500/20 flex'],
  ['sym-w-16 sym-h-16 rounded-2xl sym-icon-bg-purple flex', 'w-16 h-16 rounded-2xl bg-purple-500/20 flex'],
  ['sym-w-16 sym-h-16 rounded-2xl sym-icon-bg-cyan flex', 'w-16 h-16 rounded-2xl bg-cyan-500/20 flex'],
  ['sym-w-8 sym-h-8 text-blue-400', 'w-8 h-8 text-blue-400'],
  ['sym-w-8 sym-h-8 text-purple-400', 'w-8 h-8 text-purple-400'],
  ['sym-w-8 sym-h-8 text-cyan-400', 'w-8 h-8 text-cyan-400'],

  // About page - hero
  ['sym-about-eyebrow mb-4 reveal-up', 'text-white/80 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase mb-4 reveal-up'],
  ['sym-about-hero-title max-w-4xl mb-6 reveal-up', 'text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl reveal-up'],
  ['sym-min-h-50 mt-2 flex', 'min-h-[50px] mt-2 flex'],
  ['sym-text-white-90 sym-backdrop-blur cursor-pointer liquid-glass', 'text-white/90 backdrop-blur-sm cursor-pointer liquid-glass'],
  ['about-email-form align-items-center gap-2 sym-email-form-pad text-sm font-medium border sym-border-white-20 rounded-full sym-bg-white-02 sym-backdrop-blur w-full sym-max-w-320 sym-focus-within transition-colors liquid-glass', 'about-email-form flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-white/20 rounded-full bg-white/[0.02] backdrop-blur-sm w-full max-w-[320px] focus-within:border-white/40 transition-colors duration-300 liquid-glass'],
  ['bg-transparent text-white sym-placeholder flex-fill sym-min-w-0', 'bg-transparent text-white placeholder-white/45 outline-none flex-1 min-w-0'],
  ['sym-w-8 sym-h-8 rounded-full bg-white text-black flex items-center justify-center sym-hover-bg-white transition-colors flex-shrink-0', 'w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors shrink-0'],

  // About page - image hover
  ['transition-all duration-500-transform-slow group-hover-scale', 'transition-transform duration-700 group-hover:scale-110'],
  ['sym-text-3xl font-bold text-white mb-2', 'text-3xl font-bold text-white mb-2'],

  // Generic sym-w/h remaining
  ['sym-w-12 sym-h-12', 'w-12 h-12'],
  ['sym-w-10 sym-h-10', 'w-10 h-10'],
  ['sym-w-8 sym-h-8', 'w-8 h-8'],
  ['sym-w-6 sym-h-6', 'w-6 h-6'],
  ['sym-w-5 sym-h-5', 'w-5 h-5'],
  ['sym-w-4 sym-h-4', 'w-4 h-4'],
  ['sym-w-14 sym-h-14', 'w-14 h-14'],
  ['sym-w-16 sym-h-16', 'w-16 h-16'],

  // Bootstrap remnants
  ['align-items-center', 'items-center'],
  ['flex-fill', 'flex-1'],
  ['flex-shrink-0', 'shrink-0'],
  ['position-absolute', 'absolute'],
  ['start-0', 'left-0'],
  ['end-0', 'right-0'],
  ['bottom-0', 'bottom-0'],
  ['top-0', 'top-0'],

  // sym-text remnants
  ['sym-text-lg-md text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed', 'text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed'],
  ['sym-text-lg text-slate-400 max-w-2xl mx-auto', 'text-lg text-slate-400 max-w-2xl mx-auto'],
  ['sym-text-lg text-slate-400 mb-12', 'text-lg text-slate-400 mb-12'],
  ['sym-text-lg text-slate-300 leading-relaxed mb-6', 'text-lg text-slate-300 leading-relaxed mb-6'],
  ['sym-text-lg text-slate-300 leading-relaxed', 'text-lg text-slate-300 leading-relaxed'],
  ['sym-text-lg text-slate-400', 'text-lg text-slate-400'],
  ['sym-text-section font-display mb-6', 'text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6'],
  ['sym-text-hero font-display leading-tight mb-6', 'text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-tight mb-6'],
  ['sym-text-subheading font-display mb-6', 'text-3xl md:text-4xl font-bold font-display mb-6'],

  // sym-max-w remnants
  ['sym-max-w-5xl mx-auto', 'max-w-5xl mx-auto'],
  ['sym-max-w-4xl mx-auto', 'max-w-4xl mx-auto'],
  ['sym-max-w-3xl mx-auto', 'max-w-3xl mx-auto'],
  ['sym-max-w-2xl mx-auto', 'max-w-2xl mx-auto'],
  ['sym-max-w-320', 'max-w-[320px]'],

  // sym-mb/mt remnants
  ['sym-mb-16', 'mb-16'],
  ['sym-mb-12', 'mb-12'],
  ['sym-mb-8', 'mb-8'],
  ['sym-mb-6', 'mb-6'],
  ['sym-mb-4', 'mb-4'],
  ['sym-mb-3', 'mb-3'],
  ['sym-mb-2', 'mb-2'],
  ['sym-mt-16', 'mt-16'],
  ['sym-mt-10', 'mt-10'],
  ['sym-mt-8', 'mt-8'],
  ['sym-mt-6', 'mt-6'],

  // sym-border remnants
  ['sym-border-white-20', 'border-white/20'],
  ['sym-border-white-10', 'border-white/10'],
  ['sym-border-slate-800', 'border-slate-800'],
  ['sym-border-slate-700', 'border-slate-700'],

  // sym-bg remnants
  ['sym-bg-white-02', 'bg-white/[0.02]'],
  ['sym-bg-slate-800-solid', 'bg-slate-800'],

  // group-hover-scale without colon
  ['group-hover-scale', 'group-hover:scale-110'],

  // sym-hover remnants
  ['sym-hover-white', 'hover:text-white'],
  ['sym-hover-bg-white', 'hover:bg-white/90'],

  // sym-focus
  ['sym-focus-within', 'focus-within:border-white/40'],

  // sym-placeholder
  ['sym-placeholder', 'placeholder-white/45'],

  // rounded-3 (bootstrap) -> rounded-lg
  ['rounded-3 ', 'rounded-lg '],

  // Duplicate rounded-full glass
  ['rounded-full glass rounded-full glass', 'rounded-full glass'],

  // Clean double spaces
  ['  ', ' '],
];

function fix(html) {
  let result = html;
  for (const [from, to] of replacements) {
    if (from) result = result.split(from).join(to);
  }
  result = result.replace(/class="\s+"/g, '');
  result = result.replace(/class="([^"]*)"/g, (_, cls) => {
    const cleaned = cls.replace(/\s+/g, ' ').trim();
    return cleaned ? `class="${cleaned}"` : '';
  });
  return result;
}

['index.html', 'about.html', 'contact.html'].forEach((f) => {
  const fp = path.join(dir, f);
  let html = fs.readFileSync(fp, 'utf8');
  html = fix(html);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('Fixed', f);
});
