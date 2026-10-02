'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface StaggeredTextRevealProps {
  text: string;
  className?: string;
  letterClassName?: string;
  delay?: number;
  stagger?: number;
  enableHover?: boolean;
  as?: React.ElementType;
}

export function StaggeredTextReveal({
  text,
  className = '',
  letterClassName = '',
  delay = 0,
  stagger = 0.025,
  enableHover = true,
  as: Component = 'span',
}: StaggeredTextRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // Split into words to ensure natural line wraps across all screen sizes
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
      filter: shouldReduceMotion ? 'none' : 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <Component className={`inline-block ${className}`}>
      <motion.span
        className="inline-flex flex-wrap"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
            {word.split('').map((char, charIdx) => (
              <motion.span
                key={charIdx}
                variants={letterVariants}
                className={`inline-block transition-all duration-300 ${
                  enableHover
                    ? 'hover:-translate-y-1 hover:text-[#6C151E] dark:hover:text-[#F5DABF] cursor-default'
                    : ''
                } ${letterClassName}`}
                style={{ willChange: 'transform, opacity' }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </Component>
  );
}
