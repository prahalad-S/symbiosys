/**
 * Hero carousel with auto-advance and slide transitions
 */
export function initHeroCarousel(options = {}) {
  const {
    trackSelector = '#hero-carousel-track',
    slideSelector = '.hero-slide',
    prevBtnSelector = '#hero-prev-slide',
    nextBtnSelector = '#hero-next-slide',
    dotSelector = '.hero-dot',
    autoInterval = 6000,
    onCtaClick,
  } = options;

  const track = document.querySelector(trackSelector);
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(slideSelector));
  const prevBtn = document.querySelector(prevBtnSelector);
  const nextBtn = document.querySelector(nextBtnSelector);
  const dots = Array.from(document.querySelectorAll(dotSelector));

  if (!slides.length) return;

  let currentSlide = 0;
  let direction = 1;
  let timer = null;

  const updateDots = () => {
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('w-8', 'h-2.5', 'bg-gradient-to-r', 'from-blue-500', 'to-purple-500');
        dot.classList.remove('w-2.5', 'h-2.5', 'bg-slate-600');
      } else {
        dot.classList.remove('w-8', 'h-2.5', 'bg-gradient-to-r', 'from-blue-500', 'to-purple-500');
        dot.classList.add('w-2.5', 'h-2.5', 'bg-slate-600');
      }
    });
  };

  const goToSlide = (index, dir) => {
    if (index === currentSlide) return;
    direction = dir;

    const prev = slides[currentSlide];
    const next = slides[index];

    slides.forEach((slide) => {
      if (slide !== prev && slide !== next) {
        slide.classList.remove('active', 'exit-left', 'exit-right', 'enter-from-left', 'enter-from-right');
      }
    });

    prev.classList.remove('active');
    prev.classList.add(dir > 0 ? 'exit-left' : 'exit-right');

    next.classList.remove('exit-left', 'exit-right');
    next.classList.add(dir > 0 ? 'enter-from-right' : 'enter-from-left');

    setTimeout(() => {
      next.classList.add('active');
      next.classList.remove('enter-from-right', 'enter-from-left');
    }, 50);

    setTimeout(() => {
      prev.classList.remove('exit-left', 'exit-right');
    }, 700);

    currentSlide = index;
    updateDots();
  };

  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length, -1);
  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length, 1);

  const startAuto = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => nextSlide(), autoInterval);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (timer) clearInterval(timer);
    } else {
      startAuto();
    }
  });

  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i, i > currentSlide ? 1 : -1);
      startAuto();
    });
  });

  // CTA buttons
  track.querySelectorAll('[data-cta-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-cta-section');
      if (onCtaClick) {
        onCtaClick(section);
      } else if (section) {
        if (section.startsWith('http://') || section.startsWith('https://')) {
          window.open(section, '_blank', 'noopener,noreferrer');
        } else {
          const el = document.getElementById(section);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  slides[0].classList.add('active');
  updateDots();
  startAuto();
}

/**
 * Testimonials carousel
 */
export function initTestimonialsCarousel() {
  const container = document.getElementById('testimonials-carousel');
  if (!container) return;

  const slides = Array.from(container.querySelectorAll('.testimonial-slide'));
  const dots = Array.from(document.querySelectorAll('.testimonial-dot'));
  if (!slides.length) return;

  let activeIndex = 0;

  let isAnimating = false;

  const goTo = (index) => {
    if (index === activeIndex || isAnimating) return;
    isAnimating = true;

    slides[activeIndex].classList.remove('active');
    slides[activeIndex].classList.add('exit');

    const prevIndex = activeIndex;
    const nextIndex = index;

    setTimeout(() => {
      slides[prevIndex].classList.remove('exit');
      slides[nextIndex].classList.add('active');
      activeIndex = nextIndex;
      isAnimating = false;

      dots.forEach((dot, i) => {
        if (i === nextIndex) {
          dot.classList.add('bg-blue-500', 'w-8');
          dot.classList.remove('bg-slate-700', 'w-3');
        } else {
          dot.classList.remove('bg-blue-500', 'w-8');
          dot.classList.add('bg-slate-700', 'w-3');
        }
      });
    }, 500);
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  slides[0].classList.add('active');
}

/**
 * About page email capture form
 */
export function initAboutEmailForm() {
  const btn = document.getElementById('about-email-btn');
  const form = document.getElementById('about-email-form');
  const input = document.getElementById('about-email-input');
  const submitBtn = document.getElementById('about-email-submit');
  const submitIcon = document.getElementById('about-email-submit-icon');

  if (!btn || !form) return;

  let submitted = false;
  const fullPlaceholder = 'Enter Your Email Here For Early Access';
  const submittedPlaceholder = 'You Will Receive Notifications By Email';

  btn.addEventListener('click', () => {
    btn.classList.add('hidden');
    form.classList.add('visible');
    typePlaceholder(input, submitted ? submittedPlaceholder : fullPlaceholder);
    if (input) input.focus();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitted = true;
    if (submitIcon) {
      submitIcon.setAttribute('data-lucide', 'check');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    setTimeout(() => {
      btn.classList.remove('hidden');
      form.classList.remove('visible');
      submitted = false;
      if (submitIcon) {
        submitIcon.setAttribute('data-lucide', 'arrow-right');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      if (input) input.value = '';
    }, 4000);
  });
}

function typePlaceholder(input, text) {
  if (!input) return;
  let i = 0;
  input.placeholder = '';
  const interval = setInterval(() => {
    input.placeholder = text.slice(0, i + 1);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 60);
}
