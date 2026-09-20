'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Tag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CampusLocation } from '@/data/campus-locations';

interface LocationDetailCardProps {
  location: CampusLocation;
}

export function LocationDetailCard({ location }: LocationDetailCardProps) {
  // SRM University AP Google Maps URL for directions
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=SRM+University+AP+Amaravati+Andhra+Pradesh`;

  return (
    <div
      aria-label={`Details for ${location.name}`}
      className="
        w-full h-full flex flex-col justify-between
        rounded-2xl p-6 sm:p-7
        border border-[rgba(108,21,30,0.2)] dark:border-[rgba(176,141,87,0.25)]
        bg-white dark:bg-[#1C0D11]
        shadow-xl shadow-black/5 dark:shadow-black/50
        transition-all duration-300
      "
    >
      <div className="space-y-4">
        {/* Eyebrow Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20 dark:border-[#B08D57]/30">
            {location.isKeyVenue ? 'MAIN VENUE' : location.categoryLabel.toUpperCase()}
          </span>
          {location.metadata?.buildingCode && (
            <span className="font-mono text-xs text-stone-400">
              CODE: {location.metadata.buildingCode}
            </span>
          )}
        </div>

        {/* Title & Subtitle */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#16171B] dark:text-[#F5F3F0] tracking-tight">
            {location.name}
          </h3>
          <p className="text-sm font-sans text-[#6C151E] dark:text-[#B08D57] font-medium mt-0.5">
            {location.subtitle || location.categoryLabel}
          </p>
        </div>

        {/* Building Photo */}
        <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800">
          <Image
            src={location.image}
            alt={location.name}
            fill
            sizes="(max-width: 1024px) 100vw, 450px"
            className="object-cover object-center transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Description */}
        <p className="text-sm text-[#16171B]/80 dark:text-[#F5F3F0]/80 font-sans leading-relaxed">
          {location.description}
        </p>

        {/* Verified Metadata Details (Capacity removed per user request) */}
        <div className="space-y-2.5 pt-2 border-t border-stone-200 dark:border-stone-800/80">
          <div className="flex items-center gap-3 text-xs font-sans text-stone-700 dark:text-stone-300">
            <MapPin className="w-4 h-4 text-[#6C151E] dark:text-[#B08D57] shrink-0" />
            <span className="font-semibold text-stone-500 dark:text-stone-400">Location:</span>
            <span>{location.locationLabel}</span>
          </div>

          {location.festRole && (
            <div className="flex items-start gap-3 text-xs font-sans text-stone-700 dark:text-stone-300">
              <Tag className="w-4 h-4 text-[#6C151E] dark:text-[#B08D57] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-500 dark:text-stone-400 mr-1.5">Focus:</span>
                <span>{location.festRole}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 mt-4 border-t border-stone-200 dark:border-stone-800/80">
        <Link
          href="/schedule"
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-3 rounded-lg font-sans text-xs font-semibold tracking-wide
            bg-[#6C151E] text-white hover:bg-[#521018]
            dark:bg-[#6C151E] dark:hover:bg-[#851D28]
            shadow-md transition-colors
          "
        >
          <span>View Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-3 rounded-lg font-sans text-xs font-semibold tracking-wide
            border border-stone-300 dark:border-stone-700
            bg-white/70 dark:bg-white/5
            text-[#16171B] dark:text-[#F5F3F0]
            hover:bg-stone-100 dark:hover:bg-white/10
            transition-colors
          "
        >
          <span>Get Directions</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </a>
      </div>
    </div>
  );
}
