import { Playfair_Display } from 'next/font/google';

// Self-hosted by next/font, so the PNG export of the award card can embed it (same origin).
// Kept out of the 'use client' card module so server pages can use it too.
export const awardSerif = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  style: ['normal', 'italic'],
  display: 'block',
});
