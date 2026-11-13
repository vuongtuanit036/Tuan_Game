/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Lớp Canvas hiệu ứng môi trường Kiếm Hiệp Thủy Mặc:
 * - Lá trúc & cánh hoa đào rơi nhẹ theo gió
 * - Sương mù mờ ảo ở vùng rìa bản đồ
 */

import React, { useEffect, useRef } from 'react';
import { WeatherType } from '../types/game';

interface WorldAtmosphereCanvasProps {
  zoneId: string;
  timeOfDay: 'day' | 'night';
  weather: WeatherType;
}

interface FallingParticle {
  kind: 'bamboo_leaf' | 'peach_petal';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vr: number;
  swayPhase: number;
  swayFreq: number;
  swayAmp: number;
  tumblePhase: number;
  alpha: number;
  color: string;
}

interface EdgeMistBlob {
  edge: 'top' | 'bottom' | 'left' | 'right';
  t: number;
  speed: number;
  radius: number;
  alpha: number;
  phase: number;
}

const BAMBOO_COLORS = ['#4d7c0f', '#65a30d', '#3f6212', '#84cc16'];
const PETAL_COLORS = ['#fda4af', '#fecdd3', '#ffe4e6', '#fb7185'];

export const WorldAtmosphereCanvas: React.FC<WorldAtmosphereCanvasProps> = ({
  zoneId,
  timeOfDay,
  weather
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const envRef = useRef({ zoneId, timeOfDay, weather });

  useEffect(() => {
    envRef.current = { zoneId, timeOfDay, weather };
  }, [zoneId, timeOfDay, weather]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const makeParticle = (spawnAnywhere: boolean): FallingParticle => {
      const isBambooZone = envRef.current.zoneId === 'rung_truc';
      const kind: 'bamboo_leaf' | 'peach_petal' =
        Math.random() < (isBambooZone ? 0.72 : 0.34) ? 'bamboo_leaf' : 'peach_petal';
      const palette = kind === 'bamboo_leaf' ? BAMBOO_COLORS : PETAL_COLORS;

      return {
        kind,
        x: spawnAnywhere ? Math.random() * width : -40 + Math.random() * (width * 0.85),
        y: spawnAnywhere ? Math.random() * height : -24 - Math.random() * 60,
        vx: 18 + Math.random() * 24,
        vy: 20 + Math.random() * 22,
        size: kind === 'bamboo_leaf' ? 7 + Math.random() * 5 : 4.5 + Math.random() * 3.5,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 1.4,
        swayPhase: Math.random() * Math.PI * 2,
        swayFreq: 1.1 + Math.random() * 1.3,
        swayAmp: 12 + Math.random() * 16,
        tumblePhase: Math.random() * Math.PI * 2,
        alpha: 0.45 + Math.random() * 0.38,
        color: palette[Math.floor(Math.random() * palette.length)]
      };
    };

    const particles: FallingParticle[] = Array.from({ length: 34 }, () => makeParticle(true));

    const mistBlobs: EdgeMistBlob[] = [
      { edge: 'top', t: 0.15, speed: 0.012, radius: 260, alpha: 0.16, phase: 0.2 },
      { edge: 'top', t: 0.55, speed: -0.009, radius: 310, alpha: 0.14, phase: 1.4 },
      { edge: 'top', t: 0.88, speed: 0.01, radius: 240, alpha: 0.15, phase: 2.8 },
      { edge: 'bottom', t: 0.2, speed: -0.011, radius: 280, alpha: 0.19, phase: 0.7 },
      { edge: 'bottom', t: 0.72, speed: 0.013, radius: 320, alpha: 0.18, phase: 3.4 },
      { edge: 'left', t: 0.3, speed: 0.01, radius: 260, alpha: 0.18, phase: 1.9 },
      { edge: 'left', t: 0.75, speed: -0.008, radius: 290, alpha: 0.17, phase: 4.1 },
      { edge: 'right', t: 0.25, speed: -0.012, radius: 270, alpha: 0.18, phase: 2.3 },
      { edge: 'right', t: 0.7, speed: 0.009, radius: 300, alpha: 0.17, phase: 5.0 }
    ];

    const drawPerimeterMist = (timeSec: number) => {
      const { zoneId: curZone, timeOfDay: tod, weather: curWeather } = envRef.current;
      const isBamboo = curZone === 'rung_truc';
      const isFoggy = curWeather === 'foggy';
      const isNight = tod === 'night';

      const mistIntensity =
        (isBamboo ? 1.25 : 0.85) * (isFoggy ? 1.45 : 1.0);

      // 1. Sương mù mờ ảo bao quanh rìa màn hình (Edge Vignette Mist)
      const cx = width / 2;
      const cy = height / 2;
      const innerR = Math.min(width, height) * 0.34;
      const outerR = Math.hypot(width, height) * 0.58;
      const edgeGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);

      if (isNight) {
        edgeGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
        edgeGrad.addColorStop(0.68, `rgba(30, 41, 59, ${(0.12 * mistIntensity).toFixed(3)})`);
        edgeGrad.addColorStop(1, `rgba(15, 23, 42, ${Math.min(0.55, 0.36 * mistIntensity).toFixed(3)})`);
      } else {
        edgeGrad.addColorStop(0, 'rgba(226, 232, 240, 0)');
        edgeGrad.addColorStop(0.68, `rgba(203, 213, 225, ${(0.09 * mistIntensity).toFixed(3)})`);
        edgeGrad.addColorStop(1, `rgba(241, 245, 249, ${Math.min(0.46, 0.26 * mistIntensity).toFixed(3)})`);
      }

      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Các đám mây sương trôi nhẹ dọc 4 cạnh bản đồ
      for (const blob of mistBlobs) {
        const pos = ((blob.t + timeSec * blob.speed) % 1 + 1) % 1;
        let bx = 0;
        let by = 0;
        const drift = Math.sin(timeSec * 0.4 + blob.phase) * 18;

        if (blob.edge === 'top') {
          bx = pos * width;
          by = 28 + drift;
        } else if (blob.edge === 'bottom') {
          bx = pos * width;
          by = height - 24 + drift;
        } else if (blob.edge === 'left') {
          bx = 28 + drift;
          by = pos * height;
        } else {
          bx = width - 28 + drift;
          by = pos * height;
        }

        const r = blob.radius * (isBamboo ? 1.1 : 0.95);
        const alpha = Math.min(0.32, blob.alpha * mistIntensity);
        const g = ctx.createRadialGradient(bx, by, r * 0.08, bx, by, r);

        if (isNight) {
          g.addColorStop(0, `rgba(148, 163, 184, ${(alpha * 0.55).toFixed(3)})`);
          g.addColorStop(0.5, `rgba(71, 85, 105, ${(alpha * 0.28).toFixed(3)})`);
          g.addColorStop(1, 'rgba(15, 23, 42, 0)');
        } else {
          g.addColorStop(0, `rgba(248, 250, 252, ${alpha.toFixed(3)})`);
          g.addColorStop(0.55, `rgba(226, 232, 240, ${(alpha * 0.45).toFixed(3)})`);
          g.addColorStop(1, 'rgba(241, 245, 249, 0)');
        }

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawParticle = (p: FallingParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      const tumbleScale = 0.45 + 0.55 * Math.abs(Math.cos(p.tumblePhase));
      ctx.scale(1, tumbleScale);
      ctx.globalAlpha = p.alpha;

      if (p.kind === 'bamboo_leaf') {
        // Hình lá trúc thon nhọn hai đầu kiểu bút lông thủy mặc
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.quadraticCurveTo(0, -p.size * 0.34, p.size, 0);
        ctx.quadraticCurveTo(0, p.size * 0.34, -p.size, 0);
        ctx.fill();

        ctx.strokeStyle = 'rgba(26, 46, 5, 0.35)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.75, 0);
        ctx.lineTo(p.size * 0.75, 0);
        ctx.stroke();
      } else {
        // Cánh hoa đào mềm mại với khe nhỏ ở đầu cánh
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, p.size * 0.8);
        ctx.bezierCurveTo(
          -p.size * 0.9,
          p.size * 0.3,
          -p.size * 0.75,
          -p.size * 0.75,
          -p.size * 0.15,
          -p.size * 0.6
        );
        ctx.lineTo(0, -p.size * 0.35);
        ctx.lineTo(p.size * 0.15, -p.size * 0.6);
        ctx.bezierCurveTo(
          p.size * 0.75,
          -p.size * 0.75,
          p.size * 0.9,
          p.size * 0.3,
          0,
          p.size * 0.8
        );
        ctx.fill();
      }

      ctx.restore();
    };

    let rafId = 0;
    let lastTime = performance.now();

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const timeSec = now / 1000;

      ctx.clearRect(0, 0, width, height);

      // 1. Sương mù rìa bản đồ
      drawPerimeterMist(timeSec);

      // 2. Lá trúc & cánh hoa đào rơi nhẹ theo gió
      if (!prefersReducedMotion) {
        const windGust = Math.sin(timeSec * 0.45) * 14;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.swayPhase += dt * p.swayFreq;
          p.tumblePhase += dt * 2.1;
          p.x += (p.vx + windGust + Math.cos(p.swayPhase) * p.swayAmp) * dt;
          p.y += p.vy * dt;
          p.rotation += p.vr * dt;

          if (p.y > height + 30 || p.x > width + 50) {
            particles[i] = makeParticle(false);
            if (Math.random() < 0.35) {
              // Một số hạt thổi từ mép trái vào
              particles[i].x = -20;
              particles[i].y = Math.random() * height * 0.75;
            }
          }

          drawParticle(particles[i]);
        }
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    if (prefersReducedMotion) {
      renderFrame(performance.now());
    } else {
      rafId = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-[5]"
    />
  );
};
