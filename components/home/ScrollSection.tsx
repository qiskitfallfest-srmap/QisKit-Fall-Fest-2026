import * as React from 'react';

export interface ScrollSectionProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  title: string;
  tag: string;
  num: string;
  children: React.ReactNode;
  className?: string;
  fitContent?: boolean;
}

export function ScrollSection({
  id,
  title,
  tag,
  num,
  children,
  className = '',
  fitContent = false,
  ...props
}: ScrollSectionProps) {
  return (
    <section
      id={id}
      data-snap-section="true"
      data-section-id={id}
      data-section-title={title}
      data-section-tag={tag}
      data-section-num={num}
      aria-label={`${num} — ${title}`}
      className={`
        w-full relative
        ${fitContent ? 'min-h-0' : 'min-h-[calc(100svh-var(--navbar-height,80px))]'}
        flex flex-col justify-center
        overflow-x-hidden
        transition-colors duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </section>
  );
}
