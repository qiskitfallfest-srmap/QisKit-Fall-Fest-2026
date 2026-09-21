"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type React from "react";

export interface LayeredTextProps {
  lines?: Array<{ top: string; bottom: string }>;
  fontSize?: string;
  fontSizeMd?: string;
  lineHeight?: number;
  lineHeightMd?: number;
  className?: string;
  fontClassName?: string;
  facingFront?: boolean;
  autoPlay?: boolean;
}

export function LayeredText({
  lines = [
    { top: "MEET THE", bottom: "MEET THE" },
    { top: "PEOPLE", bottom: "PEOPLE" },
    { top: "BEHIND", bottom: "BEHIND" },
    { top: "THE EXPERIENCE", bottom: "THE EXPERIENCE" },
  ],
  fontSize = "clamp(35px, 5.2vw, 75px)",
  fontSizeMd = "38px",
  lineHeight = 84,
  lineHeightMd = 46,
  className = "",
  fontClassName = "font-serif font-bold tracking-tight",
  facingFront = true,
  autoPlay = true,
}: LayeredTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | undefined>(undefined);
  const [activeLineHeight, setActiveLineHeight] = useState(lineHeight);

  // Keep activeLineHeight responsive to viewport resize
  useEffect(() => {
    const updateDimensions = () => {
      const isDesktop = window.innerWidth >= 768;
      setActiveLineHeight(isDesktop ? lineHeight : lineHeightMd);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [lineHeight, lineHeightMd]);

  const calculateTranslateX = (index: number) => {
    if (facingFront) {
      return { desktop: 0, mobile: 0 };
    }
    const baseOffset = 35;
    const baseOffsetMd = 20;
    const centerIndex = Math.floor(lines.length / 2);
    return {
      desktop: (index - centerIndex) * baseOffset,
      mobile: (index - centerIndex) * baseOffsetMd,
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const paragraphs = container.querySelectorAll("p");

    // Clean up previous timeline if any
    timelineRef.current?.kill();

    // Reset paragraph transform positions before starting timeline
    gsap.set(paragraphs, { y: 0 });

    // Build timeline - if autoPlay is true, loop with a pleasant pause
    timelineRef.current = gsap.timeline({
      paused: !autoPlay,
      repeat: autoPlay ? -1 : 0,
      repeatDelay: 2.0,
      yoyo: true,
    });

    timelineRef.current.to(paragraphs, {
      y: -activeLineHeight,
      duration: 0.85,
      ease: "power2.inOut",
      stagger: 0.1,
    });

    const handleMouseEnter = () => {
      if (!autoPlay) {
        timelineRef.current?.play();
      }
    };

    const handleMouseLeave = () => {
      if (!autoPlay) {
        timelineRef.current?.reverse();
      }
    };

    const handleClick = () => {
      if (timelineRef.current) {
        if (timelineRef.current.progress() === 0) {
          timelineRef.current.play();
        } else if (!autoPlay) {
          timelineRef.current.reverse();
        }
      }
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("click", handleClick);
      timelineRef.current?.kill();
    };
  }, [lines, activeLineHeight, autoPlay]);

  return (
    <div
      ref={containerRef}
      className={`mx-auto ${fontClassName} uppercase text-[#16171B] dark:text-[#F5F3F0] antialiased cursor-pointer select-none drop-shadow-sm ${className}`}
      style={{ fontSize, "--md-font-size": fontSizeMd } as React.CSSProperties}
    >
      <ul className="list-none p-0 m-0 flex flex-col items-center justify-center gap-1 sm:gap-2">
        {lines.map((line, index) => {
          const translateX = calculateTranslateX(index);
          const isIsometric = !facingFront;

          return (
            <li
              key={index}
              className={`
                overflow-hidden relative flex flex-col items-center justify-start text-center
                ${
                  isIsometric
                    ? index % 2 === 0
                      ? "[transform:skew(60deg,-30deg)_scaleY(0.66667)]"
                      : "[transform:skew(0deg,-30deg)_scaleY(1.33333)]"
                : ""
                }
              `}
              style={
                {
                  height: `${activeLineHeight}px`,
                  transform: isIsometric
                    ? `translateX(${translateX.desktop}px) skew(${index % 2 === 0 ? "60deg, -30deg" : "0deg, -30deg"}) scaleY(${index % 2 === 0 ? "0.66667" : "1.33333"})`
                    : "none",
                } as React.CSSProperties
              }
            >
              <p
                className="px-4 text-center whitespace-nowrap m-0 flex items-center justify-center font-serif font-bold"
                style={
                  {
                    height: `${activeLineHeight}px`,
                    lineHeight: `${activeLineHeight}px`,
                  } as React.CSSProperties
                }
              >
                {line.top}
              </p>
              <p
                className="px-4 text-center whitespace-nowrap m-0 flex items-center justify-center font-serif font-bold"
                style={
                  {
                    height: `${activeLineHeight}px`,
                    lineHeight: `${activeLineHeight}px`,
                  } as React.CSSProperties
                }
              >
                {line.bottom}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default LayeredText;
