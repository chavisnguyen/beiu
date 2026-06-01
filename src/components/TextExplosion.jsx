import React, { useEffect, useRef } from 'react';
import greetings from '../content/greetings.json';

const { word1: WORD1_TEXT, word2: WORD2, timing: TIMING } = greetings.textExplosion;
const WORD2_LINE1 = WORD2.line1;
const WORD2_LINE2 = WORD2.line2;

export default function TextExplosion({ onComplete }) {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let finished = false;
    let animationId;
    let particles = [];
    let state = 'word1';
    const timers = [];

    const schedule = (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      onCompleteRef.current?.();
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor(x, y) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(255, ${Math.floor(Math.random() * 80 + 100)}, ${Math.floor(Math.random() * 120 + 120)}, ${Math.random() * 0.5 + 0.5})`;
        this.tx = x;
        this.ty = y;
        this.vx = 0;
        this.vy = 0;
        this.acc = 0.1 + Math.random() * 0.05;
        this.friction = 0.84 + Math.random() * 0.08;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.012;
      }

      update() {
        if (state === 'explode') {
          this.x += this.vx;
          this.y += this.vy;
          this.vx *= 0.98;
          this.vy *= 0.98;
          this.alpha -= this.decay;
          return;
        }

        const dx = this.tx - this.x;
        const dy = this.ty - this.y;
        this.vx += dx * this.acc;
        this.vy += dy * this.acc;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        this.x += Math.sin(Date.now() * 0.003 + this.y) * 0.12;
        this.y += Math.cos(Date.now() * 0.003 + this.x) * 0.12;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = '#ff4d6d';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const getTexPixels = (text, fontSize, yOffset = 0) => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return [];

      const size = window.innerWidth < 768 ? fontSize * 0.65 : fontSize;
      tempCanvas.width = window.innerWidth;
      tempCanvas.height = window.innerHeight;

      tempCtx.fillStyle = '#ffffff';
      tempCtx.font = `600 ${size}px Outfit, "Segoe UI", Arial, sans-serif`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const lines = text.split('\n');
      const lineHeight = size * 1.2;
      const blockHeight = (lines.length - 1) * lineHeight;
      const startY = tempCanvas.height / 2 - blockHeight / 2 + yOffset;

      lines.forEach((line, index) => {
        tempCtx.fillText(line.trim(), tempCanvas.width / 2, startY + index * lineHeight);
      });

      const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imgData.data;
      const points = [];
      const step = window.innerWidth < 768 ? 4 : 3;

      for (let y = 0; y < tempCanvas.height; y += step) {
        for (let x = 0; x < tempCanvas.width; x += step) {
          const index = (y * tempCanvas.width + x) * 4;
          if (data[index + 3] > 128) {
            points.push({ x, y });
          }
        }
      }
      return points;
    };

    const measureWord2 = () => {
      const combined = getTexPixels(`${WORD2_LINE1}\n${WORD2_LINE2}`, 88);
      if (combined.length > 0) return combined;

      const line1 = getTexPixels(WORD2_LINE1, 88, -50);
      const line2 = getTexPixels(WORD2_LINE2, 88, 50);
      return line1.concat(line2);
    };

    let word1Points = [];
    let word2Points = [];

    const measureAll = async () => {
      try {
        if (document.fonts?.load) {
          await Promise.all([
            document.fonts.load('600 110px Outfit'),
            document.fonts.load('600 88px Outfit'),
          ]);
        } else if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        /* fallback fonts */
      }

      if (cancelled) return;
      word1Points = getTexPixels(WORD1_TEXT, 110);
      word2Points = measureWord2();
    };

    const spawnParticles = (points) => {
      if (!points.length) return;
      particles = points.map((p) => new Particle(p.x, p.y));
    };

    const retargetParticles = (points) => {
      if (!points.length) return;

      while (particles.length < points.length) {
        const p = points[particles.length];
        particles.push(new Particle(p.x, p.y));
      }
      if (particles.length > points.length) {
        particles.length = points.length;
      }

      particles.forEach((p, idx) => {
        const target = points[idx];
        p.tx = target.x;
        p.ty = target.y;
        p.alpha = 1;
      });
    };

    const goToWord2 = () => {
      if (cancelled || finished || state !== 'word1') return;
      state = 'word2';

      if (word2Points.length === 0) {
        word2Points = measureWord2();
      }
      if (word2Points.length === 0) {
        goToExplode();
        return;
      }

      retargetParticles(word2Points);
    };

    const goToExplode = () => {
      if (cancelled || finished || state === 'explode') return;
      state = 'explode';

      particles.forEach((p) => {
        const angle =
          Math.atan2(p.y - canvas.height / 2, p.x - canvas.width / 2) +
          (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 18 + 10;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      });
    };

    const startSequence = async () => {
      await measureAll();
      if (cancelled || finished) return;

      spawnParticles(word1Points.length ? word1Points : getTexPixels(WORD1_TEXT, 110));
      state = 'word1';

      schedule(goToWord2, TIMING.word1);
      schedule(goToExplode, TIMING.word1 + TIMING.word2);
      schedule(finish, TIMING.word1 + TIMING.word2 + TIMING.explode);
    };

    const loop = () => {
      if (cancelled || finished) return;

      ctx.fillStyle = 'rgba(13, 1, 4, 0.28)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(loop);
    };

    startSequence();
    loop();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0d0104',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    />
  );
}
