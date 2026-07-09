import {
  initLenis,
  initNavigation,
  initScrollReveal,
  initHeroParallax,
  initGlobeVideoScroll,
  initLucideIcons,
  setFooterYear,
} from './app.js';
import { initBackgroundVideos } from './hls-video.js';
import { initHeroCanvas } from './three-canvas.js';
import { initNeuralNetworkScene } from './neural-network.js';
import { initHeroCarousel } from './carousel.js';

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initNavigation('contact');
  initScrollReveal();
  initHeroParallax();
  initGlobeVideoScroll();
  initLucideIcons();
  setFooterYear();
  initBackgroundVideos();

  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) initHeroCanvas(canvasContainer, { withSphere: false });

  const neuralContainer = document.getElementById('neural-network-canvas');
  if (neuralContainer) initNeuralNetworkScene(neuralContainer);

  initHeroCarousel();
});
