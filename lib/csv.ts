/**
 * CSV parser and participant extractor for Qiskit Fall Fest SRMAP.
 * Handles RFC-4180 standard CSV, quotes, commas in fields, UTF-8 BOM,
 * and automatic column detection for participant exports.
 */

export interface ParsedParticipant {
  email: string;
  fullName: string;
  role: string;
}

/**
 * Parses raw CSV string into a 2D array of string cells.
 */
export function parseCSV(text: string): string[][] {
  if (!text) return [];

  // Strip UTF-8 BOM if present
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let cur = '';

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const next = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i++;
      }
      row.push(cur.trim());
      cur = '';
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
    } else {
      cur += char;
    }
  }

  if (cur.length > 0 || row.length > 0) {
    row.push(cur.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

const EMAIL_HEADER_KEYWORDS = [
  "candidate's email",
  'candidate email',
  'candidate_email',
  'registered email',
  'email address',
  'e-mail address',
  'email',
  'e-mail',
  'mail',
];

const NAME_HEADER_KEYWORDS = [
  "candidate's name",
  'candidate name',
  'candidate_name',
  'full name',
  'fullname',
  'student name',
  'participant name',
  'user name',
  'username',
  'name',
];

/**
 * Automatically extracts valid participants from CSV rows.
 * Deduplicates by lowercased email while preserving candidate names.
 */
export function extractParticipantsFromCSV(
  csvText: string,
  defaultRole = 'participant'
): {
  participants: ParsedParticipant[];
  totalRows: number;
  duplicateCount: number;
} {
  const rows = parseCSV(csvText);
  if (rows.length === 0) {
    return { participants: [], totalRows: 0, duplicateCount: 0 };
  }

  // 1. Inspect first row for column headers
  // If the first row already contains an '@' in any cell, it is definitely data, NOT a header!
  const firstRowHasEmail = rows[0].some((c) => c.includes('@'));

  let emailCol = -1;
  let nameCol = -1;

  if (!firstRowHasEmail) {
    const header = rows[0].map((h) => h.toLowerCase().trim());
    for (let i = 0; i < header.length; i++) {
      const colName = header[i];
      if (emailCol === -1) {
        if (EMAIL_HEADER_KEYWORDS.some((kw) => colName === kw || colName.includes(kw))) {
          emailCol = i;
        }
      }
      if (nameCol === -1) {
        if (NAME_HEADER_KEYWORDS.some((kw) => colName === kw || colName.includes(kw))) {
          nameCol = i;
        }
      }
    }
  }

  const hasHeaders = !firstRowHasEmail && emailCol !== -1;
  const startIndex = hasHeaders ? 1 : 0;
  const totalRows = rows.length - (hasHeaders ? 1 : 0);

  const participants: ParsedParticipant[] = [];
  const seenEmails = new Set<string>();
  let duplicateCount = 0;

  for (let r = startIndex; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    let email = '';
    let fullName = '';

    if (emailCol !== -1) {
      email = row[emailCol] || '';
      fullName = nameCol !== -1 ? row[nameCol] || '' : '';
    } else {
      // Auto-detect column containing an '@'
      for (let c = 0; c < row.length; c++) {
        const cell = row[c] || '';
        if (cell.includes('@')) {
          email = cell;
          // Try to get name from adjacent columns if they don't look like emails
          if (c === 1 && row[0] && !row[0].includes('@')) {
            fullName = row[0];
          } else if (c === 0 && row[1] && !row[1].includes('@')) {
            fullName = row[1];
          }
          break;
        }
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    // Basic email validation
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      continue;
    }

    const cleanName = fullName.trim();

    if (seenEmails.has(cleanEmail)) {
      duplicateCount++;
      // If previous entry had empty name and this one has name, update it
      const existing = participants.find((p) => p.email === cleanEmail);
      if (existing && !existing.fullName && cleanName) {
        existing.fullName = cleanName;
      }
      continue;
    }

    seenEmails.add(cleanEmail);
    participants.push({
      email: cleanEmail,
      fullName: cleanName,
      role: defaultRole,
    });
  }

  return {
    participants,
    totalRows,
    duplicateCount,
  };
}
