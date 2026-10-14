import React from 'react';
import { Footer } from '@/components/shared/Footer';
import { AboutArticle } from '@/components/about/AboutArticle';

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col">
      <AboutArticle />
      <Footer />
    </div>
  );
}
