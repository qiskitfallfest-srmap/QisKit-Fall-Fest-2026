'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Loader2,
  ArrowRight,
  BedDouble,
  Phone,
  MapPin,
  Bus,
  MessageSquare,
  AlertTriangle,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { ACCOMMODATION_HELPLINES, ARRIVAL_MODE_LABEL, GENDER_LABEL, formatStayDate, stayNights, type ArrivalMode, type Gender } from '@/lib/accommodation';

const [{ display: HELPLINE_DISPLAY, tel: HELPLINE_TEL }] = ACCOMMODATION_HELPLINES;

type StayState = 'stay' | 'declined' | 'cancelled' | 'not_answered' | 'not_applicable';

interface AccommodationInfo {
  state: StayState;
  allocated: boolean;
  gender: string | null;
  checkIn: string | null;
  checkOut: string | null;
  travellingFrom?: string | null;
  arrivalMode?: string | null;
  arrivalPoint?: string | null;
  arrivalTime: string | null;
  allocationNotes: string | null;
  hasNote: boolean;
  notes?: string | null;
}

interface PassData {
  id: string;
  userName: string;
  userEmail?: string;
  passTier: string;
  institution: string;
  transactionReference?: string;
  status: string;
  amountInr: number;
  receiptUrl?: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy?: string | null;
  phone?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  accommodation?: AccommodationInfo;
  hackathon?: { teamName: string; role: string } | null;
  transport?: { boardingPoint: string } | null;
}

const STATUS_STYLES: Record<string, { label: string; border: string; band: string; chip: string }> = {
  verified: {
    label: 'Valid Pass · Payment Confirmed',
    border: 'border-emerald-500/70 dark:border-emerald-600/70',
    band: 'bg-emerald-600',
    chip: 'bg-emerald-700/60',
  },
  claimed_provisional: {
    label: 'Payment Pending Verification',
    border: 'border-amber-400 dark:border-amber-600/70',
    band: 'bg-amber-500',
    chip: 'bg-amber-600/60',
  },
  rejected: {
    label: 'Pass Rejected · Do Not Admit',
    border: 'border-rose-500/70 dark:border-rose-600/70',
    band: 'bg-rose-600',
    chip: 'bg-rose-700/60',
  },
};

function istTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function passLabel(p: PassData) {
  if (p.institution?.toLowerCase().includes('faculty')) return 'Faculty Pass · Official (QIS)';
  if (Number(p.amountInr) === 0) return 'General Pass · Free (SRM-AP)';
  return p.passTier === 'flagship_offline' ? `Flagship Pass · ₹${p.amountInr}` : `General Pass · ₹${p.amountInr}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{label}</span>
      <div className="text-slate-800 dark:text-slate-200 mt-0.5">{children}</div>
    </div>
  );
}

function ContactButtons({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, '');
  return (
    <div className="flex items-center gap-2">
      <a
        href={`tel:${phone.replace(/\s+/g, '')}`}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-700 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold"
      >
        <Phone className="w-3 h-3" />
        Call
      </a>
      {digits.length >= 10 && (
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-xs font-semibold"
        >
          <MessageSquare className="w-3 h-3" />
          WhatsApp
        </a>
      )}
    </div>
  );
}

/** The question the Gate 3 crew asks first: does this person need a room tonight? */
function StayPanel({ acc }: { acc: AccommodationInfo }) {
  if (acc.state === 'stay') {
    const nights = acc.checkIn && acc.checkOut ? stayNights(acc.checkIn, acc.checkOut).length : 0;
    const gender = acc.gender ? GENDER_LABEL[acc.gender as Gender] || acc.gender : null;
    return (
      <div className="rounded-xl border-2 border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/30 p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <BedDouble className="w-6 h-6 text-sky-700 dark:text-sky-300 shrink-0" />
          <div>
            <p className="text-base font-bold text-sky-950 dark:text-sky-100">
              {acc.allocated ? 'Room allocated · on-campus stay' : 'Needs a room · on-campus stay'}
            </p>
            <p className="text-xs text-sky-900 dark:text-sky-200 mt-0.5">
              Take them to on-spot room allocation. Check-in active from Monday morning; stay is chargeable.
            </p>
          </div>
        </div>

        {acc.allocationNotes && (
          <div className="p-2.5 rounded-lg bg-white dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sm">
            <span className="font-mono text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase block">Room</span>
            <p className="font-semibold text-slate-900 dark:text-white">{acc.allocationNotes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs">
          {gender && <Field label="Room for">{gender}</Field>}
          {acc.checkIn && acc.checkOut && (
            <Field label="Stay">
              {formatStayDate(acc.checkIn)} to {formatStayDate(acc.checkOut)}
              {nights > 0 && ` (${nights} night${nights === 1 ? '' : 's'})`}
            </Field>
          )}
          {acc.travellingFrom && (
            <Field label="Coming from">
              {acc.travellingFrom}
              {acc.arrivalMode && ` by ${(ARRIVAL_MODE_LABEL[acc.arrivalMode as ArrivalMode] || acc.arrivalMode).toLowerCase()}`}
            </Field>
          )}
          {(acc.arrivalPoint || acc.arrivalTime) && (
            <Field label="Expected arrival">
              {acc.arrivalPoint}
              {acc.arrivalTime && ` around ${acc.arrivalTime.slice(0, 5)}`}
            </Field>
          )}
        </div>

        {!acc.notes && acc.hasNote && (
          <p className="text-xs text-amber-900 dark:text-amber-200">
            The attendee left a note for the room team. Call the coordinator before allotting.
          </p>
        )}

        {acc.notes && (
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-100">
            <span className="font-mono text-[10px] font-bold uppercase block">Attendee note (accessibility / roommate)</span>
            <p className="mt-0.5">{acc.notes}</p>
          </div>
        )}
      </div>
    );
  }

  if (acc.state === 'not_answered') {
    return (
      <div className="rounded-xl border-2 border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-2.5">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="text-sm text-amber-950 dark:text-amber-100">
          <p className="font-bold">Stay not answered</p>
          <p className="text-xs mt-0.5">
            Ask the attendee if they need a room. If yes, call the coordinator at{' '}
            <a href={`tel:${HELPLINE_TEL}`} className="font-bold underline">
              {HELPLINE_DISPLAY}
            </a>{' '}
            before sending them to allocation.
          </p>
        </div>
      </div>
    );
  }

  const text: Record<Exclude<StayState, 'stay' | 'not_answered'>, { title: string; detail: string }> = {
    declined: { title: 'No room needed', detail: 'Attendee said they have their own arrangement.' },
    cancelled: {
      title: 'Stay request cancelled',
      detail: `If they now need a room, call the coordinator at ${HELPLINE_DISPLAY}.`,
    },
    not_applicable: { title: 'SRM AP student · no stay', detail: 'Campus accommodation is for external participants.' },
  };
  const t = text[acc.state];
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] p-4 flex items-start gap-2.5">
      <Home className="w-5 h-5 text-slate-500 shrink-0" />
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.title}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.detail}</p>
      </div>
    </div>
  );
}

function VerifyPassContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [loading, setLoading] = useState(Boolean(token || initialQuery));
  const [passData, setPassData] = useState<PassData | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');

  useEffect(() => {
    if (token || initialQuery) lookup(token ? { token } : { q: initialQuery });
  }, [token, initialQuery]);

  async function lookup(params: { token?: string; q?: string }) {
    setLoading(true);
    setErrorMessage('');
    setCheckInError('');
    try {
      const qs = params.token ? `token=${encodeURIComponent(params.token)}` : `q=${encodeURIComponent(params.q || '')}`;
      const res = await fetch(`/api/pass/verify?${qs}`, { cache: 'no-store' });
      const data = await res.json();
      setIsStaff(Boolean(data.isStaff));
      if (res.ok && data.pass) {
        setPassData(data.pass);
        return;
      }
      setPassData(null);
      setErrorMessage(data.error || 'Invalid or unregistered festival pass.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error. Check the connection and scan again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!passData) return;
    setCheckingIn(true);
    setCheckInError('');
    try {
      const res = await fetch('/api/pass/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId: passData.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassData((prev) =>
          prev
            ? {
                ...prev,
                checkedIn: true,
                checkedInAt: data.pass?.checkedInAt || new Date().toISOString(),
                checkedInBy: data.pass?.checkedInBy || null,
              }
            : null
        );
      } else {
        setCheckInError(data.error || 'Check-in failed. Try again.');
      }
    } catch (err: any) {
      setCheckInError(err?.message || 'Network error. Try again.');
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E0406] text-slate-900 dark:text-[#FAF6F3] font-sans py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-burgundy dark:text-[#E89BA5] font-bold">
            SRM University-AP · Qiskit Fall Fest 2026
          </p>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Gate 3 Pass Check</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Entry, stay and room allocation · 26–30 Oct 2026</p>
        </div>

        {isStaff && (
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            Organizer account: contact details and check-in shown
          </div>
        )}

        {isStaff && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) lookup({ q: searchInput.trim() });
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="QR not scanning? Search email or Txn ID"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#1C0A0D] focus:outline-none focus:ring-2 focus:ring-burgundy/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-4 py-2 bg-burgundy hover:bg-burgundy-deep text-white text-sm font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Find
            </button>
          </form>
        )}

        {loading && (
          <div className="p-10 text-center bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-3">
            <Loader2 className="w-8 h-8 text-burgundy dark:text-[#E89BA5] animate-spin mx-auto" />
            <p className="font-mono text-xs text-slate-500">Checking pass...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-center space-y-2">
            <XCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto" />
            <h2 className="font-serif text-lg font-bold text-rose-950 dark:text-rose-100">Pass not found</h2>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed max-w-md mx-auto">{errorMessage}</p>
          </div>
        )}

        {!loading && !passData && !errorMessage && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-6">
            Scan an attendee&apos;s pass QR with the phone camera to open it here.
          </p>
        )}

        {!loading && passData && (() => {
          const style = STATUS_STYLES[passData.status] || STATUS_STYLES.claimed_provisional;
          const isRejected = passData.status === 'rejected';
          const isProvisional = passData.status === 'claimed_provisional';

          return (
            <div className={clsx('bg-white dark:bg-[#150709] border-2 rounded-2xl overflow-hidden shadow-sm', style.border)}>
              <div className={clsx(style.band, 'text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2')}>
                <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                  {isRejected ? <XCircle className="w-5 h-5" /> : isProvisional ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  {style.label}
                </span>
                <span className={clsx('font-mono text-xs font-semibold px-2 py-0.5 rounded text-white', style.chip)}>
                  {passLabel(passData)}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">{passData.userName}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{passData.institution}</p>
                  {passData.userEmail && (
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400 break-all">{passData.userEmail}</p>
                  )}
                </div>

                {isProvisional && (
                  <p className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-2.5">
                    Receipt submitted but not yet matched by the team. Admit, and note the name for the payments desk.
                  </p>
                )}

                {passData.accommodation && <StayPanel acc={passData.accommodation} />}

                {!isStaff && passData.hackathon && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Hackathon team: <span className="font-semibold">{passData.hackathon.teamName}</span>
                  </p>
                )}

                {isStaff && (
                  <div className="grid grid-cols-1 gap-3 text-xs border-t border-slate-100 dark:border-[#250D11] pt-3.5">
                    {passData.phone && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Field label="Attendee phone">
                          <span className="font-mono font-semibold">{passData.phone}</span>
                        </Field>
                        <ContactButtons phone={passData.phone} />
                      </div>
                    )}
                    {passData.emergencyPhone && (
                      <Field label="Emergency contact">
                        {passData.emergencyName ? `${passData.emergencyName} · ` : ''}
                        <a href={`tel:${passData.emergencyPhone}`} className="font-mono hover:underline">
                          {passData.emergencyPhone}
                        </a>
                      </Field>
                    )}
                    {(passData.hackathon || passData.transport) && (
                      <div className="grid grid-cols-2 gap-3">
                        {passData.hackathon && (
                          <Field label="Hackathon team">
                            <span className="font-semibold">{passData.hackathon.teamName}</span> · {passData.hackathon.role}
                          </Field>
                        )}
                        {passData.transport && (
                          <Field label="SRM bus">
                            <span className="inline-flex items-center gap-1">
                              <Bus className="w-3 h-3" />
                              {passData.transport.boardingPoint}
                            </span>
                          </Field>
                        )}
                      </div>
                    )}
                    {passData.transactionReference && (
                      <Field label={Number(passData.amountInr) === 0 ? 'Pass reference' : 'Easebuzz Txn ID'}>
                        <span className="font-mono">{passData.transactionReference}</span>
                        {isStaff && passData.receiptUrl && !passData.receiptUrl.startsWith('institutional://') && (
                          <a
                            href={passData.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 font-semibold text-burgundy dark:text-[#E89BA5] hover:underline"
                          >
                            Receipt
                          </a>
                        )}
                      </Field>
                    )}
                  </div>
                )}

                <div className="pt-1">
                  {isRejected ? (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-3 text-xs text-rose-900 dark:text-rose-200 font-medium">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>Receipt was rejected by the organizing team. Send the attendee to the help desk.</span>
                    </div>
                  ) : passData.checkedIn ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold">Already checked in · let them through</p>
                        <p className="font-mono text-[11px] mt-0.5">
                          First entry {passData.checkedInAt ? `${istTime(passData.checkedInAt)} IST` : 'recorded'}
                          {passData.checkedInBy ? ` · ${passData.checkedInBy}` : ''}
                        </p>
                      </div>
                    </div>
                  ) : isStaff ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {checkingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {checkingIn ? 'Recording...' : 'Check In'}
                      </button>
                      {checkInError && <p className="mt-2 text-xs text-rose-700 dark:text-rose-400">{checkInError}</p>}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] px-3.5 py-2.5 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            Stay and room coordinator
          </span>
          <span className="flex flex-col items-end gap-0.5">
            {ACCOMMODATION_HELPLINES.map((h) => (
              <a key={h.tel} href={`tel:${h.tel}`} className="font-mono font-bold text-burgundy dark:text-[#E89BA5] hover:underline">
                {h.display}
              </a>
            ))}
          </span>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/learning"
            className="font-mono text-xs text-slate-500 hover:text-burgundy dark:hover:text-[#E89BA5] transition-colors inline-flex items-center gap-1"
          >
            Back to Learning Portal
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPassPage() {
  return (
    <Suspense
      fallback={<div className="p-12 text-center font-mono text-xs text-slate-500">Loading pass check...</div>}
    >
      <VerifyPassContent />
    </Suspense>
  );
}
