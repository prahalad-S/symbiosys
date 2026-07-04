import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Users, Target, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import Hls from 'hls.js';
import * as THREE from 'three';

function ParticlesCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer
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

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    document.addEventListener('mousemove', onMouseMove);

    // Animation loop
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      particleMesh.rotation.y -= 0.0005;

      group.rotation.x += (mouseY * 0.4 - group.rotation.x) * 0.05;
      group.rotation.y += (mouseX * 0.4 - group.rotation.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
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

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoSrc = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8';

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => { });
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => { });
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover opacity-100"
      />
      {/* Dark overlay to match theme */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}

function AboutHero() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const fullPlaceholder = emailSubmitted ? "You Will Receive Notifications By Email" : "Enter Your Email Here For Early Access";

  useEffect(() => {
    if (showEmailForm) {
      let i = 0;
      setPlaceholder("");
      const interval = setInterval(() => {
        setPlaceholder(fullPlaceholder.slice(0, i + 1));
        i++;
        if (i >= fullPlaceholder.length) clearInterval(interval);
      }, 60);
      return () => clearInterval(interval);
    }
  }, [showEmailForm, fullPlaceholder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitted(true);
    setTimeout(() => {
      setShowEmailForm(false);
      setEmailSubmitted(false);
    }, 4000);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
      <BackgroundVideo />
      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/80 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase mb-4"
        >
          BUILD A NO-CODE AI APP IN MINUTES
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          A new way to think and create <br className="hidden md:block" /> with computers
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="min-h-[50px] mt-2 flex items-center justify-center w-full"
        >
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.button
                key="btn"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowEmailForm(true)}
                className="px-10 py-3 text-[14px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer liquid-glass"
              >
                Get early access
              </motion.button>
            ) : (
              <motion.form
                key="form"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-white/20 rounded-full bg-white/[0.02] backdrop-blur-sm w-full max-w-[320px] focus-within:border-white/40 transition-colors duration-300 liquid-glass"
              >
                <input
                  type="email"
                  autoFocus
                  required
                  placeholder={placeholder}
                  className="bg-transparent text-white placeholder-white/45 outline-none flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors shrink-0"
                >
                  {emailSubmitted ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a href="#demo" className="text-white/80 hover:text-white/40 transition-colors duration-300 text-[13px] font-medium tracking-wide">
            Play Video Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}


export default function AboutUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={containerRef} className="relative bg-black selection:bg-white selection:text-black min-h-screen">
      <ParticlesCanvas />
      {/* New Hero Section */}
      <AboutHero />

      {/* Rest of the Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Content Section 1: The Company */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-40 glass rounded-3xl p-10 md:p-16 border border-slate-800/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">The Company</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                Symbiosys Technologies provides high-quality services and solutions to our clients worldwide. Our development center is located in India with offices in the US. The company aims at developing innovative and cost-effective end-to-end technology solutions with high performance and security.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                Since our inception, we have been committed to delivering excellent results for our clients. As results-oriented problem solvers, we thrive to successfully meet our client's requirements on a priority basis. We take pride in teaching the technology to everyone we talk to and feel privileged in getting them to experience it.
              </p>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden glass border border-slate-700/50 group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 opacity-60" />
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                alt="Global Network"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <div className="text-3xl font-bold text-white mb-2">Global Reach</div>
                <div className="text-blue-400 font-medium">India & United States</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Section 2: Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-40 glass rounded-3xl p-10 md:p-16 border border-slate-800/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/20 to-transparent" />
          <div className="relative z-10">
            <div className="text-center mb-16">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">Business Strategy & Approach</h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                We help our customers focus on their core business activities by providing high-quality and low-risk solutions to complex problems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Strategic Solutions", desc: "Developing strategic business solutions using onsite, offsite and offshore project execution methodologies." },
                { title: "Customer Satisfaction", desc: "Providing consummate and laudable products aimed strictly at maximum customer satisfaction." },
                { title: "Stringent Timelines", desc: "Maintaining strict timelines for product deployment and providing effective after-sales support." }
              ].map((item, i) => (
                <div key={i} className="glass p-8 rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Section 3: Workforce */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="glass rounded-3xl p-10 md:p-16 border border-slate-800/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-transparent" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative h-[400px] rounded-2xl overflow-hidden glass border border-slate-700/50 group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 opacity-60" />
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                alt="Our Team"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <div className="text-3xl font-bold text-white mb-2">Proficient Experts</div>
                <div className="text-cyan-400 font-medium">Highly Trained Engineers</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">Our Workforce</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                The proficient workforce at Symbiosys Technologies comprises highly trained engineers, IT specialists & technicians who have developed a niche market and an appreciation for mastering solutions to complex engineering problems.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                Our engineers constantly keep themselves abreast with the latest trends in technology. We encourage growth and development within the organization to cater to the demands of a constantly expanding domain and market diversification.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
