import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import greetings from '../content/greetings.json';

const { hint: sphereHint } = greetings.threeSphere;

const SPHERE_RADIUS = 340;
const LOVE_FRAME_BG = '#c9184a';
const LOVE_FRAME_EDGE = '#ff4d6d';
const PACKING = 1.05;

/** Kích thước khung đẹp (portrait / vuông / ngang nhẹ) — mỗi ảnh chọn ngẫu nhiên có kiểm soát */
const FRAME_PRESETS = [
  { w: 68, h: 94 },
  { w: 76, h: 104 },
  { w: 82, h: 112 },
  { w: 70, h: 98 },
  { w: 88, h: 88 },
  { w: 92, h: 74 },
  { w: 74, h: 108 },
  { w: 86, h: 96 },
];

function pickFrameSize(seed) {
  const base = FRAME_PRESETS[seed % FRAME_PRESETS.length];
  const t = Math.sin(seed * 127.1 + 311.7) * 0.5 + 0.5;
  const scale = 0.92 + t * 0.14;
  return { width: base.w * scale, height: base.h * scale };
}

/**
 * Lưới kinh/vĩ độ — ảnh xếp thành vòng ngang, tạo cảm giác quả cầu (giống TikTok photo sphere).
 */
function buildLatLongSlots(radius, cardW, cardH) {
  const slots = [];
  const angH = cardH / radius;
  const poleLimit = Math.PI / 2 - angH * 0.55;

  for (let lat = -poleLimit + angH * 0.5; lat <= poleLimit - angH * 0.5; lat += angH) {
    const cosLat = Math.cos(lat);
    const ringR = radius * cosLat;
    if (ringR < cardW * 0.45) continue;

    const circumference = 2 * Math.PI * ringR;
    const count = Math.max(3, Math.round(circumference / (cardW * PACKING)));
    const lonStep = (2 * Math.PI) / count;
    const rowIndex = Math.round((lat + poleLimit) / angH);
    const lonOffset = rowIndex % 2 === 0 ? 0 : lonStep * 0.5;

    for (let j = 0; j < count; j++) {
      const lon = lonOffset + j * lonStep;
      slots.push(
        new THREE.Vector3(
          ringR * Math.cos(lon),
          radius * Math.sin(lat),
          ringR * Math.sin(lon),
        ),
      );
    }
  }

  return slots;
}

function orientOnSphere(card, position) {
  const normal = position.clone().normalize();
  const worldUp = new THREE.Vector3(0, 1, 0);
  let right = new THREE.Vector3().crossVectors(worldUp, normal);

  if (right.lengthSq() < 1e-8) {
    right.set(1, 0, 0);
  } else {
    right.normalize();
  }

  const up = new THREE.Vector3().crossVectors(normal, right).normalize();
  const basis = new THREE.Matrix4().makeBasis(right, up, normal);
  card.quaternion.setFromRotationMatrix(basis);
}

function sharpenTexture(texture, renderer) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
}

/** object-fit: cover — một chiều fill khung, chiều kia crop giữa */
function applyTextureCover(texture, frameW, frameH, imgW, imgH) {
  if (!imgW || !imgH) return;

  const frameAspect = frameW / frameH;
  const imgAspect = imgW / imgH;

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.center.set(0.5, 0.5);

  if (imgAspect > frameAspect) {
    const repeatX = frameAspect / imgAspect;
    texture.repeat.set(repeatX, 1);
    texture.offset.set((1 - repeatX) / 2, 0);
  } else {
    const repeatY = imgAspect / frameAspect;
    texture.repeat.set(1, repeatY);
    texture.offset.set(0, (1 - repeatY) / 2);
  }
}

