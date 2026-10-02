import { DailyCompetition } from './types';

export const DAILY_COMPETITIONS: Record<number, DailyCompetition> = {
  1: {
    day: 1,
    type: 'reels',
    title: 'Quantum Tech Reels',
    subtitle: 'Day 1 Creative Communication Sprint',
    description:
      'Distill complex quantum computing concepts into an engaging 45–90 second short-form video or technical reel. Explain superposition, entanglement, or qubit connectivity with visual flair and scientific clarity.',
    guidelines: [
      'Duration: 45 to 90 seconds in vertical format (9:16).',
      'Topics: Qubit superposition, entanglement, quantum gates, or physical processor connectivity.',
      'Evaluation: Scientific accuracy (40%), visual clarity & storytelling (30%), creativity & production (30%).',
      'Accepted platforms: YouTube Shorts, Instagram Reels, LinkedIn Video, or public Google Drive/OneDrive link.',
      'Make sure the video or link is set to Public or Anyone with the link can view.',
    ],
    submissionType: 'url',
    urlPlaceholder: 'https://youtube.com/shorts/... or https://instagram.com/reel/...',
    submissionDeadline: '08 October 2026, 11:59 PM IST',
  },
  2: {
    day: 2,
    type: 'poster',
    title: 'Digital Poster Creation',
    subtitle: 'Day 2 Visual Concept & Scientific Poster Competition',
    description:
      'Design an infographic or academic digital poster illustrating breakthroughs in Quantum Materials, Quantum Sensing, or Quantum Optics. Combine scientific diagrams, technical schematics, and clear explanatory text.',
    guidelines: [
      'Format: High-resolution digital poster (PNG, PDF, or SVG) formatted in standard 16:9 or A1/A2 ratio.',
      'Core Theme: Quantum Materials (topological insulators, superconductors) OR Quantum Sensing (NV centers, metrology).',
      'Evaluation: Conceptual precision (40%), information architecture (30%), visual composition (30%).',
      'Accepted hosts: Canva link, Figma view link, Google Drive, Dropbox, or public image URL.',
      'Ensure the link has open view permissions for the jury evaluation panel.',
    ],
    submissionType: 'url',
    urlPlaceholder: 'https://canva.com/design/... or https://drive.google.com/file/...',
    submissionDeadline: '09 October 2026, 11:59 PM IST',
  },
  3: {
    day: 3,
    type: 'essay',
    title: 'Essay Competition',
    subtitle: 'Day 3 Critical Perspectives on Quantum Frontiers',
    description:
      'Author a structured 800–1200 word essay analyzing the societal, cryptographic, or algorithmic implications of Quantum Machine Learning or Post-Quantum Cryptography transitions.',
    guidelines: [
      'Length: 800 to 1200 words in clean academic prose.',
      'Prompts: (A) The Post-Quantum Cryptographic Migration: Balancing Vulnerability and Readiness, OR (B) Quantum Machine Learning: Fundamental Advantage vs Classical Baseline Realities.',
      'Evaluation: Logical coherence & argumentation (40%), technical depth (35%), clarity & citations (25%).',
      'Accepted formats: Public Google Docs link (view access), Notion page, or PDF link.',
      'Include author name, institutional affiliation, and references/citations at the bottom.',
    ],
    submissionType: 'url',
    urlPlaceholder: 'https://docs.google.com/document/d/... (ensure link is set to Anyone with link can view)',
    submissionDeadline: '10 October 2026, 11:59 PM IST',
  },
};
