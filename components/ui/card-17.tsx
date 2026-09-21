"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Original LocationCardProps from prompt
export interface LocationCardProps {
  city: string;
  address: string;
  imageUrl: string;
  directionsUrl: string;
  className?: string;
}

// LocationCard implementation strictly adhering to prompt specification
export const LocationCard = ({
  city,
  address,
  imageUrl,
  directionsUrl,
  className,
}: LocationCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["10deg", "-10deg"]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-10deg", "10deg"]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative w-full h-80 rounded-xl bg-cover bg-center",
        "shadow-lg transition-shadow duration-300 hover:shadow-2xl",
        className
      )}
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
          backgroundImage: `url(${imageUrl})`,
        }}
        className="absolute inset-4 grid h-[calc(100%-2rem)] w-[calc(100%-2rem)] place-content-end rounded-xl bg-cover bg-center shadow-lg"
      >
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content */}
        <div
          style={{ transform: "translateZ(50px)" }}
          className="p-6 text-white flex justify-between items-end w-full relative z-10"
        >
          <div>
            <h3 className="text-2xl font-bold">{city}</h3>
            <p className="text-sm text-white/80">{address}</p>
          </div>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="secondary"
              aria-label={`Get directions to our ${city} office`}
            >
              Get directions
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// TeamBranchCardProps preserving all original Section 3 copy & structure
export interface TeamBranchCardProps {
  branch: string;
  category: string;
  title: string;
  description: string;
  highlights?: string[];
  imageUrl: string;
  href: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  className?: string;
  onSelect?: () => void;
  isSelected?: boolean;
  actionLabel?: string;
}

export const TeamBranchCard = ({
  branch,
  category,
  title,
  description,
  highlights = [],
  imageUrl,
  href,
  badgeColor = "bg-[#800020]/20 text-[#B08D57] border-[#800020]/30",
  icon,
  className,
  onSelect,
  isSelected = false,
  actionLabel = "Enter Branch",
}: TeamBranchCardProps) => {
  return (
    <div
      onClick={onSelect ? () => onSelect() : undefined}
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer",
        "border-2 transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:shadow-2xl",
        isSelected
          ? "border-[#3A0B10] dark:border-[#B08D57] shadow-xl ring-2 ring-[#3A0B10]/20 dark:ring-[#B08D57]/20"
          : "border-[#3A0B10]/15 dark:border-white/15 hover:border-[#3A0B10]/40 dark:hover:border-[#B08D57]/40 shadow-md",
        "bg-white dark:bg-[#1A0507]",
        className
      )}
    >
      {/* UP: Image Header */}
      <div className="relative w-full h-60 sm:h-72 overflow-hidden bg-black/5">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges & Link */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border",
                badgeColor
              )}
            >
              {branch}
            </span>
            {isSelected && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#800020] text-white">
                Active Cohort
              </span>
            )}
          </div>

          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="h-9 w-9 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#800020] hover:border-[#800020] transition-colors"
            aria-label={`Open dedicated page for ${title}`}
          >
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>

        {/* Category on bottom edge of image */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-mono font-medium tracking-wider text-white drop-shadow">
          {icon}
          <span>{category}</span>
        </div>
      </div>

      {/* DOWN: Text in White / Theme Background */}
      <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow space-y-6 bg-white dark:bg-[#1A0507] text-[#16171B] dark:text-[#F5F3F0]">
        <div className="space-y-3">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] tracking-tight">
            {title}
          </h3>

          <p className="text-sm font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
            {description}
          </p>

          {highlights.length > 0 && (
            <div className="space-y-2 pt-2 text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/80">
              {highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#800020] dark:text-[#B08D57] shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/50">
            {isSelected ? "● Roster shown below" : `View ${title}`}
          </span>

          {onSelect ? (
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={cn(
                "font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm",
                isSelected
                  ? "bg-[#800020] text-white hover:bg-[#6C151E]"
                  : "bg-[#3A0B10]/5 dark:bg-white/10 text-[#3A0B10] dark:text-white hover:bg-[#800020] hover:text-white dark:hover:bg-[#800020]"
              )}
            >
              <span>{isSelected ? "Active Cohort" : actionLabel}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Link href={href}>
              <Button
                variant="secondary"
                className="bg-[#3A0B10]/5 dark:bg-white/10 text-[#3A0B10] dark:text-white hover:bg-[#800020] hover:text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <span>{actionLabel}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamBranchCard;