function createPhotoCard(sourceTexture, renderer, frameSize, slotIndex) {
  const { width: w, height: h } = frameSize;
  const img = sourceTexture.image;
  const imgW = img?.width || 1;
  const imgH = img?.height || 1;

  const texture = sourceTexture.clone();
  sharpenTexture(texture, renderer);
  applyTextureCover(texture, w, h, imgW, imgH);

  const frameGeo = new THREE.PlaneGeometry(w, h);
  const edgeGeo = new THREE.PlaneGeometry(w + 4, h + 4);
  const geometries = [frameGeo, edgeGeo];

  const frameBg = new THREE.Mesh(
    frameGeo,
    new THREE.MeshBasicMaterial({
      color: LOVE_FRAME_BG,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    }),
  );

  const edgeMesh = new THREE.Mesh(
    edgeGeo,
    new THREE.MeshBasicMaterial({
      color: LOVE_FRAME_EDGE,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  edgeMesh.position.z = -0.3;

  const imageMesh = new THREE.Mesh(
    frameGeo,
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: true,
    }),
  );
  imageMesh.position.z = 0.4;

  const card = new THREE.Group();
  card.add(edgeMesh);
  card.add(frameBg);
  card.add(imageMesh);

  return {
    card,
    imageMesh,
    frameBg,
    edgeMesh,
    texture,
    geometries,
    slotIndex,
  };
}

function loadTexture(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

// Đọc toàn bộ ảnh trong thư mục — thêm/xóa file sẽ HMR reload component
const imageModules = import.meta.glob('../assets/images/*.{png,jpg,jpeg,gif,webp}', {
  eager: true,
});

function loadImageUrls() {
  return Object.entries(imageModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .map(([, mod]) => mod.default)
    .filter(Boolean);
}


export default function ThreeSphere({ onTriggerLetter }) {
  const containerRef = useRef(null);
  const triggerExplosionRef = useRef(null);
  const onTriggerLetterRef = useRef(onTriggerLetter);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    onTriggerLetterRef.current = onTriggerLetter;
  }, [onTriggerLetter]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const imageUrls = loadImageUrls();

    if (imageUrls.length === 0) {
      console.warn('ThreeSphere: không có ảnh trong src/assets/images/');
      const skipTimer = window.setTimeout(() => {
        if (!disposed) onTriggerLetterRef.current?.();
      }, 1500);
      return () => {
        disposed = true;
        window.clearTimeout(skipTimer);
      };
    }

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d0104');
    scene.fog = new THREE.FogExp2('#0d0104', 0.00085);

    const camera = new THREE.PerspectiveCamera(52, width / height, 1, 5000);
    camera.position.set(0, 0, 820);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText =
      'display:block;position:absolute;inset:0;z-index:1;width:100%;height:100%;touch-action:none;' +
      '-webkit-mask-image:radial-gradient(circle at 50% 48%,#000 0%,#000 36%,rgba(0,0,0,0.55) 52%,transparent 68%);' +
      'mask-image:radial-gradient(circle at 50% 48%,#000 0%,#000 36%,rgba(0,0,0,0.55) 52%,transparent 68%);';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const pointLight = new THREE.PointLight(0xff8fab, 1.3, 2500);
    pointLight.position.set(180, 120, 500);
    scene.add(pointLight);

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1600;
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const radius = 1000 + Math.random() * 700;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2 * Math.PI;
      const phi = Math.acos(2 * v - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
      starColors[i] = 1;
      starColors[i + 1] = 0.55 + Math.random() * 0.35;
      starColors[i + 2] = 0.75 + Math.random() * 0.2;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const starCtx = starCanvas.getContext('2d');
    const starGrad = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    starGrad.addColorStop(0, 'rgba(255,255,255,1)');
    starGrad.addColorStop(1, 'rgba(255,255,255,0)');
    starCtx.fillStyle = starGrad;
    starCtx.fillRect(0, 0, 32, 32);
    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starsMaterial = new THREE.PointsMaterial({
      size: 5,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });
    const starParticles = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starParticles);

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    const textureLoader = new THREE.TextureLoader();
    const cardItems = [];

    const buildCards = async () => {
      try {
        const textures = await Promise.all(
          imageUrls.map((url) => loadTexture(textureLoader, url)),
        );
        if (disposed) {
          textures.forEach((t) => t.dispose());
          return;
        }

        const slotW = Math.max(...FRAME_PRESETS.map((p) => p.w)) * 1.08;
        const slotH = Math.max(...FRAME_PRESETS.map((p) => p.h)) * 1.08;
        const slots = buildLatLongSlots(SPHERE_RADIUS, slotW, slotH);

        slots.forEach((targetPos, i) => {
          const sourceTexture = textures[i % textures.length];
          const frameSize = pickFrameSize(i);
          const photo = createPhotoCard(sourceTexture, renderer, frameSize, i);

          photo.card.position.copy(targetPos);
          orientOnSphere(photo.card, targetPos);
          sphereGroup.add(photo.card);

          cardItems.push({
            ...photo,
            velocity: new THREE.Vector3(),
            fadeSpeed: 0.03 + Math.random() * 0.02,
          });
        });
      } catch (err) {
        console.error('ThreeSphere: load ảnh thất bại', err);
        if (!disposed) onTriggerLetterRef.current?.();
      }
    };

    let sphereRotY = 0;
    let sphereRotX = 0;
    let autoSpin = 0.0025;
    let isDragging = false;
    let pointerId = null;
    let lastX = 0;
    let lastY = 0;
    let dragMoved = false;
    let pointerDownX = 0;
    let pointerDownY = 0;

    const onPointerDown = (e) => {
      if (isDispersed) return;
      isDragging = true;
      dragMoved = false;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      autoSpin = 0;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(e.clientX - pointerDownX) > 6 || Math.abs(e.clientY - pointerDownY) > 6) {
        dragMoved = true;
      }
      sphereRotY += dx * 0.006;
      sphereRotX += dy * 0.006;
      sphereRotX = THREE.MathUtils.clamp(sphereRotX, -0.85, 0.85);
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const endDrag = (e) => {
      if (e.pointerId !== pointerId) return;
      isDragging = false;
      pointerId = null;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      if (!dragMoved && !isDispersed) {
        triggerExplosionRef.current?.();
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);

    let mouseX = 0;
    let mouseY = 0;
    let camX = 0;
    let camY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX - width / 2) * 0.35;
      mouseY = (e.clientY - height / 2) * 0.35;
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationId;
    let isDispersed = false;
    let dispersionTime = 0;

    const animate = () => {
      if (disposed) return;
      animationId = requestAnimationFrame(animate);

      if (!isDispersed) {
        if (!isDragging) {
          sphereRotY += autoSpin;
          if (autoSpin < 0.0025) autoSpin = Math.min(0.0025, autoSpin + 0.00006);
        }
        sphereGroup.rotation.y = sphereRotY;
        sphereGroup.rotation.x = sphereRotX;
      } else {
        sphereGroup.rotation.y += 0.012;
      }

      camX += (mouseX - camX) * 0.04;
      camY += (-mouseY - camY) * 0.04;
      camera.position.set(camX, camY, 820);
      camera.lookAt(0, 0, 0);

      starParticles.rotation.y -= 0.00035;

      cardItems.forEach((item) => {
        const { imageMesh, frameBg, edgeMesh, card, velocity, fadeSpeed } = item;

        if (isDispersed) {
          card.position.add(velocity);
          imageMesh.material.opacity = Math.max(0, imageMesh.material.opacity - 0.02);
          frameBg.material.opacity = Math.max(0, frameBg.material.opacity - 0.02);
          edgeMesh.material.opacity = Math.max(0, edgeMesh.material.opacity - 0.02);
          card.scale.multiplyScalar(0.984);
        } else {
          if (frameBg.material.opacity < 1) {
            frameBg.material.opacity = Math.min(1, frameBg.material.opacity + fadeSpeed);
          }
          if (edgeMesh.material.opacity < 0.9) {
            edgeMesh.material.opacity = Math.min(0.9, edgeMesh.material.opacity + fadeSpeed);
          }
          if (imageMesh.material.opacity < 1) {
            imageMesh.material.opacity = Math.min(1, imageMesh.material.opacity + fadeSpeed);
          }
        }
      });

      if (isDispersed && Date.now() - dispersionTime > 1600) {
        onTriggerLetterRef.current?.();
        return;
      }

      renderer.render(scene, camera);
    };

    buildCards();
    animate();

    const handleResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    triggerExplosionRef.current = () => {
      if (isDispersed) return;
      isDispersed = true;
      dispersionTime = Date.now();
      setClicked(true);

      cardItems.forEach((item) => {
        const dir = item.card.position.clone().normalize();
        dir.x += (Math.random() - 0.5) * 0.45;
        dir.y += (Math.random() - 0.5) * 0.45;
        dir.z += (Math.random() - 0.5) * 0.45;
        dir.normalize();
        item.velocity.copy(dir).multiplyScalar(12 + Math.random() * 14);
      });
    };

    return () => {
      disposed = true;
      triggerExplosionRef.current = null;
      cancelAnimationFrame(animationId);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', endDrag);
      container.removeEventListener('pointercancel', endDrag);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      starTexture.dispose();
      cardItems.forEach((item) => {
        item.geometries?.forEach((geo) => geo.dispose());
        item.texture?.dispose();
        item.imageMesh.material.dispose();
        item.frameBg.material.dispose();
        item.edgeMesh.material.dispose();
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="three-sphere-stage">
      {!clicked && <div className="sphere-hint-text">{sphereHint}</div>}

      <style>{`
        .three-sphere-stage {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10;
          cursor: grab;
          background: #0d0104;
          isolation: isolate;
        }

        .three-sphere-stage:active {
          cursor: grabbing;
        }

        .sphere-hint-text {
          position: fixed;
          left: 50%;
          bottom: max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1rem));
          transform: translateX(-50%);
          box-sizing: border-box;
          width: min(92vw, 22rem);
          max-width: calc(100vw - 2rem);
          padding: 0.5rem 0.85rem;
          color: #ff9fb2;
          font-size: clamp(0.8rem, 3.2vw, 1.05rem);
          font-weight: 500;
          line-height: 1.45;
          letter-spacing: 0.02em;
          text-align: center;
          text-wrap: balance;
          white-space: normal;
          text-shadow: 0 0 12px rgba(255, 77, 109, 0.75);
          background: rgba(13, 1, 4, 0.72);
          border: 1px solid rgba(255, 77, 109, 0.25);
          border-radius: 999px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: sphereHintPulse 2.2s infinite ease-in-out;
          pointer-events: none;
          z-index: 30;
          font-family: 'Outfit', sans-serif;
        }

        @media (max-width: 640px) {
          .sphere-hint-text {
            bottom: auto;
            top: max(4.5rem, calc(env(safe-area-inset-top, 0px) + 3.25rem));
            width: min(94vw, 20rem);
            font-size: clamp(0.78rem, 3.6vw, 0.95rem);
            padding: 0.45rem 0.75rem;
            border-radius: 12px;
          }
        }

        @keyframes sphereHintPulse {
          0%, 100% {
            opacity: 0.72;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
