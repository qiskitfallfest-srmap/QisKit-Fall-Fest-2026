import * as React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface EcosystemEntity {
  id: string;
  name: string;
  role: string;
  description: string;
  href: string;
  actionLabel: string;
  renderLogo: () => React.ReactNode;
}

const ENTITIES: EcosystemEntity[] = [
  {
    id: 'srm-university-ap',
    name: 'SRM University-AP',
    role: 'Host Institution',
    description:
      'Premier research-driven university in Amaravati, hosting workshops, distinguished keynotes, and the flagship quantum hackathon on campus.',
    href: 'https://www.srmap.edu.in/',
    actionLabel: 'Visit University',
    renderLogo: () => (
      <div className="flex items-center gap-3.5">
        <div className="relative w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] shrink-0">
          <Image
            src="/images/footer/srm-ap-emblem.png"
            alt="SRM University-AP Emblem"
            fill
            sizes="46px"
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-bold text-[14px] sm:text-[15px] leading-tight tracking-[0.04em] text-[#211718] dark:text-[#FFF4F1]">
            SRM UNIVERSITY-AP
          </span>
          <span className="font-sans text-[11px] font-medium tracking-[0.14em] uppercase text-[#625754] dark:text-[#D8CCCA] mt-0.5">
            Amaravati &middot; India
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'ibm-quantum',
    name: 'IBM Quantum',
    role: 'Ecosystem Support',
    description:
      'Advancing quantum computing to solve the world’s hardest problems with state-of-the-art superconducting processors and cloud access.',
    href: 'https://www.ibm.com/quantum',
    actionLabel: 'Explore IBM Quantum',
    renderLogo: () => (
      <div className="flex items-center">
        {/* Light Theme: Dark Positive Logotype with -ml compensation for internal transparent whitespace */}
        <div className="dark:hidden relative h-[76px] w-[200px] sm:h-[82px] sm:w-[216px] -ml-[28px] sm:-ml-[30px] -my-[22px] sm:-my-[24px] flex items-center">
          <Image
            src="/images/branding/IBM_Quantum_logotype_pos_RGB.png"
            alt="IBM Quantum"
            fill
            sizes="216px"
            className="object-contain object-left select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Dark Theme: Light Reverse Logotype */}
        <div className="hidden dark:block relative h-[28px] w-[155px] sm:h-[30px] sm:w-[166px]">
          <Image
            src="/images/branding/IBM_Quantum_logotype_rev_RGB.png"
            alt="IBM Quantum"
            fill
            sizes="166px"
            className="object-contain object-left select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    ),
  },
  {
    id: 'qiskit',
    name: 'Qiskit',
    role: 'Quantum Software Ecosystem',
    description:
      'Open-source software development kit providing tools for creating and manipulating quantum programs and executing them on prototype devices.',
    href: 'https://qiskit.org/',
    actionLabel: 'Explore Qiskit',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <div className="relative w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] shrink-0">
          <Image
            src="/qiskit-purple-60.png"
            alt="Qiskit Purple Mark"
            fill
            sizes="38px"
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="font-sans font-bold text-[20px] sm:text-[22px] tracking-[-0.01em] text-[#211718] dark:text-[#FFF4F1]">
          Qiskit
        </span>
      </div>
    ),
  },
];

export function HostAndEcosystemSection() {
  return (
    <section
      id="section-06-host-and-ecosystem"
      aria-labelledby="host-ecosystem-heading"
      className="
        relative w-full overflow-hidden
        bg-[#F7F2ED] dark:bg-[#0C0A0B]
        transition-colors duration-300
      "
    >
      <div
        className="
          w-full max-w-[1920px] mx-auto
          px-5 sm:px-[34px] md:px-[52px] lg:px-[64px] xl:px-[76px] 2xl:px-[96px]
          py-[38px] sm:py-[46px] lg:py-[52px] 2xl:py-[58px]
          lg:min-h-[calc(100svh-var(--navbar-height))] lg:flex lg:flex-col lg:justify-center
        "
      >
        {/* =========================================================
            HEADER ROW: Editorial eyebrow + Headline & Narrative
        ========================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 lg:pb-10 border-b border-[rgba(108,21,30,0.14)] dark:border-[rgba(255,235,232,0.14)]">
          <div className="max-w-[620px]">
            {/* Eyebrow */}
            <div className="flex items-center gap-[10px] mb-2.5 sm:mb-3">
              <span
                aria-hidden="true"
                className="w-[5.5px] h-[5.5px] rotate-45 shrink-0 bg-[#8F1723] dark:bg-[#F06B78]"
              />
              <h2
                id="host-ecosystem-heading"
                className="
                  font-sans font-bold uppercase
                  text-[11px] sm:text-[12px] lg:text-[12.5px]
                  tracking-[0.19em] leading-none
                  text-[#8F1723] dark:text-[#F06B78]
                "
              >
                HOST & ECOSYSTEM
              </h2>
            </div>

            {/* Display Title */}
            <h3
              className="
                font-serif font-bold tracking-[-0.03em] leading-[1.0]
                text-[26px] sm:text-[32px] lg:text-[38px] 2xl:text-[42px]
                text-[#211718] dark:text-[#FFF4F1]
              "
            >
              Building a Stronger Quantum Tomorrow.
            </h3>
          </div>

          {/* Secondary Copy */}
          <p
            className="
              max-w-[440px]
              font-sans font-normal
              text-[12.5px] sm:text-[13px] lg:text-[13.5px]
              leading-[1.55]
              text-[#625754] dark:text-[#D8CCCA]
            "
          >
            An academic host, an industry ecosystem, and an open-source quantum
            platform coming together for Qiskit Fall Fest 2026.
          </p>
        </div>

        {/* =========================================================
            3-ENTITY CARDS ROW WITH SEPARATORS
        ========================================================== */}
        <div
          className="
            grid grid-cols-1
            md:grid-cols-3
            gap-0
            pt-2 sm:pt-4
          "
        >
          {ENTITIES.map((entity, index) => (
            <article
              key={entity.id}
              className={`
                group relative flex flex-col justify-between
                p-5 sm:p-6 lg:p-7 2xl:p-8
                transition-all duration-200 ease-out
                hover:bg-[rgba(108,21,30,0.025)] dark:hover:bg-[rgba(255,235,232,0.025)]
                ${
                  index !== 0
                    ? 'border-t md:border-t-0 md:border-l border-[rgba(108,21,30,0.14)] dark:border-[rgba(255,235,232,0.14)]'
                    : ''
                }
              `}
            >
              <div>
                {/* Role Pill */}
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <span
                    className="
                      inline-flex items-center px-2.5 py-1 rounded-[4px]
                      bg-[rgba(143,23,35,0.07)] dark:bg-[rgba(240,107,120,0.12)]
                      border border-[rgba(143,23,35,0.18)] dark:border-[rgba(240,107,120,0.24)]
                      font-sans font-bold text-[10px] sm:text-[10.5px]
                      tracking-[0.14em] uppercase
                      text-[#8F1723] dark:text-[#F06B78]
                    "
                  >
                    {entity.role}
                  </span>
                </div>

                {/* Logo Presentation Viewport */}
                <div className="h-[52px] sm:h-[58px] flex items-center mb-4">
                  {entity.renderLogo()}
                </div>

                {/* Description */}
                <p
                  className="
                    font-sans font-normal
                    text-[12.5px] sm:text-[13px] 2xl:text-[13.5px]
                    leading-[1.58]
                    text-[#625754] dark:text-[#D8CCCA]
                    max-w-[360px]
                  "
                >
                  {entity.description}
                </p>
              </div>

              {/* Action Link */}
              <div className="pt-6 sm:pt-7 mt-auto">
                <a
                  href={entity.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${entity.actionLabel} (opens in a new tab)`}
                  className="
                    inline-flex items-center gap-1.5
                    font-sans font-semibold text-[12px] sm:text-[12.5px]
                    text-[#8F1723] dark:text-[#F06B78]
                    hover:text-[#6C151E] dark:hover:text-[#FFA6B0]
                    transition-colors duration-180
                  "
                >
                  <span>{entity.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-180 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
