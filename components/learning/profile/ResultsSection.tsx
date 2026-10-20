'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CirclePlay,
  Copy,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  Medal,
  Share2,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import {
  AWARD_RANK_LABEL,
  awardUrl,
  formatInr,
  type AwardRank,
  type CompetitionType,
  type CompetitionWinner,
  type CompetitionWinnersBoard,
  type CompetitionWinnersResponse,
  type YourCompetitionEntry,
} from '@/lib/competition-results';
import { Card, EmptyState, StatusPill, buttonStyles, formatIst, type Tone } from './profile-ui';
import { AwardCard, MEDAL_METAL } from './AwardCard';
import { awardSerif } from './award-font';

export const COMPETITION_WINNERS_KEY = '/api/learning/competition-winners';

const fetcher = async (url: string): Promise<CompetitionWinnersResponse> => {
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || 'Could not load results.');
  return json;
};

export function useCompetitionWinners() {
  return useSWR<CompetitionWinnersResponse>(COMPETITION_WINNERS_KEY, fetcher, { revalidateOnFocus: false });
}

/** Boards that have at least one placement to show. */
export function boardsWithWinners(data: CompetitionWinnersResponse | undefined): CompetitionWinnersBoard[] {
  return (data?.boards || []).filter((b) => b.winners.length > 0);
}

interface Placement {
  board: CompetitionWinnersBoard;
  winner: CompetitionWinner;
}

function yourPlacements(boards: CompetitionWinnersBoard[]): Placement[] {
  return boards.flatMap((board) => board.winners.filter((w) => w.isYou).map((winner) => ({ board, winner })));
}

const ORDINAL: Record<AwardRank, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

/** Action label for a winning entry link: the verb says it opens, the noun says what it opens. */
const ENTRY_ACTION: Record<CompetitionType, { label: string; verb: string; noun: string; Icon: LucideIcon }> = {
  reels: { label: 'Watch Reel', verb: 'Watch', noun: 'reel', Icon: CirclePlay },
  poster: { label: 'View Poster', verb: 'View', noun: 'poster', Icon: ImageIcon },
  essay: { label: 'Read Essay', verb: 'Read', noun: 'essay', Icon: FileText },
};

/* ───────────────────────────── Share actions ───────────────────────────── */

function linkedInCaption({ board, winner }: Placement): string {
  const lines = [
    `I am glad to share that I won ${AWARD_RANK_LABEL[winner.rank]} in the ${board.title} at Qiskit Fall Fest 2026, hosted by SRM University-AP, Amaravati (Partner Plus Host).`,
  ];
  if (winner.entryTitle) lines.push(`My entry: "${winner.entryTitle}"`);
  if (winner.entryUrl) lines.push(winner.entryUrl);
  lines.push(
    '',
    `Verify this award (${winner.awardId}): ${awardUrl(board.type, winner.rank)}`,
    '',
    'Thank you to the organizers and the jury.',
    '',
    '#QiskitFallFest #Qiskit #QuantumComputing #IBMQuantum #SRMAP'
  );
  return lines.join('\n');
}

function CopyCaptionButton({ placement }: { placement: Placement }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={buttonStyles.secondary}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(linkedInCaption(placement));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable: nothing to do */
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Caption copied' : 'Copy LinkedIn caption'}
    </button>
  );
}

/** Exported image size: 1080 x 1350, LinkedIn's portrait format. */
const EXPORT_WIDTH = 1080;

function fileNameFor({ board, winner }: Placement): string {
  const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `QFF2026-${slug(board.title)}-${slug(AWARD_RANK_LABEL[winner.rank])}-${slug(winner.name)}.png`;
}

async function renderCardPng(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import('html-to-image');
  await document.fonts.ready;
  const options = { pixelRatio: EXPORT_WIDTH / node.offsetWidth, cacheBust: true, backgroundColor: '#FBF8F2' };
  // The first pass loads images and fonts into the clone; Safari often draws them only on the second
  await toBlob(node, options);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error('Could not create the image.');
  return blob;
}

