/**
 * Migrate static HTML from Tailwind shim classes to Bootstrap + sym-* utilities
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, '..');

const replacements = [
  // Long compound patterns first
  ['relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden flex flex-col', 'sym-bg-dark text-white overflow-hidden d-flex flex-column min-vh-100 position-relative'],
  ['relative min-h-screen flex items-center justify-center overflow-hidden', 'position-relative min-vh-100 d-flex align-items-center justify-content-center overflow-hidden'],
  ['relative min-h-screen overflow-x-hidden', 'position-relative min-vh-100 overflow-hidden'],
  ['relative min-h-screen', 'position-relative min-vh-100'],
  ['relative bg-black selection:bg-white selection:text-black min-h-screen', 'position-relative bg-black sym-selection min-vh-100'],
  ['fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6 bg-transparent nav-entrance', 'position-fixed top-0 start-0 end-0 sym-z-50 sym-transition sym-nav-py bg-transparent-nav nav-entrance'],
  ['max-w-7xl mx-auto px-6 lg:px-8', 'container-xl sym-container px-4 px-lg-5'],
  ['w-full max-w-7xl mx-auto px-6 lg:px-8', 'w-100 container-xl sym-container px-4 px-lg-5'],
  ['hidden lg:flex items-center gap-8', 'd-none d-lg-flex align-items-center gap-4'],
  ['hidden lg:flex items-center gap-4', 'd-none d-lg-flex align-items-center gap-3'],
  ['flex flex-col sm:flex-row items-center justify-center gap-4', 'd-flex flex-column flex-sm-row align-items-center justify-content-center gap-3'],
  ['flex flex-col items-center justify-center text-center px-4', 'd-flex flex-column align-items-center justify-content-center text-center px-3'],
  ['flex flex-col items-center justify-center h-full gap-8', 'd-flex flex-column align-items-center justify-content-center h-100 gap-4'],
  ['flex flex-col items-center justify-center', 'd-flex flex-column align-items-center justify-content-center'],
  ['inline-flex items-center gap-2 px-4 py-2 rounded-full glass', 'd-inline-flex align-items-center gap-2 sym-badge-pad rounded-pill glass'],
  ['inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium', 'd-inline-flex align-items-center gap-2 sym-badge-pad rounded-pill glass small fw-medium'],
  ['inline-flex items-center gap-2', 'd-inline-flex align-items-center gap-2'],
  ['flex items-center justify-between', 'd-flex align-items-center justify-content-between'],
  ['flex items-center justify-center', 'd-flex align-items-center justify-content-center'],
  ['flex items-center gap-4', 'd-flex align-items-center gap-3'],
  ['flex items-center gap-3', 'd-flex align-items-center gap-3'],
  ['flex items-center gap-2', 'd-flex align-items-center gap-2'],
  ['flex items-center gap-1', 'd-flex align-items-center gap-1'],
  ['flex items-center', 'd-flex align-items-center'],
  ['flex flex-wrap gap-4', 'd-flex flex-wrap gap-3'],
  ['flex flex-col sm:flex-row', 'd-flex flex-column flex-sm-row'],
  ['flex flex-col', 'd-flex flex-column'],
  ['flex gap-4', 'd-flex gap-3'],
  ['flex gap-1', 'd-flex gap-1'],
  ['flex gap-3 mt-10', 'd-flex gap-2 sym-mt-10'],
  ['flex justify-center gap-3 mt-8', 'd-flex justify-content-center gap-2 sym-mt-8'],
  ['flex-grow', 'flex-grow-1'],
  ['inline-flex', 'd-inline-flex'],
  ['inline-block', 'd-inline-block'],
  ['lg:hidden', 'd-lg-none'],
  ['hidden md:block', 'd-none d-md-block'],
  ['hidden', 'd-none'],
  ['absolute inset-0 z-10 grid-pattern opacity-30', 'position-absolute top-0 start-0 end-0 bottom-0 sym-z-10 grid-pattern sym-opacity-30'],
  ['absolute inset-0 z-10', 'position-absolute top-0 start-0 end-0 bottom-0 sym-z-10'],
  ['absolute inset-0 z-0', 'position-absolute top-0 start-0 end-0 bottom-0 sym-z-0'],
  ['absolute inset-0 z-20', 'position-absolute top-0 start-0 end-0 bottom-0 sym-z-20'],
  ['absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent', 'position-absolute top-0 start-0 end-0 bottom-0 sym-gradient-blue-section'],
  ['absolute inset-0 bg-gradient-to-tl from-purple-900/20 to-transparent', 'position-absolute top-0 start-0 end-0 bottom-0',],
  ['absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-transparent', 'position-absolute top-0 start-0 end-0 bottom-0'],
  ['absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10', 'position-absolute top-0 start-0 end-0 bottom-0 sym-gradient-card'],
  ['absolute inset-0 grid-pattern opacity-20', 'position-absolute top-0 start-0 end-0 bottom-0 grid-pattern sym-opacity-30'],
  ['absolute inset-0 bg-black/60', 'position-absolute top-0 start-0 end-0 bottom-0 sym-opacity-60',],
  ['absolute inset-0 bg-slate-950/95 backdrop-blur-xl', 'position-absolute top-0 start-0 end-0 bottom-0 sym-bg-slate-950 sym-backdrop-blur'],
  ['absolute inset-0', 'position-absolute top-0 start-0 end-0 bottom-0'],
  ['absolute bottom-10 left-1/2 -translate-x-1/2 z-20 scroll-indicator-bounce', 'position-absolute sym-bottom-10 start-50 translate-middle-x sym-z-20 scroll-indicator-bounce'],
  ['absolute bottom-10 left-1/2 -translate-x-1/2 z-20', 'position-absolute sym-bottom-10 start-50 translate-middle-x sym-z-20'],
  ['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', 'position-absolute top-50 start-50 translate-middle'],
  ['absolute left-0 top-1/2 -translate-y-1/2 z-30', 'position-absolute start-0 top-50 translate-middle-y sym-z-30'],
  ['absolute right-0 top-1/2 -translate-y-1/2 z-30', 'position-absolute end-0 top-50 translate-middle-y sym-z-30'],
  ['absolute -top-6 -left-6 glass px-4 py-2 rounded-full flex items-center gap-2 float-badge-up', 'position-absolute sym-neg-top-6 sym-neg-left-6 glass sym-badge-pad rounded-pill d-flex align-items-center gap-2 float-badge-up'],
  ['absolute -bottom-6 -right-6 glass px-4 py-2 rounded-full flex items-center gap-2 float-badge-down', 'position-absolute sym-neg-bottom-6 sym-neg-right-6 glass sym-badge-pad rounded-pill d-flex align-items-center gap-2 float-badge-down'],
  ['absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl', 'position-absolute sym-neg-top-10 sym-neg-right-10 sym-orb sym-orb-blue-sm'],
  ['absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl', 'position-absolute sym-neg-bottom-10 sym-neg-left-10 sym-orb sym-orb-purple-sm'],
  ['absolute bottom-8 left-8 z-20', 'position-absolute bottom-0 start-0 sym-z-20',],
  ['absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300', 'position-absolute bottom-0 end-0 sym-fade-hover'],
  ['absolute top-8 right-8 opacity-10', 'position-absolute top-0 end-0 sym-opacity-10'],
  ['absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse-glow', 'sym-orb sym-orb-blue-lg animate-pulse-glow'],
  ['absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse-glow', 'sym-orb sym-orb-purple-md animate-pulse-glow'],
  ['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[200px]', 'sym-orb sym-orb-cyan-xl'],
  ['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[200px]', 'sym-orb sym-orb-purple-lg'],
  ['absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]', 'sym-orb sym-orb-purple-section'],
  ['absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px]', 'sym-orb sym-orb-blue-section'],
  ['absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[150px]', 'sym-orb sym-orb-blue-footer'],
  ['absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]', 'sym-orb sym-orb-purple-footer'],
  ['absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[150px]', 'sym-orb sym-orb-blue-wide'],
  ['absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-blue-600/10 to-transparent', 'position-absolute bottom-0 start-0 end-0 sym-gradient-blue-up',],
  ['absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10', 'position-absolute start-0 top-0 bottom-0 sym-w-32 sym-gradient-fade-r sym-z-10'],
  ['absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10', 'position-absolute end-0 top-0 bottom-0 sym-w-32 sym-gradient-fade-l sym-z-10'],
  ['absolute top-0 left-0', 'position-absolute top-0 start-0'],
  ['absolute bottom-0 right-0', 'position-absolute bottom-0 end-0'],
  ['relative z-20 w-full', 'position-relative sym-z-20 w-100'],
  ['relative z-10 w-full mx-auto px-6 lg:px-8', 'position-relative sym-z-10 w-100 mx-auto px-4 px-lg-5'],
  ['relative z-10 max-w-7xl mx-auto px-6 lg:px-8', 'position-relative sym-z-10 container-xl sym-container px-4 px-lg-5'],
  ['relative z-10', 'position-relative sym-z-10'],
  ['relative z-10 grid md:grid-cols-2 gap-12 items-center', 'position-relative sym-z-10 row sym-gap-12 align-items-center'],
  ['relative z-10 grid md:grid-cols-2 gap-12 items-center pt-5', 'position-relative sym-z-10 row sym-gap-12 align-items-center sym-pt-5'],
  ['relative h-[400px] rounded-2xl overflow-hidden glass border border-slate-700/50 group', 'position-relative sym-h-400 sym-rounded-2xl overflow-hidden glass border sym-border-slate-700-50 sym-group'],
  ['relative h-full glass rounded-2xl p-8 border border-slate-800 group-hover:border-slate-700 transition-colors duration-300 overflow-hidden', 'position-relative h-100 glass sym-rounded-2xl sym-p-8 border sym-border-slate-800 sym-group sym-hover-border-slate sym-transition-colors overflow-hidden'],
  ['relative h-full', 'position-relative h-100'],
  ['relative max-w-4xl mx-auto', 'position-relative sym-max-w-4xl mx-auto'],
  ['relative overflow-hidden', 'position-relative overflow-hidden'],
  ['relative glass rounded-3xl p-8 overflow-hidden', 'position-relative glass sym-rounded-3xl sym-p-8 overflow-hidden'],
  ['relative', 'position-relative'],
  ['hero-parallax-content relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8', 'hero-parallax-content position-relative sym-z-20 w-100 container-xl sym-container px-4 px-lg-5'],
  ['grid lg:grid-cols-2 gap-16 items-center', 'row sym-gap-16 align-items-center'],
  ['grid md:grid-cols-2 gap-12 items-center', 'row sym-gap-12 align-items-center'],
  ['grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-reveal', 'row g-4 stagger-reveal'],
  ['grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16', 'row sym-gap-12 sym-mb-16'],
  ['grid md:grid-cols-2 gap-6', 'row g-4'],
  ['grid grid-cols-2 gap-6', 'row g-4'],
  ['grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto reveal-up', 'row g-4 sym-max-w-4xl mx-auto reveal-up'],
  ['grid lg:grid-cols-2 gap-16', 'row sym-gap-16'],
  ['text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-tight mb-6', 'sym-text-hero font-display sym-leading-tight sym-mb-6'],
  ['text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6', 'sym-text-section font-display sym-mb-6'],
  ['text-4xl md:text-5xl font-bold font-display mb-6', 'sym-text-heading font-display sym-mb-6'],
  ['text-3xl md:text-4xl font-bold font-display mb-6', 'sym-text-subheading font-display sym-mb-6'],
  ['text-3xl font-bold font-display gradient-text', 'sym-text-3xl fw-bold font-display gradient-text'],
  ['text-3xl md:text-4xl font-bold text-white mb-2', 'sym-text-subheading fw-bold text-white sym-mb-2'],
  ['text-3xl font-bold text-white mb-2', 'sym-text-3xl fw-bold text-white sym-mb-2'],
  ['text-2xl font-display font-semibold text-white hover:text-blue-400 transition-colors', 'sym-text-2xl font-display fw-semibold text-white sym-hover-blue-400 sym-transition-colors'],
  ['text-xl md:text-2xl text-slate-300 leading-relaxed mb-8 relative z-10', 'sym-text-xl-md text-slate-300 sym-leading-relaxed sym-mb-8 position-relative sym-z-10'],
  ['text-xl font-bold font-display text-white mb-3 group-hover:text-blue-400 transition-colors', 'sym-text-lg fw-bold font-display text-white sym-mb-3 sym-group-hover-blue sym-transition-colors'],
  ['text-xl font-bold font-display', 'sym-text-lg fw-bold font-display'],
  ['text-lg md:text-xl text-slate-400 max-w-2hxl mx-auto mb-12 leading-relaxed', 'sym-text-lg-md text-slate-400 sym-max-w-2xl mx-auto sym-mb-12 sym-leading-relaxed'],
  ['text-lg text-slate-400 max-w-2xl mx-auto', 'sym-text-lg text-slate-400 sym-max-w-2xl mx-auto'],
  ['text-lg text-slate-400 mb-12', 'sym-text-lg text-slate-400 sym-mb-12'],
  ['text-lg text-slate-300 leading-relaxed mb-6', 'sym-text-lg text-slate-300 sym-leading-relaxed sym-mb-6'],
  ['text-lg text-slate-300 leading-relaxed', 'sym-text-lg text-slate-300 sym-leading-relaxed'],
  ['text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed', 'sym-text-lg text-slate-300 sym-max-w-3xl mx-auto sym-leading-relaxed'],
  ['text-lg text-slate-400', 'sym-text-lg text-slate-400'],
  ['text-lg', 'sym-text-lg'],
  ['text-sm font-medium text-slate-300', 'small fw-medium text-slate-300'],
  ['text-sm font-medium text-white', 'small fw-medium text-white'],
  ['text-sm font-medium text-slate-400 mb-2', 'small fw-medium text-slate-400 sym-mb-2'],
  ['text-sm text-slate-500 mt-1', 'small text-slate-500 sym-mt-1'],
  ['text-sm text-slate-500', 'small text-slate-500'],
  ['text-sm text-slate-400 hover:text-white transition-colors', 'small text-slate-400 sym-hover-white sym-transition-colors'],
  ['text-sm text-slate-400', 'small text-slate-400'],
  ['text-sm text-slate-300', 'small text-slate-300'],
  ['text-sm', 'small'],
  ['text-xs text-slate-500 uppercase tracking-widest', 'sym-text-xs text-slate-500 text-uppercase sym-tracking-widest'],
  ['text-xs font-medium text-white', 'sym-text-xs fw-medium text-white'],
  ['text-xs font-bold', 'sym-text-xs fw-bold'],
  ['text-xs', 'sym-text-xs'],
  ['text-3xl md:text-4xl font-bold font-display gradient-text-cyan', 'sym-text-stat fw-bold font-display gradient-text-cyan'],
  ['text-4xl md:text-5xl font-bold font-display', 'sym-text-heading fw-bold font-display'],
  ['text-4xl md:text-5xl font-bold font-display mb-6', 'sym-text-heading fw-bold font-display sym-mb-6'],
  ['text-white font-medium', 'text-white fw-medium'],
  ['text-white font-bold text-lg', 'text-white fw-bold sym-text-lg'],
  ['text-white font-semibold', 'text-white fw-semibold'],
  ['text-white font-bold', 'text-white fw-bold'],
  ['text-white', 'text-white'],
  ['text-center mb-20', 'text-center sym-mb-20'],
  ['text-center mb-16', 'text-center sym-mb-16'],
  ['text-center', 'text-center'],
  ['block text-white', 'd-block text-white'],
  ['block gradient-text', 'd-block gradient-text'],
  ['font-bold font-display', 'fw-bold font-display'],
  ['font-semibold', 'fw-semibold'],
  ['font-medium', 'fw-medium'],
  ['font-bold', 'fw-bold'],
  ['font-display', 'font-display'],
  ['capitalize', 'text-capitalize'],
  ['whitespace-nowrap', 'text-nowrap'],
  ['uppercase', 'text-uppercase'],
  ['w-40 h-auto flex items-center justify-center group-hover:shadow-blue-500/30 transition-shadow duration-300', 'sym-w-40 h-auto d-flex align-items-center justify-content-center sym-logo-hover-shadow sym-transition-shadow'],
  ['w-40 h-auto flex items-center justify-center', 'sym-w-40 h-auto d-flex align-items-center justify-content-center'],
  ['w-40 h-auto', 'sym-w-40 h-auto'],
  ['w-full h-full object-cover opacity-100', 'w-100 h-100 object-fit-cover'],
  ['w-full h-full object-cover', 'w-100 h-100 object-fit-cover'],
  ['w-full', 'w-100'],
  ['h-full', 'h-100'],
  ['w-6 h-6', 'sym-w-6 sym-h-6'],
  ['w-5 h-5', 'sym-w-5 sym-h-5'],
  ['w-4 h-4', 'sym-w-4 sym-h-4'],
  ['w-7 h-7 text-white', 'sym-w-7 sym-h-7 text-white'],
  ['w-8 h-8 text-blue-400 mx-auto mb-3', 'sym-w-8 sym-h-8 text-blue-400 mx-auto sym-mb-3'],
  ['w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg', 'sym-w-14 sym-h-14 rounded-circle sym-gradient-avatar d-flex align-items-center justify-content-center text-white fw-bold sym-text-lg'],
  ['w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center', 'sym-w-12 sym-h-12 sym-rounded-xl sym-bg-slate-800-solid d-flex align-items-center justify-content-center'],
  ['w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors', 'sym-w-10 sym-h-10 rounded-3 sym-bg-slate-800-solid d-flex align-items-center justify-content-center text-slate-400 sym-social-hover sym-transition-colors'],
  ['w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6', 'sym-w-16 sym-h-16 sym-rounded-2xl d-flex align-items-center justify-content-center sym-mb-6',],
  ['w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6', 'sym-w-16 sym-h-16 sym-rounded-2xl d-flex align-items-center justify-content-center mx-auto sym-mb-6'],
  ['w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6', 'sym-w-16 sym-h-16 sym-rounded-2xl d-flex align-items-center justify-content-center sym-mb-6'],
  ['py-32 overflow-hidden', 'sym-section-py overflow-hidden'],
  ['py-20 border-t border-slate-800/50 mt-auto', 'sym-py-20 border-top sym-border-slate mt-auto'],
  ['p-10 md:p-16  relative overflow-hidden pb-5 border-top-0 border-start-0 border-end-0', 'sym-p-section position-relative overflow-hidden sym-pb-5 border-0'],
  ['p-10 md:p-16 relative overflow-hidden pb-5 border-0', 'sym-p-section position-relative overflow-hidden sym-pb-5 border-0'],
  ['glass rounded-3xl p-8 border border-slate-800', 'glass sym-rounded-3xl sym-p-8 border sym-border-slate-800'],
  ['glass rounded-3xl p-8 md:p-12 border border-slate-800 relative overflow-hidden', 'glass sym-rounded-3xl sym-p-card-lg border sym-border-slate-800 position-relative overflow-hidden'],
  ['rounded-3xl p-8 border border-slate-800', 'sym-rounded-3xl sym-p-8 border sym-border-slate-800'],
  ['rounded-full', 'rounded-pill'],
  ['rounded-2xl', 'sym-rounded-2xl'],
  ['rounded-xl', 'sym-rounded-xl'],
  ['rounded-lg', 'rounded-3'],
  ['border-t border-slate-800/50', 'border-top sym-border-slate'],
  ['border-t border-slate-800', 'border-top sym-border-slate-800'],
  ['border border-slate-800/50', 'border sym-border-slate-800-50'],
  ['border border-slate-800', 'border sym-border-slate-800'],
  ['border border-slate-700/50', 'border sym-border-slate-700-50'],
  ['border border-slate-700', 'border sym-border-slate-700'],
  ['border border-white/10 text-white hover:bg-white/10 hover:border-white/30 hover:scale-110 transition-all duration-300 shadow-lg', 'border sym-border-white-10 text-white sym-btn-glass-hover sym-transition-fast shadow'],
  ['border border-white/10', 'border sym-border-white-10'],
  ['border-2 border-slate-600 flex items-start justify-center p-1', 'border border-2 sym-border-slate-600 d-flex align-items-start justify-content-center p-1'],
  ['group relative', 'sym-group position-relative'],
  ['group', 'sym-group'],
  ['space-y-6', 'sym-space-y-6'],
  ['space-y-4', 'sym-space-y-4'],
  ['space-y-3', 'sym-space-y-3'],
  ['space-y-2', 'sym-space-y-2'],
  ['overflow-hidden', 'overflow-hidden'],
  ['overflow-x-hidden', 'overflow-hidden'],
  ['order-2 md:order-1', 'order-2 order-md-1'],
  ['order-1 md:order-2', 'order-1 order-md-2'],
  ['lg:col-span-2', 'col-lg-4'],
  ['mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto reveal-up', 'sym-mt-16 row g-4 sym-max-w-4xl mx-auto reveal-up'],
  ['mt-16 grid', 'sym-mt-16 row'],
  ['mt-16', 'sym-mt-16'],
  ['mt-10', 'sym-mt-10'],
  ['mt-8', 'sym-mt-8'],
  ['mt-6', 'sym-mt-6'],
  ['mt-4', 'mt-4'],
  ['mt-2', 'mt-2'],
  ['mt-1', 'mt-1'],
  ['mt-auto', 'mt-auto'],
  ['mb-16', 'sym-mb-16'],
  ['mb-12', 'sym-mb-12'],
  ['mb-8', 'sym-mb-8'],
  ['mb-6', 'sym-mb-6'],
  ['mb-4', 'sym-mb-4'],
  ['mb-3', 'sym-mb-3'],
  ['mb-2', 'sym-mb-2'],
  ['mb-1', 'mb-1'],
  ['mb-40', 'sym-mb-40'],
  ['mb-20', 'sym-mb-20'],
  ['mx-auto', 'mx-auto'],
  ['flex-shrink-0 glass px-8 py-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group', 'flex-shrink-0 glass sym-card-pad sym-rounded-xl border sym-border-slate-800 sym-hover-border-slate sym-transition-colors sym-group'],
  ['btn-primary group flex items-center gap-2 text-base', 'btn-primary sym-group d-flex align-items-center gap-2 sym-text-lg'],
  ['btn-primary text-sm', 'btn-primary small'],
  ['btn-secondary flex items-center gap-2 text-base', 'btn-secondary d-flex align-items-center gap-2 sym-text-lg'],
  ['btn-primary mt-4 inline-flex', 'btn-primary mt-4 d-inline-flex'],
  ['btn-primary mt-4', 'btn-primary mt-4'],
  ['w-full btn-primary py-4 text-base', 'w-100 btn-primary sym-py-4 sym-text-lg'],
  ['w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors', 'w-100 px-3 sym-py-3 sym-rounded-xl sym-bg-slate-800 border sym-border-slate-700 text-white sym-input-focus sym-transition-colors'],
  ['w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition-colors', 'w-100 px-3 sym-py-3 sym-rounded-xl sym-bg-slate-800 border sym-border-slate-700 text-white sym-input-focus sym-transition-colors'],
  ['rotate-180', 'sym-rotate-180'],
  ['group-hover:translate-x-1 transition-transform', 'sym-group-hover-translate'],
  ['transition-all duration-300 rounded-full', 'sym-transition-fast rounded-pill'],
  ['transition-colors duration-300', 'sym-transition-colors'],
  ['transition-colors', 'sym-transition-colors'],
  ['transition-transform duration-700 group-hover:scale-110', 'sym-transition-transform-slow sym-group-hover-scale'],
  ['resize-none', 'sym-resize-none'],
  ['shrink-0', 'flex-shrink-0'],
  ['min-w-0', 'sym-min-w-0'],
  ['object-contain opacity-80', 'object-fit-contain sym-opacity-60'],
  ['opacity-30', 'sym-opacity-30'],
  ['text-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50', 'text-center sym-p-6 sym-rounded-2xl sym-bg-slate-800 border sym-border-slate-700-50'],
  ['text-center', 'text-center'],
  ['flex flex-col md:flex-row items-center justify-between gap-4', 'd-flex flex-column flex-md-row align-items-center justify-content-between gap-3'],
  ['hero-dot transition-all duration-300 rounded-full w-2.5 h-2.5 bg-slate-600 hover:bg-slate-400', 'hero-dot'],
  ['testimonial-dot w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-all duration-300', 'testimonial-dot'],
  ['absolute inset-0 z-0', 'position-absolute top-0 start-0 end-0 bottom-0 sym-z-0'],
  ['mobile-menu-content relative flex flex-col items-center justify-center h-full gap-8', 'mobile-menu-content position-relative d-flex flex-column align-items-center justify-content-center h-100 gap-4'],
  ['flex items-center gap-3 group', 'd-flex align-items-center gap-3 sym-group'],
  ['flex items-center gap-3 mb-6', 'd-flex align-items-center gap-3 sym-mb-6'],
  ['flex gap-4', 'd-flex gap-3'],
  ['flex items-center gap-6', 'd-flex align-items-center gap-4'],
  ['list-none', 'list-unstyled'],
];

function migrateClassString(classStr) {
  let result = classStr;
  for (const [from, to] of replacements) {
    if (!from || !to) continue;
    // Word boundary aware replacement within class string
    const regex = new RegExp(`(^|\\s)${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'g');
    result = result.replace(regex, `$1${to}$2`);
  }
  // Cleanup duplicate spaces
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

function addColClasses(html) {
  // Add col classes to row children based on row parent classes
  const rowPatterns = [
    { rowClass: 'row g-4 stagger-reveal', childClass: 'col-md-6 col-lg-4' },
    { rowClass: 'row g-4', childClass: 'col-md-6' },
    { rowClass: 'row sym-gap-16 align-items-center', childClass: 'col-lg-6' },
    { rowClass: 'row sym-gap-12 align-items-center', childClass: 'col-md-6' },
    { rowClass: 'row sym-gap-16', childClass: 'col-lg-6' },
    { rowClass: 'row g-4 sym-max-w-4xl mx-auto reveal-up', childClass: 'col-6 col-md-3' },
    { rowClass: 'row sym-gap-12 sym-mb-16', childClass: 'col-md-6 col-lg-2' },
    { rowClass: 'relative grid grid-cols-2 gap-6', childClass: 'col-6' },
  ];

  for (const { rowClass, childClass } of rowPatterns) {
    const regex = new RegExp(`(<div class="${rowClass.replace(/ /g, '\\s+')}[^"]*">)([\\s\\S]*?)(<\\/div>)`, 'g');
    html = html.replace(regex, (match, open, inner, close) => {
      const updated = inner.replace(/<div class="(sym-group position-relative|col-lg-4|order-\d[^"]*|text-center[^"]*)"/g, (m, cls) => {
        if (cls.startsWith('col-')) return m;
        return `<div class="${childClass} ${cls}"`;
      });
      // First child of footer row with lg:col-span-2
      return open + updated + close;
    });
  }
  return html;
}

function migrateFile(filename) {
  const filepath = path.join(staticDir, filename);
  let html = fs.readFileSync(filepath, 'utf8');

  // Update CSS links
  html = html.replace(
    '<link rel="stylesheet" href="css/styles.css">',
    '<link rel="stylesheet" href="css/bootstrap-custom.css">\n  <link rel="stylesheet" href="css/styles.css">'
  );

  // Migrate class attributes
  html = html.replace(/class="([^"]*)"/g, (_, classes) => {
    return `class="${migrateClassString(classes)}"`;
  });

  // Fix footer brand col span
  html = html.replace(
    /(<div class="row sym-gap-12 sym-mb-16">\s*)<div class="col-md-6 col-lg-2 col-lg-4">/g,
    '$1<div class="col-md-6 col-lg-4">'
  );

  // Add col classes to service cards
  html = html.replace(
    /(<div class="row g-4 stagger-reveal">)\s*(<div class="sym-group position-relative">)/g,
    '$1\n              <div class="col-md-6 col-lg-4 sym-group position-relative">'
  );
  html = html.replace(
    /(<div class="row g-4 stagger-reveal">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/,
    (m) => m.replace(/<div class="sym-group position-relative">/g, '<div class="col-md-6 col-lg-4 sym-group position-relative">')
  );

  // Two-column sections
  html = html.replace(
    /(<div class="row sym-gap-16 align-items-center">)\s*(<div class="reveal-left">)/g,
    '$1\n              <div class="col-lg-6 reveal-left">'
  );
  html = html.replace(
    /(<div class="row sym-gap-16 align-items-center">[\s\S]*?)<div class="relative reveal-right">/g,
    '$1<div class="col-lg-6 position-relative reveal-right">'
  );
  html = html.replace(
    /(<div class="row sym-gap-16 align-items-center">[\s\S]*?)<div class="position-relative reveal-right">/g,
    '$1<div class="col-lg-6 position-relative reveal-right">'
  );

  // Stats grid inside about card
  html = html.replace(
    '<div class="row g-4">',
    '<div class="row g-4">'
  );

  // Hero dots - simplify classes
  html = html.replace(/class="hero-dot[^"]*"/g, 'class="hero-dot"');
  html = html.replace(/class="testimonial-dot[^"]*"/g, 'class="testimonial-dot"');

  // About page specific
  html = html.replace(
    'text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl reveal-up',
    'sym-about-hero-title sym-max-w-4xl reveal-up'
  );

  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`Migrated ${filename}`);
}

// Strip tailwind shim from styles.css
function stripTailwindShim() {
  const cssPath = path.join(staticDir, 'css', 'styles.css');
  let css = fs.readFileSync(cssPath, 'utf8');
  const startMarker = '/* ================================================================\n   TAILWIND UTILITY SHIM';
  const endMarker = '/* ================================================================\n   REDUCED MOTION';
  const startIdx = css.indexOf(startMarker);
  const endIdx = css.indexOf(endMarker);
  if (startIdx !== -1 && endIdx !== -1) {
    css = css.slice(0, startIdx) + css.slice(endIdx);
    // Remove duplicate bootstrap overrides section at end if present
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('Stripped Tailwind shim from styles.css');
  }
}

['index.html', 'about.html', 'contact.html'].forEach(migrateFile);
stripTailwindShim();
console.log('Migration complete!');
