/**
 * App initialization: Lenis smooth scroll, navigation, scroll reveals
 */

export function initLenis() {
  if (typeof Lenis === 'undefined') return null;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  document.documentElement.classList.add('lenis');
  return lenis;
}

export function initNavigation(currentPage) {
  const nav = document.getElementById('main-nav');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!nav) return;

  let mobileOpen = false;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      nav.classList.add('glass-strong', 'py-3');
      nav.classList.remove('py-6', 'bg-transparent');
    } else {
      nav.classList.remove('glass-strong', 'py-3');
      nav.classList.add('py-6', 'bg-transparent');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const toggleMobileMenu = (open) => {
    mobileOpen = open;
    if (mobileMenu) {
      mobileMenu.classList.toggle('open', open);
    }
    if (menuIcon) menuIcon.classList.toggle('hidden', open);
    if (closeIcon) closeIcon.classList.toggle('hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(!mobileOpen));
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', () => toggleMobileMenu(false));
  }

  document.querySelectorAll('[data-close-mobile-menu]').forEach((el) => {
    el.addEventListener('click', () => toggleMobileMenu(false));
  });

  // Highlight active page link
  if (currentPage) {
    document.querySelectorAll(`[data-nav-link="${currentPage}"]`).forEach((link) => {
      link.classList.add('text-white', 'nav-link-active');
      link.classList.remove('text-slate-400');
    });
  }
}

export function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .stagger-reveal'
  );

  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '-50px' }
  );

  revealElements.forEach((el) => observer.observe(el));
}

export function initHeroParallax() {
  const heroSection = document.getElementById('hero');
  const parallaxContent = document.querySelector('.hero-parallax-content');
  if (!heroSection || !parallaxContent) return;

  const onScroll = () => {
    const rect = heroSection.getBoundingClientRect();
    const sectionHeight = heroSection.offsetHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));

    const y = progress * 200;
    const opacity = 1 - progress * 2;
    const scale = 1 - progress * 0.1;

    parallaxContent.style.transform = `translateY(${y}px) scale(${Math.max(0.9, scale)})`;
    parallaxContent.style.opacity = String(Math.max(0, Math.min(1, opacity)));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export function initGlobeVideoScroll() {
  const video = document.getElementById('globe-video');
  if (!video) return;

  if (window.location.pathname.includes('services.html')) {
    return;
  }

  const breakpoints = [0, 0.3, 0.6, 1];
  const positions = [0, 35, -35, 35];

  const onScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;

    let x = 0;
    for (let i = 0; i < breakpoints.length - 1; i++) {
      if (progress >= breakpoints[i] && progress <= breakpoints[i + 1]) {
        const localProgress =
          (progress - breakpoints[i]) / (breakpoints[i + 1] - breakpoints[i]);
        x = positions[i] + (positions[i + 1] - positions[i]) * localProgress;
        break;
      }
    }
    if (progress >= breakpoints[breakpoints.length - 1]) {
      x = positions[positions.length - 1];
    }

    video.style.transform = `translateX(${x}vw)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export function initLucideIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

export function setFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}
