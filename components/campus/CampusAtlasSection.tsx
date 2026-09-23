'use client';

import * as React from 'react';
import { InteractiveCampusMap } from './InteractiveCampusMap';
import { LocationDetailCard } from './LocationDetailCard';
import {
  CAMPUS_LOCATIONS,
  CampusLocation,
} from '@/data/campus-locations';

const QUICK_VENUES = [
  { id: 'x-lab', label: 'Main Audi (X-Lab)' },
  { id: 'jc-bose', label: 'JC Bose' },
  { id: 'v-block', label: 'V-Block' },
  { id: 'homi-bhabha', label: 'Homi Bhabha' },
  { id: 'food-court', label: 'Food Court' },
  { id: 'sr-block', label: 'S.R. Block' },
  { id: 'gate-3', label: 'Gate 3' },
  { id: 'ground', label: 'Ground' },
];

export function CampusAtlasSection() {
  const [selectedLocation, setSelectedLocation] = React.useState<CampusLocation>(
    CAMPUS_LOCATIONS[0]
  );
  const [showRoute, setShowRoute] = React.useState<boolean>(true);

  const handleSelectLocation = (loc: CampusLocation) => {
    setSelectedLocation(loc);
  };

  const handleSelectById = (id: string) => {
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === id);
    if (loc) {
      setSelectedLocation(loc);
    }
  };

  return (
    <section
      id="interactive-atlas"
      aria-label="Campus Atlas & Venues"
      className="
        relative isolate w-full
        bg-[#F7F5F0] dark:bg-[#120709]
        py-8 sm:py-12 lg:py-16
        transition-colors duration-300
      "
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#6C151E] dark:text-[#B08D57]">
              CAMPUS ATLAS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#16171B] dark:text-[#F5F3F0] tracking-tight">
              Navigate the Fest.
            </h2>
            <p className="text-sm sm:text-base text-[#16171B]/75 dark:text-[#F5F3F0]/75 font-sans leading-relaxed">
              Explore key event venues, workshop labs, and verified walking routes from Gate 3.
            </p>
          </div>
        </div>

        {/* Quick Venue Filter Chips (Mobile-first horizontal scrollbar) */}
        <div className="w-full overflow-x-auto no-scrollbar py-1 -my-1">
          <div className="flex items-center gap-2 min-w-max pb-1">
            <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 mr-1 hidden sm:inline">
              Quick Select:
            </span>
            {QUICK_VENUES.map((venue) => {
              const isActive = selectedLocation.id === venue.id;
              return (
                <button
                  key={venue.id}
                  onClick={() => handleSelectById(venue.id)}
                  type="button"
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer shrink-0
                    ${isActive
                      ? 'bg-[#6C151E] text-white shadow-sm dark:bg-[#6C151E] dark:text-white'
                      : 'bg-white/80 dark:bg-white/5 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-[#B08D57]/60'}
                  `}
                >
                  {venue.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zero-Obstruction Layout: Map on left, Venue Details Companion on right (Stacked on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Map Viewport (Unobstructed) */}
          <div className="lg:col-span-7 xl:col-span-8 w-full">
            <InteractiveCampusMap
              locations={CAMPUS_LOCATIONS}
              selectedLocationId={selectedLocation.id}
              onSelectLocation={handleSelectLocation}
              showRoute={showRoute}
              onToggleRoute={() => setShowRoute((prev) => !prev)}
            />
          </div>

          {/* Venue Detail Card Companion (Side on Desktop, Below on Mobile) */}
          <div className="lg:col-span-5 xl:col-span-4 w-full">
            <LocationDetailCard
              location={selectedLocation}
              showRoute={showRoute}
              onToggleRoute={() => setShowRoute((prev) => !prev)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
