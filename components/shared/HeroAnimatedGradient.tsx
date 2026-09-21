"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import AnimatedGradient from "@/components/ui/animated-gradient";

interface HeroAnimatedGradientProps {
  className?: string;
  style?: React.CSSProperties;
}

export function HeroAnimatedGradient({
  className = "absolute inset-0 w-full h-full pointer-events-auto",
  style,
}: HeroAnimatedGradientProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine active theme (default to dark before hydration)
  const isDark = mounted ? (resolvedTheme || theme) === "dark" : true;

  // Custom user requested colors:
  // Light: Dominant warm elegant Beige with delicate, subtle Burgundy ribbons (#800020 / #942638)
  // Dark: Black (#000000) and Burgundy (#800020)
  const lightConfig = {
    preset: "custom" as const,
    color1: "#F8F4EE", // Dominant refined warm Beige
    color2: "#9E2A3B", // Softened, delicate wine-burgundy tone to avoid dark text clashes
    color3: "#F4EDE2", // Soft ivory-beige ambient tone
    rotation: 35,
    proportion: 18,    // Significantly reduced so beige dominates and burgundy is gentle
    scale: 0.45,
    speed: 18,
    distortion: 4,
    swirl: 30,
    swirlIterations: 6,
    softness: 98,
    offset: 0,
    shape: "Checks" as const,
    shapeSize: 14,
  };

  const darkConfig = {
    preset: "custom" as const,
    color1: "#000000", // Pure Black
    color2: "#800020", // Exact #800020 requested by user
    color3: "#080103", // Deep obsidian dark tone
    rotation: -45,
    proportion: 38,
    scale: 0.65,
    speed: 25,
    distortion: 10,
    swirl: 50,
    swirlIterations: 10,
    softness: 90,
    offset: 0,
    shape: "Checks" as const,
    shapeSize: 25,
  };

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <AnimatedGradient
        key={isDark ? "dark-animated-gradient" : "light-animated-gradient"}
        config={isDark ? darkConfig : lightConfig}
        noise={{ opacity: 0.08, scale: 1 }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default HeroAnimatedGradient;
