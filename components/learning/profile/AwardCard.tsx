'use client';

import React, { forwardRef, useEffect, useId, useState } from 'react';
import QRCode from 'qrcode';
import clsx from 'clsx';
import { awardSerif } from './award-font';
import { AWARD_RANK_LABEL, awardUrl, formatInr, type AwardRank, type CompetitionWinner, type CompetitionWinnersBoard } from '@/lib/competition-results';

/** Sizes are in container-width units so the card is identical at any screen width. */
const cq = (n: number) => `${n}cqw`;

// Brand palette (app/globals.css)
const INK = '#16171B';
const BURGUNDY = '#6C151E';
const BURGUNDY_DEEP = '#3A0B10';
const GOLD = '#B08D57';
const GOLD_LIGHT = '#D9C08E';
const PAPER = '#FBF8F2';
const MUTED = '#6B6259';

const ORDINAL_SUFFIX: Record<AwardRank, string> = { 1: 'st', 2: 'nd', 3: 'rd' };

/** Metal for the medallion: gold, silver, bronze (light, mid, dark stops). */
export const MEDAL_METAL: Record<AwardRank, [string, string, string]> = {
  1: ['#F1E2B8', '#C9A55C', '#8C6A2F'],
  2: ['#F2F3F5', '#B9BEC6', '#7D838D'],
  3: ['#F0D2B6', '#C08457', '#83502A'],
};

/** Laurel leaves along an arc on one side of the medallion (viewBox 0 0 200 200, centre 100,100). */
function laurelLeaves(side: 'left' | 'right') {
  const count = 8;
  return Array.from({ length: count }, (_, i) => {
    // Left branch runs from below the disc (110deg) up to above it (235deg); the right one is its mirror
    const deg = 110 + (i * 125) / (count - 1);
    const rad = (deg * Math.PI) / 180;
    const lx = 100 + Math.cos(rad) * 80;
    const y = 100 + Math.sin(rad) * 80;
    const tangent = deg + 90;
    return side === 'left'
      ? { x: lx, y, rot: tangent, s: 1 - i * 0.045 }
      : { x: 200 - lx, y, rot: 180 - tangent, s: 1 - i * 0.045 };
  });
}

function Medallion({ rank, gradId }: { rank: AwardRank; gradId: string }) {
  const [light, mid, dark] = MEDAL_METAL[rank];
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={`${gradId}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${gradId}-leaf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_LIGHT} />
          <stop offset="100%" stopColor={GOLD} />
        </linearGradient>
      </defs>
      {/* Laurel */}
      {(['left', 'right'] as const).map((side) =>
        laurelLeaves(side).map((l, i) => (
          <ellipse
            key={`${side}-${i}`}
            cx={l.x}
            cy={l.y}
            rx={13 * l.s}
            ry={5.2 * l.s}
            transform={`rotate(${l.rot} ${l.x} ${l.y})`}
            fill={`url(#${gradId}-leaf)`}
          />
        ))
      )}
      {/* Disc */}
      <circle cx="100" cy="100" r="64" fill={`url(#${gradId}-metal)`} />
      <circle cx="100" cy="100" r="56" fill={PAPER} />
      <circle cx="100" cy="100" r="51" fill="none" stroke={mid} strokeWidth="1.2" strokeDasharray="1.5 3" />
    </svg>
  );
}

/** Fine engraved rosette behind the medallion, as on printed certificates. */
function Guilloche() {
  const rings = Array.from({ length: 18 }, (_, i) => i);
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
      <g fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.22">
        {rings.map((i) => (
          <ellipse key={i} cx="200" cy="200" rx="190" ry="78" transform={`rotate(${i * 10} 200 200)`} />
        ))}
      </g>
    </svg>
  );
}

/** QR code for the public verification page, as a data URL so the PNG export can inline it. */
function useQrDataUrl(text: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(text, { margin: 0, width: 320, errorCorrectionLevel: 'M', color: { dark: INK, light: PAPER } })
      .then((u) => !cancelled && setUrl(u))
      .catch(() => !cancelled && setUrl(null));
    return () => {
      cancelled = true;
    };
  }, [text]);
  return url;
}

/**
 * Award card sized 4:5 for a LinkedIn post. Always light, regardless of the
 * site theme, because it is exported as an image.
 */
