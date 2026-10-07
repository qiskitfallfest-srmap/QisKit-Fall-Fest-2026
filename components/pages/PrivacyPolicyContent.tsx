'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, FileText, CheckCircle2, Mail, ExternalLink, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';

export default function PrivacyPolicyContent() {
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
            <Shield className="w-3.5 h-3.5" />
            Legal & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#201617] dark:text-[#FFF4F1]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#635654] dark:text-[#D2C4C1]">
            <strong>Effective Date:</strong> October 1, 2026 &nbsp;&middot;&nbsp; <strong>Last Updated:</strong> October 8, 2026
          </p>
          <p className="mt-2 text-sm text-[#7D111C] dark:text-[#F07A86] font-medium">
            Official Data Privacy Policy for Qiskit Fall Fest SRMAP 2026 &middot; SRM University-AP in collaboration with IBM Quantum
          </p>
        </header>

        {/* Content Body */}
        <div className="space-y-10 text-[15px] sm:text-[16px] leading-[1.75] text-[#3D3334] dark:text-[#E2D5D3]">
          
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">01</span>
              Introduction & Scope
            </h2>
            <p>
              This Privacy Policy describes how <strong>Qiskit Fall Fest SRMAP 2026</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Event&rdquo;), organized by <strong>SRM University-AP</strong> in academic collaboration with <strong>IBM Quantum</strong>, collects, processes, stores, and protects personal information obtained through our official platform located at{' '}
              <a href="https://qffsrmap2026.com" className="text-[#7D111C] dark:text-[#F07A86] font-semibold underline">
                https://qffsrmap2026.com
              </a>{' '}
              and its interactive sub-services, including the Learning Portal (<code>/learning</code>), hackathon registration, and certificate verification systems.
            </p>
            <p className="mt-3">
              We respect your privacy and are committed to protecting the personal data you share with us in compliance with applicable global data privacy regulations and Google API Services User Data Policies.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">02</span>
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div className="border-l-2 border-[#7D111C] dark:border-[#F07A86] pl-4">
                <h3 className="font-bold text-[#201617] dark:text-[#FFF4F1]">A. Google OAuth Account Information</h3>
                <p className="mt-1 text-sm sm:text-base">
                  When you sign in using <strong>Google Sign-In</strong>, we request access only to your standard profile information via non-sensitive Google OAuth scopes (<code>openid</code>, <code>profile</code>, <code>email</code>). This data includes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li><strong>Full Name</strong> (used to personalize your participant dashboard and print your official certificate).</li>
                  <li><strong>Email Address</strong> (used for secure account login, session tokens, and dispatching event announcements).</li>
                  <li><strong>Profile Picture URL</strong> (used to display your avatar in the learning navigation header).</li>
                </ul>
                <p className="mt-2 text-xs sm:text-sm text-[#7D111C] dark:text-[#F07A86] font-semibold">
                  ⚠️ Note: We NEVER request, access, or store your passwords, contacts, Google Drive files, Gmail messages, or any other sensitive account data.
                </p>
              </div>

              <div className="border-l-2 border-[#7D111C] dark:border-[#F07A86] pl-4">
                <h3 className="font-bold text-[#201617] dark:text-[#FFF4F1]">B. Participant & Academic Details</h3>
                <p className="mt-1 text-sm sm:text-base">
                  When participating in workshops or the hackathon, you may voluntarily submit:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
                  <li>College/University affiliation and Student Registration Number.</li>
                  <li>Hackathon team name, member rosters, and GitHub repository links for code review.</li>
                </ul>
              </div>

              <div className="border-l-2 border-[#7D111C] dark:border-[#F07A86] pl-4">
                <h3 className="font-bold text-[#201617] dark:text-[#FFF4F1]">C. Learning Progress & Quiz Analytics</h3>
                <p className="mt-1 text-sm sm:text-base">
                  We record your completed quantum learning modules, interactive quiz scores, and session attendance to compute certificate eligibility.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Google Limited Use Requirement */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(108,21,30,0.05)] dark:bg-[rgba(240,120,132,0.06)] border-2 border-[#7D111C]/30 dark:border-[#F07A86]/40 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#7D111C] dark:text-[#F07A86] mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6" />
              Google API Services User Data Policy Compliance
            </h2>
            <div className="p-4 rounded-xl bg-white/70 dark:bg-black/30 border border-[#7D111C]/20 dark:border-[#F07A86]/25 font-mono text-xs sm:text-sm leading-relaxed">
              &ldquo;Qiskit Fall Fest SRMAP 2026&rsquo;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-[#7D111C] dark:text-[#F07A86]"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.&rdquo;
            </div>
            <ul className="mt-4 space-y-2 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>We do not transfer Google user data to third parties, except when strictly necessary to provide or improve the core learning portal features.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>We do not use Google user data for advertising, retargeting, or selling to data brokers under any circumstances.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>We do not use Google user data to train generalized AI or machine learning models.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">03</span>
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
              <li><strong>Authentication &amp; Session Management:</strong> Enabling smooth sign-in to the Learning Portal via secure tokens.</li>
              <li><strong>Academic Credentialing:</strong> Generating cryptographically signed, verifiable event certificates with authentic participant names.</li>
              <li><strong>Hackathon Evaluation:</strong> Reviewing code repositories and awarding prizes to registered teams.</li>
              <li><strong>Direct Event Communication:</strong> Sending urgent notifications regarding lecture schedules, hackathon rounds, and mentor sessions.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">04</span>
              Data Storage &amp; Encryption
            </h2>
            <p>
              Your data is stored in dedicated, highly secured cloud infrastructure managed by <strong>Supabase</strong> on Amazon Web Services (AWS) data centers with:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
              <li><strong>Encryption in Transit:</strong> TLS 1.3 / HTTPS encryption for all browser-to-server communications.</li>
              <li><strong>Encryption at Rest:</strong> AES-256 bit database encryption.</li>
              <li><strong>Row-Level Security (RLS):</strong> Database-level access rules ensuring students can only access their personal progress and scores.</li>
            </ul>
          </section>

          {/* Section 6 - User Rights & Deletion */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">05</span>
              Your Rights &amp; Data Deletion (Right to Be Forgotten)
            </h2>
            <p>
              You maintain full ownership and control over your personal data. At any time, you have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base">
              <li>Request an export of all personal data held about you.</li>
              <li>Request immediate and permanent deletion of your account and related records.</li>
              <li>Revoke Google OAuth authorization at any time directly through{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#7D111C] dark:text-[#F07A86] underline font-semibold">
                  Google Account Security Settings
                </a>.
              </li>
            </ul>
            <div className="mt-4 p-4 rounded-xl bg-[rgba(108,21,30,0.06)] dark:bg-[rgba(240,120,132,0.08)] border border-[rgba(108,21,30,0.14)] dark:border-[rgba(240,120,132,0.20)]">
              <p className="font-semibold text-sm sm:text-base text-[#201617] dark:text-[#FFF4F1]">
                How to Request Account Deletion:
              </p>
              <p className="mt-1 text-sm">
                Send an email from your registered address to{' '}
                <a href="mailto:qiskitfallfest@srmap.edu.in" className="text-[#7D111C] dark:text-[#F07A86] font-bold underline">
                  qiskitfallfest@srmap.edu.in
                </a>{' '}
                with the subject <code>&quot;Data Deletion Request&quot;</code>. All user records will be permanently removed within 48 business hours.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(255,250,246,0.92)] dark:bg-[rgba(26,6,9,0.85)] border border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.18)] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#7D111C] text-white text-xs font-mono">06</span>
              Contact &amp; Data Controller Information
            </h2>
            <p>
              If you have any questions, clarifications, or privacy-related requests regarding this policy, please reach out to our organizing committee:
            </p>
            <div className="mt-4 space-y-2 text-sm sm:text-base">
              <p><strong>Organizing Entity:</strong> Qiskit Fall Fest SRMAP 2026 Organizing Committee</p>
              <p><strong>Academic Institution:</strong> Department of Computer Science &amp; Engineering, SRM University-AP</p>
              <p><strong>Campus Address:</strong> Neerukonda, Mangalagiri Mandal, Guntur District, Mangalagiri, Andhra Pradesh 522240, India</p>
              <p>
                <strong>Official Email:</strong>{' '}
                <a href="mailto:qiskitfallfest@srmap.edu.in" className="text-[#7D111C] dark:text-[#F07A86] font-bold underline">
                  qiskitfallfest@srmap.edu.in
                </a>
              </p>
              <p>
                <strong>Official Website:</strong>{' '}
                <a href="https://qffsrmap2026.com" className="text-[#7D111C] dark:text-[#F07A86] font-bold underline">
                  https://qffsrmap2026.com
                </a>
              </p>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
