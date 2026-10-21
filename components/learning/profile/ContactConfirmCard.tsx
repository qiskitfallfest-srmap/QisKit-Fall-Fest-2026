'use client';

import React, { useEffect, useState } from 'react';
import { mutate as mutateKey } from 'swr';
import { AlertCircle, Loader2, Pencil, Phone } from 'lucide-react';
import { PROFILE_OVERVIEW_KEY, type ProfileOverview } from '@/hooks/use-profile-overview';
import { OPEN_CONTACT_EVENT, PHONE_HINT, normalizePhone } from '@/lib/phone';
import { ACCOMMODATION_KEY } from './AccommodationCard';
import { TRANSPORT_KEY } from './TransportCard';
import { Card, StatusPill, buttonStyles } from './profile-ui';

export { OPEN_CONTACT_EVENT };

const inputClass =
  'w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/40 aria-[invalid=true]:border-rose-500';

type Contact = NonNullable<ProfileOverview['profile']['contact']>;

export function contactNeedsAnswer(contact: Contact | undefined): boolean {
  return Boolean(contact?.tracked) && !(contact?.confirmed && contact?.emergencyPhone);
}

type Field = 'phone' | 'repeat' | 'name' | 'emergency' | 'ack' | 'form';

function ContactForm({ contact, onDone, onCancel }: { contact: Contact; onDone: () => void; onCancel?: () => void }) {
  const [phone, setPhone] = useState(contact.phone || '');
  const [repeat, setRepeat] = useState('');
  const [name, setName] = useState(contact.emergencyName || '');
  const [emergency, setEmergency] = useState(contact.emergencyPhone || '');
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field: Field; message: string } | null>(null);

  function fail(field: Field, message: string) {
    setError({ field, message });
    document.getElementById(`contact-${field}`)?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const own = normalizePhone(phone);
    if (!own) return fail('phone', 'Enter a valid mobile number.');
    // Typing it twice is the check: there is no OTP
    if (normalizePhone(repeat) !== own) return fail('repeat', 'The two numbers do not match.');
    if (name.trim().length < 2) return fail('name', 'Enter the name of your emergency contact.');
    const other = normalizePhone(emergency);
    if (!other) return fail('emergency', 'Enter a valid mobile number for your emergency contact.');
    if (other === own) return fail('emergency', 'Use a different person’s number for the emergency contact.');
    if (!ack) return fail('ack', 'Confirm that the number is yours and will be reachable.');
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/user/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: own, emergencyName: name, emergencyPhone: other }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not save.');
      await Promise.all([mutateKey(PROFILE_OVERVIEW_KEY), mutateKey(TRANSPORT_KEY), mutateKey(ACCOMMODATION_KEY)]);
      onDone();
    } catch (err: any) {
      setError({ field: 'form', message: err?.message || 'Could not save.' });
    } finally {
      setBusy(false);
    }
  }

  const invalid = (f: Field) => error?.field === f || undefined;
  const field = (id: Field, label: string, value: string, set: (v: string) => void, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`contact-${id}`} className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {label}
      </label>
      <input
        id={`contact-${id}`}
        value={value}
        onChange={(e) => {
          set(e.target.value);
          if (error?.field === id) setError(null);
        }}
        aria-invalid={invalid(id)}
        aria-describedby={error?.field === id ? 'contact-error' : undefined}
        className={inputClass}
        {...extra}
      />
    </div>
  );
  const tel = { type: 'tel', inputMode: 'tel' as const, maxLength: 20 };

  return (
    <form onSubmit={submit} noValidate aria-busy={busy} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('phone', 'Your mobile number', phone, setPhone, { ...tel, autoComplete: 'tel' })}
        {field('repeat', 'Type it again', repeat, setRepeat, { ...tel, autoComplete: 'off' })}
        {field('name', 'Emergency contact name', name, setName, { maxLength: 70, placeholder: 'Parent, guardian or friend' })}
        {field('emergency', 'Emergency contact mobile', emergency, setEmergency, tel)}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">{PHONE_HINT}</p>
      <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          id="contact-ack"
          type="checkbox"
          checked={ack}
          onChange={(e) => {
            setAck(e.target.checked);
            if (error?.field === 'ack') setError(null);
          }}
          className="mt-0.5 accent-[#6C151E]"
        />
        This is my own number and it will be reachable on call and WhatsApp during 26–30 October.
      </label>
      {error && (
        <p id="contact-error" role="alert" className="flex items-start gap-1.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle aria-hidden="true" className="h-4 w-4 mt-0.5 shrink-0" />
          {error.message}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={buttonStyles.primary}>
          {busy && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />}
          {busy ? 'Saving…' : 'Confirm'}
        </button>
        {onCancel && (
          <button type="button" disabled={busy} onClick={onCancel} className={buttonStyles.secondary}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Mobile number and emergency contact confirmation. On the overview it shows only while
 * unanswered; in the Account tab (`alwaysShow`) it shows the confirmed details with Change.
 */
export function ContactConfirmCard({ contact, alwaysShow = false }: { contact: Contact | undefined; alwaysShow?: boolean }) {
  const [editing, setEditing] = useState(false);
  const pending = contactNeedsAnswer(contact);

  useEffect(() => {
    function open() {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('contact-phone')?.focus();
    }
    window.addEventListener(OPEN_CONTACT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, open);
  }, []);

  if (!contact?.tracked || (!pending && !alwaysShow)) return null;

  return (
    <Card
      id="contact"
      title="Mobile number and emergency contact"
      description="The organizers use these to reach you, or someone close to you, during the on-campus days. Bus travel and accommodation open once this is confirmed."
      action={pending ? <StatusPill tone="warning">Not confirmed</StatusPill> : <StatusPill tone="success">Confirmed</StatusPill>}
    >
      {pending || editing ? (
        <ContactForm contact={contact} onDone={() => setEditing(false)} onCancel={pending ? undefined : () => setEditing(false)} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <p className="flex items-center gap-2">
              <Phone aria-hidden="true" className="h-4 w-4 text-slate-400" />
              {contact.phone}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Emergency: {contact.emergencyName} · {contact.emergencyPhone}
            </p>
          </div>
          <button type="button" onClick={() => setEditing(true)} className={buttonStyles.secondary}>
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            Change
          </button>
        </div>
      )}
    </Card>
  );
}
