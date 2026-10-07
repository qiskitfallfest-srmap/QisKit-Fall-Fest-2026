"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Rotate3D, Sparkles, Compass } from 'lucide-react';

interface QuantumBlochSphereProps {
  className?: string;
  size?: number;
}

export function QuantumBlochSphere({ className = '', size = 360 }: QuantumBlochSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Spherical state angles (in radians)
  // |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
  const [theta, setTheta] = useState<number>(Math.PI / 3); // 60 deg
  const [phi, setPhi] = useState<number>(Math.PI / 4);     // 45 deg

  // Target angles for smooth gate transitions
  const targetThetaRef = useRef<number>(Math.PI / 3);
  const targetPhiRef = useRef<number>(Math.PI / 4);

  // Active gate label for display
  const [activeGate, setActiveGate] = useState<string>('SUPERPOSITION');

  // 3D View rotation angles (camera orbit)
  const rotXRef = useRef<number>(0.35); // tilt downward
  const rotYRef = useRef<number>(0.65); // azimuth
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isInteractingRef = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  // Quantum Gate Applications
  const applyGate = useCallback((gate: string) => {
    setActiveGate(gate);
    if (gate === '|0⟩') {
      targetThetaRef.current = 0.001;
      targetPhiRef.current = 0;
    } else if (gate === '|1⟩') {
      targetThetaRef.current = Math.PI - 0.001;
      targetPhiRef.current = 0;
    } else if (gate === 'H') {
      // Hadamard creates |+⟩: θ = π/2, φ = 0
      targetThetaRef.current = Math.PI / 2;
      targetPhiRef.current = 0;
    } else if (gate === 'X') {
      // Bit flip: θ -> π - θ
      targetThetaRef.current = Math.PI - targetThetaRef.current;
    } else if (gate === 'Z') {
      // Phase flip: φ -> φ + π
      targetPhiRef.current = (targetPhiRef.current + Math.PI) % (2 * Math.PI);
    } else if (gate === 'Y') {
      // Pauli-Y: θ -> π - θ, φ -> φ + π/2
      targetThetaRef.current = Math.PI - targetThetaRef.current;
      targetPhiRef.current = (targetPhiRef.current + Math.PI / 2) % (2 * Math.PI);
    } else if (gate === 'RESET') {
      targetThetaRef.current = Math.PI / 3;
      targetPhiRef.current = Math.PI / 4;
      setActiveGate('SUPERPOSITION');
    }
  }, []);

  // Mouse / Touch handlers for 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isInteractingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    rotYRef.current += dx * 0.012;
    rotXRef.current += dy * 0.012;
    // Limit pitch to avoid flipping upside down
    rotXRef.current = Math.max(-1.4, Math.min(1.4, rotXRef.current));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 1500);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let currentTheta = theta;
    let currentPhi = phi;

    // Helper: 3D point rotation
    const project = (
      x: number,
      y: number,
      z: number,
      R: number,
      cx: number,
      cy: number
    ): { x: number; y: number; z: number; visible: boolean } => {
      // Rotate around X axis
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotate around Y axis
      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      // Perspective projection
      const fov = 420;
      const scale = fov / (fov + z2 * 0.5);

      return {
        x: cx + x2 * scale,
        y: cy + y1 * scale,
        z: z2,
        visible: z2 <= 0,
      };
    };

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      // Smooth state animation towards target
      currentTheta += (targetThetaRef.current - currentTheta) * 0.1;
      currentPhi += (targetPhiRef.current - currentPhi) * 0.1;
      setTheta(currentTheta);
      setPhi(currentPhi);

      // Gentle auto-rotation when user is not interacting
      if (!isDraggingRef.current && !isInteractingRef.current) {
        rotYRef.current += 0.005;
      }

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      // Theme-dependent colors
      const colorBurgundy = '#6C151E';
      const colorGold = '#B08D57';
      const colorOxblood = isDark ? '#F5DABF' : '#3A0B10';
      const colorGrid = isDark ? 'rgba(245, 218, 191, 0.18)' : 'rgba(108, 21, 30, 0.16)';
      const colorAxis = isDark ? 'rgba(176, 141, 87, 0.45)' : 'rgba(108, 21, 30, 0.35)';

      // 1. Ambient Background Glow Behind Sphere
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3);
      if (isDark) {
        glowGrad.addColorStop(0, 'rgba(176, 141, 87, 0.15)');
        glowGrad.addColorStop(0.5, 'rgba(108, 21, 30, 0.12)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(176, 141, 87, 0.18)');
        glowGrad.addColorStop(0.5, 'rgba(108, 21, 30, 0.08)');
        glowGrad.addColorStop(1, 'rgba(245, 243, 240, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Sphere Outer Silhouette / Translucent Shell
      const sphereGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      if (isDark) {
        sphereGrad.addColorStop(0, 'rgba(40, 10, 14, 0.45)');
        sphereGrad.addColorStop(0.8, 'rgba(16, 4, 6, 0.65)');
        sphereGrad.addColorStop(1, 'rgba(176, 141, 87, 0.3)');
      } else {
        sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        sphereGrad.addColorStop(0.8, 'rgba(245, 235, 225, 0.6)');
        sphereGrad.addColorStop(1, 'rgba(108, 21, 30, 0.22)');
      }
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isDark ? 'rgba(176, 141, 87, 0.4)' : 'rgba(108, 21, 30, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 3. Draw Latitude & Longitude Rings
      const drawRing = (latAngle: number, isEquator: boolean = false) => {
        const ringR = R * Math.cos(latAngle);
        const ringZ = R * Math.sin(latAngle);
        const steps = 60;
        ctx.beginPath();

        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const px = ringR * Math.cos(a);
          const py = -ringZ;
          const pz = ringR * Math.sin(a);
          const pt = project(px, py, pz, R, cx, cy);

          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }

        ctx.strokeStyle = isEquator
          ? isDark ? 'rgba(176, 141, 87, 0.45)' : 'rgba(108, 21, 30, 0.4)'
          : colorGrid;
        ctx.lineWidth = isEquator ? 1.5 : 0.8;
        if (!isEquator) ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawRing(0, true);
      drawRing(Math.PI / 4, false);
      drawRing(-Math.PI / 4, false);

      const drawMeridian = (meridianAngle: number) => {
        const steps = 60;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const px = R * Math.cos(a) * Math.cos(meridianAngle);
          const py = -R * Math.sin(a);
          const pz = R * Math.cos(a) * Math.sin(meridianAngle);
          const pt = project(px, py, pz, R, cx, cy);

          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = colorGrid;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawMeridian(0);
      drawMeridian(Math.PI / 2);

      // 4. Draw 3D Coordinate Axes
      const axisLen = R * 1.25;

      const drawAxis = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, labelPlus: string, labelMinus: string) => {
        const p1 = project(x1, y1, z1, R, cx, cy);
        const p2 = project(x2, y2, z2, R, cx, cy);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = colorAxis;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        ctx.font = 'bold 11px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = colorOxblood;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelPlus, p2.x + 8, p2.y - 8);
        ctx.fillText(labelMinus, p1.x - 8, p1.y + 8);
      };

      drawAxis(0, axisLen, 0, 0, -axisLen, 0, '|0⟩', '|1⟩');
      drawAxis(-axisLen, 0, 0, axisLen, 0, 0, '|+⟩', '|-⟩');
      drawAxis(0, 0, -axisLen, 0, 0, axisLen, '|+i⟩', '|-i⟩');

      // 5. State Vector |ψ⟩
      const vecX = R * Math.sin(currentTheta) * Math.cos(currentPhi);
      const vecY = -R * Math.cos(currentTheta);
      const vecZ = R * Math.sin(currentTheta) * Math.sin(currentPhi);

      const centerPt = project(0, 0, 0, R, cx, cy);
      const tipPt = project(vecX, vecY, vecZ, R, cx, cy);
      const eqPt = project(vecX, 0, vecZ, R, cx, cy);

      // Dashed projection to equator
      ctx.beginPath();
      ctx.moveTo(tipPt.x, tipPt.y);
      ctx.lineTo(eqPt.x, eqPt.y);
      ctx.strokeStyle = isDark ? 'rgba(176, 141, 87, 0.45)' : 'rgba(108, 21, 30, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vector line
      ctx.beginPath();
      ctx.moveTo(centerPt.x, centerPt.y);
      ctx.lineTo(tipPt.x, tipPt.y);
      ctx.strokeStyle = isDark ? '#E45464' : '#6C151E';
      ctx.lineWidth = 2.8;
      ctx.stroke();

      // Pulsar tip glow
      const tipGlow = ctx.createRadialGradient(tipPt.x, tipPt.y, 1, tipPt.x, tipPt.y, 14);
      tipGlow.addColorStop(0, '#FFFFFF');
      tipGlow.addColorStop(0.3, isDark ? '#E45464' : '#6C151E');
      tipGlow.addColorStop(1, 'rgba(108, 21, 30, 0)');

      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(tipPt.x, tipPt.y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(tipPt.x, tipPt.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillStyle = isDark ? '#F5DABF' : '#3A0B10';
      ctx.textAlign = 'left';
      ctx.fillText('|ψ⟩', tipPt.x + 8, tipPt.y - 6);

      ctx.fillStyle = isDark ? '#B08D57' : '#3A0B10';
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isDark]);

  const prob0 = Math.round(Math.pow(Math.cos(theta / 2), 2) * 100);
  const prob1 = 100 - prob0;
  const degTheta = Math.round((theta * 180) / Math.PI);
  const degPhi = Math.round((phi * 180) / Math.PI);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-white/90 via-[#FAF9F6]/90 to-[#F5EBE1]/85 dark:from-[#24080B]/90 dark:via-[#1A0507]/90 dark:to-[#120406]/95 border-2 border-[#3A0B10]/20 dark:border-[#B08D57]/30 shadow-2xl backdrop-blur-md flex flex-col justify-between overflow-hidden select-none ${className}`}
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-[#3A0B10]/10 dark:border-white/10 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#6C151E]/10 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57]">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#6C151E] dark:text-[#B08D57]">
              Interactive Bloch Qubit
            </span>
            <div className="text-[10px] font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/60">
              Qiskit State Visualizer
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3A0B10]/5 dark:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-white/15">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{activeGate}</span>
        </div>
      </div>

      <div className="relative w-full aspect-square max-h-[300px] my-1 flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full touch-none"
        />

        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none px-2.5 py-0.5 rounded-full bg-black/45 text-white/90 dark:bg-white/10 text-[9px] font-mono tracking-wider uppercase flex items-center gap-1 backdrop-blur-xs">
          <Rotate3D size={11} />
          <span>Drag to rotate in 3D</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#3A0B10]/5 dark:bg-black/30 border border-[#3A0B10]/10 dark:border-white/10 z-10 text-[11px] font-mono">
        <div>
          <span className="text-[#16171B]/60 dark:text-[#C7C8CC]/60">Coordinates:</span>
          <div className="font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
            θ = {degTheta}° &nbsp; φ = {degPhi}°
          </div>
        </div>
        <div className="text-right">
          <span className="text-[#16171B]/60 dark:text-[#C7C8CC]/60">Probabilities:</span>
          <div className="font-bold text-[#6C151E] dark:text-[#B08D57]">
            |0⟩: {prob0}% &nbsp; |1⟩: {prob1}%
          </div>
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#3A0B10]/10 dark:border-white/10 z-10 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
          <span>Apply Quantum Gate:</span>
          <button
            type="button"
            onClick={() => applyGate('RESET')}
            className="hover:underline text-[#6C151E] dark:text-[#B08D57] cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[
            { label: '|0⟩', title: 'Ground State' },
            { label: '|1⟩', title: 'Excited State' },
            { label: 'H', title: 'Hadamard Superposition' },
            { label: 'X', title: 'Pauli-X (NOT)' },
            { label: 'Z', title: 'Pauli-Z (Phase Flip)' },
          ].map((g) => (
            <button
              key={g.label}
              type="button"
              onClick={() => applyGate(g.label)}
              title={g.title}
              className={`py-1 px-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                activeGate === g.label
                  ? 'bg-[#6C151E] text-white dark:bg-[#B08D57] dark:text-[#1A0507] shadow-xs scale-[1.03]'
                  : 'bg-white dark:bg-white/5 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-white/15 hover:border-[#6C151E] dark:hover:border-[#B08D57]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuantumBlochSphere;
