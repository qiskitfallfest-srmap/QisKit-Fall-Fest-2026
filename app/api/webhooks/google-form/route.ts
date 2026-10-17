import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redis, invalidateEmailCache, CACHE_TTL } from '@/lib/redis';
import { logError, logInfo, logWarn, serializeError } from '@/lib/logger';

export const runtime = 'edge';

const SYNC_SECRET = process.env.GOOGLE_FORM_SYNC_SECRET || 'qff-srmap-2026-sync-secret';

interface FormSubmission {
  email?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  whatsapp?: string;
  institution?: string;
  college?: string;
  role?: string;
  yearOfStudy?: string;
  year?: string;
  education?: string;
  highestEducation?: string;
  collegeEmail?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Secret authentication
    const authHeader = request.headers.get('x-sync-secret');
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('secret');

    if (authHeader !== SYNC_SECRET && querySecret !== SYNC_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid sync secret.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const records: FormSubmission[] = Array.isArray(body.records)
      ? body.records
      : Array.isArray(body)
      ? body
      : [body];

    if (!records.length) {
      return NextResponse.json({ error: 'No records provided.' }, { status: 400 });
    }

    const processedEmails: string[] = [];

    for (const record of records) {
      const rawEmail = (record.email || '').trim().toLowerCase();
      if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
        continue;
      }

      const fullName = (record.fullName || record.name || rawEmail.split('@')[0]).trim();
      const phone = (record.phone || record.whatsapp || '').trim();
      const institution = (record.institution || record.college || 'SRM University-AP').trim();
      const role = (record.role || 'Undergraduate Student').trim();
      const yearOfStudy = (record.yearOfStudy || record.year || '').trim() || null;
      const education = (record.education || record.highestEducation || '').trim();
      const collegeEmail = (record.collegeEmail || '').trim().toLowerCase();

      // Collect emails to whitelist for this participant (primary + college email if different)
      const emailsToWhitelist = [rawEmail];
      if (
        collegeEmail &&
        collegeEmail !== rawEmail &&
        collegeEmail.includes('@') &&
        collegeEmail.includes('.')
      ) {
        emailsToWhitelist.push(collegeEmail);
      }

      // 1. Insert into public.registrations
      const { error: regError } = await supabaseAdmin
        .from('registrations')
        .insert({
          name: fullName,
          email: rawEmail,
          institution,
          role,
          phone,
          year_of_study: yearOfStudy,
          interests: education ? [education] : ['Masterclasses', 'Quizzes', 'Challenges'],
        });

      if (regError) {
        logWarn('webhooks.google_form.registrations_insert_failed', {
          email: rawEmail,
          error: serializeError(regError),
        });
      }

      // 2. Upsert each email into public.allowed_emails
      for (const emailToWhitelist of emailsToWhitelist) {
        const { error: whitelistError } = await supabaseAdmin
          .from('allowed_emails')
          .upsert(
            {
              email: emailToWhitelist,
              full_name: fullName,
              role: 'participant',
              is_active: true,
              added_by: 'google_form_sync',
            },
            { onConflict: 'email' }
          );

        if (whitelistError) {
          await logError('webhooks.google_form.whitelist_failed', whitelistError, {
            email: emailToWhitelist,
          });
        } else {
          // 3. Cache in Redis
          await invalidateEmailCache(emailToWhitelist);
          if (redis) {
            try {
              await redis.set(
                `whitelist:${emailToWhitelist}`,
                { whitelisted: true, role: 'participant', fullName },
                { ex: CACHE_TTL.WHITELIST }
              );
            } catch (cacheErr) {
              logWarn('webhooks.google_form.cache_failed', {
                email: emailToWhitelist,
                error: serializeError(cacheErr),
              });
            }
          }
          processedEmails.push(emailToWhitelist);
        }
      }
    }

    logInfo('webhooks.google_form.success', {
      count: processedEmails.length,
      emails: processedEmails.length <= 10 ? processedEmails : `${processedEmails.length} emails`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${processedEmails.length} email(s) into authorized whitelist.`,
      syncedEmails: processedEmails,
    });
  } catch (err: any) {
    await logError('webhooks.google_form.error', err);
    return NextResponse.json(
      { error: err?.message || 'Internal webhook error.' },
      { status: 500 }
    );
  }
}
