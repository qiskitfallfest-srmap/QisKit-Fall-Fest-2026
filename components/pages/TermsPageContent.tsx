'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Award, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';

export default function TermsPageContent() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F7F2ED] dark:bg-[#120506] text-[#201617] dark:text-[#FFF4F1] transition-colors duration-300">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7D111C] dark:text-[#F07A86] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12 border-b border-[rgba(108,21,30,0.16)] dark:border-[rgba(240,120,132,0.20)] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-[rgba(108,21,30,0.08)] dark:bg-[rgba(240,120,132,0.12)] text-[#6C151E] dark:text-[#F07A86] border border-[rgba(108,21,30,0.18)] dark:border-[rgba(240,120,132,0.25)] mb-4">
            <FileText className="w-3.5 h-3.5" />
            Terms &amp; Code of Conduct
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#201617] dark:text-[#FFF4F1]">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#635654] dark:text-[#D2C4C1]">
            <strong>Effective Date:</strong> October 1, 2026 &nbsp;&middot;&nbsp; <strong>Last Updated:</strong> October 8, 2026
          </p>
          <p className="mt-2 text-sm text-[#7D111C] dark:text-[#F07A86] font-medium">
            Event Participation Rules &middot; Hackathon Intellectual Property &middot; Code of Conduct
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-[15px] sm:text-[16px] leading-[1.75] text-[#3D3334] dark:text-[#E2D5D3]">
          
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">01</span>
              Agreement to Terms
            </h2>
            <p>
              By accessing or using the official web portal at{' '}
              <a href="https://qffsrmap2026.com" className="text-[#7D111C] dark:text-[#F07A86] font-semibold underline">
                https://qffsrmap2026.com
              </a>{' '}
              or registering for any workshop, masterclass, or hackathon track of <strong>Qiskit Fall Fest SRMAP 2026</strong>, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue use of this site.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">02</span>
              Eligibility &amp; Registration
            </h2>
            <p>
              Participation in Qiskit Fall Fest SRMAP 2026 is open to undergraduate, postgraduate, and doctoral students, researchers, faculty, and industry developers interested in quantum computing.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-sm sm:text-base">
              <li>You agree to provide accurate and truthful information upon registration.</li>
              <li>Each participant is responsible for maintaining the confidentiality of their login credentials.</li>
              <li>One person may only maintain a single active user account on the learning portal.</li>
            </ul>
          </section>

          {/* Section 3 - IP */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">03</span>
              Intellectual Property Rights
            </h2>
            <p>
              <strong>You retain 100% full ownership of all intellectual property, algorithms, circuits, and source code</strong> created by you or your team during the hackathon. Neither SRM University-AP nor IBM Quantum claims ownership over your project submissions.
            </p>
            <p className="mt-3">
              By submitting a project for hackathon evaluation, you grant the organizing committee a non-exclusive, royalty-free license to display, review, and evaluate your submission solely for judging, award ceremonies, and educational demonstration purposes.
            </p>
          </section>

          {/* Section 4 - Code of Conduct */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">04</span>
              Code of Conduct &amp; Academic Integrity
            </h2>
            <p>
              We are dedicated to providing a respectful, inclusive, and harassment-free environment for everyone, regardless of gender, gender identity, sexual orientation, disability, race, ethnicity, or religion.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-sm sm:text-base">
              <li>Plagiarism, submitting pre-existing commercial projects, or misrepresenting team authorship will result in immediate disqualification.</li>
              <li>Harassment or unprofessional conduct on event communication channels, Discord, or during on-campus sessions will not be tolerated.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">05</span>
              Contact Information
            </h2>
            <p>
              For legal questions, code of conduct reports, or inquiries regarding these Terms, contact:
            </p>
            <p className="mt-3">
              <strong>Email:</strong>{' '}
              <a href="mailto:qiskitfallfest@srmap.edu.in" className="text-[#7D111C] dark:text-[#F07A86] font-bold underline">
                qiskitfallfest@srmap.edu.in
              </a>
            </p>
            <p>
              <strong>Campus:</strong> SRM University-AP, Neerukonda, Mangalagiri Mandal, Guntur District, Andhra Pradesh 522240, India
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
