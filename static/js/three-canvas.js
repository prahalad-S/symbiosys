import * as THREE from 'three';

function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  context.beginPath();
  context.arc(32, 32, 30, 0, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}


const LEFT_X = 18;
const RIGHT_X = -18;

const sectionTargetX = (idx) => (idx % 2 === 0 ? LEFT_X : RIGHT_X);

/**
 * Vanilla Three.js HeroCanvas – scroll-animated fixed overlay
 * @param {HTMLElement} container
 * @param {{ withSphere?: boolean }} options
 */
export function initHeroCanvas(container, options = {}) {
  const { withSphere = true } = options;
  if (!container) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 30;
  camera.position.x = LEFT_X;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = withSphere ? '100%' : '100%';
  renderer.domElement.style.height = withSphere ? '110%' : '100%';
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  let sphere = null;
  if (withSphere) {
    sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(12, 1),
      new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
    );
    group.add(sphere);
  }

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
      map: createCircleTexture(),
      alphaTest: 0.01
    })
  );
  group.add(particleMesh);

  let sectionEls = [];
  let sectionRatios = [];
  let currentSectionIdx = 0;

  const refreshSections = () => {
    sectionEls = Array.from(document.querySelectorAll('[data-section]'));
    sectionRatios = new Array(sectionEls.length).fill(0);
  };
  refreshSections();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = sectionEls.indexOf(entry.target);
        if (idx !== -1) sectionRatios[idx] = entry.intersectionRatio;
      });
      let maxRatio = -1;
      sectionRatios.forEach((r, i) => {
        if (r > maxRatio) {
          maxRatio = r;
          currentSectionIdx = i;
        }
      });
    },
    { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
  );

  sectionEls.forEach((el) => observer.observe(el));

  let targetCameraX = LEFT_X;
  let currentCameraX = LEFT_X;
  let scrollStopTimer = null;

  const onScroll = () => {
    if (sectionEls.length === 0) refreshSections();

    const fromX = sectionTargetX(currentSectionIdx);
    const nextIdx = Math.min(currentSectionIdx + 1, sectionEls.length - 1);
    const toX = sectionTargetX(nextIdx);

    let frac = 0;
    if (nextIdx !== currentSectionIdx) {
      const nextEl = sectionEls[nextIdx];
      const rect = nextEl.getBoundingClientRect();
      frac = Math.max(
        0,
        Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
      );
    }

    targetCameraX = fromX + (toX - fromX) * frac;

    if (scrollStopTimer) clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      targetCameraX = sectionTargetX(currentSectionIdx);
    }, 150);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  let mouseX = 0;
  let mouseY = 0;
  const onMouseMove = (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  };
  document.addEventListener('mousemove', onMouseMove);

  let rafId;
  const animate = () => {
    rafId = requestAnimationFrame(animate);

    if (sphere) {
      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.002;
    }
    particleMesh.rotation.y -= 0.0005;

    group.rotation.x += (mouseY * 0.4 - group.rotation.x) * 0.05;
    group.rotation.y += (mouseX * 0.4 - group.rotation.y) * 0.05;

    currentCameraX += (targetCameraX - currentCameraX) * 0.05;
    camera.position.x = currentCameraX;

    renderer.render(scene, camera);
  };
  animate();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

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
}

/**
 * Particles-only canvas for About page
 */
export function initParticlesCanvas(container) {
  if (!container) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 30;

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
      map: createCircleTexture(),
      alphaTest: 0.01
    })
  );
  group.add(particleMesh);

  let mouseX = 0;
  let mouseY = 0;
  const onMouseMove = (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  };
  document.addEventListener('mousemove', onMouseMove);

  let rafId;
  const animate = () => {
    rafId = requestAnimationFrame(animate);
    particleMesh.rotation.y -= 0.0005;
    group.rotation.x += (mouseY * 0.4 - group.rotation.x) * 0.05;
    group.rotation.y += (mouseX * 0.4 - group.rotation.y) * 0.05;
    renderer.render(scene, camera);
  };
  animate();

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
}
