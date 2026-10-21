'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { mutate as mutateKey } from 'swr';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Hourglass,
  LayoutGrid,
  MessageSquare,
  Loader2,
  Pencil,
  RefreshCw,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import { usePassStatus, type PassStatusResponse } from '@/hooks/use-pass-status';
import { PROFILE_OVERVIEW_KEY, useProfileOverview, type ProfileOverview } from '@/hooks/use-profile-overview';
import { phase2Headline } from '@/components/learning/Phase2StatusCard';
import { markNoticesSeen, readSeenNoticeIds } from '@/lib/notices';
import { trackForLeadEmail } from '@/lib/participant-track';
import { deriveActionItems, type ActionItem, type ProfileTab } from './action-items';
import {
  AccountSection,
  ActivitySection,
  HackathonSection,
  NoticeItem,
  NoticesSection,
  PaymentsSection,
} from './ProfileSections';
import { AccommodationCard, useAccommodation } from './AccommodationCard';
import { TransportCard, useTransport } from './TransportCard';
import { ContactConfirmCard } from './ContactConfirmCard';
import { AppNotificationsCard } from './AppNotificationsCard';
import { ArrivalChecklist, INSTITUTION_BANNER_ID } from './ArrivalChecklist';
import { useCertificateName } from './CertificateNameCard';
import {
  COMPETITION_WINNERS_KEY,
  ResultsSection,
  YourAwardCallout,
  boardsWithWinners,
  useCompetitionWinners,
} from './ResultsSection';
import {
  RequestsSection,
  decisionKey,
  isDecided,
  markDecisionsSeen,
  readSeenDecisions,
  useParticipantRequests,
} from './RequestsSection';
import { Card, StatusPill, buttonStyles, formatIst, initials, timeLeft, useResultsOut, type Tone } from './profile-ui';

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'notices', label: 'Notices', icon: Bell },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'hackathon', label: 'Hackathon', icon: Users },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'requests', label: 'Requests', icon: MessageSquare },
  { id: 'activity', label: 'Activity', icon: BookOpen },
  { id: 'account', label: 'Account', icon: UserRound },
];

function isTab(value: string | null): value is ProfileTab {
  return TABS.some((t) => t.id === value);
}

/* ───────────────────────────── Header ───────────────────────────── */

function ProfileHeader({ overview, status }: { overview: ProfileOverview; status?: PassStatusResponse }) {
  const p = overview.profile;
  const team = overview.team;
  const hackathon = status?.hackathon;
  const resultsOut = useResultsOut();

  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div
        aria-hidden="true"
        className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-burgundy text-white text-base sm:text-lg font-semibold"
      >
        {initials(p.fullName)}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] leading-tight break-words">
          {p.fullName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 break-all">
          {p.email}
          {p.institution && <span className="hidden sm:inline"> · {p.institution}</span>}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {team ? (
            <StatusPill tone="info">
              <Users className="h-3 w-3" />
              {team.isLead ? 'Team lead' : 'Member'} · {team.name}
            </StatusPill>
          ) : (
            <StatusPill tone="neutral">Participant</StatusPill>
          )}
          {hackathon?.phase2 && resultsOut && (
            <StatusPill tone={phase2Tone(hackathon.phase2.stage)}>{phase2Headline(hackathon)}</StatusPill>
          )}
          {p.isAdmin && <StatusPill tone="neutral">Admin</StatusPill>}
        </div>
      </div>
    </div>
  );
}

function phase2Tone(stage: string): Tone {
  if (stage === 'confirmed') return 'success';
  if (stage === 'invited' || stage === 'accepted') return 'warning';
  if (stage === 'waitlisted' || stage === 'under_review') return 'neutral';
  return 'neutral';
}

/* ───────────────────────────── Overview ───────────────────────────── */

