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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      time += 0.012;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const isDark = (resolvedTheme || theme) === 'dark';

      // Draw 6 undulating quantum probability wave manifolds
      const waveCount = 6;
      for (let i = 0; i < waveCount; i++) {
        const progress = i / waveCount;
        ctx.beginPath();

        const baseAmplitude = 26 + i * 8;
        const frequency = 0.0028 + i * 0.0008;
        const phase = time * (0.7 + i * 0.18);
        const yOffset = h * (0.15 + progress * 0.7);

        ctx.moveTo(0, yOffset);

        for (let x = 0; x <= w; x += 6) {
          const distToMouse = Math.hypot(x - mouse.x, yOffset - mouse.y);
          const mousePerturb = Math.max(0, 1 - distToMouse / 280) * Math.sin(distToMouse * 0.04 - time * 2.5) * 24;

          const waveY =
            yOffset +
            Math.sin(x * frequency + phase) * baseAmplitude +
            Math.cos(x * frequency * 1.6 - phase * 0.8) * (baseAmplitude * 0.45) +
            mousePerturb;

          ctx.lineTo(x, waveY);
        }

        // Palette gradient strokes
        if (isDark) {
          ctx.strokeStyle = i % 2 === 0
            ? `rgba(245, 218, 191, ${0.12 + i * 0.035})` // Warm Gold
            : `rgba(239, 120, 133, ${0.10 + i * 0.03})`; // Crimson
        } else {
          ctx.strokeStyle = i % 2 === 0
            ? `rgba(108, 21, 30, ${0.14 + i * 0.035})`  // Burgundy
            : `rgba(176, 141, 87, ${0.15 + i * 0.04})`; // Gold
        }

        ctx.lineWidth = 1.2 + i * 0.35;
        ctx.stroke();
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
