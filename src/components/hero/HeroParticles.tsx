import React, { useEffect, useRef } from 'react';

interface HeroParticlesProps {
  scrollY: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  vy: number;
  vx: number;
  driftPhase: number;
  driftSpeed: number;
  color: string;
}

const PARTICLE_COLORS = [
  '#34d399', // Mint
  '#10b981', // Emerald
  '#6ee7b7', // Light mint
  '#a7f3d0', // Pale emerald
  '#ffffff', // Pure soft white
];

export const HeroParticles: React.FC<HeroParticlesProps> = ({ scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollYRef = useRef(scrollY);

  useEffect(() => {
    scrollYRef.current = scrollY;
  }, [scrollY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    const initParticles = () => {
      const count = width < 640 ? 35 : 70;
      particles = [];
      for (let i = 0; i < count; i++) {
        const baseAlpha = 0.12 + Math.random() * 0.45;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.8 + Math.random() * 1.8,
          baseAlpha,
          alpha: baseAlpha,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.2 - Math.random() * 0.35,
          driftPhase: Math.random() * Math.PI * 2,
          driftSpeed: 0.01 + Math.random() * 0.02,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
    };

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, canvas.parentElement?.clientWidth || window.innerWidth || 320);
      height = Math.max(1, canvas.parentElement?.clientHeight || window.innerHeight || 480);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    handleResize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', handleResize);
    }

    let isVisible = true;
    const intersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      isVisible = entry.isIntersecting;
      if (isVisible && !animId) {
        animId = requestAnimationFrame(render);
      }
    }, { threshold: 0.05 });

    if (canvas.parentElement) {
      intersectionObserver.observe(canvas.parentElement);
    }

    const render = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      if (width <= 0 || height <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const scrollOffset = (scrollYRef.current || 0) * 0.25;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.driftPhase += p.driftSpeed;
        p.x += p.vx + Math.sin(p.driftPhase) * 0.2;
        p.y += p.vy;

        // Subtle alpha breathing
        p.alpha = p.baseAlpha * (0.8 + Math.sin(p.driftPhase * 1.5) * 0.2);

        // Wrap around bounds
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const renderY = p.y - scrollOffset;

        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      intersectionObserver.disconnect();
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
