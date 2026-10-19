'use client';

import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import {
  NOTICE_AUDIENCE_LABEL,
  NOTICE_SEVERITY_LABEL,
  PARTICIPANT_NOTICES_KEY,
  parseNotices,
  type Notice,
  type NoticeAudience,
  type NoticeSeverity,
} from '@/lib/notices';

const EMPTY = {
  title: '',
  body: '',
  audience: 'all' as NoticeAudience,
  severity: 'info' as NoticeSeverity,
  pinned: false,
  linkLabel: '',
  linkHref: '',
  expiresAt: '',
};

const field =
  'w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/40';

function toLocalInput(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function AdminNoticesManager() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadedAt, setLoadedAt] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config', { cache: 'no-store' });
      const json = await res.json();
      setNotices(parseNotices(json?.config?.[PARTICIPANT_NOTICES_KEY]));
      setLoadedAt(Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function persist(next: Notice[], success: string) {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: PARTICIPANT_NOTICES_KEY, value: { items: next } }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Save failed.');
      setNotices(next);
      setMessage(success);
      return true;
    } catch (err: any) {
      setMessage(err?.message || 'Save failed.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setMessage('A title is required.');
      return;
    }
    if (form.linkHref && !/^(https?:\/\/|\/)/.test(form.linkHref.trim())) {
      setMessage('Links must start with https:// or / (a page on this site).');
      return;
    }
    const existing = notices.find((n) => n.id === editingId);
    const notice: Notice = {
      id: editingId || `n_${Date.now().toString(36)}`,
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      severity: form.severity,
      pinned: form.pinned,
      linkLabel: form.linkLabel.trim() || undefined,
      linkHref: form.linkHref.trim() || undefined,
      publishedAt: existing?.publishedAt || new Date().toISOString(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    const next = editingId ? notices.map((n) => (n.id === editingId ? notice : n)) : [notice, ...notices];
    if (await persist(next, editingId ? 'Notice updated.' : 'Notice published.')) {
      setForm(EMPTY);
      setEditingId(null);
    }
  }

  function edit(n: Notice) {
    setEditingId(n.id);
    setForm({
      title: n.title,
      body: n.body,
      audience: n.audience,
      severity: n.severity,
      pinned: Boolean(n.pinned),
      linkLabel: n.linkLabel || '',
      linkHref: n.linkHref || '',
      expiresAt: toLocalInput(n.expiresAt),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(n: Notice) {
    if (!window.confirm(`Delete the notice "${n.title}"? Participants will no longer see it.`)) return;
    await persist(
      notices.filter((x) => x.id !== n.id),
      'Notice deleted.'
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 sm:p-5 space-y-4"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-[#FAF6F3]">{editingId ? 'Edit notice' : 'New notice'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Shown on participants&apos; profile page (/learning/profile). Publishing is immediate.
          </p>
        </div>

        <div>
          <label htmlFor="notice-title" className="block text-xs font-semibold mb-1">Title</label>
          <input id="notice-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={140} className={field} />
        </div>
        <div>
          <label htmlFor="notice-body" className="block text-xs font-semibold mb-1">Message</label>
          <textarea id="notice-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} maxLength={2000} className={field} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="notice-audience" className="block text-xs font-semibold mb-1">Who sees it</label>
            <select
              id="notice-audience"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as NoticeAudience })}
              className={field}
            >
              {(Object.keys(NOTICE_AUDIENCE_LABEL) as NoticeAudience[]).map((a) => (
                <option key={a} value={a}>{NOTICE_AUDIENCE_LABEL[a]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="notice-severity" className="block text-xs font-semibold mb-1">Type</label>
            <select
              id="notice-severity"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value as NoticeSeverity })}
              className={field}
            >
              {(Object.keys(NOTICE_SEVERITY_LABEL) as NoticeSeverity[]).map((s) => (
                <option key={s} value={s}>{NOTICE_SEVERITY_LABEL[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="notice-link-label" className="block text-xs font-semibold mb-1">Link text (optional)</label>
            <input id="notice-link-label" value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="notice-link-href" className="block text-xs font-semibold mb-1">Link URL (optional)</label>
            <input
              id="notice-link-href"
              value={form.linkHref}
              onChange={(e) => setForm({ ...form, linkHref: e.target.value })}
              placeholder="/learning/hackathon or https://..."
              className={field}
            />
          </div>
          <div>
            <label htmlFor="notice-expires" className="block text-xs font-semibold mb-1">Hide after (optional)</label>
            <input
              id="notice-expires"
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className={field}
            />
          </div>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="accent-[#6C151E]" />
            Pin to top
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy text-white px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {editingId ? 'Save changes' : 'Publish notice'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
              className="rounded-lg border border-slate-300 dark:border-[#3D1418] px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          )}
          {message && <span className="text-xs text-slate-600 dark:text-slate-300">{message}</span>}
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Published ({notices.length})</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Loading</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-slate-500">No notices yet.</p>
        ) : (
          <ul className="space-y-2">
            {notices.map((n) => {
              const expired = n.expiresAt && Date.parse(n.expiresAt) <= loadedAt;
              return (
                <li
                  key={n.id}
                  className={clsx(
                    'rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 flex flex-wrap items-start justify-between gap-3',
                    expired && 'opacity-60'
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                      {n.pinned && <span className="mr-1.5 text-xs font-normal text-burgundy">Pinned</span>}
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {NOTICE_AUDIENCE_LABEL[n.audience]} · {NOTICE_SEVERITY_LABEL[n.severity]} · {new Date(n.publishedAt).toLocaleString('en-IN')}
                      {n.expiresAt && ` · ${expired ? 'Expired' : 'Hides'} ${new Date(n.expiresAt).toLocaleString('en-IN')}`}
                    </p>
                    {n.body && <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line line-clamp-3">{n.body}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => edit(n)} aria-label={`Edit ${n.title}`} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] cursor-pointer">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(n)} aria-label={`Delete ${n.title}`} className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
