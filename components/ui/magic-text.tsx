"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export interface MagicTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: number[];
  className?: string;
}

const Word: React.FC<WordProps> = ({ children, progress, range, className }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className={cn("relative inline-block mr-2 sm:mr-3 my-1", className)}>
      <span className="absolute opacity-20 select-none pointer-events-none">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
};

export const MagicText: React.FC<MagicTextProps> = ({
  text,
  className,
  wordClassName,
}) => {
  const container = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.85", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <p
      ref={container}
      className={cn("flex flex-wrap items-center justify-center leading-relaxed", className)}
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;

        return (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[start, end]}
            className={wordClassName}
          >
            {word}
          </Word>
        );
      })}
    </p>
  );
};

export default MagicText;
