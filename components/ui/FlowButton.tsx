'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'burgundy';
}

export function FlowButton({
  text = 'Modern Button',
  href,
  target,
  rel,
  className = '',
  variant = 'burgundy',
  ...props
}: FlowButtonProps) {
  const isBurgundy = variant === 'burgundy';

  const baseStyles = `group relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] px-8 py-3 text-sm font-semibold cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] select-none ${
    isBurgundy
      ? 'border-[#6C151E] bg-[#6C151E] text-white hover:border-[#4A0D14] hover:rounded-[14px]'
      : 'border-[#333333]/40 bg-transparent text-[#111111] dark:text-white dark:border-white/30 hover:border-transparent hover:text-white hover:rounded-[14px]'
  } ${className}`;

  const circleBg = isBurgundy ? 'bg-[#3A0B10]' : 'bg-[#6C151E] dark:bg-[#A7192A]';

  const content = (
    <>
      {/* Left arrow (arr-2) - slides in from offscreen on hover */}
      <ArrowRight
        className="absolute w-4 h-4 left-[-25%] stroke-current fill-none z-[9] group-hover:left-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />

      {/* Text - shifts right on hover */}
      <span className="relative z-[1] transition-all duration-[600ms] ease-out group-hover:translate-x-3">
        {text}
      </span>

      {/* Fluid expanding circle background fill */}
      <span
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${circleBg} rounded-full opacity-0 group-hover:w-[350px] group-hover:h-[350px] group-hover:opacity-100 transition-all duration-[1300ms] ease-[cubic-bezier(0.25,1,0.35,1)] pointer-events-none`}
      />

      {/* Right arrow (arr-1) - slides out to right on hover */}
      <ArrowRight
        className="absolute w-4 h-4 right-4 stroke-current fill-none z-[9] group-hover:right-[-25%] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />
    </>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={baseStyles}>
        {content}
      </a>
    );
  }

  return (
    <button {...props} className={baseStyles}>
      {content}
    </button>
  );
}
