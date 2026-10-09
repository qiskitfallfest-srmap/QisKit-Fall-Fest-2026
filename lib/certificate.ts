import crypto from 'crypto';
import { supabaseAdmin as supabase } from './supabase-admin';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';

export interface EligibilityResult {
  eligible: boolean;
  alreadyIssued: boolean;
  issuedCertificate?: {
    id: string;
    serialNumber: string;
    recipientName: string;
    averageQuizScore: number;
    certificateUrl: string;
    issuedAt: string;
    verificationHash: string;
  };
  totalSessions: number;
  sessionsCompleted: number;
  quizzesPassed: number;
  competitionsSubmitted: number;
  averageQuizScore: number;
  missingTasks: string[];
}

/**
 * Checks candidate eligibility for receiving an official Certificate
 */
export async function checkCertificateEligibility(
  email: string
): Promise<EligibilityResult> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if certificate is already issued
  const { data: existingCert } = await supabase
    .from('issued_certificates')
    .select('*')
    .ilike('user_email', normalizedEmail)
    .maybeSingle();

  if (existingCert) {
    return {
      eligible: true,
      alreadyIssued: true,
      issuedCertificate: {
        id: existingCert.id,
        serialNumber: existingCert.serial_number,
        recipientName: existingCert.recipient_name,
        averageQuizScore: Number(existingCert.average_quiz_score),
        certificateUrl: existingCert.certificate_url,
        issuedAt: existingCert.issued_at,
        verificationHash: existingCert.verification_hash,
      },
      totalSessions: CURRICULUM_SESSIONS.length,
      sessionsCompleted: CURRICULUM_SESSIONS.length,
      quizzesPassed: CURRICULUM_SESSIONS.length,
      competitionsSubmitted: 3,
      averageQuizScore: Number(existingCert.average_quiz_score),
      missingTasks: [],
    };
  }

  // 2. Query user progress across all sessions
  const { data: progressList } = await supabase
    .from('user_progress')
    .select('session_id, video_completed, quiz_passed, quiz_score')
    .ilike('email', normalizedEmail);

  const progressMap = new Map<string, { video_completed: boolean; quiz_passed: boolean; quiz_score: number }>();
  if (progressList) {
    for (const p of progressList) {
      progressMap.set(p.session_id, p);
    }
  }

  // 3. Query competitions submissions
  const { data: submissions } = await supabase
    .from('competition_submissions')
    .select('competition_type, submission_url')
    .ilike('email', normalizedEmail);

  const submittedTypes = new Set<string>();
  if (submissions) {
    for (const s of submissions) {
      if (s.submission_url && s.submission_url.trim()) {
        submittedTypes.add(s.competition_type);
      }
    }
  }

  // 4. Evaluate sessions & quizzes
  const missingTasks: string[] = [];
  let sessionsCompleted = 0;
  let quizzesPassed = 0;
  let totalScore = 0;

  for (const session of CURRICULUM_SESSIONS) {
    const prog = progressMap.get(session.id);
    const quizDone = prog?.quiz_passed === true;
    const videoDone = prog?.video_completed === true || quizDone;

    if (videoDone) {
      sessionsCompleted++;
    } else {
      missingTasks.push(`Session ${session.sessionNumber} Video Lecture incomplete`);
    }

    if (quizDone) {
      quizzesPassed++;
      totalScore += prog?.quiz_score || 0;
    } else {
      missingTasks.push(`Session ${session.sessionNumber} Concept Check Quiz not passed`);
    }
  }

  // 5. Evaluate competitions (reels, poster, essay)
  const requiredCompTypes = ['reels', 'poster', 'essay'] as const;
  const compLabels: Record<string, string> = {
    reels: 'Day 1 Quantum Tech Reels',
    poster: 'Day 2 Digital Poster',
    essay: 'Day 3 Essay Competition',
  };

  let competitionsSubmitted = 0;
  for (const cType of requiredCompTypes) {
    if (submittedTypes.has(cType)) {
      competitionsSubmitted++;
    } else {
      missingTasks.push(`${compLabels[cType]} submission missing`);
    }
  }

  const totalSessions = CURRICULUM_SESSIONS.length;
  const averageQuizScore =
    quizzesPassed > 0 ? Math.round((totalScore / totalSessions) * 10) / 10 : 0;

  const eligible =
    sessionsCompleted === totalSessions &&
    quizzesPassed === totalSessions &&
    competitionsSubmitted === requiredCompTypes.length;

  return {
    eligible,
    alreadyIssued: false,
    totalSessions,
    sessionsCompleted,
    quizzesPassed,
    competitionsSubmitted,
    averageQuizScore,
    missingTasks,
  };
}

