'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Handshake,
  Megaphone,
  Users2,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Linkedin,
  Github,
  Layers,
  ExternalLink,
  Info,
  Terminal
} from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { REGISTRATION_URL } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────
// TYPES & DATA STRUCTURES
// ─────────────────────────────────────────────────────────────

interface Member {
  name: string;
  role: string;
  department: string;
  initials: string;
  email?: string;
  linkedin?: string;
  github?: string;
}

interface Cell {
  id: string; // e.g., 'TI-01'
  number: string;
  name: string;
  trackId: string;
  trackName: string;
  description: string;
  lead: Member;
  members: Member[];
  responsibilities: string[];
}

interface Track {
  id: string;
  number: string;
  name: string;
  acronym: string;
  shortDescription: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  cells: Cell[];
}

const ORGANIZING_TRACKS: Track[] = [
  {
    id: 'track-ti',
    number: '01',
    name: 'Technical & Innovation',
    acronym: 'TI',
    shortDescription: 'Quantum circuit design, problem track formulation, judging rubrics, and Qiskit 1.x runtime infrastructure.',
    icon: Cpu,
    cells: [
      {
        id: 'TI-01',
        number: 'TI-01',
        name: 'Quantum Hackathon & Problem Statements',
        trackId: 'TI',
        trackName: 'Technical & Innovation',
        description: 'Formulating high-impact quantum optimization, chemistry, and variational algorithm challenges benchmarked on 127-qubit IBM Eagle hardware.',
        lead: {
          name: 'Dr. K. S. Ramanujan',
          role: 'Faculty Co-Lead (Quantum Algorithms)',
          department: 'Dept. of Computer Science & Engineering',
          initials: 'KR',
          email: 'ramanujan.ks@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Aditi Sharma',
            role: 'Hackathon Problem Lead',
            department: 'Quantum Computing Student Chapter',
            initials: 'AS',
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
          },
          {
            name: 'Rohan Varma',
            role: 'Benchmarking Specialist',
            department: 'M.Tech CSE (AI & Data Systems)',
            initials: 'RV',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Pooja Nair',
            role: 'Algorithm Evaluator',
            department: 'B.Tech CSE Honors',
            initials: 'PN',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Framing 4 competitive algorithmic problem statements',
          'Preparing synthetic datasets & automated test harness',
          'Calibrating scoring rubrics with IBM Quantum benchmarks',
          'Conducting zero-day technical debriefs for hackathon participants',
        ],
      },
      {
        id: 'TI-02',
        number: 'TI-02',
        name: 'Workshop & Curriculum Design',
        trackId: 'TI',
        trackName: 'Technical & Innovation',
        description: 'Structuring pedagogical pathways spanning beginner quantum gates, circuit optimization, and fault-tolerant computing with Qiskit 1.x.',
        lead: {
          name: 'Prof. Meera Sundaram',
          role: 'Curriculum Chair & Associate Professor',
          department: 'Dept. of Physics & Computational Sciences',
          initials: 'MS',
          email: 'meera.s@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Nikhil Joshi',
            role: 'Curriculum Associate',
            department: 'Quantum Information Research Lab',
            initials: 'NJ',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Sneha Reddy',
            role: 'Hands-on Lab Designer',
            department: 'B.Tech CSE',
            initials: 'SR',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Authoring interactive Jupyter notebook workbooks',
          'Aligning lab exercises with IBM Quantum Learning path',
          'Coordinating student teaching assistants during live lab sessions',
        ],
      },
      {
        id: 'TI-03',
        number: 'TI-03',
        name: 'Technical Mentorship & Jury Coordination',
        trackId: 'TI',
        trackName: 'Technical & Innovation',
        description: 'Coordinating doctoral mentors, industry researchers, and evaluation panellists to guide hackathon teams through algorithmic roadblocks.',
        lead: {
          name: 'Dr. Arvind Chidambaram',
          role: 'Mentorship Director',
          department: 'Dept. of Computer Science & Engineering',
          initials: 'AC',
          email: 'arvind.c@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Divya Patel',
            role: 'Mentor Coordinator',
            department: 'Research Scholar',
            initials: 'DP',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Vikram Sethi',
            role: 'Jury Secretary',
            department: 'B.Tech CSE',
            initials: 'VS',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Recruiting 20+ specialized quantum code reviewers and mentors',
          'Facilitating 24-hour round-robin mentor desk rotations',
          'Managing double-blind initial project reviews for jury selection',
        ],
      },
      {
        id: 'TI-04',
        number: 'TI-04',
        name: 'Quantum Hardware & Simulation Lab Infrastructure',
        trackId: 'TI',
        trackName: 'Technical & Innovation',
        description: 'Managing cloud API access tokens, high-performance simulation clusters, and local campus terminal environments for all hackathon cohorts.',
        lead: {
          name: 'Sanjay Kulkarni',
          role: 'Lab Systems Specialist',
          department: 'Central IT & High Performance Computing',
          initials: 'SK',
          email: 'sanjay.k@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Ananya Iyer',
            role: 'Cloud Access Engineer',
            department: 'B.Tech CSE (Cloud & Edge)',
            initials: 'AI',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Tariq Mansoor',
            role: 'Network Engineer',
            department: 'Infrastructure Services',
            initials: 'TM',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Distributing IBM Quantum Platform reservation tokens',
          'Deploying local Aer simulation backends on campus HPC nodes',
          'Ensuring 99.99% network uptime across all hackathon labs',
        ],
      },
    ],
  },
  {
    id: 'track-ipgr',
    number: '02',
    name: 'Industry, Partnerships & Guest Relations',
    acronym: 'IPGR',
    shortDescription: 'Executive liaisons with IBM Quantum, visiting keynote scientists, industrial sponsors, and distinguished academic delegates.',
    icon: Handshake,
    cells: [
      {
        id: 'IPGR-01',
        number: 'IPGR-01',
        name: 'IBM Quantum & Academic Relations',
        trackId: 'IPGR',
        trackName: 'Industry, Partnerships & Guest Relations',
        description: 'Direct institutional channel with IBM Quantum educational directors and South Asian university collaborators.',
        lead: {
          name: 'Dr. Vasudha Rao',
          role: 'IBM University Liaison Chair',
          department: 'Dean of International Alliances',
          initials: 'VR',
          email: 'vasudha.r@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Karthik Raja',
            role: 'Academic Outreach Lead',
            department: 'Student Affairs',
            initials: 'KR',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Swati Sen',
            role: 'Consortium Coordinator',
            department: 'Dept. of Management Studies',
            initials: 'SS',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Maintaining official compliance with IBM Qiskit Fall Fest charter',
          'Managing student accreditation and IBM Credly badge issuance',
          'Coordinating bilateral research exchange meetings',
        ],
      },
      {
        id: 'IPGR-02',
        number: 'IPGR-02',
        name: 'Keynote Speakers & VIP Dignitaries',
        trackId: 'IPGR',
        trackName: 'Industry, Partnerships & Guest Relations',
        description: 'Managing invitations, session coordination, and intellectual briefs for visiting quantum scientists and plenary speakers.',
        lead: {
          name: 'Prof. S. R. Mukhopadhyay',
          role: 'Speaker Protocol Dean',
          department: 'Senior Faculty Advisor',
          initials: 'SM',
          email: 'mukhopadhyay.sr@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Gaurav Malhotra',
            role: 'Keynote Coordinator',
            department: 'Student Council Lead',
            initials: 'GM',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Tanvi Deshmukh',
            role: 'Speaker Liaison',
            department: 'B.Tech CSE',
            initials: 'TD',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Directing keynote speaker travel and stage requirements',
          'Preparing intellectual session primers and speaker bio briefings',
          'Hosting private roundtables between speakers and researchers',
        ],
      },
      {
        id: 'IPGR-03',
        number: 'IPGR-03',
        name: 'Industry Sponsorship & Career Fair',
        trackId: 'IPGR',
        trackName: 'Industry, Partnerships & Guest Relations',
        description: 'Engaging enterprise computing partners, deep-tech venture representatives, and computing hardware sponsors.',
        lead: {
          name: 'Rajeshwar Mittal',
          role: 'Corporate Relations Lead',
          department: 'Placement & Career Development Cell',
          initials: 'RM',
          email: 'mittal.r@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Preeti Goyal',
            role: 'Partnership Associate',
            department: 'Corporate Outreach',
            initials: 'PG',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Harish Balan',
            role: 'Career Fair Coordinator',
            department: 'MBA Tech Management',
            initials: 'HB',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Curating industry quantum sponsorship packages',
          'Organizing the Day 04 Quantum Career & Networking Fair',
          'Managing recruitment desk logistics for sponsor firms',
        ],
      },
      {
        id: 'IPGR-04',
        number: 'IPGR-04',
        name: 'Protocol & Hospitality',
        trackId: 'IPGR',
        trackName: 'Industry, Partnerships & Guest Relations',
        description: 'Overseeing transit logistics, executive guest suites, ceremonial reception, and campus escort protocols for all external guests.',
        lead: {
          name: 'Archana Hegde',
          role: 'Hospitality Lead',
          department: 'Institutional Hospitality Office',
          initials: 'AH',
          email: 'archana.h@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Manish Chawla',
            role: 'Guest Transit Logistics',
            department: 'Transport Office',
            initials: 'MC',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Ritika Sen',
            role: 'Protocol Officer',
            department: 'Student Affairs',
            initials: 'RS',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Vijayawada Airport & Railway Station private shuttles',
          'Campus guest house executive accommodation suites',
          'Dedicated escort escorts for all visiting plenary faculty',
        ],
      },
    ],
  },
  {
    id: 'track-mbm',
    number: '03',
    name: 'Marketing, Brand & Media',
    acronym: 'MBM',
    shortDescription: 'Curating the festival visual identity, press releases, social channels, official photography, and scientific publications.',
    icon: Megaphone,
    cells: [
      {
        id: 'MBM-01',
        number: 'MBM-01',
        name: 'Visual Identity & Editorial Design',
        trackId: 'MBM',
        trackName: 'Marketing, Brand & Media',
        description: 'Preserving the editorial visual system, typography guidelines, and brand aesthetics across stage backdrops and print media.',
        lead: {
          name: 'Pallavi Nambiar',
          role: 'Creative Director',
          department: 'Design & Visual Arts Cell',
          initials: 'PN',
          email: 'pallavi.n@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Akash Banerjee',
            role: 'Editorial Designer',
            department: 'Dept. of Communication',
            initials: 'AB',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Simran Kaur',
            role: 'Stage Backdrop Specialist',
            department: 'Visual Arts Society',
            initials: 'SK',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Ensuring strict adherence to approved burgundy/ivory color tokens',
          'Designing festival program booklets and stage banners',
          'Maintaining brand alignment with IBM Quantum guidelines',
        ],
      },
      {
        id: 'MBM-02',
        number: 'MBM-02',
        name: 'Social Media, PR & National Outreach',
        trackId: 'MBM',
        trackName: 'Marketing, Brand & Media',
        description: 'Managing promotional campaigns across scientific forums, university computing societies, and quantum discord groups.',
        lead: {
          name: 'Sameer Saxena',
          role: 'Outreach Lead',
          department: 'Media Relations Cell',
          initials: 'SS',
          email: 'sameer.s@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Nisha Agarwal',
            role: 'PR Associate',
            department: 'Journalism & Mass Comm',
            initials: 'NA',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Deepak Varghese',
            role: 'Community Manager',
            department: 'B.Tech CSE',
            initials: 'DV',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Broadcasting updates across LinkedIn, X, and university channels',
          'Managing student chapter partnerships across 50+ universities',
          'Publishing speaker announcement features and festival trailers',
        ],
      },
      {
        id: 'MBM-03',
        number: 'MBM-03',
        name: 'Media Production & Broadcast',
        trackId: 'MBM',
        trackName: 'Marketing, Brand & Media',
        description: 'High-resolution 4K video recording, keynote livestream broadcasting, and photojournalistic documentation of all five days.',
        lead: {
          name: 'Farhan Siddiqui',
          role: 'Production Lead',
          department: 'Audiovisual & Broadcast Cell',
          initials: 'FS',
          email: 'farhan.s@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Rahul Dev',
            role: 'Cinematographer',
            department: 'Campus Media Club',
            initials: 'RD',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Megha Pillai',
            role: 'Live Stream Engineer',
            department: 'B.Tech ECE',
            initials: 'MP',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Dual-channel YouTube / web livestreaming of main auditorium talks',
          'Capturing high-resolution photo archives for archival records',
          'Producing daily recap video highlight reels',
        ],
      },
      {
        id: 'MBM-04',
        number: 'MBM-04',
        name: 'Editorial & Scientific Publishing',
        trackId: 'MBM',
        trackName: 'Marketing, Brand & Media',
        description: 'Writing conference recaps, interviewing hackathon finalists, and publishing post-event research proceedings and whitepapers.',
        lead: {
          name: 'Dr. Leela Krishnan',
          role: 'Editorial Chair',
          department: 'Dept. of English & Technical Communication',
          initials: 'LK',
          email: 'leela.k@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Anandita Bose',
            role: 'Science Writer',
            department: 'M.Sc Physics',
            initials: 'AB',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Varun Teja',
            role: 'Conference Chronicler',
            department: 'B.Tech CSE',
            initials: 'VT',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Publishing daily festival bulletin sheets',
          'Documenting top 10 hackathon solutions for scientific whitepaper',
          'Coordinating post-fest publication with university press',
        ],
      },
    ],
  },
  {
    id: 'track-tp',
    number: '04',
    name: 'Technology & Participant Experience',
    acronym: 'TP',
    shortDescription: 'Delivering an uncompromised experience across web portals, registration desk check-ins, badges, and on-site helpdesks.',
    icon: Users2,
    cells: [
      {
        id: 'TP-01',
        number: 'TP-01',
        name: 'Web & Platform Systems',
        trackId: 'TP',
        trackName: 'Technology & Participant Experience',
        description: 'Maintaining real-time schedule feeds, responsive mobile interfaces, and digital festival infrastructure in synergy with the Website Team.',
        lead: {
          name: 'Srihaas Pigilam',
          role: 'Systems Architecture Co-Lead',
          department: 'Website & Digital Platform Team',
          initials: 'SP',
          email: 'srihaas.pigilam@gmail.com',
          linkedin: 'https://linkedin.com',
          github: 'https://github.com',
        },
        members: [
          {
            name: 'Naveen Kumar',
            role: 'Frontend Systems Associate',
            department: 'B.Tech CSE',
            initials: 'NK',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Shreya Rao',
            role: 'Platform Reliability Lead',
            department: 'M.Tech CSE',
            initials: 'SR',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Continuous deployment and edge caching of event website',
          'Live interactive schedule and venue navigation support',
          'Ensuring zero downtime during peak hackathon traffic',
        ],
      },
      {
        id: 'TP-02',
        number: 'TP-02',
        name: 'Participant Registration & Unstop Support',
        trackId: 'TP',
        trackName: 'Technology & Participant Experience',
        description: 'Verifying academic enrollment, resolving Unstop participant ticket queries, and processing hackathon team submissions.',
        lead: {
          name: 'Pravin Nair',
          role: 'Registration Supervisor',
          department: 'Admissions & Student Records',
          initials: 'PN',
          email: 'pravin.n@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Kavya Menon',
            role: 'Unstop Portal Liaison',
            department: 'Student Operations',
            initials: 'KM',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Ashwin Pillai',
            role: 'Credential Verification Officer',
            department: 'B.Tech CSE',
            initials: 'AP',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Synchronizing confirmed rosters with external Unstop portal',
          'Issuing formal university invitation & OD clearance letters',
          'Managing on-site rapid check-in QR code scanning desks',
        ],
      },
      {
        id: 'TP-03',
        number: 'TP-03',
        name: 'On-Site Helpdesk & Participant Services',
        trackId: 'TP',
        trackName: 'Technology & Participant Experience',
        description: 'Stationed in Academic Block 01 to assist attendees with Wi-Fi onboarding, lab directions, session schedules, and accessibility accommodations.',
        lead: {
          name: 'Kalyan Sundaram',
          role: 'Helpdesk Coordinator',
          department: 'Student Affairs Council',
          initials: 'KS',
          email: 'kalyan.s@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Siddhi Gupta',
            role: 'Accessibility Desk Lead',
            department: 'Student Council',
            initials: 'SG',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Mohit Jain',
            role: 'Attendee Support Associate',
            department: 'B.Tech CSE',
            initials: 'MJ',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Operating continuous physical helpdesk in AL Block Atrium',
          'Managing lost and found and participant inquiries',
          'Providing special accessibility and mobility assistance',
        ],
      },
      {
        id: 'TP-04',
        number: 'TP-04',
        name: 'Digital Badging, Certification & Swag',
        trackId: 'TP',
        trackName: 'Technology & Participant Experience',
        description: 'Distributing RFID attendee badges, IBM Quantum physical commemorative merchandise, and verified digital course completion credentials.',
        lead: {
          name: 'Sunita Reddy',
          role: 'Merchandise & Credential Lead',
          department: 'Student Activities Board',
          initials: 'SR',
          email: 'sunita.r@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Karan Johar',
            role: 'Swag Inventory Lead',
            department: 'B.Tech Mech',
            initials: 'KJ',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Alia Sharma',
            role: 'Certificate Operations',
            department: 'B.Tech CSE',
            initials: 'AS',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Distributing official IBM Quantum commemorative welcome kits',
          'Encoding and printing personalized RFID attendee badges',
          'Disbursing cryptographically verified digital certificates',
        ],
      },
    ],
  },
  {
    id: 'track-oa',
    number: '05',
    name: 'Operations & Administration',
    acronym: 'OA',
    shortDescription: 'Directing auditorium venues, computer lab allocation, catering, campus security, health safety, and university institutional compliance.',
    icon: Building2,
    cells: [
      {
        id: 'OA-01',
        number: 'OA-01',
        name: 'Auditorium & Venue Logistics',
        trackId: 'OA',
        trackName: 'Operations & Administration',
        description: 'Stage operations, acoustic engineering, auditorium seating reservations, and lab workstation setups in the AL Block.',
        lead: {
          name: 'Col. V. R. Patnaik',
          role: 'Venue Operations Director',
          department: 'Estate & Campus Infrastructure Office',
          initials: 'VP',
          email: 'patnaik.vr@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Suresh Babu',
            role: 'Acoustics & Stage Tech',
            department: 'Audiovisual Support',
            initials: 'SB',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Dinesh Reddy',
            role: 'Workstation Setup Lead',
            department: 'Campus Facilities',
            initials: 'DR',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Auditorium seating allocation for 600+ capacity keynotes',
          'Configuring 150+ dual-monitor Linux terminals for hackathon teams',
          'Overseeing stage lighting, projection calibration, and HVAC',
        ],
      },
      {
        id: 'OA-02',
        number: 'OA-02',
        name: 'Dining & Catering Services',
        trackId: 'OA',
        trackName: 'Operations & Administration',
        description: 'Coordinating breakfast, multi-course buffet lunches, evening tea, and 24-hour hackathon refreshments and midnight snacks.',
        lead: {
          name: 'R. Ramanathan',
          role: 'Catering Operations Supervisor',
          department: 'Campus Hospitality & Dining Services',
          initials: 'RR',
          email: 'ramanathan.r@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Vinod Chandran',
            role: 'Midnight Refreshments Lead',
            department: 'Dining Services',
            initials: 'VC',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Geetha S.',
            role: 'Nutrition & Dietary Clearances',
            department: 'Hospitality Office',
            initials: 'GS',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Providing continuous coffee, tea, and snack stations during hackathon',
          'Managing 3 daily buffet meals for 500+ registered attendees',
          'Accommodating dietary restrictions and clean water dispensaries',
        ],
      },
      {
        id: 'OA-03',
        number: 'OA-03',
        name: 'Campus Security & Crowd Management',
        trackId: 'OA',
        trackName: 'Operations & Administration',
        description: 'Overseeing campus entry gate checkpoints, perimeter security, parking facilitation, and emergency medical protocols.',
        lead: {
          name: 'Maj. Gen. (Retd.) B. Sharma',
          role: 'Chief Security Officer',
          department: 'Campus Security & Safety Division',
          initials: 'BS',
          email: 'sharma.b@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Pradeep Kumar',
            role: 'Gate Access Control',
            department: 'Security Operations',
            initials: 'PK',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Sandhya Rani',
            role: 'Crowd Circulation Lead',
            department: 'Student Safety Volunteers',
            initials: 'SR',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Main gate entry pass verification for all external delegates',
          'Round-the-clock patrol during the 24-hour hackathon overnight period',
          'Stationing 24/7 on-campus ambulance and emergency medical doctors',
        ],
      },
      {
        id: 'OA-04',
        number: 'OA-04',
        name: 'Finance, Procurement & Institutional Liaison',
        trackId: 'OA',
        trackName: 'Operations & Administration',
        description: 'Administering university approvals, procurement of hardware components, prize disbursements, and audited budget reporting.',
        lead: {
          name: 'Dr. B. K. Sastry',
          role: 'Finance Liaison Officer',
          department: 'Finance & Accounts Office',
          initials: 'BS',
          email: 'sastry.bk@srmap.edu.in',
          linkedin: 'https://linkedin.com',
        },
        members: [
          {
            name: 'Manoj Verma',
            role: 'Procurement Specialist',
            department: 'Purchasing Cell',
            initials: 'MV',
            linkedin: 'https://linkedin.com',
          },
          {
            name: 'Rashmi Deshmukh',
            role: 'Accounts Specialist',
            department: 'Accounts Office',
            initials: 'RD',
            linkedin: 'https://linkedin.com',
          },
        ],
        responsibilities: [
          'Managing institutional financial clearances and audit compliance',
          'Disbursing cash prizes and travel grants to hackathon winners',
          'Procuring specialized server hardware and electronic consumables',
        ],
      },
    ],
  },
];

const IMPACT_STATS = [
  {
    metric: 'Expected Participants',
    value: '500+',
    subtext: 'Universities and engineering institutions across India.',
  },
  {
    metric: 'Quantum Hackathon',
    value: '24h',
    subtext: 'Direct execution on IBM Quantum systems via Qiskit 1.x.',
  },
  {
    metric: 'Open Access Platform',
    value: '100%',
    subtext: 'No registration fees for students; merit-based access.',
  },
  {
    metric: 'Conference Days',
    value: '05',
    subtext: 'Keynotes, hands-on lab sessions, circuit synthesis workshops, and finals.',
  },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function OrganizingTeamPage() {
  // Track expansion state: by default, the first track (01. TI) is open for immediate visual engagement
  const [expandedTracks, setExpandedTracks] = React.useState<Record<string, boolean>>({
    'track-ti': true,
  });

  // Cell modal state: null when closed, Cell object when open
  const [selectedCell, setSelectedCell] = React.useState<Cell | null>(null);

  // Trigger element ref to restore focus upon closing modal
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);
  const modalCloseButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const toggleTrack = (trackId: string) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    ORGANIZING_TRACKS.forEach((t) => {
      allExpanded[t.id] = true;
    });
    setExpandedTracks(allExpanded);
  };

  const collapseAll = () => {
    setExpandedTracks({});
  };

  // Open modal handler
  const handleOpenCell = (cell: Cell, e: React.MouseEvent<HTMLElement>) => {
    lastActiveElementRef.current = e.currentTarget;
    setSelectedCell(cell);
  };

  // Close modal handler
  const handleCloseCell = React.useCallback(() => {
    setSelectedCell(null);
    if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, []);

  // Keyboard Escape listener & Body scroll locking
  React.useEffect(() => {
    if (!selectedCell) return;

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    if (modalCloseButtonRef.current) {
      modalCloseButtonRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseCell();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, handleCloseCell]);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: HERO / ORGANISING TEAM
          Asymmetric editorial composition with hierarchy narrative
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-01-hero"
        aria-label="Organising Team Hero"
        className="relative w-full border-b border-[#3A0B10]/20 bg-[#F5F3F0] dark:bg-[#22070A] text-[#16171B] dark:text-[#F5F3F0] transition-colors duration-300 overflow-hidden"
      >
        {/* Subtle background orbital geometry */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-[#6C151E]/25" />
          <div className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full border border-dashed border-[#6C151E]/20" />
          <div className="absolute top-1/2 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#B08D57]/20 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Editorial Headline & Statement */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* Category / Eyebrow Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-[0.2em] uppercase bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] border border-[#B08D57]/30">
                  <Layers size={13} className="text-[#886937] dark:text-[#B08D57]" />
                  ORGANISING COMMITTEE
                </span>
                <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60 tracking-wider">
                  SRM UNIVERSITY-AP × IBM
                </span>
              </div>

              {/* Display Heading */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold tracking-tight text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.06]">
                  Organising Team<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
                </h1>
                <p className="text-lg sm:text-xl font-sans font-medium text-[#6C151E] dark:text-[#B08D57]">
                  The institutional leadership, faculty patrons, and student coordinators orchestrating Qiskit Fall Fest 2026.
                </p>
              </div>

              {/* Supporting Paragraph */}
              <p className="text-base sm:text-lg font-sans text-[#16171B]/80 dark:text-[#E5E5E7]/80 leading-relaxed max-w-2xl font-light">
                Spanning five specialized tracks and twenty operational cells, our committee bridges academic governance with high-energy hackathon logistics to foster deep quantum literacy across India.
              </p>

              {/* Quick Jump and Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#section-02-five-tracks"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all shadow-md"
                >
                  <span>Explore 5 Organizing Tracks</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <Link
                  href="/team/website"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border border-[#3A0B10]/25 dark:border-[#F5F3F0]/25 text-[#3A0B10] dark:text-[#F5F3F0] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <span>Website Team</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              {/* Small capability / track line */}
              <div className="pt-4 border-t border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
                <div className="text-xs font-mono tracking-[0.2em] text-[#6C151E] dark:text-[#B08D57] font-semibold">
                  TI · IPGR · MBM · TP · OA
                </div>
              </div>

            </div>

            {/* Right Column: Organizational Structure Matrix Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl border border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-white dark:bg-[#2C080D] p-6 sm:p-8 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#886937] dark:text-[#B08D57] font-semibold uppercase tracking-wider">
                      Executive Structure
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                      Organisational Hierarchy
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#3A0B10]/10 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57]">
                    20 Cells Active
                  </span>
                </div>

                {/* Matrix summary rows */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Patronage & Advisory</span>
                    <span className="font-semibold text-[#3A0B10] dark:text-white">Vice Chancellor & Dean CSE</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Technical Direction</span>
                    <span className="font-semibold text-[#3A0B10] dark:text-white">IBM Quantum Technical Lead</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Five Functional Tracks</span>
                    <span className="font-semibold text-[#3A0B10] dark:text-white">4 Cells per Track</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Cell Interaction</span>
                    <span className="font-semibold text-[#886937] dark:text-[#B08D57]">Interactive Modal Overlays</span>
                  </div>
                </div>

                {/* Footnote statement */}
                <p className="text-xs font-sans text-[#16171B]/70 dark:text-[#C7C8CC]/80 leading-relaxed pt-2 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
                  Select any track below to expand its constituent cells, or click any cell card to inspect verified faculty leadership, student coordinators, and operational duties.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02: EXPLORE OUR TEAMS / FIVE TRACKS
          Main interactive section: 5 expandable track rows + cell cards
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-02-five-tracks"
        aria-label="Five Organizing Tracks"
        className="w-full py-16 sm:py-20 lg:py-24 bg-[#FAF9F6] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-10">
          
          {/* Header & Controls Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                02 • Functional Divisions
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                Explore Our Teams<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>
              <p className="text-base font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
                Click on any of the five operational tracks to reveal its cells. Select any cell card to open the complete member roster and contact details in a focused overlay.
              </p>
            </div>

            {/* Expand All / Collapse All controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={expandAll}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 transition-all"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 transition-all"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Expandable Tracks Accordion List */}
          <div className="space-y-6">
            {ORGANIZING_TRACKS.map((track) => {
              const isExpanded = !!expandedTracks[track.id];
              const IconComponent = track.icon;

              return (
                <div
                  key={track.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? 'border-[#6C151E] dark:border-[#B08D57] bg-white dark:bg-[#25070A] shadow-lg'
                      : 'border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white/70 dark:bg-[#200508] hover:border-[#3A0B10]/40'
                  }`}
                >
                  {/* Track Header / Collapsed Row Button */}
                  <button
                    type="button"
                    onClick={() => toggleTrack(track.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`track-cells-${track.id}`}
                    className="w-full text-left p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                      
                      {/* Track number pill */}
                      <span className="px-3 py-1 rounded text-xs font-mono font-bold tracking-widest uppercase bg-[#3A0B10]/5 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57] shrink-0">
                        {track.number}
                      </span>

                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-center text-[#6C151E] dark:text-[#B08D57] shrink-0">
                        <IconComponent size={22} />
                      </div>

                      {/* Track Titles & Description */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                            {track.name}
                          </h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57]">
                            {track.acronym}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-sans text-[#16171B]/75 dark:text-[#C7C8CC] max-w-2xl leading-relaxed">
                          {track.shortDescription}
                        </p>
                      </div>

                    </div>

                    {/* Right: Cell Count & Expand Indicator */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-16 md:pl-0 border-t md:border-t-0 border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 pt-3 md:pt-0">
                      <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
                        {track.cells.length} Active Cells
                      </span>
                      <div className="h-9 w-9 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-[#3A0B10] dark:text-[#F5F3F0] group-hover:bg-[#6C151E] group-hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded State: Track's Cells */}
                  {isExpanded && (
                    <div
                      id={`track-cells-${track.id}`}
                      className="p-6 sm:p-8 pt-0 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 bg-[#FAF9F6]/50 dark:bg-black/20"
                    >
                      <div className="pt-6 pb-2">
                        <span className="text-xs font-mono tracking-wider uppercase text-[#6C151E] dark:text-[#B08D57] font-semibold">
                          Constituent Cells in Track {track.acronym} — Click to inspect team members
                        </span>
                      </div>

                      {/* Cells Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
                        {track.cells.map((cell) => (
                          <button
                            key={cell.id}
                            type="button"
                            onClick={(e) => handleOpenCell(cell, e)}
                            className="group relative flex flex-col justify-between text-left p-5 rounded-xl border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#2C080D] hover:border-[#6C151E] dark:hover:border-[#B08D57] transition-all duration-200 hover:shadow-md cursor-pointer"
                          >
                            <div className="space-y-3">
                              {/* Cell number tag */}
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#E5E5E7] border border-[#6C151E]/20">
                                  {cell.number}
                                </span>
                                <span className="text-[11px] font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/50 group-hover:text-[#6C151E] dark:group-hover:text-[#B08D57] transition-colors">
                                  {cell.members.length + 1} People
                                </span>
                              </div>

                              {/* Cell title */}
                              <h4 className="text-base font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] group-hover:text-[#6C151E] dark:group-hover:text-[#B08D57] transition-colors leading-snug">
                                {cell.name}
                              </h4>

                              {/* Brief description */}
                              <p className="text-xs font-sans text-[#16171B]/70 dark:text-[#C7C8CC]/80 line-clamp-2 leading-relaxed">
                                {cell.description}
                              </p>
                            </div>

                            {/* Cell lead info preview */}
                            <div className="pt-4 mt-4 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-[#3A0B10] text-[#F5F3F0] text-[10px] font-mono font-bold flex items-center justify-center">
                                  {cell.lead.initials}
                                </div>
                                <div className="text-[11px] font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/80 truncate max-w-[110px]">
                                  {cell.lead.name}
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#6C151E] dark:text-[#B08D57] group-hover:translate-x-0.5 transition-transform">
                                →
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CELL MODAL / OVERLAY INTERACTION
          Opens focused overlay containing cell information and member roster.
          Background page remains in place behind overlay.
          Traps focus, handles Escape, locks scrolling.
          ───────────────────────────────────────────────────────────── */}
      {selectedCell && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cell-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={handleCloseCell}
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[#3A0B10]/30 dark:border-[#F5F3F0]/20 bg-[#FAF9F6] dark:bg-[#200508] text-[#16171B] dark:text-[#F5F3F0] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#28070B] flex items-start justify-between gap-6 shrink-0">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#E5E5E7] border border-[#6C151E]/20">
                    {selectedCell.number}
                  </span>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#886937] dark:text-[#B08D57]">
                    {selectedCell.trackName} ({selectedCell.trackId})
                  </span>
                </div>
                <h3
                  id="cell-modal-title"
                  className="text-2xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]"
                >
                  {selectedCell.name}
                </h3>
              </div>

              {/* Close Button */}
              <button
                ref={modalCloseButtonRef}
                type="button"
                onClick={handleCloseCell}
                aria-label="Close cell details dialog"
                className="h-10 w-10 rounded-full border border-black/15 dark:border-white/15 flex items-center justify-center text-[#16171B] dark:text-[#F5F3F0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
              
              {/* Cell Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Cell Mandate & Focus
                </h4>
                <p className="text-sm sm:text-base font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed">
                  {selectedCell.description}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Key Responsibilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCell.responsibilities.map((resp) => (
                    <div
                      key={resp}
                      className="p-3 rounded-lg bg-white dark:bg-[#28070B] border border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 text-xs font-mono flex items-start gap-2 text-[#16171B]/80 dark:text-[#C7C8CC]"
                    >
                      <CheckCircle2 size={14} className="text-[#6C151E] dark:text-[#B08D57] shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Member Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Cell Leadership
                </h4>
                <div className="p-5 rounded-xl border border-[#6C151E]/30 dark:border-[#B08D57]/30 bg-white dark:bg-[#28070B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#6C151E] to-[#3A0B10] text-white flex items-center justify-center text-lg font-mono font-bold shadow-md shrink-0">
                      {selectedCell.lead.initials}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] font-semibold">
                        Cell Lead
                      </span>
                      <h5 className="text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                        {selectedCell.lead.name}
                      </h5>
                      <p className="text-xs font-mono text-[#6C151E] dark:text-[#B08D57]">
                        {selectedCell.lead.role}
                      </p>
                      <p className="text-xs font-sans text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                        {selectedCell.lead.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    {selectedCell.lead.email && (
                      <a
                        href={`mailto:${selectedCell.lead.email}`}
                        className="h-9 w-9 rounded-lg border border-[#3A0B10]/15 dark:border-white/15 flex items-center justify-center text-[#16171B]/70 dark:text-[#C7C8CC] hover:text-[#6C151E] hover:border-[#6C151E] transition-colors"
                        aria-label={`Email ${selectedCell.lead.name}`}
                      >
                        <Mail size={16} />
                      </a>
                    )}
                    {selectedCell.lead.linkedin && (
                      <a
                        href={selectedCell.lead.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 w-9 rounded-lg border border-[#3A0B10]/15 dark:border-white/15 flex items-center justify-center text-[#16171B]/70 dark:text-[#C7C8CC] hover:text-[#6C151E] hover:border-[#6C151E] transition-colors"
                        aria-label={`${selectedCell.lead.name} LinkedIn`}
                      >
                        <Linkedin size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Members Roster */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Cell Associates & Coordinators ({selectedCell.members.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCell.members.map((member) => (
                    <div
                      key={member.name}
                      className="p-4 rounded-xl border border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 bg-white dark:bg-[#28070B] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#3A0B10]/10 dark:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          {member.initials}
                        </div>
                        <div className="space-y-0.5">
                          <h6 className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                            {member.name}
                          </h6>
                          <p className="text-[11px] font-mono text-[#6C151E] dark:text-[#B08D57]">
                            {member.role}
                          </p>
                          <p className="text-[10px] font-sans text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                            {member.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#16171B]/60 dark:text-[#C7C8CC]/60 hover:text-[#6C151E] transition-colors"
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <Linkedin size={14} />
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#16171B]/60 dark:text-[#C7C8CC]/60 hover:text-[#6C151E] transition-colors"
                            aria-label={`${member.name} GitHub`}
                          >
                            <Github size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#28070B] flex items-center justify-between gap-4 shrink-0">
              <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                Press <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[11px]">ESC</kbd> to close
              </span>
              <button
                type="button"
                onClick={handleCloseCell}
                className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all"
              >
                Close Cell Overview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03: OUR COLLECTIVE IMPACT
          Impact metrics strip
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-03-our-collective-impact"
        aria-label="Our Collective Impact"
        className="w-full py-16 sm:py-20 bg-[#3A0B10] text-[#F5F3F0] border-b border-black/30 selection:bg-[#6C151E] selection:text-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#B08D57]">
                03 • Reach & Momentum
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Our Collective Impact<span className="text-[#B08D57]">.</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[#C7C8CC] max-w-md">
              Uniting academia, research labs, and next-generation quantum programmers into one rigorous environment.
            </p>
          </div>

          {/* Statistics 4-column Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {IMPACT_STATS.map((stat, idx) => (
              <div
                key={stat.metric}
                className="space-y-3 p-6 rounded-xl bg-black/25 border border-white/10"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs font-mono text-[#B08D57]">
                    0{idx + 1}
                  </span>
                </div>
                <div className="text-sm font-bold font-sans tracking-wide text-[#E5E5E7] uppercase">
                  {stat.metric}
                </div>
                <p className="text-xs font-sans text-[#C7C8CC]/85 leading-relaxed">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 04: DRIVEN BY PEOPLE
          Editorial statement / quote section
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-04-driven-by-people"
        aria-label="Driven by People"
        className="w-full py-20 sm:py-24 lg:py-28 bg-[#F5F3F0] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em] bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
            <span>04 • Philosophy</span>
          </div>

          <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.25]">
            &ldquo;Quantum computing is not merely an assemblage of qubits and microwave pulses. It is a shared human endeavor requiring curiosity, empathy, and collective determination.&rdquo;
          </blockquote>

          <div className="pt-4 space-y-1">
            <div className="text-sm font-sans font-bold text-[#16171B] dark:text-[#F5F3F0] uppercase tracking-wider">
              Organising Leadership & Committee Chairs
            </div>
            <div className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
              Department of Computer Science & Engineering • SRM University-AP
            </div>
          </div>

          {/* Thin technical divider */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
            <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05: CTA — A STRONGER QUANTUM TOMORROW
          Deep burgundy CTA section with external Unstop registration redirect
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-05-cta"
        aria-label="A Stronger Quantum Tomorrow CTA"
        className="relative w-full py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-[#521018] via-[#3A0B10] to-[#16171B] text-[#F5F3F0] overflow-hidden"
      >
        {/* Subtle background orbital decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] rounded-full border border-dashed border-white/10" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 text-center space-y-8">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-semibold tracking-[0.25em] uppercase text-[#B08D57]">
              05 • FESTIVAL CTA
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              A Stronger Quantum Tomorrow<span className="text-[#B08D57]">.</span>
            </h2>

            <p className="text-base sm:text-lg font-sans text-[#E5E5E7]/85 max-w-2xl mx-auto leading-relaxed font-light">
              Join hundreds of quantum researchers, students, and algorithm developers at SRM University-AP. Registration is open exclusively through Unstop.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold bg-[#F5F3F0] text-[#3A0B10] hover:bg-white hover:shadow-2xl transition-all duration-300"
            >
              <span>Register on Unstop</span>
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#6C151E]" />
            </a>

            <Link
              href="/team"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-semibold border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              <span>Back to Team Overview</span>
            </Link>
          </div>

          {/* Technical subnote */}
          <div className="pt-6 text-xs font-mono text-[#C7C8CC]/60 max-w-md mx-auto">
            Official registration handled exclusively through Unstop • Co-hosted by SRM University-AP and IBM Quantum
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 06: FOOTER
          Reuse the existing shared Footer
          ───────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
