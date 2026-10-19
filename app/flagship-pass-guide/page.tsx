import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Eye, Lock, Receipt, Users } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import {
  CERTIFICATE_FEE_INR,
  COMBINED_FLAGSHIP_CERTIFICATE_INR,
  FLAGSHIP_PASS_FEE_INR,
  PASS_FEE_INR,
} from '@/lib/payments';
import { getServerSession } from '@/lib/auth';
import { getFlagshipPaymentWindow } from '@/lib/hackathon-pass';

// Participants see the guide once the Flagship Pass payment link is published; admins can preview it before then.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Flagship Pass Payment Guide',
  description:
    'How shortlisted Phase 2 hackathon participants pay for the ₹499 Flagship Pass (Diamond Pass on Easebuzz) and submit their receipt.',
  robots: { index: false, follow: false },
};

const SELECTIONS: { field: string; choice: string; note?: string }[] = [
  { field: 'I confirm the above', choice: 'Tick it first' },
  {
    field: `Offline Entry Pass (Platinum) – ₹${PASS_FEE_INR}`,
    choice: 'Set to No',
    note: 'Important: setting Platinum to No is what reveals the Diamond Pass field below it.',
  },
  { field: `Diamond Pass – ₹${FLAGSHIP_PASS_FEE_INR}`, choice: 'Set to Yes', note: 'This is your Flagship Pass.' },
  {
    field: `Certificate – ₹${CERTIFICATE_FEE_INR}`,
    choice: 'Yes or No',
    note: 'Yes only if your masterclass certificate is unlocked and you have not paid for it yet. Otherwise No.',
  },
  { field: 'Easebuzz Privacy Policy consent', choice: 'Tick it' },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex gap-4 sm:gap-5">
      <span className="flex-none w-8 h-8 rounded-full bg-[#7D111C] dark:bg-[#F07A86] text-white dark:text-[#120506] font-mono font-bold text-sm grid place-items-center">
        {n}
      </span>
      <div className="flex-1 min-w-0 space-y-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1] leading-snug">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Screenshot({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <figure className="rounded-xl overflow-hidden border border-[rgba(108,21,30,0.16)] dark:border-[rgba(240,120,132,0.20)] bg-white">
      <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" sizes="(min-width: 896px) 800px, 100vw" />
    </figure>
  );
}

function NotOpenYet() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F7F2ED] dark:bg-[#120506] text-[#201617] dark:text-[#FFF4F1]">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-20 space-y-4">
        <Lock className="w-6 h-6 text-[#7D111C] dark:text-[#F07A86]" />
        <h1 className="text-2xl sm:text-3xl font-serif font-bold">Flagship Pass payment guide</h1>
        <p className="text-[15px] leading-relaxed text-[#3D3334] dark:text-[#E2D5D3]">
          This guide opens when the Flagship Pass payment link is published. Your Flagship Pass card on the dashboard will
          link here at that time.
        </p>
        <Link
          href="/learning#campus-pass"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7D111C] dark:text-[#F07A86] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to your dashboard
        </Link>
      </main>
      <Footer />
    </div>
  );
}

