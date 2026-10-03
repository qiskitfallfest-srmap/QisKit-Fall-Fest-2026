'use client';

import * as React from 'react';

export interface GyroCompassProps {
  /** Optional callback when user clicks to reset view or recalibrate */
  onReset?: () => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show live degrees & cardinal direction badge */
  showReadout?: boolean;
  /** Custom extra classes */
  className?: string;
  /** Optional title */
  title?: string;
}

/** Convert degrees to 16-wind compass cardinal direction */
function getCardinalDirection(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

/** Calculate shortest difference between two angles in degrees */
function shortestAngleDiff(target: number, current: number): number {
  let diff = (target - current) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return diff;
}

export function GyroCompass({
  onReset,
  size = 'md',
  showReadout = true,
  className = '',
  title = 'Live Campus Compass',
}: GyroCompassProps) {
  // Device heading in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  const [heading, setHeading] = React.useState<number>(0);
  // Needle rotation in degrees (points to Earth North: -heading)
  const [needleRotation, setNeedleRotation] = React.useState<number>(0);
  const [isGyroActive, setIsGyroActive] = React.useState<boolean>(false);
  const [permissionRequired, setPermissionRequired] = React.useState<boolean>(false);
  const [mouseHoverAngle, setMouseHoverAngle] = React.useState<number | null>(null);

  // References for smooth animation / damping
  const targetNeedleRef = React.useRef<number>(0);
  const currentNeedleRef = React.useRef<number>(0);
  const animFrameRef = React.useRef<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Check if iOS DeviceOrientation permission is needed
  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent !== 'undefined' &&
      typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent?.requestPermission === 'function'
    ) {
      setPermissionRequired(true);
    }
  }, []);

  // Set up Orientation Listener
  React.useEffect(() => {
    let active = true;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;

      let compassHeading: number | null = null;

      // 1. iOS Safari webkitCompassHeading (0 = North, clockwise)
      if (typeof (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading === 'number') {
        compassHeading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      }
      // 2. Android Chrome deviceorientationabsolute with absolute=true
      else if (e.absolute && e.alpha !== null && typeof e.alpha === 'number') {
        compassHeading = (360 - e.alpha) % 360;
      }
      // 3. Fallback alpha
      else if (e.alpha !== null && typeof e.alpha === 'number') {
        compassHeading = (360 - e.alpha) % 360;
      }

      if (compassHeading !== null && !isNaN(compassHeading)) {
        setIsGyroActive(true);
        const normalizedHeading = ((compassHeading % 360) + 360) % 360;
        setHeading(normalizedHeading);

        // Needle points to true North => -heading (or 360 - heading)
        const targetAngle = -normalizedHeading;
        targetNeedleRef.current = targetAngle;
      }
    };

    // Try absolute first (Android), then standard orientation (iOS & standard)
    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.addEventListener('deviceorientation', handleOrientation as EventListener, true);
    }

    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
        window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
      }
    };
  }, []);

  // Smooth 60fps animation loop using angular interpolation
  React.useEffect(() => {
    let lastTime = performance.now();

    const updateNeedle = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // If mouse is hovering on desktop and no gyro is active, subtly attract needle towards mouse
      let target = targetNeedleRef.current;
      if (!isGyroActive && mouseHoverAngle !== null) {
        target = mouseHoverAngle;
      } else if (!isGyroActive) {
        // Subtle natural quantum ambient drift ±1.2°
        const ambientOscillation = Math.sin(now * 0.0015) * 1.5;
        target = ambientOscillation;
      }

      const diff = shortestAngleDiff(target, currentNeedleRef.current);
      // Smooth lerp damping factor (faster on mobile gyro, elegant on desktop)
      const speed = isGyroActive ? 12 : 7;
      currentNeedleRef.current += diff * Math.min(speed * dt, 1);

      setNeedleRotation(currentNeedleRef.current);
      animFrameRef.current = requestAnimationFrame(updateNeedle);
    };

    animFrameRef.current = requestAnimationFrame(updateNeedle);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isGyroActive, mouseHoverAngle]);

  // Handle request permission for iOS when user taps the compass
  const handleCompassClick = async () => {
    if (
      permissionRequired &&
      typeof window !== 'undefined' &&
      typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent?.requestPermission === 'function'
    ) {
      try {
        const response = await (
          window as unknown as { DeviceOrientationEvent: { requestPermission: () => Promise<string> } }
        ).DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setIsGyroActive(true);
          setPermissionRequired(false);
        }
      } catch (err) {
        console.warn('[GyroCompass] Permission error:', err);
      }
    }

    if (onReset) {
      onReset();
    }
  };

  // Handle Desktop Mouse Move for Interactive Magnetic Response
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGyroActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    // Calculate angle in degrees from center
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI + 90; // 0 = straight up
    if (angleDeg < 0) angleDeg += 360;
    // Apply subtle magnetic pull towards cursor (max ±35°)
    const pull = Math.sin((angleDeg * Math.PI) / 180) * 28;
    setMouseHoverAngle(pull);
  };

  const handleMouseLeave = () => {
    setMouseHoverAngle(null);
  };

  const cardinal = getCardinalDirection(heading);
  const roundedDeg = Math.round(heading);
  const formattedHeading = `${String(roundedDeg).padStart(3, '0')}° ${cardinal}`;

  // Dimensions based on size prop
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  }[size];

  const dialDiameter = size === 'sm' ? 36 : size === 'md' ? 48 : 64;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
    >
      {/* Compass Interactive Dial Button */}
      <button
        type="button"
        onClick={handleCompassClick}
        title={`${title} (${isGyroActive ? 'Live Gyro Active: ' + formattedHeading : 'Orientation Calibrated - Click to Recenter'})`}
        aria-label={`Compass orientation: ${formattedHeading}`}
        className={`
          group relative flex items-center justify-center rounded-full
          bg-white/95 dark:bg-[#16080A]/95 backdrop-blur-md
          border border-stone-300/90 dark:border-[#B08D57]/40
          shadow-lg shadow-black/10 dark:shadow-black/50
          hover:border-[#6C151E] dark:hover:border-[#B08D57]
          hover:shadow-xl transition-all duration-300 cursor-pointer
          p-0.5 ${sizeClasses}
        `}
      >
        {/* Outer Bezel with Tick Marks & Cardinals */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle Outer Track Ring */}
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-stone-300 dark:text-stone-700/60"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1 3"
            className="text-stone-400 dark:text-[#B08D57]/30"
          />

          {/* 30-Degree Tick Marks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const isCardinal = deg % 90 === 0;
            const length = isCardinal ? 5.5 : 3;
            const strokeWidth = isCardinal ? 1.5 : 0.8;
            return (
              <line
                key={deg}
                x1="50"
                y1={47 - length}
                x2="50"
                y2="47"
                transform={`rotate(${deg} 50 50)`}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className={
                  deg === 0
                    ? 'text-[#6C151E] dark:text-[#E89BA5]'
                    : isCardinal
                    ? 'text-[#B08D57]'
                    : 'text-stone-300 dark:text-stone-700'
                }
              />
            );
          })}

          {/* Cardinal Labels: Fixed at Cardinal Directions */}
          <text
            x="50"
            y="17"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono font-black text-[9px] fill-[#6C151E] dark:fill-[#E89BA5]"
          >
            N
          </text>
          <text
            x="85"
            y="50.5"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono font-bold text-[7px] fill-stone-400 dark:fill-stone-500"
          >
            E
          </text>
          <text
            x="50"
            y="85"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono font-bold text-[7px] fill-stone-400 dark:fill-stone-500"
          >
            S
          </text>
          <text
            x="15"
            y="50.5"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono font-bold text-[7px] fill-stone-400 dark:fill-stone-500"
          >
            W
          </text>

          {/* Dynamic Live Rotating Needle */}
          <g
            style={{
              transformOrigin: '50px 50px',
              transform: `rotate(${needleRotation}deg)`,
              transition: isGyroActive ? 'none' : 'transform 0.08s ease-out',
            }}
          >
            {/* North Pointing Arrow (Quantum Crimson / Burgundy Faceted) */}
            {/* Left facet (Darker) */}
            <path
              d="M 50 18 L 46 50 L 50 47 Z"
              className="fill-[#521018] dark:fill-[#851D28]"
            />
            {/* Right facet (Luminous) */}
            <path
              d="M 50 18 L 54 50 L 50 47 Z"
              className="fill-[#A21B2B] dark:fill-[#D93848]"
            />
            {/* North Tip Glow Dot */}
            <circle cx="50" cy="22" r="1.2" className="fill-white drop-shadow-xs" />

            {/* South Pointing Arrow (Gold / Metallic Silver Faceted) */}
            {/* Left facet */}
            <path
              d="M 50 82 L 46 50 L 50 53 Z"
              className="fill-stone-300 dark:fill-stone-600"
            />
            {/* Right facet */}
            <path
              d="M 50 82 L 54 50 L 50 53 Z"
              className="fill-stone-400 dark:fill-[#B08D57]/70"
            />

            {/* Pivot Center Jewel & Retaining Ring */}
            <circle
              cx="50"
              cy="50"
              r="4.5"
              className="fill-white dark:fill-[#120709] stroke-[#B08D57] dark:stroke-[#B08D57]"
              strokeWidth="1.2"
            />
            <circle
              cx="50"
              cy="50"
              r="2.2"
              className="fill-[#6C151E] dark:fill-[#E89BA5]"
            />
            <circle cx="49" cy="49" r="0.8" className="fill-white/80" />
          </g>
        </svg>

        {/* Live Gyro Sensor Indicator Pulse in Corner */}
        {isGyroActive && (
          <span
            title="Hardware Gyroscope Active"
            className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-black" />
          </span>
        )}
      </button>

      {/* Real-time Bearing / Cardinal Digital Readout */}
      {showReadout && (
        <div className="mt-1.5 flex flex-col items-center">
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-900/80 dark:bg-black/80 backdrop-blur-xs text-[10px] font-mono font-bold text-stone-100 dark:text-[#F5F3F0] tracking-tight shadow-sm border border-stone-700/50">
            {isGyroActive ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
            )}
            <span>{isGyroActive ? formattedHeading : `${cardinal} · 000°`}</span>
          </div>
          <span className="text-[8px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-400 mt-0.5">
            {isGyroActive ? 'Live Gyro' : 'Compass'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Live Direction Needle Icon for Buttons or Table Rows
 */
export function LiveDirectionNeedleIcon({
  className = 'w-4 h-4',
  headingOffset = 0,
}: {
  className?: string;
  headingOffset?: number;
}) {
  const [needleRotation, setNeedleRotation] = React.useState<number>(headingOffset);

  React.useEffect(() => {
    let active = true;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;
      let heading: number | null = null;
      if (typeof (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading === 'number') {
        heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (e.alpha !== null && typeof e.alpha === 'number') {
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        setNeedleRotation(-heading + headingOffset);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.addEventListener('deviceorientation', handleOrientation as EventListener, true);
    }

    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
        window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
      }
    };
  }, [headingOffset]);

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block transition-transform duration-100 ${className}`}
      style={{ transform: `rotate(${needleRotation}deg)` }}
      aria-hidden="true"
    >
      {/* Outer Dial Circle */}
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" />
      {/* North Arrow Tip (Filled) */}
      <polygon points="12,3.5 15,12 12,10.5" fill="#6C151E" className="dark:fill-[#E89BA5]" />
      <polygon points="12,3.5 9,12 12,10.5" fill="#A21B2B" className="dark:fill-[#D93848]" />
      {/* South Arrow Tip */}
      <polygon points="12,20.5 15,12 12,13.5" fill="#B08D57" opacity="0.75" />
      <polygon points="12,20.5 9,12 12,13.5" fill="#8C6D3B" opacity="0.75" />
      {/* Center Pivot Point */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
