'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  ArrowRight,
  ExternalLink,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { CampusLocation } from '@/data/campus-locations';

interface LocationDetailCardProps {
  location: CampusLocation;
  showRoute?: boolean;
  onToggleRoute?: () => void;
  className?: string;
}

export function LocationDetailCard({
  location,
  showRoute = true,
  onToggleRoute,
  className = '',
}: LocationDetailCardProps) {
  // SRM University AP Google Maps URL for directions
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${location.name}, SRM University AP, Amaravati, Andhra Pradesh`)}`;

  return (
    <div
      aria-label={`Details for ${location.name}`}
      className={`
        w-full flex flex-col justify-between
        rounded-2xl p-5 sm:p-6 lg:p-7
        border border-stone-200/90 dark:border-[#B08D57]/25
        bg-white/95 dark:bg-[#180A0D]/95 backdrop-blur-sm
        shadow-xl shadow-black/5 dark:shadow-black/40
        transition-all duration-300
        ${className}
      `}
    >
      <div className="space-y-4">
        {/* Top Header: Category Tag & Building Code */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20 dark:border-[#B08D57]/30">
            {location.isKeyVenue && <Sparkles className="w-3 h-3 text-[#B08D57]" />}
            {location.isKeyVenue ? 'KEY FESTIVAL VENUE' : location.categoryLabel}
          </span>

          {location.metadata?.buildingCode && (
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-400">
              {location.metadata.buildingCode}
            </span>
          )}
        </div>

        {/* Building Title & Subtitle */}
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#16171B] dark:text-[#F5F3F0] tracking-tight leading-snug">
            {location.name}
          </h3>
          <p className="text-xs sm:text-sm font-sans text-[#6C151E] dark:text-[#B08D57] font-medium mt-1">
            {location.subtitle || location.categoryLabel}
          </p>
        </div>

        {/* Building Image */}
        <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-inner group">
          <Image
            src={location.image}
            alt={location.name}
            fill
            sizes="(max-width: 1024px) 100vw, 420px"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-mono flex items-center gap-1.5 drop-shadow">
            <MapPin className="w-3.5 h-3.5 text-[#B08D57] shrink-0" />
            <span className="truncate">{location.locationLabel}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#16171B]/80 dark:text-[#F5F3F0]/80 font-sans leading-relaxed">
          {location.description}
        </p>

        {/* Fest Role */}
        {location.festRole && (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/5 text-xs font-sans text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#6C151E] dark:text-[#B08D57] shrink-0">
                Festival Focus:
              </span>
              <span className="truncate">{location.festRole}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons & Walking Route Toggle */}
      <div className="space-y-2.5 pt-5 mt-4 border-t border-stone-200 dark:border-stone-800">
        {onToggleRoute && location.id !== 'gate-3' && (
          <button
            onClick={onToggleRoute}
            type="button"
            className={`
              w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-sans text-xs font-semibold
              border transition-all cursor-pointer
              ${showRoute
                ? 'bg-[#B08D57]/15 border-[#B08D57]/60 text-[#6C151E] dark:text-[#B08D57]'
                : 'bg-stone-100 dark:bg-white/5 border-stone-200 dark:border-stone-700 text-[#16171B] dark:text-[#F5F3F0] hover:bg-stone-200 dark:hover:bg-white/10'}
            `}
          >
            <Navigation className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>{showRoute ? 'Walking Path from Gate 3: Active' : 'Show Walking Path from Gate 3'}</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/schedule"
            className="
              inline-flex items-center justify-center gap-1.5
              py-2.5 px-3.5 rounded-xl font-sans text-xs font-semibold
              bg-[#6C151E] text-white hover:bg-[#521018]
              dark:bg-[#6C151E] dark:hover:bg-[#851D28]
              shadow-sm transition-colors
            "
          >
            <span>Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center gap-1.5
              py-2.5 px-3.5 rounded-xl font-sans text-xs font-semibold
              border border-stone-300 dark:border-stone-700
              bg-white dark:bg-white/5
              text-[#16171B] dark:text-[#F5F3F0]
              hover:bg-stone-100 dark:hover:bg-white/10
              transition-colors
            "
          >
            <span>Directions</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