function ActionList({ items, onTab }: { items: ActionItem[]; onTab: (t: ProfileTab) => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3.5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm text-emerald-900 dark:text-emerald-200">Nothing needs your attention right now.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="attention-heading" className="space-y-2">
      <h2 id="attention-heading" className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
        Needs your attention
      </h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const urgent = item.dueIso && Date.parse(item.dueIso) - now < 6 * 3_600_000;
          const cta = item.cta;
          const ctaClass = item.kind === 'action' ? buttonStyles.primary : buttonStyles.secondary;
          return (
            <li
              key={item.id}
              className={clsx(
                'flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border px-4 py-3.5',
                item.kind === 'action'
                  ? urgent
                    ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/70 dark:bg-rose-950/20'
                    : 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/15'
                  : 'border-slate-200 bg-white dark:border-[#3D1418] dark:bg-[#150709]'
              )}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {item.kind === 'action' ? (
                  <AlertCircle className={clsx('h-5 w-5 shrink-0 mt-0.5', urgent ? 'text-rose-600' : 'text-amber-600')} />
                ) : (
                  <Hourglass className="h-5 w-5 shrink-0 mt-0.5 text-slate-400" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] leading-snug">{item.title}</p>
                  {item.detail && <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">{item.detail}</p>}
                  {item.dueIso && (
                    <p
                      className={clsx(
                        'mt-1 inline-flex items-center gap-1 text-xs font-semibold',
                        urgent ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300'
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Due {formatIst(item.dueIso)} IST ({timeLeft(item.dueIso, now)})
                    </p>
                  )}
                </div>
              </div>
              {cta &&
                (cta.href ? (
                  <Link href={cta.href} className={clsx(ctaClass, 'sm:shrink-0')}>
                    {cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => (cta.tab ? onTab(cta.tab) : cta.event && window.dispatchEvent(new Event(cta.event)))}
                    className={clsx(ctaClass, 'sm:shrink-0')}
                  >
                    {cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ))}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'neutral',
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 hover:border-burgundy/40 dark:hover:border-burgundy/60 hover:shadow-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-burgundy dark:group-hover:text-[#E89BA5] transition-colors" />
      </div>
      <p
        className={clsx(
          'mt-2 text-sm font-semibold leading-snug',
          tone === 'success'
            ? 'text-emerald-700 dark:text-emerald-300'
            : tone === 'warning'
              ? 'text-amber-700 dark:text-amber-300'
              : tone === 'danger'
                ? 'text-rose-700 dark:text-rose-300'
                : 'text-slate-900 dark:text-[#FAF6F3]'
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{sub}</p>}
    </button>
  );
}

function InstitutionConfirmBanner({
  email,
  institution,
  confirmedAt,
  confirmedValue,
  onEdit,
}: {
  email: string;
  institution: string | null;
  confirmedAt: string | null;
  confirmedValue: string | null;
  onEdit: () => void;
}) {
  const current = (institution || '').trim();
  const answeredOnServer = Boolean(confirmedAt) && (confirmedValue || '').trim().toLowerCase() === current.toLowerCase();
  const [confirmed, setConfirmed] = useState(answeredOnServer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const saveConfirmation = useCallback(async () => {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmInstitution: true }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.error || 'Could not save your confirmation.');
    mutateKey(PROFILE_OVERVIEW_KEY);
  }, []);

  useEffect(() => {
    if (answeredOnServer) {
      setConfirmed(true);
      return;
    }
    setConfirmed(false);
    // Clicks made before confirmations were stored on the server live only in localStorage: send them once
    const legacyKey = 'qff_inst_confirmed_' + email.toLowerCase();
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(legacyKey);
    } catch {}
    if (current && stored && stored.toLowerCase() === current.toLowerCase()) {
      setConfirmed(true);
      saveConfirmation()
        .then(() => {
          try {
            localStorage.removeItem(legacyKey);
          } catch {}
        })
        .catch(() => setConfirmed(false));
    }
  }, [answeredOnServer, current, email, saveConfirmation]);

  if (confirmed) return null;

  const handleConfirm = async () => {
    setBusy(true);
    setError('');
    try {
      await saveConfirmation();
      setConfirmed(true);
    } catch (err: any) {
      setError(err?.message || 'Could not save your confirmation.');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = () => {
    onEdit();
    window.dispatchEvent(new CustomEvent('qff_edit_institution'));
  };

  return (
    <div
      id={INSTITUTION_BANNER_ID}
      className="rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-burgundy/5 dark:bg-burgundy/15 text-burgundy dark:text-[#E89BA5] shrink-0 mt-0.5">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                Confirm your institution details
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-[#200B0E] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#3D1418]">
                {institution || 'Not provided'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              This name will be printed on your event check-in pass badge, team roster, and verified certificates.
            </p>
            {error && <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="disabled:opacity-60 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Looks correct
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className={clsx(buttonStyles.primary, '!py-1.5 !px-3')}
          >
            <Pencil className="h-3.5 w-3.5" />
            Change
          </button>
        </div>
      </div>
    </div>
  );
}

function OverviewSection({
  overview,
  status,
  actions,
  seen,
  onTab,
}: {
  overview: ProfileOverview;
  status?: PassStatusResponse;
  actions: ActionItem[];
  seen: Set<string>;
  onTab: (t: ProfileTab) => void;
}) {
  const { data: certName } = useCertificateName();
  const { data: transport } = useTransport();
  const { data: accommodation } = useAccommodation();
  const hackathon = status?.hackathon;
  const resultsOut = useResultsOut();
  const sessions = overview.activity.sessions;
  const done = sessions.filter((s) => s.videoCompleted && s.quizPassed).length;
  const pass = status?.pass;

  const hackValue = !overview.team
    ? 'Not on a team'
    : hackathon?.phase2 && resultsOut
      ? phase2Headline(hackathon)
      : overview.team.repoUrl
        ? 'Phase 1 submitted'
        : 'Team formed';
  const hackTone: Tone = hackathon?.phase2 ? phase2Tone(hackathon.phase2.stage) : 'neutral';

  const pay = hackathon?.phase2?.payment;
  const payValue = pay
    ? `Team: ${pay.members.filter((m) => m.paid).length} of ${pay.members.length} paid`
    : pass
      ? pass.status === 'verified'
        ? 'Pass verified'
        : pass.status === 'rejected'
          ? 'Pass payment not accepted'
          : 'Pass under review'
      : 'No payments';
  const payTone: Tone = pay
    ? pay.members.every((m) => m.paid)
      ? 'success'
      : 'warning'
    : pass?.status === 'verified'
      ? 'success'
      : pass?.status === 'rejected'
        ? 'danger'
        : pass
          ? 'warning'
          : 'neutral';

  const latest = overview.notices.slice(0, 2);

  return (
    <div className="space-y-6">
      <YourAwardCallout onOpen={() => onTab('results')} />
      <ArrivalChecklist
        overview={overview}
        certName={certName}
        transport={transport}
        accommodation={accommodation}
        onTab={onTab}
      />
      <InstitutionConfirmBanner
        email={overview.profile.email}
        institution={overview.profile.institution}
        confirmedAt={overview.profile.institutionConfirmedAt ?? null}
        confirmedValue={overview.profile.institutionConfirmedValue ?? null}
        onEdit={() => onTab('account')}
      />
      <ContactConfirmCard contact={overview.profile.contact} />
      <AppNotificationsCard />
      <ActionList items={actions} onTab={onTab} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryTile
          icon={Users}
          label="Hackathon"
          value={hackValue}
          sub={overview.team ? `${overview.team.name} · ${overview.team.members.filter((m) => m.status === 'accepted').length} members` : undefined}
          tone={hackTone}
          onClick={() => onTab('hackathon')}
        />
        <SummaryTile icon={Wallet} label="Payments" value={payValue} tone={payTone} onClick={() => onTab('payments')} />
        <SummaryTile
          icon={BookOpen}
          label="Masterclasses"
          value={`${done} of ${sessions.length} complete`}
          sub={overview.certificate.alreadyIssued ? 'Certificate issued' : overview.certificate.eligible ? 'Certificate unlocked' : undefined}
          tone={done === sessions.length ? 'success' : 'neutral'}
          onClick={() => onTab('activity')}
        />
        <SummaryTile
          icon={Bell}
          label="Notices"
          value={
            overview.notices.length === 0
              ? 'No notices'
              : `${overview.notices.filter((n) => !seen.has(n.id)).length} unread of ${overview.notices.length}`
          }
          onClick={() => onTab('notices')}
        />
      </div>

      <TransportCard mayBeShortlisted={Boolean(hackathon?.phase2)} />

      <AccommodationCard
        mayBeExternal={
          hackathon?.phase2?.track === 'external' ||
          trackForLeadEmail(overview.profile.email, overview.profile.institution || status?.user?.institution) === 'external'
        }
      />

      {latest.length > 0 && (
        <Card
          title="Latest notices"
          action={
            <button type="button" onClick={() => onTab('notices')} className={buttonStyles.ghost}>
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          <div className="space-y-3">
            {latest.map((n) => (
              <NoticeItem key={n.id} notice={n} unread={!seen.has(n.id)} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ───────────────────────────── Shell ───────────────────────────── */

export function ProfileView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') ?? null;
  const tab: ProfileTab = isTab(tabParam) ? tabParam : 'overview';

  const { data: overview, error, isLoading, mutate } = useProfileOverview();
  const { data: status, mutate: mutateStatus } = usePassStatus();
  const { data: requestsData } = useParticipantRequests();
  const { data: winners } = useCompetitionWinners();
  // Entrants also keep the tab before the announcement, so they see when results come out
  const hasResults = boardsWithWinners(winners).length > 0 || (winners?.yourEntries?.length ?? 0) > 0;
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [seenDecisions, setSeenDecisions] = useState<Set<string>>(new Set());
  const newForm = searchParams?.get('new');

  useEffect(() => {
    setSeen(readSeenNoticeIds());
    setSeenDecisions(readSeenDecisions());
  }, []);

  // Decisions count as read once the Requests tab has been opened
  useEffect(() => {
    if (tab === 'requests' && requestsData?.requests.length) {
      markDecisionsSeen(requestsData.requests.filter(isDecided).map(decisionKey));
    }
  }, [tab, requestsData?.requests]);

  // Opening the Notices tab marks everything there as read (the badge and dots clear on next visit)
  useEffect(() => {
    if (tab === 'notices' && overview?.notices.length) {
      markNoticesSeen(overview.notices.map((n) => n.id));
    }
  }, [tab, overview?.notices]);

  const setTab = useCallback(
    (next: ProfileTab) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (next === 'overview') params.delete('tab');
      else params.set('tab', next);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      document.getElementById('profile-tabs')?.scrollIntoView({ block: 'nearest' });
    },
    [pathname, router, searchParams]
  );

  const unseenDecisions = useMemo(
    () =>
      (requestsData?.requests || []).filter(
        (r) => isDecided(r) && r.requester_email === overview?.profile.email && !seenDecisions.has(decisionKey(r))
      ),
    [requestsData, seenDecisions, overview?.profile.email]
  );

  const actions = useMemo<ActionItem[]>(
    () => [
      ...deriveActionItems(overview, status),
      ...unseenDecisions.map((r) => ({
        id: `decision-${r.id}`,
        kind: 'action' as const,
        title:
          r.kind === 'question'
            ? 'The organizers replied to your question'
            : r.status === 'approved'
              ? 'Your team change request was approved'
              : 'Your team change request was not approved',
        detail: r.admin_response ? r.admin_response.slice(0, 140) : undefined,
        cta: { label: 'View reply', tab: 'requests' as const },
      })),
    ],
    [overview, status, unseenDecisions]
  );
  const unread = overview?.notices.filter((n) => !seen.has(n.id)).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your profile
      </div>
    );
  }

  // A failed background refresh keeps the last good data on screen
  if (!overview) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-3">
        <AlertCircle className="h-8 w-8 mx-auto text-rose-500" />
        <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Could not load your profile</p>
        <p className="text-xs text-slate-500">{error?.message}</p>
        <button type="button" onClick={() => mutate()} className={buttonStyles.secondary}>
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }

  const badges: Partial<Record<ProfileTab, number>> = {
    overview: actions.filter((a) => a.kind === 'action').length,
    notices: unread,
    requests: unseenDecisions.length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <ProfileHeader overview={overview} status={status} />

      <nav
        id="profile-tabs"
        aria-label="Profile sections"
        className="md:sticky md:top-[82px] xl:top-[88px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-[#FAF7F4]/95 dark:bg-[#100405]/95 backdrop-blur border-b border-slate-200 dark:border-[#3D1418]"
      >
        <div role="tablist" className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
          {TABS.filter((t) => t.id !== 'results' || hasResults || tab === 'results').map((t) => {
            const active = t.id === tab;
            const count = badges[t.id] || 0;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`profile-panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap px-3 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-burgundy/5',
                  active
                    ? 'border-burgundy text-burgundy dark:border-[#E89BA5] dark:text-[#E89BA5]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#FAF6F3]'
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {count > 0 && (
                  <span
                    className="ml-0.5 min-w-[1.25rem] rounded-full bg-burgundy dark:bg-[#E89BA5] px-1.5 text-[11px] leading-5 text-white dark:text-[#150709] text-center"
                    aria-label={`${count} ${t.id === 'notices' ? 'unread' : 'to do'}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div role="tabpanel" id={`profile-panel-${tab}`} aria-label={TABS.find((t) => t.id === tab)?.label}>
        {tab === 'overview' && (
          <OverviewSection overview={overview} status={status} actions={actions} seen={seen} onTab={setTab} />
        )}
        {tab === 'notices' && <NoticesSection notices={overview.notices} seen={seen} />}
        {tab === 'results' && <ResultsSection isAdmin={overview.profile.isAdmin} />}
        {tab === 'hackathon' && <HackathonSection overview={overview} status={status} onRosterChanged={() => mutate()} />}
        {tab === 'payments' && <PaymentsSection overview={overview} status={status} />}
        {tab === 'requests' && (
          <RequestsSection
            overview={overview}
            initialForm={newForm === 'question' || newForm === 'roster' ? newForm : null}
            onRosterChanged={() => mutate()}
          />
        )}
        {tab === 'activity' && <ActivitySection overview={overview} />}
        {tab === 'account' && (
          <AccountSection
            overview={overview}
            onNameSaved={(name) => {
              mutate({ ...overview, profile: { ...overview.profile, fullName: name } }, { revalidate: true });
              mutateStatus();
              // Award cards and the winners board print the profile name
              mutateKey(COMPETITION_WINNERS_KEY);
            }}
            onProfileUpdated={(updated) => {
              mutate({ ...overview, profile: { ...overview.profile, ...updated } }, { revalidate: true });
              mutateStatus();
              mutateKey(COMPETITION_WINNERS_KEY);
            }}
          />
        )}
      </div>
    </div>
  );
}
