import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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

    // ── Icosahedron + Particles ──────────────────────────────────────
    const group = new THREE.Group();
    scene.add(group);

    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(12, 1),
      new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      })
    );
    group.add(sphere);

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

      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.002;
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
    badge: "Innovating Tomorrow's Technology Today",
    heading1: 'Engineering',
    heading2: 'Excellence',
    description:
      'Symbiosys Technologies delivers world-class IT solutions, engineering services, and creative animation & VFX for global enterprises. Transforming visions into reality.',
    primaryCta: { label: 'Explore Services', section: 'services' },
    secondaryCta: { label: 'Learn More', section: 'about' },
  },
  {
    badge: 'AI Services',
    heading1: 'Learn AI for Free',
    heading2: 'and Get Certified',
    description:
      'Many leading universities and technology companies offer free AI courses, and we provide certificates to boost your resume and LinkedIn profile.',
    primaryCta: { label: 'Our Work', section: 'services' },
    secondaryCta: { label: 'Contact Us', section: 'contact' },
  },
  {
    badge: 'Slide 3 – Edit this content',
    heading1: 'Slide Three',
    heading2: 'Heading Here',
    description:
      'Add your own description for slide 3. This is a placeholder you can replace with your real content.',
    primaryCta: { label: 'Get Started', section: 'contact' },
    secondaryCta: { label: 'About Us', section: 'about' },
  },
];

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
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
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
                className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
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
                <button
                  onClick={() => scrollToSection(slide.secondaryCta.section)}
                  className="btn-secondary flex items-center gap-2 text-base"
                >
                  <Play className="w-4 h-4" />
                  <span>{slide.secondaryCta.label}</span>
                </button>
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
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: '15+', label: 'Years Experience' },
            { value: '200+', label: 'Projects Delivered' },
            { value: '50+', label: 'Global Clients' },
            { value: '99%', label: 'Client Satisfaction' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold font-display gradient-text-cyan">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
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
  const services = [
    {
      icon: Film,
      title: 'Animation & VFX',
      description: 'World-class 2D & 3D animation, storyboarding, and visual effects for film, television, and digital media.',
      features: ['2D/3D Animation', 'Storyboarding', 'Concept Art', 'VFX Production'],
      gradient: 'from-pink-500 to-rose-500',
      glowColor: 'shadow-pink-500/20',
    },
    {
      icon: Beaker,
      title: 'Testing Services',
      description: 'Comprehensive quality assurance and testing solutions ensuring flawless software performance.',
      features: ['QA Automation', 'Performance Testing', 'Security Testing', 'Mobile Testing'],
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/20',
    },
    {
      icon: BookOpen,
      title: 'Publishing Services',
      description: 'End-to-end digital publishing solutions with advanced development and analysis capabilities.',
      features: ['Digital Publishing', 'Content Development', 'Data Analysis', 'eLearning Solutions'],
      gradient: 'from-purple-500 to-violet-500',
      glowColor: 'shadow-purple-500/20',
    },
    {
      icon: Code2,
      title: 'IT Solutions',
      description: 'Custom software development and IT consulting services for enterprise transformation.',
      features: ['Custom Software', 'Cloud Solutions', 'DevOps Services', 'API Integration'],
      gradient: 'from-amber-500 to-orange-500',
      glowColor: 'shadow-amber-500/20',
    },
    {
      icon: Cog,
      title: 'Engineering Services',
      description: 'Advanced engineering solutions spanning mechanical, electrical, and civil disciplines.',
      features: ['CAD/CAM Services', 'BIM Solutions', 'Plant Design', 'Structural Analysis'],
      gradient: 'from-emerald-500 to-teal-500',
      glowColor: 'shadow-emerald-500/20',
    },
    {
      icon: Cpu,
      title: 'AI & Automation',
      description: 'Cutting-edge artificial intelligence and automation solutions for business optimization.',
      features: ['Machine Learning', 'Process Automation', 'Chatbots', 'Predictive Analytics'],
      gradient: 'from-indigo-500 to-blue-500',
      glowColor: 'shadow-indigo-500/20',
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="services" data-section className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-blue-400 mb-6">
            <Layers className="w-4 h-4" />
            Our Expertise
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6">
            Innovative Solutions for
            <span className="block gradient-text">Complex Project Needs</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We deliver comprehensive technology services across multiple verticals,
            combining technical excellence with creative innovation.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 blur-xl`} />
              <div className="relative h-full glass rounded-2xl p-8 border border-slate-800 group-hover:border-slate-700 transition-colors duration-300 overflow-hidden">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg ${service.glowColor} transition-all duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold font-display text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const stats = [
    { icon: Users, value: 500, suffix: '+', label: 'Team Members' },
    { icon: Globe, value: 25, suffix: '+', label: 'Countries Served' },
    { icon: Award, value: 50, suffix: '+', label: 'Industry Awards' },
    { icon: TrendingUp, value: 98, suffix: '%', label: 'Success Rate' },
  ];

  return (
    <section id="about" data-section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 dot-pattern opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-purple-400 mb-6">
              <Zap className="w-4 h-4" />
              About Us
            </span>

            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Pioneering Technology
              <span className="block gradient-text">Excellence Since 2008</span>
            </h2>

            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                Symbiosys Technologies is a multi-vertical company specializing in IT services,
                IT Enabled services, Engineering services, and 2D/3D Animation & VFX. Our development
                center in India, combined with offices in the US, enables us to deliver exceptional
                solutions to clients worldwide.
              </p>
              <p>
                Since our inception, we have remained committed to delivering excellent results
                for our clients by providing the highest quality of offshore development services
                across various platforms. Our team of experts constantly keeps themselves abreast
                with the latest trends in technology.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                ISO 9001:2015 Certified
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                CMMI Level 3
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                SOC 2 Compliant
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative glass rounded-3xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />

              {/* Animated Grid */}
              <div className="absolute inset-0 grid-pattern opacity-20" />

              {/* Stats Grid */}
              <div className="relative grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold font-display gradient-text">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 glass px-4 py-2 rounded-full flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-white">Enterprise Security</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -right-6 glass px-4 py-2 rounded-full flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-white">Global Delivery</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ClientsSection() {
  const clients = [
    'Google', 'AMD', 'Trimble', 'FIS', 'CSC', 'Kentz',
    'Cambridge Systems', 'Reliance', 'L&T', 'Technip',
    'Disney India', 'Prime Focus', 'Reel FX', 'Sony Television',
    'Titmouse', 'Zagtoon', 'Framebreed', 'Grid Animation'
  ];

  return (
    <section id="clients" data-section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-emerald-400 mb-6">
            <Users className="w-4 h-4" />
            Trusted By Industry Leaders
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-display">
            Our <span className="gradient-text">Global Clients</span>
          </h2>
        </motion.div>

        {/* Clients Marquee */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10" />

          {/* Scrolling Container */}
          <motion.div
            animate={{ x: [0, -1920] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8"
          >
            {[...clients, ...clients].map((client, index) => (
              <div
                key={index}
                className="flex-shrink-0 glass px-8 py-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    <span className="text-sm font-bold text-white">{client.charAt(0)}</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">
                    {client}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Second Row - Reverse Direction */}
        <div className="relative mt-6">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10" />

          <motion.div
            animate={{ x: [-1920, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8"
          >
            {[...clients.reverse(), ...clients].map((client, index) => (
              <div
                key={index}
                className="flex-shrink-0 glass px-8 py-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                    <span className="text-sm font-bold text-white">{client.charAt(0)}</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">
                    {client}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "IT specialists & technicians who have developed a niche market and an appreciation for mastering solutions to complex engineering problems, and developed software solutions in profound disciplines.",
      author: "James Wilson",
      role: "CTO, Global Tech Solutions",
      rating: 5,
    },
    {
      quote: "Our engineers constantly keep themselves abreast with the latest trends in technology that help Symbiosys Technologies stay one step ahead of its competition in its quest for knowledge and perfection.",
      author: "Priya Sharma",
      role: "Engineering Director, Innovation Labs",
      rating: 5,
    },
    {
      quote: "The animation and VFX work delivered by Symbiosys exceeded our expectations. Their attention to detail and creative vision transformed our project completely.",
      author: "Michael Chen",
      role: "Creative Director, Studio Max",
      rating: 5,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="testimonials" data-section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-pink-400 mb-6">
            <Quote className="w-4 h-4" />
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-display">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-3xl p-8 md:p-12 border border-slate-800 relative overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 opacity-10">
                <Quote className="w-24 h-24 text-blue-500" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Sparkles key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8 relative z-10">
                &ldquo;{testimonials[activeIndex].quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[activeIndex].author.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonials[activeIndex].author}</div>
                  <div className="text-sm text-slate-500">{testimonials[activeIndex].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex
                  ? 'bg-blue-500 w-8'
                  : 'bg-slate-700 hover:bg-slate-600'
                  }`}
              />
            ))}
          </div>
        </div>
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


function App() {
  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Add lenis class to html
    document.documentElement.classList.add('lenis');

    return () => {
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Fixed 3-D icosahedron – visible across all sections */}
      <HeroCanvas />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <ClientsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
