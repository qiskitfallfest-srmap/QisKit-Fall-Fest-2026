"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// Ensure plugins are registered safely in browser
if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

export interface TextBlockAnimationProps {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  blockColor?: string;
  stagger?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function TextBlockAnimation({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#800020",
  stagger = 0.1,
  duration = 0.6,
  className,
  once = true,
}: TextBlockAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // 1. Setup SplitText
      let split: SplitText | null = null;
      try {
        split = new SplitText(containerRef.current, {
          type: "lines",
          linesClass: "block-line-parent",
        });
      } catch (err) {
        console.warn("SplitText initialization error:", err);
        return;
      }

      // 2. Wrap lines and inject the block revealer manually
      const lines = split.lines;
      if (!lines || lines.length === 0) return;

      const blocks: HTMLElement[] = [];

      lines.forEach((line) => {
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "block";
        wrapper.style.overflow = "hidden";

        const block = document.createElement("div");
        block.style.position = "absolute";
        block.style.top = "0";
        block.style.left = "0";
        block.style.width = "100%";
        block.style.height = "100%";
        block.style.backgroundColor = blockColor;
        block.style.zIndex = "2";
        block.style.transform = "scaleX(0)";
        block.style.transformOrigin = "left center";

        if (line.parentNode) {
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
          wrapper.appendChild(block);
        }

        gsap.set(line, { opacity: 0 });
        blocks.push(block);
      });

      // 3. Create the Master Timeline
      const tl = gsap.timeline({
        defaults: { ease: "expo.inOut" },
        scrollTrigger: animateOnScroll
          ? {
              trigger: containerRef.current,
              start: "top 85%",
              once: once,
              toggleActions: once ? "play none none none" : "play none none reverse",
            }
          : null,
        delay: delay,
      });

      // 4. Build the Animation Sequence
      tl.to(blocks, {
        scaleX: 1,
        duration: duration,
        stagger: stagger,
        transformOrigin: "left center",
      })
        .set(
          lines,
          {
            opacity: 1,
            stagger: stagger,
          },
          `<${duration / 2}`
        )
        .to(
          blocks,
          {
            scaleX: 0,
            duration: duration,
            stagger: stagger,
            transformOrigin: "right center",
          },
          `<${duration * 0.4}`
        );

      return () => {
        try {
          split?.revert();
        } catch {
          // Ignore cleanup errors
        }
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, blockColor, stagger, duration, once],
    }
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {children}
    </div>
  );
}

export default TextBlockAnimation;
