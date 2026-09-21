'use client';

import * as React from 'react';
import Image from 'next/image';
import { Search, ArrowRight } from 'lucide-react';
import {
  CAMPUS_LOCATIONS,
  KEY_FEST_VENUES,
} from '@/data/campus-locations';

interface CampusLocationDirectoryProps {
  onSelectLocation?: (locationId: string) => void;
}

export function CampusLocationDirectory({
  onSelectLocation,
}: CampusLocationDirectoryProps) {
  const [search, setSearch] = React.useState<string>('');

  const displayedLocations = React.useMemo(() => {
    return CAMPUS_LOCATIONS.filter((loc) => {
      const isFestKey = KEY_FEST_VENUES.includes(loc.id);
      if (!search) return isFestKey;
      return (
        loc.name.toLowerCase().includes(search.toLowerCase()) ||
        loc.description.toLowerCase().includes(search.toLowerCase()) ||
        (loc.subtitle && loc.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        (loc.tags && loc.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
      );
    });
  }, [search]);

  const handleCardClick = (locationId: string) => {
    if (onSelectLocation) {
      onSelectLocation(locationId);
    }
    const atlasSection = document.getElementById('interactive-atlas');
    if (atlasSection) {
      atlasSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="venue-directory"
      aria-label="Venue Directory"
      className="
        relative isolate w-full scroll-mt-24
        bg-[#FFFFFF] dark:bg-[#0E0608]
        border-t border-[rgba(22,23,27,0.1)] dark:border-[rgba(245,243,240,0.08)]
        py-12 sm:py-16 lg:py-20
        transition-colors duration-300
      "
    >
      {/* Anchor alias so any link pointing to campus-directory or venue-directory lands here */}
      <span id="campus-directory" className="absolute -top-24 left-0 pointer-events-none opacity-0" aria-hidden="true" />

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#6C151E] dark:text-[#B08D57]">
              VENUE DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#16171B] dark:text-[#F5F3F0] tracking-tight">
              All Locations
            </h2>
            <p className="text-sm text-[#16171B]/75 dark:text-[#F5F3F0]/75 font-sans max-w-xl">
              Discover all event venues and what&apos;s happening at each location.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search for a venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2.5 rounded-lg text-xs sm:text-sm font-sans
                border border-stone-300 dark:border-stone-800
                bg-stone-50 dark:bg-[#180A0D]
                text-[#16171B] dark:text-[#F5F3F0]
                placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#6C151E] dark:focus:ring-[#B08D57]
                transition-all
              "
            />
          </div>
        </div>

        {/* Venue Cards Grid (5 primary festival venues) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {displayedLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => handleCardClick(loc.id)}
              className="
                group rounded-xl overflow-hidden
                border border-stone-200 dark:border-[rgba(108,21,30,0.25)]
                bg-stone-50/50 dark:bg-[#14080B]
                hover:border-[#6C151E] dark:hover:border-[#B08D57]
                hover:shadow-xl transition-all duration-300
                flex flex-col justify-between cursor-pointer
              "
            >
              <div>
                {/* Building Thumbnail */}
                <div className="relative w-full h-36 overflow-hidden bg-stone-900">
                  <Image
                    src={loc.image}
                    alt={loc.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 240px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2.5">
                  <h3 className="font-serif text-base font-bold text-[#16171B] dark:text-[#F5F3F0] leading-snug group-hover:text-[#6C151E] dark:group-hover:text-[#B08D57] transition-colors line-clamp-1">
                    {loc.shortName || loc.name}
                  </h3>
                  <p className="text-xs font-sans text-stone-500 dark:text-stone-400 line-clamp-1">
                    {loc.subtitle || loc.categoryLabel}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(loc.tags || []).slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-stone-200/70 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="p-4 pt-0 mt-2 flex items-center justify-between text-xs font-semibold text-[#6C151E] dark:text-[#B08D57] border-t border-stone-200/60 dark:border-stone-800/60 pt-3">
                <span>View Details</span>
                <span className="w-5 h-5 rounded-full bg-[#6C151E]/10 dark:bg-[#B08D57]/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
