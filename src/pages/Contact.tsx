import { useEffect, useRef, useState } from 'react';
import mapImg from '../assets/map.png';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
  ChevronRight,
  Play,
  Zap,
  Shield,
  Globe,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  Quote,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Film,
  Beaker,
  BookOpen,
  Cog
} from 'lucide-react';
import Lenis from 'lenis';
import * as THREE from 'three';

// ============================================
// HERO CANVAS (Vanilla Three.js – scroll-animated, fixed overlay)
// ============================================
//
// Rules:
//   • Even-index sections (0, 2, 4 …) → sphere on the LEFT  (camera.x = +LEFT_X)
//   • Odd-index  sections (1, 3, 5 …) → sphere on the RIGHT (camera.x = -RIGHT_X)
//   • During scroll the camera X interpolates between the current and next target.
//   • 150 ms after scroll stops the camera snaps to the current section's side.
//   • Sections are discovered via data-section attributes so new sections work automatically.

const LEFT_X = 18;   // camera offset → sphere appears on left
const RIGHT_X = -18;   // camera offset → sphere appears on right

/** Returns the target camera X for a given 0-based section index */
const sectionTargetX = (idx: number) => (idx % 2 === 0 ? LEFT_X : RIGHT_X);

function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Scene & Camera ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    camera.position.x = LEFT_X; // start at left (section 0)

    // ── Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMesh = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        size: 0.12,
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.75,
      })
    );
    group.add(particleMesh);

    // ── Section detection via IntersectionObserver ──────────────────
    //
    // We observe every <section> element with a data-section attribute.
    // The one with the highest intersection ratio is considered "current".
    // Adding data-section to a new <section> is all that's needed.

    let sectionEls: HTMLElement[] = [];
    let sectionRatios: number[] = [];
    let currentSectionIdx = 0;

    const refreshSections = () => {
      sectionEls = Array.from(
        document.querySelectorAll<HTMLElement>('[data-section]')
      );
      sectionRatios = new Array(sectionEls.length).fill(0);
    };
    refreshSections();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = sectionEls.indexOf(entry.target as HTMLElement);
          if (idx !== -1) sectionRatios[idx] = entry.intersectionRatio;
        });
        // The section with the most visible area wins
        let maxRatio = -1;
        sectionRatios.forEach((r, i) => {
          if (r > maxRatio) { maxRatio = r; currentSectionIdx = i; }
        });
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    sectionEls.forEach((el) => observer.observe(el));

    // ── Scroll-driven interpolation ─────────────────────────────────
    //
    // While scrolling: interpolate camera X between the current section's
    // target and the next section's target based on how far the next
    // section has scrolled into view.
    // After scroll stops (150 ms): snap camera X to current section target.

    let targetCameraX = LEFT_X;
    let currentCameraX = LEFT_X;
    let scrollStopTimer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      // Re-query sections lazily in case the DOM changed
      if (sectionEls.length === 0) refreshSections();

      const fromX = sectionTargetX(currentSectionIdx);
      const nextIdx = Math.min(currentSectionIdx + 1, sectionEls.length - 1);
      const toX = sectionTargetX(nextIdx);

      // How far has the NEXT section scrolled into view? (0 → 1)
      let frac = 0;
      if (nextIdx !== currentSectionIdx) {
        const nextEl = sectionEls[nextIdx];
        const rect = nextEl.getBoundingClientRect();
        // frac goes 0→1 as the next section's top crosses from bottom-of-viewport to top
        frac = Math.max(0, Math.min(1,
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
        ));
      }

      targetCameraX = fromX + (toX - fromX) * frac;

      // Scroll-stop snap
      if (scrollStopTimer) clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        targetCameraX = sectionTargetX(currentSectionIdx);
      }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Mouse parallax ──────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    document.addEventListener('mousemove', onMouseMove);

    // ── Animation loop ──────────────────────────────────────────────
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // sphere.rotation.x += 0.001; // Removed so the plane video stays flat
      // sphere.rotation.y += 0.002;
      particleMesh.rotation.y -= 0.0005;

      // Subtle mouse parallax on rotation
      group.rotation.x += (mouseY * 0.4 - group.rotation.x) * 0.05;
      group.rotation.y += (mouseX * 0.4 - group.rotation.y) * 0.05;

      // Ease camera X toward target
      currentCameraX += (targetCameraX - currentCameraX) * 0.05;
      camera.position.x = currentCameraX;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ──────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ─────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (scrollStopTimer) clearTimeout(scrollStopTimer);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      id="canvas-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

