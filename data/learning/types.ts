export interface Speaker {
  name: string;
  role: string;
  institution: string;
  avatarUrl?: string;
  bio: string;
  websiteUrl?: string;
  profileUrl?: string;
}

export interface LectureSession {
  id: string; // 'session-1', etc.
  day: 1 | 2 | 3;
  sessionNumber: number;
  title: string;
  dateStr: string;
  timeStr: string;
  duration: string;
  youtubeId: string; // Youtube video embed ID
  youtubeUrl: string;
  speaker: Speaker;
  coSpeakers?: Speaker[];
  description: string;
  prerequisites: string;
  learnPoints: string[];
  lectureNotesUrl?: string;
  slidesUrl?: string;
  liveMeetingUrl?: string;
  isLive?: boolean;
  liveNotice?: string;
  customEmbedUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SessionQuiz {
  sessionId: string;
  title: string;
  passingScore: number; // e.g. 75%
  questions: QuizQuestion[];
}

export interface DailyCompetition {
  day: 1 | 2 | 3;
  type: 'reels' | 'poster' | 'essay';
  title: string;
  subtitle: string;
  description: string;
  guidelines: string[];
  submissionType: 'url' | 'document';
  urlPlaceholder: string;
  submissionDeadline: string;
}

export type VerticalType =
  | 'Quantum Chemistry'
  | 'Quantum Optimization'
  | 'Quantum Simulation'
  | 'Quantum Machine Learning'
  | 'Post-Quantum Cryptography';

export interface ProblemStatement {
  id: string; // 'PS-C1', 'PS-O2', etc.
  vertical: VerticalType;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  mathematicalFormulation: string;
  quantumFormulation: string;
  hardwareSpecs: {
    processorA: string;
    processorB: string;
    processorC: string;
  };
  processorDTask: string;
  deliverables: string[];
  evaluationRubric: {
    componentA: string; // 40 pts
    componentB: string; // 30 pts
    componentC: string; // 30 pts
  };
}

export interface UserProgressRecord {
  sessionId: string;
  videoCompleted: boolean;
  quizScore: number;
  quizPassed: boolean;
  quizAttempts: number;
  completedAt?: string;
}

export interface TeamMemberRecord {
  id: string;
  teamId: string;
  email: string;
  fullName: string;
  role: 'leader' | 'member';
  status: 'invited' | 'accepted' | 'declined';
  invitedAt: string;
  respondedAt?: string;
}

export interface HackathonTeamRecord {
  id: string;
  name: string;
  leadEmail: string;
  leadName: string;
  vertical: VerticalType;
  problemStatementId: string;
  githubRepoUrl?: string;
  submissionNotes?: string;
  submittedAt?: string;
  createdAt: string;
  members?: TeamMemberRecord[];
}