export default async function FlagshipPassGuidePage() {
  const [session, paymentWindow] = await Promise.all([getServerSession(), getFlagshipPaymentWindow()]);
  const published = Boolean(paymentWindow.gatewayUrl);
  if (!published && !session?.isAdmin) return <NotOpenYet />;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F7F2ED] dark:bg-[#120506] text-[#201617] dark:text-[#FFF4F1]">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-20">
        {!published && (
          <div className="mb-6 flex gap-3 p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200/90 text-sm">
            <Eye className="w-4 h-4 mt-0.5 flex-none" />
            <p>
              <strong>Admin preview.</strong> Participants see a &ldquo;not open yet&rdquo; notice here until the Flagship
              Pass payment link is published from the Hackathon admin view. This banner is not shown to them.
            </p>
          </div>
        )}
        <div className="mb-8">
          <Link
            href="/learning#campus-pass"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7D111C] dark:text-[#F07A86] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to your dashboard
          </Link>
        </div>

        <header className="mb-10 border-b border-[rgba(108,21,30,0.16)] dark:border-[rgba(240,120,132,0.20)] pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-[rgba(108,21,30,0.08)] dark:bg-[rgba(240,120,132,0.12)] text-[#6C151E] dark:text-[#F07A86] border border-[rgba(108,21,30,0.18)] dark:border-[rgba(240,120,132,0.25)]">
            <CreditCard className="w-3.5 h-3.5" />
            Hackathon Phase 2 finalists
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">Flagship Pass payment guide</h1>
          <p className="text-[15px] sm:text-base leading-relaxed text-[#3D3334] dark:text-[#E2D5D3] max-w-2xl">
            The ₹{FLAGSHIP_PASS_FEE_INR} Flagship Pass is called the <strong>Diamond Pass</strong> on the Easebuzz form. That
            option stays hidden until you tick <strong>&ldquo;I confirm the above&rdquo;</strong> AND change <strong>&ldquo;Offline Entry Pass (Platinum) – ₹{PASS_FEE_INR}&rdquo; to &ldquo;No&rdquo;</strong>. Only after selecting Platinum to No does the Diamond Pass field appear.
          </p>
        </header>

        <div className="space-y-12 text-[15px] sm:text-base leading-[1.7] text-[#3D3334] dark:text-[#E2D5D3]">
          {/* Summary */}
          <section className="rounded-xl border border-[rgba(108,21,30,0.16)] dark:border-[rgba(240,120,132,0.20)] bg-white dark:bg-[#1A0A0C] overflow-hidden">
            <h2 className="px-5 py-3.5 font-semibold text-[#201617] dark:text-[#FFF4F1] border-b border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.16)]">
              What to select on the Easebuzz form
            </h2>
            <dl className="divide-y divide-[rgba(108,21,30,0.10)] dark:divide-[rgba(240,120,132,0.14)]">
              {SELECTIONS.map((s) => (
                <div key={s.field} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-3 items-start">
                  <dt className="min-w-0">
                    <span className="font-medium text-[#201617] dark:text-[#FFF4F1]">{s.field}</span>
                    {s.note && <span className="block text-sm text-[#635654] dark:text-[#D2C4C1]">{s.note}</span>}
                  </dt>
                  <dd className="font-mono text-sm font-bold text-[#7D111C] dark:text-[#F07A86] whitespace-nowrap">{s.choice}</dd>
                </div>
              ))}
            </dl>
            <p className="px-5 py-3.5 text-sm bg-[rgba(108,21,30,0.04)] dark:bg-[rgba(240,120,132,0.06)] border-t border-[rgba(108,21,30,0.12)] dark:border-[rgba(240,120,132,0.16)]">
              The Pay button must show <strong>₹{FLAGSHIP_PASS_FEE_INR}</strong>, or{' '}
              <strong>₹{COMBINED_FLAGSHIP_CERTIFICATE_INR}</strong> with the certificate. If it shows ₹{PASS_FEE_INR} or ₹
              {PASS_FEE_INR + CERTIFICATE_FEE_INR}, the Diamond Pass is not selected.
            </p>
          </section>

          {/* Before you pay */}
          <section className="flex gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200/90 text-sm">
            <Users className="w-4 h-4 mt-1 flex-none" />
            <div className="space-y-1.5">
              <p className="font-semibold">Before you pay</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Every team member pays ₹{FLAGSHIP_PASS_FEE_INR} separately, from their own account.</li>
                <li>The team lead pays last, after all teammates have submitted their receipts.</li>
                <li>
                  Your deadline is the countdown on your Flagship Pass card. Unpaid places may be released to the next team
                  in the waiting room.
                </li>
              </ul>
            </div>
          </section>

          <Step n={1} title="Open the payment form from your dashboard">
            <p>
              Go to the <strong>Flagship Pass</strong> card on your dashboard and click{' '}
              <strong>Pay ₹{FLAGSHIP_PASS_FEE_INR} on Easebuzz</strong>. Fill in your name, contact number, institution,
              state and city. Use the same email ID you sign in to this website with.
            </p>
            <Link
              href="/learning#campus-pass"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7D111C] hover:bg-[#5E0C15] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Go to my Flagship Pass card
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Step>

          <Step n={2} title="Tick “I confirm the above” and set Platinum Pass to No">
            <p>
              When you scroll down, there is no Diamond Pass option yet. First tick the confirmation box marked in blue.
              Then, change <strong>Offline Entry Pass (Platinum) – ₹{PASS_FEE_INR}</strong> from Yes to <strong>No</strong>.
              Only after selecting Platinum to No does the ₹{FLAGSHIP_PASS_FEE_INR} Diamond Pass field open below it.
            </p>
            <Screenshot
              src="/images/payment-guide/step-tick.png"
              alt="Easebuzz form with the I confirm the above box not ticked and no Diamond Pass field"
              width={1362}
              height={906}
            />
          </Step>

          <Step n={3} title="Select Diamond Pass: Yes">
            <p>
              Once you set Offline Entry Pass (Platinum) to No, the <strong>Diamond Pass</strong> dropdown opens below it.
              Set the fields as follows:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>Offline Entry Pass (Platinum):</strong> must be set to <strong>No</strong> (crucial: this is what reveals the Diamond Pass option).
              </li>
              <li>
                <strong>Diamond Pass:</strong> choose <strong>Yes</strong> (this is your ₹{FLAGSHIP_PASS_FEE_INR} Flagship Pass).
              </li>
              <li>
                <strong>Certificate:</strong> choose <strong>Yes</strong> only if your masterclass certificate is unlocked
                (all video lectures and quizzes complete) and you have not paid for it yet. If you already paid, or have not
                finished the course, choose <strong>No</strong>.
              </li>
              <li>Tick the Easebuzz Privacy Policy consent box.</li>
            </ol>
            <Screenshot
              src="/images/payment-guide/step-select.png"
              alt="Correct selections: confirm ticked, certificate depends, Platinum No, Diamond Pass Yes, consent ticked"
              width={1463}
              height={881}
            />
          </Step>

          <Step n={4} title="Check the amount, then pay">
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1.5 flex-none text-emerald-700 dark:text-emerald-400" />
                <span>
                  <strong>₹{FLAGSHIP_PASS_FEE_INR}</strong> for the Flagship Pass only
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 mt-1.5 flex-none text-emerald-700 dark:text-emerald-400" />
                <span>
                  <strong>₹{COMBINED_FLAGSHIP_CERTIFICATE_INR}</strong> for the Flagship Pass and the certificate together
                </span>
              </li>
            </ul>
            <div className="flex gap-3 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200/90 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-none" />
              <p>
                If the button shows <strong>₹{PASS_FEE_INR}</strong>, you are about to buy the general Platinum pass. Do not
                pay. Go back and tick the confirmation box. This is what the wrong selection looks like:
              </p>
            </div>
            <Screenshot
              src="/images/payment-guide/step-wrong.png"
              alt="Wrong selection: confirmation not ticked and Platinum pass set to Yes for 99 rupees"
              width={1467}
              height={925}
            />
          </Step>

          <Step n={5} title="Submit your receipt on the dashboard">
            <p>
              Save the Easebuzz receipt and note the <strong>Transaction ID</strong> (for example E26101518BKHN3). Then, on
              your Flagship Pass card, click <strong>I have paid: submit receipt</strong> and enter that Transaction ID with
              the receipt.
            </p>
            <div className="flex gap-3 p-4 rounded-xl border border-[rgba(108,21,30,0.16)] dark:border-[rgba(240,120,132,0.20)] bg-white dark:bg-[#1A0A0C] text-sm">
              <Receipt className="w-4 h-4 mt-0.5 flex-none text-[#7D111C] dark:text-[#F07A86]" />
              <p>
                Paid ₹{COMBINED_FLAGSHIP_CERTIFICATE_INR} with the certificate? Submit the same Transaction ID and receipt
                twice: once on the Flagship Pass card and once in the masterclass certificate section. Both use the one
                payment.
              </p>
            </div>
          </Step>

          <section className="border-t border-[rgba(108,21,30,0.16)] dark:border-[rgba(240,120,132,0.20)] pt-8 space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#201617] dark:text-[#FFF4F1]">Common mistakes</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Paying ₹{PASS_FEE_INR} with Platinum set to Yes.</strong> This is the general entry pass, not the
                Flagship Pass. It happens when the confirmation box is left unticked.
              </li>
              <li>
                <strong>Paying for the certificate twice.</strong> If you already bought it, set Certificate to No.
              </li>
              <li>
                <strong>Adding the certificate before finishing the course.</strong> The certificate is issued only after all
                video lectures and quizzes are complete.
              </li>
              <li>
                <strong>Team lead paying first.</strong> The lead&apos;s receipt is accepted only after every teammate has
                submitted theirs.
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
