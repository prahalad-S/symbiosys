import {
  initLenis,
  initNavigation,
  initScrollReveal,
  initLucideIcons,
  setFooterYear,
} from './app.js';
import { initBackgroundVideos } from './hls-video.js';
import { initParticlesCanvas } from './three-canvas.js';
import { initAboutEmailForm } from './carousel.js';

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initNavigation('about');
  initScrollReveal();
  initLucideIcons();
  setFooterYear();
  initBackgroundVideos();

  const particlesContainer = document.getElementById('particles-canvas-container');
  if (particlesContainer) initParticlesCanvas(particlesContainer);

  initAboutEmailForm();
});
