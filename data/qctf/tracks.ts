/**
 * Quantum Capture the Flag (QCTF): public metadata and types shared by the arena UI,
 * the admin console and the API routes.
 *
 * Nothing in this file is secret. Challenge statements and flag hashes live in the
 * qctf_challenges table and are served by /api/qctf/*; never add them here, because
 * this module ships in the browser bundle.
 */

export type QctfTrackId = 'qml' | 'qaoa' | 'pqc' | 'q-chemistry' | 'quantum-simulation';
export type QctfDifficulty = 'easy' | 'hard' | 'advanced';
export type QctfBlock = 'practice' | 'block_1' | 'block_2' | 'final';

/**
 * hidden: organizers only. rehearsal: organizers and testers. announced: eligible
 * players can enter, form teams and see released blocks. live: the round. frozen:
 * the public scoreboard stops at frozenAt while submissions continue. closed: read-only.
 */
export type QctfState = 'hidden' | 'rehearsal' | 'announced' | 'live' | 'frozen' | 'closed';

export interface QctfTrack {
  id: QctfTrackId;
  name: string;
  summary: string;
}

export const QCTF_TRACKS: QctfTrack[] = [
  { id: 'qml', name: 'Quantum Machine Learning', summary: 'Variational circuits, encodings and trainability.' },
  { id: 'qaoa', name: 'QAOA & Optimization', summary: 'Cost Hamiltonians, MaxCut and circuit depth.' },
  { id: 'pqc', name: 'Post-Quantum Cryptography', summary: 'Period finding, Grover search and lattice ideas.' },
  { id: 'q-chemistry', name: 'Quantum Chemistry', summary: 'Molecular Hamiltonians, mappings and VQE.' },
  { id: 'quantum-simulation', name: 'Quantum Simulation', summary: 'Time evolution, spin chains and open systems.' },
];

export const QCTF_DIFFICULTY_LABEL: Record<QctfDifficulty, string> = {
  easy: 'Easy',
  hard: 'Hard',
  advanced: 'Advanced',
};

export const QCTF_BLOCKS: { id: QctfBlock; label: string }[] = [
  { id: 'practice', label: 'Warm-up' },
  { id: 'block_1', label: 'Block I' },
  { id: 'block_2', label: 'Block II' },
  { id: 'final', label: 'Final window' },
];

export const QCTF_STATES: { id: QctfState; label: string; description: string }[] = [
  { id: 'hidden', label: 'Hidden', description: 'Only admins can open the arena.' },
  { id: 'rehearsal', label: 'Rehearsal', description: 'Admins and testers play. Participants see the locked screen.' },
  { id: 'announced', label: 'Announced', description: 'Eligible players can enter, form teams and solve released blocks.' },
  { id: 'live', label: 'Live', description: 'The competition round. Scoreboard updates in real time.' },
  { id: 'frozen', label: 'Frozen', description: 'Public scoreboard stops updating. Submissions still count.' },
  { id: 'closed', label: 'Closed', description: 'Submissions stop. Final standings are shown.' },
];

export const QCTF_MAX_TEAM_SIZE = 6;

export const QCTF_EVENT = {
  dateLabel: 'Tuesday, 27 October 2026',
  venue: 'ALC, SRM University-AP',
  windowLabel: '11:30 AM – 5:00 PM IST',
  flagFormat: 'qctf{...}',
};

export interface QctfChallengeSummary {
  id: string;
  trackId: QctfTrackId;
  title: string;
  summary: string;
  difficulty: QctfDifficulty;
  points: number;
  tags: string[];
  block: QctfBlock;
  /** False only for organizers looking at a block that is not released yet. */
  released: boolean;
  solved: boolean;
  solveCount: number;
}

export interface QctfAttachment {
  label: string;
  url: string;
}

export interface QctfChallengeDetail extends QctfChallengeSummary {
  statement: string;
  attachments: QctfAttachment[];
}

export interface QctfTeamView {
  id: string;
  name: string;
  joinCode: string;
  fromHackathon: boolean;
  members: { fullName: string; email: string }[];
  points: number;
  solvedCount: number;
}

export interface QctfMe {
  state: QctfState;
  run: string;
  isStaff: boolean;
  canEnter: boolean;
  canSubmit: boolean;
  releasedBlocks: QctfBlock[];
  team: QctfTeamView | null;
}

export interface QctfSubmitResult {
  correct: boolean;
  alreadySolved?: boolean;
  pointsAwarded?: number;
  message: string;
}

export interface QctfScoreboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  points: number;
  solvedCount: number;
  lastSolveAt: string | null;
}

export interface QctfScoreboard {
  state: QctfState;
  frozenAt: string | null;
  generatedAt: string;
  entries: QctfScoreboardEntry[];
  recentSolves: { teamName: string; challengeTitle: string; points: number; solvedAt: string }[];
}

export function getQctfTrack(id: string): QctfTrack | undefined {
  return QCTF_TRACKS.find((track) => track.id === id);
}

export function getQctfBlockLabel(id: QctfBlock): string {
  return QCTF_BLOCKS.find((block) => block.id === id)?.label ?? id;
}
