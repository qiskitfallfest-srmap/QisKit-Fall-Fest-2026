'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';

export interface FlowButtonProps {
  text?: string;
  href?: string;
  target?: string;
  rel?: string;
  id?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'default' | 'beige-burgundy';
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function FlowButton({
  text = 'Modern Button',
  href,
  target,
  rel,
  id,
  onClick,
  variant = 'default',
  className = '',
  ariaLabel,
  type = 'button',
}: FlowButtonProps) {
  const isBeigeBurgundy = variant === 'beige-burgundy';

  const containerClasses = isBeigeBurgundy
    ? `group relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#B08D57]/50 bg-[#F5EBE6] px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#3A0B10] cursor-pointer shadow-[0_4px_18px_rgba(0,0,0,0.4)] transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[#6C151E] hover:text-[#F5EBE6] hover:rounded-[12px] hover:shadow-[0_6px_24px_rgba(108,21,30,0.55)] active:scale-[0.95] select-none ${className}`
    : `group relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#333333]/40 bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95] select-none ${className}`;

  const leftArrowClasses = isBeigeBurgundy
    ? 'absolute w-4 h-4 left-[-25%] stroke-[#3A0B10] fill-none z-[9] group-hover:left-4 group-hover:stroke-[#F5EBE6] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]'
    : 'absolute w-4 h-4 left-[-25%] stroke-[#111111] fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]';

  const circleClasses = isBeigeBurgundy
    ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#6C151E] rounded-[50%] opacity-0 group-hover:w-[400px] group-hover:h-[400px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none'
    : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111111] rounded-[50%] opacity-0 group-hover:w-[400px] group-hover:h-[400px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none';

  const rightArrowClasses = isBeigeBurgundy
    ? 'absolute w-4 h-4 right-4 stroke-[#3A0B10] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-[#F5EBE6] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]'
    : 'absolute w-4 h-4 right-4 stroke-[#111111] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]';

  const innerContent = (
    <>
      {/* Left arrow (arr-2): enters from left on hover */}
      <ArrowRight aria-hidden="true" className={leftArrowClasses} />

      {/* Text: glides to the right on hover */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out whitespace-nowrap">
        {text}
      </span>

      {/* Circle: expands from center to fill button on hover */}
      <span aria-hidden="true" className={circleClasses} />

      {/* Right arrow (arr-1): exits to the right on hover */}
      <ArrowRight aria-hidden="true" className={rightArrowClasses} />
    </>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        target={target || '_blank'}
        rel={rel || 'noopener noreferrer'}
        onClick={onClick}
        aria-label={ariaLabel || text}
        className={containerClasses}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel || text}
      className={containerClasses}
    >
      {innerContent}
    </button>
  );
}

export default FlowButton;