export const AwardCard = forwardRef<HTMLDivElement, { board: CompetitionWinnersBoard; winner: CompetitionWinner }>(
  function AwardCard({ board, winner }, ref) {
    const gradId = useId().replace(/:/g, '');
    const pool = board.prizePool;
    const poolTotal = pool?.reduce((a, b) => a + b, 0) ?? null;
    const serif = awardSerif.style.fontFamily;
    const qr = useQrDataUrl(awardUrl(board.type, winner.rank));

    return (
      <div className="mx-auto w-full max-w-[480px]" style={{ containerType: 'inline-size' }}>
        <div
          ref={ref}
          className="relative w-full overflow-hidden select-none"
          style={{
            aspectRatio: '4 / 5',
            background: PAPER,
            color: INK,
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Header band */}
          <div
            className="absolute inset-x-0 top-0"
            style={{ height: cq(27), background: `linear-gradient(180deg, ${BURGUNDY_DEEP} 0%, ${BURGUNDY} 100%)` }}
          >
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: cq(0.7), background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)` }}
            />
            <div className="flex items-center" style={{ padding: `${cq(5)} ${cq(6)} 0`, gap: cq(2.8) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/qiskit-fall-fest-2026-badge.png" alt="" crossOrigin="anonymous" style={{ width: cq(11.5), height: cq(11.5) }} />
              <div className="min-w-0 flex-1">
                <p className="font-bold uppercase" style={{ fontSize: cq(3), letterSpacing: '0.24em', color: '#F5EEE3' }}>
                  Qiskit Fall Fest 2026
                </p>
                <p style={{ fontSize: cq(2.5), color: GOLD_LIGHT, marginTop: cq(0.8), letterSpacing: '0.04em' }}>
                  Partner Plus Host · SRM University-AP
                </p>
              </div>
              <p className="text-right uppercase" style={{ fontSize: cq(2.1), letterSpacing: '0.16em', color: GOLD_LIGHT, lineHeight: 1.5 }}>
                Online Phase
                <br />
                October 2026
              </p>
            </div>
          </div>

          {/* Engraved rosette */}
          <div
            className="absolute"
            style={{ left: cq(-10), right: cq(-10), top: cq(14), height: cq(60), opacity: 1 }}
          >
            <Guilloche />
          </div>

          {/* Frame */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{ left: cq(3), right: cq(3), top: cq(30), bottom: cq(3), border: `1px solid ${GOLD}66` }}
          />

          {/* Medallion straddling the band */}
          <div className="absolute" style={{ left: '50%', top: cq(14), width: cq(30), height: cq(30), transform: 'translateX(-50%)' }}>
            <Medallion rank={winner.rank} gradId={gradId} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: serif, color: BURGUNDY_DEEP }}>
              {/* The suffix hangs off the numeral so the numeral itself sits at the centre of the disc */}
              <span className="relative" style={{ fontSize: cq(10.5), fontWeight: 700, lineHeight: 1 }}>
                {winner.rank}
                <span className="absolute" style={{ left: '100%', top: '0.02em', fontSize: cq(3.6), marginLeft: cq(0.3) }}>
                  {ORDINAL_SUFFIX[winner.rank]}
                </span>
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="absolute flex flex-col items-center text-center" style={{ left: cq(8), right: cq(8), top: cq(46), bottom: cq(5.5) }}>
            <p className="font-bold uppercase" style={{ fontSize: cq(3.4), letterSpacing: '0.32em', color: BURGUNDY, paddingLeft: '0.32em' }}>
              {AWARD_RANK_LABEL[winner.rank]}
            </p>
            <p style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 500, fontSize: cq(4.4), color: '#7A5B2E', marginTop: cq(1) }}>
              {board.title}
            </p>

            {/* Ornament */}
            <div className="flex items-center" style={{ gap: cq(1.6), marginTop: cq(2.4) }} aria-hidden="true">
              <span style={{ width: cq(12), height: 1, background: GOLD }} />
              <span style={{ width: cq(1.4), height: cq(1.4), background: GOLD, transform: 'rotate(45deg)' }} />
              <span style={{ width: cq(12), height: 1, background: GOLD }} />
            </div>

            <p className="uppercase" style={{ fontSize: cq(2.3), letterSpacing: '0.24em', color: MUTED, marginTop: cq(2.4) }}>
              Awarded to
            </p>
            <p
              className="break-words"
              style={{ fontFamily: serif, fontWeight: 700, fontSize: cq(7.4), lineHeight: 1.12, color: INK, marginTop: cq(1.2) }}
            >
              {winner.name}
            </p>
            {winner.institution && (
              <p style={{ fontSize: cq(2.7), color: MUTED, marginTop: cq(1.2), letterSpacing: '0.03em' }}>{winner.institution}</p>
            )}
            {winner.entryTitle && (
              <p
                className="line-clamp-1"
                style={{ fontFamily: serif, fontStyle: 'italic', fontSize: cq(3), color: '#4A433C', marginTop: cq(2) }}
              >
                &ldquo;{winner.entryTitle}&rdquo;
              </p>
            )}

            {/* Prize */}
            {winner.prizeInr != null && (
              <div
                className="mt-auto w-full flex items-center"
                style={{ borderTop: `1px solid ${GOLD}88`, borderBottom: `1px solid ${GOLD}88`, padding: `${cq(2.6)} 0` }}
              >
                <div className="text-left" style={{ paddingRight: cq(4) }}>
                  <p className="uppercase" style={{ fontSize: cq(2.1), letterSpacing: '0.2em', color: MUTED }}>
                    Cash prize
                  </p>
                  <p style={{ fontFamily: serif, fontWeight: 800, fontSize: cq(8), color: BURGUNDY, lineHeight: 1.05 }}>
                    {formatInr(winner.prizeInr)}
                  </p>
                </div>
                {pool && poolTotal != null && (
                  <div className="flex-1 text-left" style={{ borderLeft: `1px solid ${GOLD}66`, paddingLeft: cq(4) }}>
                    <p className="uppercase" style={{ fontSize: cq(2.1), letterSpacing: '0.2em', color: MUTED }}>
                      Prize pool {formatInr(poolTotal)}
                    </p>
                    <div className="flex" style={{ gap: cq(3.2), marginTop: cq(1.2) }}>
                      {pool.map((amount, i) => {
                        const rank = (i + 1) as AwardRank;
                        const mine = rank === winner.rank;
                        return (
                          <div key={rank}>
                            <p style={{ fontSize: cq(2.2), color: mine ? BURGUNDY : MUTED, fontWeight: mine ? 700 : 500 }}>
                              {rank}
                              {ORDINAL_SUFFIX[rank]}
                            </p>
                            <p
                              className="tabular-nums"
                              style={{ fontSize: cq(2.9), color: mine ? BURGUNDY : '#4A433C', fontWeight: mine ? 800 : 600 }}
                            >
                              {formatInr(amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Host and partner logos */}
            <div
              className={clsx('w-full flex items-center justify-between', winner.prizeInr == null && 'mt-auto')}
              style={{ marginTop: winner.prizeInr != null ? cq(2) : undefined, gap: cq(3) }}
            >
              <div className="flex items-center" style={{ gap: cq(3) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/srm-ap-logo.png" alt="SRM University-AP" style={{ height: cq(6.4), width: 'auto' }} />
                <span aria-hidden="true" style={{ width: 1, height: cq(5), background: `${GOLD}99` }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/branding/IBM_Quantum_logotype_pos_RGB_tight.webp"
                  alt="IBM Quantum"
                  style={{ height: cq(2.7), width: 'auto' }}
                />
              </div>
              <div className="flex items-center" style={{ gap: cq(2.2) }}>
                <div className="text-right" style={{ lineHeight: 1.35 }}>
                  <p className="uppercase" style={{ fontSize: cq(1.9), letterSpacing: '0.16em', color: winner.released ? GOLD : '#B45309' }}>
                    {winner.released ? 'Scan to verify' : 'Preview · not announced'}
                  </p>
                  <p className="font-semibold" style={{ fontSize: cq(2.2), letterSpacing: '0.06em', color: BURGUNDY }}>
                    {winner.awardId}
                  </p>
                </div>
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt={`Verification code for ${winner.awardId}`} style={{ width: cq(9.5), height: cq(9.5) }} />
                ) : (
                  <span style={{ width: cq(9.5), height: cq(9.5) }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
