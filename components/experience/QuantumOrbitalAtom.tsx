'use client';

import * as React from 'react';

interface QuantumOrbitalAtomProps {
  className?: string;
}

interface OrbitRingConfig {
  rx: number;
  ry: number;
  tilt: number; // inclination angle in radians
  yaw: number;  // axial rotation in radians
  speed: number;
  color: string;
}

interface MetallicOrbiter {
  ringIndex: number;
  phase: number;
  radius: number;
  speedMultiplier: number;
  type: 'chrome' | 'dark-chrome' | 'crimson-node';
}

// Helper function to render metallic chrome or crimson spheres
function drawOrbiter(
  ctx: CanvasRenderingContext2D,
  orb: { x: number; y: number; z: number; radius: number; type: string },
  scale: number
) {
  const r = Math.max(4, orb.radius * scale * (1 + orb.z / 600));

  // Dynamic specular center
  const lightX = orb.x - r * 0.38;
  const lightY = orb.y - r * 0.38;

  // Soft drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(20, 10, 12, 0.45)';
  ctx.shadowBlur = r * 0.8;
  ctx.shadowOffsetX = r * 0.25;
  ctx.shadowOffsetY = r * 0.35;

  const ballGrad = ctx.createRadialGradient(lightX, lightY, r * 0.05, orb.x, orb.y, r);

  if (orb.type === 'chrome') {
    // High-polish chrome stainless steel
    ballGrad.addColorStop(0, '#FFFFFF'); // Specular highlight
    ballGrad.addColorStop(0.2, '#E8E4E5');
    ballGrad.addColorStop(0.48, '#A89FA2');
    ballGrad.addColorStop(0.72, '#5E5457'); // Metallic mid-reflection
    ballGrad.addColorStop(0.88, '#2B2326');
    ballGrad.addColorStop(1.0, '#150F11');
  } else if (orb.type === 'dark-chrome') {
    // Smoked dark chrome with subtle burgundy reflection
    ballGrad.addColorStop(0, '#FFFFFF');
    ballGrad.addColorStop(0.18, '#C4B8BC');
    ballGrad.addColorStop(0.5, '#4B383C');
    ballGrad.addColorStop(0.82, '#211215');
    ballGrad.addColorStop(1.0, '#0F0608');
  } else {
    // Crimson energy node
    ballGrad.addColorStop(0, '#FFF5F6');
    ballGrad.addColorStop(0.3, '#EF384D');
    ballGrad.addColorStop(0.7, '#8C1422');
    ballGrad.addColorStop(1.0, '#36060B');
  }

  ctx.beginPath();
  ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
  ctx.fillStyle = ballGrad;
  ctx.fill();
  ctx.restore();

  // Additional bright white pin-point glint
  ctx.beginPath();
  ctx.arc(lightX, lightY, Math.max(1.2, r * 0.18), 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
}

export function QuantumOrbitalAtom({ className = '' }: QuantumOrbitalAtomProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Interaction refs
  const isDraggingRef = React.useRef(false);
  const pointerStartRef = React.useRef({ x: 0, y: 0 });
  const rotationRef = React.useRef({ x: 0.25, y: -0.35 });
  const targetRotationRef = React.useRef({ x: 0.25, y: -0.35 });
  const velocityRef = React.useRef({ x: 0, y: 0 });
  const mouseParallaxRef = React.useRef({ x: 0, y: 0 });
  const animFrameIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Rings setup matching the reference design:
    // 5 distinct elliptical 3D orbits intersecting around the core
    const rings: OrbitRingConfig[] = [
      { rx: 220, ry: 90, tilt: 0.45, yaw: 0.65, speed: 0.6, color: 'rgba(195, 35, 55, 0.48)' },
      { rx: 250, ry: 105, tilt: -0.62, yaw: -0.4, speed: -0.5, color: 'rgba(215, 60, 75, 0.42)' },
      { rx: 210, ry: 80, tilt: 1.15, yaw: 0.25, speed: 0.75, color: 'rgba(180, 40, 55, 0.38)' },
      { rx: 265, ry: 115, tilt: -0.22, yaw: 1.05, speed: -0.65, color: 'rgba(200, 50, 65, 0.45)' },
      { rx: 235, ry: 95, tilt: 0.85, yaw: -0.85, speed: 0.55, color: 'rgba(220, 70, 85, 0.4)' },
    ];

    // Metallic chrome balls orbiting along the rings
    const orbiters: MetallicOrbiter[] = [
      { ringIndex: 0, phase: 0.12, radius: 18, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 0, phase: 0.65, radius: 10, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 1, phase: 0.32, radius: 24, speedMultiplier: 1.0, type: 'chrome' }, // prominent foreground ball
      { ringIndex: 1, phase: 0.85, radius: 11, speedMultiplier: 1.0, type: 'dark-chrome' },
      { ringIndex: 2, phase: 0.22, radius: 16, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 2, phase: 0.78, radius: 9, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 3, phase: 0.48, radius: 22, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 3, phase: 0.95, radius: 12, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 4, phase: 0.18, radius: 14, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 4, phase: 0.62, radius: 19, speedMultiplier: 1.0, type: 'chrome' },
      { ringIndex: 1, phase: 0.05, radius: 7, speedMultiplier: 1.0, type: 'crimson-node' },
      { ringIndex: 3, phase: 0.3, radius: 8, speedMultiplier: 1.0, type: 'crimson-node' },
    ];

    // Procedural core sparks and surface features
    const sparkCount = 38;
    const coreSparks = Array.from({ length: sparkCount }).map((_, i) => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 0.96 + Math.random() * 0.05;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        size: 1.5 + Math.random() * 2.5,
        freq: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        brightness: 0.6 + Math.random() * 0.4,
      };
    });

    // Procedural crystalline facets for rocky core
    const facetCount = 32;
    const facets = Array.from({ length: facetCount }).map(() => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        radius: 0.28 + Math.random() * 0.35,
        tone: 0.15 + Math.random() * 0.35,
      };
    });

    let width = 600;
    let height = 600;
    let dpr = 1;

    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 320);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // 3D rotation helper
    function rotate3D(x: number, y: number, z: number, pitch: number, yaw: number) {
      // Rotate around X (pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y1 = y * cosP - z * sinP;
      const z1 = y * sinP + z * cosP;

      // Rotate around Y (yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      return { x: x2, y: y1, z: z2 };
    }

    // Get point on tilted ring in 3D
    function getRingPoint(ring: OrbitRingConfig, angle: number, scale: number) {
      // 1. Unrotated 2D ellipse in XY plane
      const ex = Math.cos(angle) * ring.rx * scale;
      const ey = Math.sin(angle) * ring.ry * scale;
      const ez = 0;

      // 2. Apply ring inclination (tilt around X) and orientation (yaw around Z)
      const cosT = Math.cos(ring.tilt);
      const sinT = Math.sin(ring.tilt);
      const ty = ey * cosT - ez * sinT;
      const tz = ey * sinT + ez * cosT;

      const cosY = Math.cos(ring.yaw);
      const sinY = Math.sin(ring.yaw);
      const rx = ex * cosY - ty * sinY;
      const ry = ex * sinY + ty * cosY;

      return { x: rx, y: ry, z: tz };
    }

    let startTime = performance.now();

    const render = (now: number) => {
      const time = (now - startTime) * 0.001;

      // Inertia & Auto-rotation
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0025;
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        targetRotationRef.current.x += velocityRef.current.x;
        targetRotationRef.current.y += velocityRef.current.y;
      }

      // Smooth dampening
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.08;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.08;

      const pitch = rotationRef.current.x + mouseParallaxRef.current.y * 0.15;
      const yaw = rotationRef.current.y + mouseParallaxRef.current.x * 0.15;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;

      // Calculate responsive scale factor
      const baseDim = Math.min(width, height);
      const scale = baseDim / 640;
      const coreRadius = Math.max(90, Math.min(145, 125 * scale));

      // -------------------------------------------------------------
      // 1. Ambient Background Glow Behind Core
      // -------------------------------------------------------------
      const bgGlow = ctx.createRadialGradient(cx, cy, coreRadius * 0.4, cx, cy, coreRadius * 2.2);
      bgGlow.addColorStop(0, 'rgba(180, 25, 42, 0.22)');
      bgGlow.addColorStop(0.35, 'rgba(125, 18, 30, 0.12)');
      bgGlow.addColorStop(0.7, 'rgba(100, 15, 25, 0.04)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 2. Prepare 3D elements for correct Depth Sorting (z-sorting)
      // -------------------------------------------------------------
      // We divide ring curves into segments (front and back) and sort orbiters

      // Ring point sampling (48 steps per ring)
      const ringSegments: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        avgZ: number;
        color: string;
      }> = [];

      rings.forEach((ring) => {
        const steps = 64;
        for (let i = 0; i < steps; i++) {
          const a1 = (i / steps) * Math.PI * 2;
          const a2 = ((i + 1) / steps) * Math.PI * 2;

          const p1 = getRingPoint(ring, a1, scale);
          const p2 = getRingPoint(ring, a2, scale);

          const r1 = rotate3D(p1.x, p1.y, p1.z, pitch, yaw);
          const r2 = rotate3D(p2.x, p2.y, p2.z, pitch, yaw);

          const avgZ = (r1.z + r2.z) * 0.5;

          ringSegments.push({
            x1: cx + r1.x,
            y1: cy + r1.y,
            x2: cx + r2.x,
            y2: cy + r2.y,
            avgZ,
            color: ring.color,
          });
        }
      });

      // Calculate orbiter 3D positions
      const orbiterPositions = orbiters.map((orb) => {
        const ring = rings[orb.ringIndex];
        const currentPhase = orb.phase + time * 0.08 * ring.speed * orb.speedMultiplier;
        const angle = currentPhase * Math.PI * 2;
        const p = getRingPoint(ring, angle, scale);
        const r = rotate3D(p.x, p.y, p.z, pitch, yaw);

        return {
          ...orb,
          x: cx + r.x,
          y: cy + r.y,
          z: r.z,
        };
      });

      // -------------------------------------------------------------
      // 3. Draw BACK Ring Segments (z < -10)
      // -------------------------------------------------------------
      ctx.lineWidth = 1.2;
      ringSegments
        .filter((seg) => seg.avgZ < -8)
        .forEach((seg) => {
          const alpha = Math.max(0.12, 0.45 + seg.avgZ / 400);
          ctx.strokeStyle = seg.color.replace(/[\d\.]+\)$/, `${alpha})`);
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        });

      // -------------------------------------------------------------
      // 4. Draw BACK Orbiters (z < -8)
      // -------------------------------------------------------------
      orbiterPositions
        .filter((orb) => orb.z < -8)
        .sort((a, b) => a.z - b.z)
        .forEach((orb) => drawOrbiter(ctx, orb, scale));

      // -------------------------------------------------------------
      // 5. Draw CENTRAL QUANTUM CORE SPHERE
      // -------------------------------------------------------------
      // Deep crystalline obsidian sphere with crinkled highlights,
      // internal crimson energy cracks, and radiant spark points.

      // Core outer shadow / ambient occlusion
      ctx.save();
      ctx.shadowColor = 'rgba(18, 4, 6, 0.65)';
      ctx.shadowBlur = 35 * scale;
      ctx.shadowOffsetX = 12 * scale;
      ctx.shadowOffsetY = 16 * scale;

      // Base sphere radial lighting (illuminated from top-left)
      const lightX = cx - coreRadius * 0.38;
      const lightY = cy - coreRadius * 0.38;

      const coreGrad = ctx.createRadialGradient(
        lightX,
        lightY,
        coreRadius * 0.1,
        cx,
        cy,
        coreRadius
      );
      coreGrad.addColorStop(0, '#382226'); // soft specular graphite
      coreGrad.addColorStop(0.28, '#241215');
      coreGrad.addColorStop(0.65, '#14070A');
      coreGrad.addColorStop(0.92, '#0B0204');
      coreGrad.addColorStop(1.0, '#040001');

      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.restore();

      // Clip to sphere for internal texture and crystalline fissures
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius - 0.5, 0, Math.PI * 2);
      ctx.clip();

      // Faceted Crystalline / Crinkled Surface Reflections
      facets.forEach((f) => {
        const rot = rotate3D(f.x, f.y, f.z, pitch * 0.7, yaw * 0.7);
        if (rot.z > -0.2) {
          const fx = cx + rot.x * (coreRadius * 0.88);
          const fy = cy + rot.y * (coreRadius * 0.88);
          const fr = f.radius * coreRadius * (0.8 + rot.z * 0.3);

          const facetGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
          const alpha = Math.max(0, rot.z * 0.28 * f.tone);
          facetGrad.addColorStop(0, `rgba(180, 80, 95, ${alpha})`);
          facetGrad.addColorStop(0.5, `rgba(45, 18, 22, ${alpha * 0.5})`);
          facetGrad.addColorStop(1, 'rgba(15, 5, 7, 0)');

          ctx.fillStyle = facetGrad;
          ctx.beginPath();
          ctx.arc(fx, fy, fr, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Internal Synaptic / Glowing Red Quantum Filaments
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 18; i++) {
        const a1 = (i / 18) * Math.PI * 2 + time * 0.15;
        const a2 = a1 + 0.65;
        const rRatio = 0.35 + (i % 5) * 0.12;

        const x1 = cx + Math.cos(a1) * coreRadius * rRatio;
        const y1 = cy + Math.sin(a1) * coreRadius * rRatio * 0.75;
        const x2 = cx + Math.cos(a2) * coreRadius * (rRatio + 0.15);
        const y2 = cy + Math.sin(a2) * coreRadius * (rRatio + 0.15) * 0.75;

        const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(235, 45, 65, ${0.12 + pulse * 0.28})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(
          (x1 + x2) * 0.5 + Math.sin(time + i) * 12,
          (y1 + y2) * 0.5 + Math.cos(time + i) * 12,
          (x1 + x2) * 0.5,
          (y1 + y2) * 0.5,
          x2,
          y2
        );
        ctx.stroke();
      }

      // Procedural Sparks on Core Surface
      coreSparks.forEach((sp) => {
        const rot = rotate3D(sp.x, sp.y, sp.z, pitch * 0.7, yaw * 0.7);
        if (rot.z > -0.05) {
          const sx = cx + rot.x * coreRadius;
          const sy = cy + rot.y * coreRadius;
          const pulse = Math.sin(time * sp.freq + sp.phase) * 0.5 + 0.5;
          const size = sp.size * scale * (0.8 + rot.z * 0.4);
          const alpha = (0.35 + pulse * 0.65) * rot.z * sp.brightness;

          // Spark aura
          const sparkGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3);
          sparkGrad.addColorStop(0, `rgba(255, 230, 235, ${alpha})`);
          sparkGrad.addColorStop(0.3, `rgba(240, 50, 75, ${alpha * 0.8})`);
          sparkGrad.addColorStop(1, 'rgba(180, 20, 35, 0)');

          ctx.fillStyle = sparkGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Hot center
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Core rim lighting / fresnel glow
      const rimGrad = ctx.createRadialGradient(cx, cy, coreRadius * 0.85, cx, cy, coreRadius);
      rimGrad.addColorStop(0, 'rgba(10, 3, 5, 0)');
      rimGrad.addColorStop(0.7, 'rgba(165, 30, 45, 0.18)');
      rimGrad.addColorStop(1.0, 'rgba(235, 120, 140, 0.45)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // end core clipping

      // -------------------------------------------------------------
      // 6. Draw FRONT Ring Segments (z >= -8)
      // -------------------------------------------------------------
      ctx.lineWidth = 1.35;
      ringSegments
        .filter((seg) => seg.avgZ >= -8)
        .forEach((seg) => {
          const alpha = Math.min(0.85, 0.38 + seg.avgZ / 250);
          ctx.strokeStyle = seg.color.replace(/[\d\.]+\)$/, `${alpha})`);
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        });

      // -------------------------------------------------------------
      // 7. Draw FRONT Orbiters (z >= -8)
      // -------------------------------------------------------------
      orbiterPositions
        .filter((orb) => orb.z >= -8)
        .sort((a, b) => a.z - b.z)
        .forEach((orb) => drawOrbiter(ctx, orb, scale));

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Pointer event handlers for drag rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseParallaxRef.current = { x: nx, y: ny };

    if (isDraggingRef.current) {
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };

      const factor = 0.006;
      targetRotationRef.current.y += dx * factor;
      targetRotationRef.current.x += dy * factor;

      velocityRef.current = {
        x: dy * factor,
        y: dx * factor,
      };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="img"
      aria-label="Interactive 3D Quantum Atom Core with Metallic Orbiters"
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none flex items-center justify-center ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />
    </div>
  );
}