// ============================================
// 3D COMPONENTS
// ============================================

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const nodeCount = 30;
  const nodes = useRef<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }[]>([]);

  useEffect(() => {
    nodes.current = Array.from({ length: nodeCount }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      vz: (Math.random() - 0.5) * 0.02,
    }));
  }, []);

  useFrame(() => {
    if (!groupRef.current || !linesRef.current) return;

    nodes.current.forEach((node, i) => {
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;

      if (Math.abs(node.x) > 5) node.vx *= -1;
      if (Math.abs(node.y) > 5) node.vy *= -1;
      if (Math.abs(node.z) > 5) node.vz *= -1;

      const mesh = groupRef.current!.children[i] as THREE.Mesh;
      if (mesh) {
        mesh.position.set(node.x, node.y, node.z);
      }
    });

    // Update connection lines
    const positions: number[] = [];
    nodes.current.forEach((node1, i) => {
      nodes.current.slice(i + 1).forEach((node2) => {
        const dist = Math.sqrt(
          Math.pow(node1.x - node2.x, 2) +
          Math.pow(node1.y - node2.y, 2) +
          Math.pow(node1.z - node2.z, 2)
        );
        if (dist < 2.5) {
          positions.push(node1.x, node1.y, node1.z);
          positions.push(node2.x, node2.y, node2.z);
        }
      });
    });

    const geometry = linesRef.current.geometry as THREE.BufferGeometry;
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <group ref={groupRef}>
        {Array.from({ length: nodeCount }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#8b5cf6" />
          </mesh>
        ))}
      </group>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.3} />
      </lineSegments>
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <NeuralNetwork />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

// ============================================
// UI COMPONENTS
// ============================================

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Determine active section
      const sections = ['hero', 'services', 'about', 'clients', 'testimonials', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'clients', label: 'Clients' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong py-3' : 'py-6 bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.a
              href="#hero"
              onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-40 h-auto flex items-center justify-center group-hover:shadow-blue-500/30 transition-shadow duration-300">

                <img src="/assets/symbiosys-logo.png" alt="Symbiosys Logo" className='w-full' />

              </div>

            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`relative text-sm font-medium transition-colors duration-300 ${activeSection === link.id ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => scrollToSection('contact')}
                className="btn-primary text-sm"
              >
                <span>Get Started</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex flex-col items-center justify-center h-full gap-8"
            >
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => scrollToSection(link.id)}
                  className="text-2xl font-display font-semibold text-white hover:text-blue-400 transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => scrollToSection('contact')}
                className="btn-primary mt-4"
              >
                <span>Get Started</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hero slide data – edit content here
const heroSlides = [
  {
    badge: 'General',
    heading1: 'Drop Your Message',
    heading2: 'info@symbiosystech.com',
    description:
      'We would love to hear from you! Whether you have a question, need support, or want to discuss a project, our team is here to help.',
    primaryCta: { label: 'Contact now', section: 'contact' }
  },
  {
    badge: "Engineering",
    heading1: 'For Engineering Services',
    heading2: 'esd@symbiosystech.com',
    description:
      'Contact our engineering experts to discuss your project requirements and get a detailed quote.',
    primaryCta: { label: 'Contact now', section: 'contact' }
  },
  {
    badge: 'Main Office',
    heading1: 'IT Park, Rushikonda',
    heading2: 'Visakhapatnam',
    description:
      'Alternatively, fill out the contact form below, and we will get back to you as soon as possible. We aim to respond within one business day.',
    primaryCta: { label: 'Location', section: 'services' }
  }
];


function GlobeVideoOverlay() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll();
  const x = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ['0vw', '35vw', '-35vw', '35vw']
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoSrc = 'https://stream.mux.com/BuGGTsiXq1T00WUb8qfURrHkTCbhrkfFLSv4uAOZzdhw.m3u8';
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => { });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => { });
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[5] overflow-hidden">
      <motion.video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{ mixBlendMode: 'screen', x, width: '1000px', height: '10000px' }}
        className="object-contain opacity-80"
      />
    </div>
  );
}

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const totalSlides = heroSlides.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const scrollToSection = (id: string) => {
    if (id.startsWith('http://') || id.startsWith('https://')) {
      window.open(id, '_blank', 'noopener,noreferrer');
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToSlide = (index: number, dir: number) => {
    setDirection(dir);
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides, -1);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % totalSlides, 1);
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  const slide = heroSlides[currentSlide];

  return (
    <section
      id="hero"
      data-section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene />
        </Canvas>
      </div>

      {/* HTML Video Globe overlay removed from here, moved to Home */}


      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[200px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-10 grid-pattern opacity-30" />

      {/* Carousel Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8"
      >
        {/* Slides */}
        <div className="relative overflow-hidden min-h-[520px] flex items-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">{slide.badge}</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-tight mb-6"
              >
                <span className="block text-white">{slide.heading1}</span>
                <span className="block gradient-text">{slide.heading2}</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-slate-400 max-w-2hxl mx-auto mb-12 leading-relaxed"
              >
                {slide.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button
                  onClick={() => scrollToSection(slide.primaryCta.section)}
                  className="btn-primary group flex items-center gap-2 text-base"
                >
                  <span>{slide.primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {/* <button
                  onClick={() => scrollToSection(slide.secondaryCta.section)}
                  className="btn-secondary flex items-center gap-2 text-base"
                >
                  <Play className="w-4 h-4" />
                  <span>{slide.secondaryCta.label}</span>
                </button> */}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrow Navigation */}
        <button
          id="hero-prev-slide"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full glass border border-white/10 text-white hover:bg-white/10 hover:border-white/30 hover:scale-110 transition-all duration-300 shadow-lg"
          style={{ marginLeft: '-0.5rem' }}
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <button
          id="hero-next-slide"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full glass border border-white/10 text-white hover:bg-white/10 hover:border-white/30 hover:scale-110 transition-all duration-300 shadow-lg"
          style={{ marginRight: '-0.5rem' }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              id={`hero-dot-${i}`}
              onClick={() => goToSlide(i, i > currentSlide ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${i === currentSlide
                ? 'w-8 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500'
                : 'w-2.5 h-2.5 bg-slate-600 hover:bg-slate-400'
                }`}
            />
          ))}
        </div>

        {/* Stats Preview */}

      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-slate-500 uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-blue-500"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ServicesSection() {

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="services" data-section className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div ref={containerRef} className="relative z-10 w-full mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <img src={mapImg} style={{ width: '100%', filter: 'grayscale(1)' }} alt="" />
        </motion.div>
      </div>
    </section>
  );
}


