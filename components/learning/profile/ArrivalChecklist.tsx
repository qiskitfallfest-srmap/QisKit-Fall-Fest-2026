'use client';

import React from 'react';
import clsx from 'clsx';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type { ProfileOverview } from '@/hooks/use-profile-overview';
import { missingTravelDetails, type AccommodationStatus } from '@/lib/accommodation';
import type { TransportStatus } from '@/lib/transport';
import { normalizeCertificateName } from '@/lib/certificate-name-shared';
import { OPEN_CONTACT_EVENT } from '@/lib/phone';
import { contactNeedsAnswer } from './ContactConfirmCard';
import { OPEN_ACCOMMODATION_EVENT } from './AccommodationCard';
import { OPEN_TRANSPORT_EVENT } from './TransportCard';
import type { CertificateNameStatus } from './CertificateNameCard';
import type { ProfileTab } from './action-items';
import { Card, StatusPill } from './profile-ui';

export const INSTITUTION_BANNER_ID = 'institution-confirm';
export const CERTIFICATE_NAME_CARD_ID = 'certificate-name';

interface Item {
  id: string;
  title: string;
  detail: string;
  done: boolean;
  linkLabel: string;
  onLink: () => void;
}

const sameName = (a: string | null | undefined, b: string | null | undefined) =>
  normalizeCertificateName(a || '').toLowerCase() === normalizeCertificateName(b || '').toLowerCase();

function openersFor<R>(people: { isYou: boolean; name: string; request: R | null }[], incomplete: (r: R) => boolean = () => false) {
  const open = people.filter((p) => !p.request || incomplete(p.request));
  const others = open.filter((p) => !p.isYou).map((p) => p.name);
  return { open: open.length, others };
}

/** Scroll to an element once the tab it lives on has rendered */
function scrollToLater(id: string) {
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
}

/**
 * The steps every participant finishes before 26 October. Each line ticks itself from
 * saved data (nothing is ticked by hand) and links to the place where it is done.
 */
export function ArrivalChecklist({
  overview,
  certName,
  transport,
  accommodation,
  onTab,
}: {
  overview: ProfileOverview;
  certName: CertificateNameStatus | undefined;
  transport: TransportStatus | undefined;
  accommodation: AccommodationStatus | undefined;
  onTab: (t: ProfileTab) => void;
}) {
  const p = overview.profile;
  const items: Item[] = [];

  if (certName) {
    const confirmed = Boolean(certName.confirmedAt || certName.locked);
    const matches = sameName(certName.name, p.fullName);
    items.push({
      id: 'name',
      title: 'Confirm your name',
      detail: !confirmed
        ? 'Check the spelling exactly as it should print on your certificate.'
        : matches
          ? `Confirmed as ${certName.name}.`
          : `Certificate name "${certName.name}" does not match your profile name "${p.fullName}". Make them the same.`,
      done: confirmed && matches,
      linkLabel: 'Check name',
      onLink: () => {
        onTab('account');
        scrollToLater(CERTIFICATE_NAME_CARD_ID);
      },
    });
  }

  const institution = (p.institution || '').trim();
  const institutionDone =
    Boolean(p.institutionConfirmedAt) && (p.institutionConfirmedValue || '').trim().toLowerCase() === institution.toLowerCase();
  items.push({
    id: 'university',
    title: 'Confirm your university',
    detail: institutionDone ? `Confirmed as ${institution}.` : `Shown as ${institution || 'not provided'}. Confirm it or correct it.`,
    done: institutionDone,
    linkLabel: 'Check',
    onLink: () => {
      if (document.getElementById(INSTITUTION_BANNER_ID)) {
        scrollToLater(INSTITUTION_BANNER_ID);
      } else {
        onTab('account');
        setTimeout(() => window.dispatchEvent(new CustomEvent('qff_edit_institution')), 120);
      }
    },
  });

  if (p.contact?.tracked) {
    const done = !contactNeedsAnswer(p.contact);
    items.push({
      id: 'contact',
      title: 'Confirm mobile number and emergency contact',
      detail: done
        ? `${p.contact.phone} · Emergency: ${p.contact.emergencyName}`
        : 'Needed before you can answer bus travel or accommodation.',
      done,
      linkLabel: done ? 'Change' : 'Confirm now',
      onLink: () => {
        if (done) {
          onTab('account');
          scrollToLater('contact');
        } else {
          window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT));
        }
      },
    });
  }

  if (transport?.eligible) {
    const { open, others } = openersFor(transport.people);
    items.push({
      id: 'bus',
      title: 'Answer SRM bus travel',
      detail:
        open === 0
          ? 'Answered. Pickup times and stops will be shared before Day 1.'
          : others.length
            ? `Still to answer: ${others.join(', ')}${open > others.length ? ' and you' : ''}.`
            : 'Tell us if you need the bus, where you will board and on which days.',
      done: open === 0,
      linkLabel: open === 0 ? 'View' : 'Answer',
      onLink: () => window.dispatchEvent(new Event(OPEN_TRANSPORT_EVENT)),
    });
  }

  if (accommodation?.eligible) {
    const { open, others } = openersFor(accommodation.people, missingTravelDetails);
    const youMissingDetails = accommodation.people.some((p) => p.isYou && missingTravelDetails(p.request));
    items.push({
      id: 'stay',
      title: 'Answer accommodation (Non-SRMAP Student)',
      detail:
        open === 0
          ? 'Answered. The organizing team confirms each booking.'
          : others.length
            ? `Still to answer or add travel details: ${others.join(', ')}${open > others.length ? ' and you' : ''}.`
            : youMissingDetails
              ? 'Add where you are travelling from, how and where you will arrive, and your arrival time.'
              : 'Rooms are only for students who are not from SRM University-AP. Tell us if you need one, your dates and how you will travel.',
      done: open === 0,
      linkLabel: open === 0 ? 'View' : youMissingDetails ? 'Add details' : 'Answer',
      onLink: () => window.dispatchEvent(new Event(OPEN_ACCOMMODATION_EVENT)),
    });
  }

  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  if (allDone) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
        <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
        Before-you-arrive checklist complete. See you on campus, 26–30 October.
      </div>
    );
  }

  return (
    <Card
      id="arrival-checklist"
      title="Before you arrive: 26–30 October"
      description="Finish each step so we can plan your name badge, buses, rooms and emergency contact. Steps tick themselves once saved."
      action={
        <StatusPill tone="warning">
          {doneCount} of {items.length} done
        </StatusPill>
      }
    >
      <div
        role="progressbar"
        aria-label="Checklist progress"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={doneCount}
        className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#250D11]"
      >
        <div className="h-full bg-emerald-600" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>
      <ol className="divide-y divide-slate-100 dark:divide-[#250D11] -my-1">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
            <div className="flex items-start gap-2.5 min-w-0">
              {item.done ? (
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
              <div className="min-w-0">
                <p
                  className={clsx(
                    'text-sm font-medium',
                    item.done ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-[#FAF6F3]'
                  )}
                >
                  <span className="sr-only">{item.done ? 'Done: ' : 'To do: '}</span>
                  {i + 1}. {item.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 break-words">{item.detail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={item.onLink}
              className={clsx(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
                item.done
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#250D11]'
                  : 'bg-burgundy text-white hover:bg-burgundy/90'
              )}
            >
              {item.linkLabel}
              {!item.done && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />}
            </button>
          </li>
        ))}
      </ol>
    </Card>
  );
}