/**
 * Generates canonical serial identifier: QFF26-MCL-202610-XXXX
 */
export function generateSerialNumber(): string {
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `QFF26-MCL-202610-${randomSuffix}`;
}

/**
 * Generates tamper-proof SHA-256 hash for public credential verification
 */
export function generateVerificationHash(
  serialNumber: string,
  email: string,
  issuedAt: string
): string {
  return crypto
    .createHash('sha256')
    .update(`${serialNumber}:${email.toLowerCase().trim()}:${issuedAt}:QFF26_VERIFIED`)
    .digest('hex');
}

/**
 * Generates an SVG Certificate
 */
export function generateCertificateSVG({
  recipientName,
  serialNumber,
  averageScore,
  issuedDateStr,
  verificationUrl,
}: {
  recipientName: string;
  serialNumber: string;
  averageScore: number;
  issuedDateStr: string;
  verificationUrl: string;
}): string {
  const distinction =
    averageScore >= 90
      ? 'Passed with High Distinction'
      : averageScore >= 75
      ? 'Passed with Distinction'
      : 'Certificate of Successful Completion';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="burgundyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#800020"/>
      <stop offset="100%" stop-color="#4a0012"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#aa820a"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1920" height="1080" fill="url(#bgGrad)"/>

  <!-- Outer Frame -->
  <rect x="40" y="40" width="1840" height="1000" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" filter="url(#shadow)"/>
  <rect x="52" y="52" width="1816" height="976" rx="12" fill="none" stroke="#800020" stroke-width="1.5" stroke-opacity="0.4"/>
  <rect x="58" y="58" width="1804" height="964" rx="8" fill="none" stroke="#d4af37" stroke-width="0.75" stroke-opacity="0.6"/>

  <!-- Corner Flourishes -->
  <circle cx="58" cy="58" r="6" fill="#800020"/>
  <circle cx="1862" cy="58" r="6" fill="#800020"/>
  <circle cx="58" cy="1022" r="6" fill="#800020"/>
  <circle cx="1862" cy="1022" r="6" fill="#800020"/>

  <!-- Top Badges -->
  <text x="960" y="140" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" letter-spacing="6" fill="#800020">
    IBM QUANTUM × SRM UNIVERSITY-AP
  </text>
  <text x="960" y="170" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" letter-spacing="3" fill="#64748b">
    A DECADE OF QUANTUM ON CLOUD (2016–2026)
  </text>

  <!-- Main Title -->
  <text x="960" y="270" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" letter-spacing="2" fill="url(#burgundyGrad)">
    Certificate of Academic Mastery
  </text>
  <text x="960" y="320" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" letter-spacing="4" fill="#d4af37">
    QISKIT FALL FEST 2026 · ONLINE LEARNING PHASE
  </text>

  <!-- Presentation line -->
  <text x="960" y="410" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="20" fill="#475569">
    This official credential is systematically awarded to
  </text>

  <!-- Recipient Name -->
  <text x="960" y="490" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="800" letter-spacing="1" fill="#0f172a">
    ${recipientName}
  </text>
  <line x1="560" y1="520" x2="1360" y2="520" stroke="url(#goldGrad)" stroke-width="2"/>

  <!-- Course description -->
  <text x="960" y="580" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#334155">
    for rigorous completion of the ${CURRICULUM_SESSIONS.length}-part progressive curriculum in Quantum Circuit Synthesis,
  </text>
  <text x="960" y="612" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#334155">
    Hardware Architectures, Quantum Sensing, QML, and Post-Quantum Cryptography,
  </text>
  <text x="960" y="644" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#334155">
    including all daily creative competitions and technical mastery evaluations.
  </text>

  <!-- Distinction Badge Box -->
  <rect x="760" y="685" width="400" height="42" rx="21" fill="#f8fafc" stroke="#d4af37" stroke-width="1.5"/>
  <text x="960" y="712" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="1" fill="#800020">
    ${distinction.toUpperCase()} (${averageScore}%)
  </text>

  <!-- Signatures Section -->
  <g transform="translate(320, 840)">
    <line x1="0" y1="0" x2="300" y2="0" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="150" y="30" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#0f172a">Dr. Kenneth Thorne</text>
    <text x="150" y="52" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b">IBM Quantum Principal Educator</text>
  </g>

  <!-- Gold Seal in Center -->
  <g transform="translate(960, 860)">
    <circle cx="0" cy="0" r="54" fill="url(#goldGrad)" opacity="0.15"/>
    <circle cx="0" cy="0" r="46" fill="none" stroke="#d4af37" stroke-width="2" stroke-dasharray="4,3"/>
    <circle cx="0" cy="0" r="38" fill="url(#burgundyGrad)"/>
    <text x="0" y="-8" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" letter-spacing="1" fill="#ffffff">QFF</text>
    <text x="0" y="8" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="#d4af37">2026</text>
    <text x="0" y="22" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="8" font-weight="700" letter-spacing="1" fill="#ffffff">VERIFIED</text>
  </g>

  <g transform="translate(1300, 840)">
    <line x1="0" y1="0" x2="300" y2="0" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="150" y="30" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#0f172a">Prof. S. K. Ramanathan</text>
    <text x="150" y="52" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b">Faculty Lead · SRM University-AP</text>
  </g>

  <!-- Footer Metadata & Verification -->
  <g transform="translate(100, 990)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#475569">
      SERIAL: <tspan fill="#800020">${serialNumber}</tspan>
    </text>
    <text x="0" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#94a3b8">
      ISSUED: ${issuedDateStr} · SRM UNIVERSITY-AP AMARAVATI
    </text>
  </g>

  <g transform="translate(1820, 990)">
    <text x="0" y="0" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#475569">
      VERIFICATION URL:
    </text>
    <text x="0" y="18" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#800020">
      ${verificationUrl}
    </text>
  </g>
</svg>`;
}

/**
 * Mints an issued certificate, uploads to Supabase Storage, and records in database
 */
export async function mintCertificate({
  userEmail,
  recipientName,
  orderId,
  averageScore,
}: {
  userEmail: string;
  recipientName: string;
  orderId: string | null;
  averageScore: number;
}) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const serialNumber = generateSerialNumber();
  const now = new Date();
  const issuedDateStr = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const issuedAtIso = now.toISOString();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qffsrmap2026.com';
  const verificationUrl = `${siteUrl}/verify-certificate/${serialNumber}`;
  const verificationHash = generateVerificationHash(
    serialNumber,
    normalizedEmail,
    issuedAtIso
  );

  const svgContent = generateCertificateSVG({
    recipientName,
    serialNumber,
    averageScore,
    issuedDateStr,
    verificationUrl,
  });

  // Upload SVG asset to Supabase Storage bucket 'certificates' (optional bucket fallback)
  const filePath = `masterclass/2026/${serialNumber}.svg`;
  let certificateUrl = `${siteUrl}/verify-certificate/${serialNumber}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, Buffer.from(svgContent, 'utf-8'), {
        contentType: 'image/svg+xml',
        upsert: true,
        cacheControl: '31536000',
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        certificateUrl = publicUrlData.publicUrl;
      }
    } else {
      console.warn('[Mint Certificate] Storage upload warning:', uploadError.message);
    }
  } catch (storageErr) {
    console.warn('[Mint Certificate] Storage upload exception, using verification URL fallback:', storageErr);
  }

  // Insert into issued_certificates table
  const { data: certRecord, error: insertError } = await supabase
    .from('issued_certificates')
    .insert({
      serial_number: serialNumber,
      user_email: normalizedEmail,
      recipient_name: recipientName,
      institution: 'SRM University-AP',
      course_name: 'IBM Quantum Masterclass: A Decade of Quantum on Cloud',
      order_id: orderId,
      average_quiz_score: averageScore,
      certificate_url: certificateUrl,
      verification_hash: verificationHash,
      issued_at: issuedAtIso,
    })
    .select('*')
    .single();

  if (insertError) {
    console.error('[Mint Certificate] Insert error:', insertError);
    throw insertError;
  }

  return {
    certRecord,
    serialNumber,
    certificateUrl,
    verificationUrl,
  };
}