function ContactSection() {
  const contactInfo = [
    { icon: MapPin, label: 'Location', value: 'India & United States' },
    { icon: Mail, label: 'Email', value: 'info@symbiosystech.com' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
  ];

  return (
    <section id="contact" data-section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-blue-600/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-cyan-400 mb-6">
              <ExternalLink className="w-4 h-4" />
              Get In Touch
            </span>

            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Let&apos;s Build Something
              <span className="block gradient-text">Extraordinary Together</span>
            </h2>

            <p className="text-lg text-slate-400 mb-12">
              Ready to transform your ideas into reality? Our team of experts is here
              to help you achieve your technology goals.
            </p>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 border border-slate-800"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Service Interest</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">Select a service</option>
                  <option value="animation">Animation & VFX</option>
                  <option value="testing">Testing Services</option>
                  <option value="publishing">Publishing Services</option>
                  <option value="it">IT Solutions</option>
                  <option value="engineering">Engineering Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>

              <button type="submit" className="w-full btn-primary py-4 text-base">
                <span>Send Message</span>
                <ChevronRight className="w-5 h-5 inline-block ml-2" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const footerLinks = {
    services: ['Animation & VFX', 'Testing Services', 'Publishing', 'IT Solutions', 'Engineering'],
    company: ['About Us', 'Careers', 'Blog', 'Press', 'Partners'],
    resources: ['Documentation', 'Case Studies', 'Whitepapers', 'Webinars', 'Support'],
    legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  };

  return (
    <footer className="relative py-20 border-t border-slate-800/50">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#hero" className="flex items-center gap-3 mb-6">
              <div className="w-40 h-auto flex items-center justify-center">

                <img src="assets/symbiosys-logo.png" alt="Symbiosys Logo" className='w-full' />

              </div>

            </a>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Delivering world-class technology solutions across IT, engineering,
              and creative services for global enterprises since 2008.
            </p>
            <div className="flex gap-4">
              {['LinkedIn', 'Twitter', 'YouTube', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <span className="text-xs font-bold">{social.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 capitalize">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Symbiosys Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN APP
// ============================================


export default function Contact() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fixed 3-D icosahedron – visible across all sections */}
      <HeroCanvas />

      {/* Global Fixed Video Overlay */}
      <GlobeVideoOverlay />

      {/* Main Content */}
      <main>
        <HeroSection />
        <ServicesSection />

        <ContactSection />
      </main>
    </div>
  );
}


