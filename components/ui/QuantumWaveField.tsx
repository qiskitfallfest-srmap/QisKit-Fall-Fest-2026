"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface QuantumWaveFieldProps {
  className?: string;
}

export function QuantumWaveField({ className = '' }: QuantumWaveFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('pointermove', handlePointerMove);

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      time += 0.015;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const isDark = (resolvedTheme || theme) === 'dark';

      // Draw 6 undulating quantum wave probability manifolds
      const waveCount = 5;
      for (let i = 0; i < waveCount; i++) {
        const progress = i / waveCount;
        ctx.beginPath();

        const baseAmplitude = 25 + i * 8;
        const frequency = 0.003 + i * 0.001;
        const phase = time * (0.8 + i * 0.2);
        const yOffset = h * (0.2 + progress * 0.6);

        ctx.moveTo(0, yOffset);

        for (let x = 0; x <= w; x += 8) {
          // Distance from mouse creates quantum ripple effect
          const distToMouse = Math.hypot(x - mouse.x, yOffset - mouse.y);
          const mousePerturb = Math.max(0, 1 - distToMouse / 260) * Math.sin(distToMouse * 0.05 - time * 2) * 22;

          const waveY =
            yOffset +
            Math.sin(x * frequency + phase) * baseAmplitude +
            Math.cos(x * frequency * 1.5 - phase * 0.7) * (baseAmplitude * 0.4) +
            mousePerturb;

          ctx.lineTo(x, waveY);
        }

        // Palette
        if (isDark) {
          ctx.strokeStyle = i % 2 === 0
            ? `rgba(176, 141, 87, ${0.12 + i * 0.04})`  // Gold
            : `rgba(228, 84, 100, ${0.10 + i * 0.03})`; // Crimson
        } else {
          ctx.strokeStyle = i % 2 === 0
            ? `rgba(108, 21, 30, ${0.12 + i * 0.03})`   // Burgundy
            : `rgba(176, 141, 87, ${0.14 + i * 0.04})`; // Gold
        }

        ctx.lineWidth = 1.2 + i * 0.3;
        ctx.stroke();
      }

      // Draw subtle interference node points along the grid
      const gridSize = 70;
      const cols = Math.floor(w / gridSize);
      const rows = Math.floor(h / gridSize);

      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const px = c * gridSize;
          const py = r * gridSize;

          // Probability interference pattern
          const psi1 = Math.sin(px * 0.01 + time) * Math.cos(py * 0.01 + time);
          const psi2 = Math.cos((px + py) * 0.008 - time * 0.7);
          const probability = Math.abs(psi1 + psi2) * 0.5;

          if (probability > 0.6) {
            const nodeRadius = (probability - 0.6) * 4;
            ctx.beginPath();
            ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = isDark
              ? `rgba(176, 141, 87, ${(probability - 0.6) * 0.4})`
              : `rgba(108, 21, 30, ${(probability - 0.6) * 0.35})`;
            ctx.fill();
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [theme, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

export default QuantumWaveField;