function AwardImageActions({ placement, cardRef }: { placement: Placement; cardRef: React.RefObject<HTMLDivElement | null> }) {
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [error, setError] = useState('');
  const fileName = fileNameFor(placement);
  // Phones that can hand a file to the LinkedIn app; read after mount so server and client markup match
  const [canShareFiles, setCanShareFiles] = useState(false);
  useEffect(() => {
    try {
      setCanShareFiles(
        typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([''], 'award.png', { type: 'image/png' })] })
      );
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  async function run(kind: 'download' | 'share') {
    if (!cardRef.current) return;
    setBusy(kind);
    setError('');
    try {
      const blob = await renderCardPng(cardRef.current);
      if (kind === 'share') {
        await navigator.share({ files: [new File([blob], fileName, { type: 'image/png' })], title: 'Qiskit Fall Fest 2026 award' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (err: any) {
      // Closing the share sheet is not an error
      if (err?.name !== 'AbortError') setError('Could not create the image. Take a screenshot of the card instead.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={buttonStyles.primary} disabled={busy !== null} onClick={() => run('download')}>
          {busy === 'download' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Download image
        </button>
        {canShareFiles && (
          <button type="button" className={buttonStyles.secondary} disabled={busy !== null} onClick={() => run('share')}>
            {busy === 'share' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
            Share
          </button>
        )}
        <CopyCaptionButton placement={placement} />
      </div>
      {error && <p className="text-center text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

/* ───────────────────────────── Board ───────────────────────────── */

/** One competition's winners. Without onSelect (public pages) each row links to its verification page. */
export function WinnersBoard({
  board,
  selectedKey = null,
  canPreview = false,
  onSelect,
}: {
  board: CompetitionWinnersBoard;
  selectedKey?: string | null;
  canPreview?: boolean;
  onSelect?: (key: string) => void;
}) {
  const poolTotal = board.prizePool?.reduce((a, b) => a + b, 0) ?? null;
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] shadow-xs">
      <header
        className="relative flex items-center justify-between gap-3 px-4 sm:px-5 py-4"
        style={{ background: 'linear-gradient(180deg, #3A0B10 0%, #6C151E 100%)' }}
      >
        <div className="min-w-0">
          <h3 className={clsx(awardSerif.className, 'text-lg sm:text-xl font-bold text-[#F5EEE3] leading-tight')}>{board.title}</h3>
          {poolTotal != null && (
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D9C08E]">
              Prize pool {formatInr(poolTotal)}
            </p>
          )}
        </div>
        <Trophy className="h-6 w-6 shrink-0 text-[#D9C08E]" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #B08D57 0%, #D9C08E 50%, #B08D57 100%)' }}
        />
      </header>
      <ol className="divide-y divide-slate-100 dark:divide-[#250D11]">
        {board.winners.map((w) => {
          const key = `${board.type}-${w.rank}`;
          const showCardButton = !!onSelect && (w.isYou || canPreview);
          const [light, mid, dark] = MEDAL_METAL[w.rank];
          const entryAction = ENTRY_ACTION[board.type];
          return (
            <li
              key={key}
              className={clsx(
                'flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-3.5',
                w.isYou && 'bg-[#FBF5E1]/60 dark:bg-[#C9A227]/5'
              )}
            >
              <span
                className={clsx(awardSerif.className, 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold')}
                style={{
                  background: `linear-gradient(135deg, ${light} 0%, ${mid} 55%, ${dark} 100%)`,
                  color: '#2A1A0C',
                  boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.45)',
                }}
                aria-label={AWARD_RANK_LABEL[w.rank]}
              >
                {ORDINAL[w.rank]}
              </span>
              <div className="min-w-0 flex-1">
                <p className={clsx(awardSerif.className, 'text-base font-bold text-slate-900 dark:text-[#FAF6F3] leading-snug')}>
                  {w.name}
                  {w.isYou && <span className="ml-1.5 font-sans text-xs font-medium text-burgundy dark:text-[#E89BA5]">(you)</span>}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {[w.institution, w.entryTitle].filter(Boolean).join(' · ') || AWARD_RANK_LABEL[w.rank]}
                </p>
              </div>
              <div className="flex basis-full sm:basis-auto items-center gap-2 pl-[3.25rem] sm:pl-0">
                {!w.released && <StatusPill tone="warning">Not announced</StatusPill>}
                {w.prizeInr != null && (
                  <span className={clsx(awardSerif.className, 'text-base font-bold tabular-nums text-burgundy dark:text-[#E89BA5]')}>
                    {formatInr(w.prizeInr)}
                  </span>
                )}
                {w.entryUrl && (
                  <a
                    href={w.entryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(buttonStyles.secondary, 'whitespace-nowrap')}
                    aria-label={`${entryAction.verb} ${w.name}'s ${entryAction.noun} (opens in new tab)`}
                  >
                    <entryAction.Icon className="h-4 w-4" aria-hidden="true" />
                    {entryAction.label}
                    <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </a>
                )}
                {showCardButton && (
                  <button
                    type="button"
                    onClick={() => onSelect?.(key)}
                    className={clsx(buttonStyles.ghost, selectedKey === key && 'bg-burgundy/5 dark:bg-burgundy/15')}
                  >
                    Card
                  </button>
                )}
                {!onSelect && w.released && (
                  <Link
                    href={`/awards/${w.awardId}`}
                    className={buttonStyles.ghost}
                    aria-label={`Verify ${w.name}'s ${AWARD_RANK_LABEL[w.rank]} award`}
                  >
                    Verify
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ───────────────────────────── Your results ───────────────────────────── */

const ENTRY_STATUS: Record<YourCompetitionEntry['status'], { label: string; tone: Tone; message: string }> = {
  winner: { label: 'Winner', tone: 'success', message: 'Your entry is among the winners.' },
  finalist: { label: 'Finalist', tone: 'info', message: 'Your entry reached the finalist round.' },
  shortlisted: { label: 'Shortlisted', tone: 'info', message: 'Your entry was shortlisted by the jury.' },
  not_selected: {
    label: 'Not among the winners',
    tone: 'neutral',
    message: 'Your entry was not selected for an award this time. Thank you for taking part.',
  },
  pending: { label: 'Not announced', tone: 'warning', message: 'Results for this competition are not announced yet.' },
};

function YourResults({ entries, onShowCard }: { entries: YourCompetitionEntry[]; onShowCard: (key: string) => void }) {
  if (entries.length === 0) return null;
  return (
    <Card title="Your results" description="Every competition you entered and the jury's decision.">
      <ul className="divide-y divide-slate-100 dark:divide-[#250D11] -my-2">
        {entries.map((e) => {
          const meta = ENTRY_STATUS[e.status];
          return (
            <li key={e.type} className="py-3 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">{e.title}</p>
                <StatusPill tone={meta.tone}>
                  {e.rank ? `${AWARD_RANK_LABEL[e.rank]}` : meta.label}
                </StatusPill>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{meta.message}</p>
              {e.feedback && (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line border-l-2 border-slate-200 dark:border-[#3D1418] pl-3">
                  {e.feedback}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-1">
                {e.entryUrl && (
                  <a href={e.entryUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles.ghost}>
                    {e.entryTitle ? `Your entry: ${e.entryTitle}` : 'Your entry'}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {e.rank && (
                  <button type="button" className={buttonStyles.ghost} onClick={() => onShowCard(`${e.type}-${e.rank}`)}>
                    Award card
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ───────────────────────────── Section ───────────────────────────── */

export function ResultsSection({ isAdmin }: { isAdmin: boolean }) {
  const { data, error, isLoading } = useCompetitionWinners();
  const boards = useMemo(() => boardsWithWinners(data), [data]);
  const mine = useMemo(() => yourPlacements(boards), [boards]);
  const all = useMemo<Placement[]>(() => boards.flatMap((board) => board.winners.map((winner) => ({ board, winner }))), [boards]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const keyOf = (p: Placement) => `${p.board.type}-${p.winner.rank}`;
  // Your own card first; admins can preview anyone's
  const selected =
    all.find((p) => keyOf(p) === selectedKey && (p.winner.isYou || isAdmin)) || mine[0] || (isAdmin ? all[0] : undefined);

  if (isLoading) return <p className="py-10 text-center text-sm text-slate-500">Loading results</p>;
  if (error && !data) return <p className="py-10 text-center text-sm text-rose-600">{error.message}</p>;

  if (boards.length === 0) {
    return (
      <Card>
        <EmptyState icon={Trophy} title="Results are not announced yet">
          Winners of the Tech Reels, Digital Poster and Essay competitions will appear here once they are announced.
        </EmptyState>
      </Card>
    );
  }

  const releasedAt = boards
    .flatMap((b) => b.winners.map((w) => w.releasedAt))
    .filter((d): d is string => !!d)
    .sort()[0];

  return (
    <div className="space-y-5">
      {data?.preview && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Admin preview. Placements marked &ldquo;Not announced&rdquo; are hidden from participants until they are released
          from Competition Results.
        </div>
      )}

      {selected && (
        <Card
          id="award-card"
          title={selected.winner.isYou ? 'Your award' : `Award card preview: ${selected.winner.name}`}
          description={
            selected.winner.isYou
              ? 'Download the card as an image (1080 × 1350) and add it to your LinkedIn post.'
              : 'This is the card the winner sees on their profile.'
          }
        >
          <div className="space-y-4">
            <AwardCard ref={cardRef} board={selected.board} winner={selected.winner} />
            <AwardImageActions placement={selected} cardRef={cardRef} />
          </div>
        </Card>
      )}

      <YourResults
        entries={data?.yourEntries || []}
        onShowCard={(key) => {
          setSelectedKey(key);
          document.getElementById('award-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Competition winners</h2>
        {releasedAt && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Announced {formatIst(releasedAt, false)} ·{' '}
            <Link href="/results" className="font-semibold text-burgundy dark:text-[#E89BA5] hover:underline">
              Public results page
            </Link>
          </p>
        )}
      </div>
      {boards.map((board) => (
        <WinnersBoard
          key={board.type}
          board={board}
          selectedKey={selected ? keyOf(selected) : null}
          canPreview={isAdmin}
          onSelect={setSelectedKey}
        />
      ))}
    </div>
  );
}

/** Overview callout for a participant who placed. */
export function YourAwardCallout({ onOpen }: { onOpen: () => void }) {
  const { data } = useCompetitionWinners();
  const mine = yourPlacements(boardsWithWinners(data)).filter((p) => p.winner.released);
  if (mine.length === 0) return null;
  const first = mine[0];
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[#C9A227]/50 bg-[#FBF5E1]/70 dark:bg-[#C9A227]/10 px-4 py-3.5">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <Medal className="h-5 w-5 shrink-0 mt-0.5 text-[#8A6D0B] dark:text-[#E6C65C]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] leading-snug">
            You won {AWARD_RANK_LABEL[first.winner.rank]} in the {first.board.title}
            {mine.length > 1 && ` and ${mine.length - 1} more award${mine.length > 2 ? 's' : ''}`}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">Your award card is ready to share.</p>
        </div>
      </div>
      <button type="button" onClick={onOpen} className={clsx(buttonStyles.primary, 'sm:shrink-0')}>
        View award
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
