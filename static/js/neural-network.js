import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

/**
 * Vanilla Three.js port of React Three Fiber NeuralNetwork + Scene
 */
export function initNeuralNetworkScene(container) {
  if (!container) return () => { };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 5);
  scene.add(dirLight);
  const pointLight = new THREE.PointLight(0x8b5cf6, 0.5);
  pointLight.position.set(-10, -10, -10);
  scene.add(pointLight);

  // Stars (port of @react-three/drei Stars)
  const starCount = 5000;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 100 * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      map: createCircleTexture(),
      alphaTest: 0.01
    })
  );
  scene.add(stars);

  // Neural network nodes
  const nodeCount = 30;
  const nodes = Array.from({ length: nodeCount }, () => ({
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    z: (Math.random() - 0.5) * 10,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02,
    vz: (Math.random() - 0.5) * 0.02,
  }));

  const nodeGroup = new THREE.Group();
  const nodeMeshes = [];
  const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });

  nodes.forEach((node) => {
    const mesh = new THREE.Mesh(sphereGeo, nodeMat);
    mesh.position.set(node.x, node.y, node.z);
    nodeGroup.add(mesh);
    nodeMeshes.push(mesh);
  });
  scene.add(nodeGroup);

  const lineGeo = new THREE.BufferGeometry();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  let rafId;
  const animate = () => {
    rafId = requestAnimationFrame(animate);

    nodes.forEach((node, i) => {
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;

      if (Math.abs(node.x) > 5) node.vx *= -1;
      if (Math.abs(node.y) > 5) node.vy *= -1;
      if (Math.abs(node.z) > 5) node.vz *= -1;

      nodeMeshes[i].position.set(node.x, node.y, node.z);
    });

    const positions = [];
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach((node2) => {
        const dist = Math.sqrt(
          (node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2 + (node1.z - node2.z) ** 2
        );
        if (dist < 2.5) {
          positions.push(node1.x, node1.y, node1.z, node2.x, node2.y, node2.z);
        }
      });
    });

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    lineGeo.attributes.position.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    controls.dispose();
    renderer.dispose();
    sphereGeo.dispose();
    nodeMat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
    starGeo.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
