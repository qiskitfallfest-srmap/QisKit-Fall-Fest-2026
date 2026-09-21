import * as React from 'react';

export interface ResponsivePictureProps {
  /** Page category: 'home' or 'about' */
  page?: 'home' | 'about';
  /** Image index within page: 1..4 for home, 1..5 for about */
  index?: number;
  /** Explicit desktop asset path override (>= 1280px) */
  desktop?: string;
  /** Explicit laptop asset path override (1024px - 1279px) */
  laptop?: string;
  /** Explicit tablet asset path override (768px - 1023px) */
  tablet?: string;
  /** Explicit mobile asset path override (< 768px) */
  mobile?: string;
  /** Accessible image description */
  alt?: string;
  /** Whether to eagerly load the image */
  priority?: boolean;
  /** Outer <picture> element classes */
  className?: string;
  /** Inner <img> element classes */
  imgClassName?: string;
  /** Whether to fill the parent container (absolute inset-0) */
  fill?: boolean;
  /** Whether to apply dark mode blending / contrast enhancement */
  darkFilter?: boolean;
  /** Object fit style (default: 'cover') */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Object position override */
  objectPosition?: string;
}

export function ResponsivePicture({
  page,
  index,
  desktop,
  laptop,
  tablet,
  mobile,
  alt = '',
  priority = false,
  className = '',
  imgClassName = '',
  fill = true,
  darkFilter = true,
  objectFit = 'cover',
  objectPosition = 'center',
}: ResponsivePictureProps) {
  // Resolve paths from page & index if explicit paths not provided
  const desktopSrc = desktop || (page && index ? `/Assets2/desktop/${page}/${index}.png` : '');
  const laptopSrc = laptop || (page && index ? `/Assets2/laptop/${page}/${index}.png` : '');
  const tabletSrc = tablet || (page && index ? `/Assets2/tablet/${page}/${index}.png` : '');
  const mobileSrc = mobile || (page && index ? `/Assets2/mobile/${page}/${index}.png` : desktopSrc);

  const containerClasses = [
    fill ? 'absolute inset-0 w-full h-full' : 'relative block w-full h-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const imageClasses = [
    'w-full h-full select-none pointer-events-none transition-all duration-300',
    objectFit === 'cover' && 'object-cover',
    objectFit === 'contain' && 'object-contain',
    darkFilter && 'dark:brightness-[0.74] dark:contrast-[1.12] dark:opacity-90',
    imgClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <picture className={containerClasses}>
      {/* 1. Desktop: Widescreen (1280px and wider) */}
      {desktopSrc && (
        <source
          media="(min-width: 1280px)"
          srcSet={desktopSrc}
          type="image/png"
        />
      )}

      {/* 2. Laptop: Mid-wide screen (1024px to 1279px) */}
      {laptopSrc && (
        <source
          media="(min-width: 1024px)"
          srcSet={laptopSrc}
          type="image/png"
        />
      )}

      {/* 3. Tablet: Portrait / Tablet screen (768px to 1023px) */}
      {tabletSrc && (
        <source
          media="(min-width: 768px)"
          srcSet={tabletSrc}
          type="image/png"
        />
      )}

      {/* 4. Mobile fallback: Phone screen (< 768px) */}
      <img
        src={mobileSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ objectPosition }}
        className={imageClasses}
      />
    </picture>
  );
}
