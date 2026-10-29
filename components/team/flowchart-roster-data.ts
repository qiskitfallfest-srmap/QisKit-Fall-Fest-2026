import { CoverflowSlide } from '@/components/ui/coverflow-carousel';

export const GENERIC_PERSON_AVATAR = '/logo-icon-person-on-white-background-free-vector.webp';

export interface FlowchartModalData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  linkHref?: string;
  linkText?: string;
  slides: CoverflowSlide[];
}

export const FLOWCHART_ROSTER_DATA: Record<string, FlowchartModalData> = {
  // ─────────────────────────────────────────────────────────────
  // LEVEL 01 & 02: ROOT / CORE ORGANIZING TEAM
  // ─────────────────────────────────────────────────────────────
  'core-organizing': {
    id: 'core-organizing',
    badge: 'LEVEL 02 • CORE LEADERSHIP',
    title: 'Core Organizing Team',
    subtitle: '1 Lead + 4 Faculty Co-Organizers + 1 Student Lead',
    description: 'The executive committee overseeing academic governance, IBM Quantum partnership, venue operations, and student leadership across all 5 festival days.',
    linkHref: '/team/organizing',
    linkText: 'View Complete Committee Hierarchy',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Harsha Siva Akash',
        title: 'Harsha Siva Akash',
        subtitle: 'Executive',
        meta: [
          { label: 'Role', value: 'Executive' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Gyan Sah',
        title: 'Gyan Sah',
        subtitle: 'Track Lead • Technical & Innovation',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Likith',
        title: 'Likith',
        subtitle: 'Track Lead • Industry, Partnerships & Guest Relations',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Manikanta',
        title: 'Manikanta',
        subtitle: 'Track Lead • Marketing, Brand & Media',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dilip',
        title: 'Dilip',
        subtitle: 'Track Lead • Registrations & Participant Experience',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Mahadesh',
        title: 'Mahadesh',
        subtitle: 'Track Lead • Operations & Administration',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 03: FACULTY ADVISORY BOARD (FAB)
  // ─────────────────────────────────────────────────────────────
  'faculty-advisory-board': {
    id: 'faculty-advisory-board',
    badge: 'LEVEL 03 • ACADEMIC OVERSIGHT',
    title: 'Faculty Advisory Board (FAB)',
    subtitle: 'Guidance & Portfolios',
    description: 'Distinguished faculty mentors and professors providing strategic academic oversight, research guidance, and technical evaluation across all tracks of Qiskit Fall Fest 2026.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Faculty Advisory Mandate',
    slides: [
      {
        src: '/images/team/faculty/shaik-johny-basha.jpg',
        alt: 'Mr. Shaik Johny Basha',
        title: 'Mr. Shaik Johny Basha',
        subtitle: 'Assistant Professor, Department of CSE',
        email: 'johnybasha.s@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/shaik-johny-basha-831945108',
        bio: 'Faculty member in the Department of Computer Science & Engineering at SRM University-AP. Supporting academic governance, technical workshops, and student research mentorship.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Role', value: 'Faculty Advisory Board' },
        ],
      },
      {
        src: '/images/team/faculty/v-udaya-sankar.jpg',
        alt: 'Dr. V. Udaya Sankar',
        title: 'Dr. V. Udaya Sankar',
        subtitle: 'Assistant Professor, Dept. of Electronics and Communication Engineering',
        email: 'udayasankar.v@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/dr-v-udaya-sankar-b373219/',
        bio: 'My area of research interest includes Game theory and optimization, Machine learning algorithms, Baseband Signal Processing for Advanced Wireless communications, Small Cell Networks, Visual Inspection Systems, Quantum Computing and Communications.',
        meta: [
          { label: 'Department', value: 'Electronics & Communication Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Quantum Computing & Wireless Comms' },
        ],
      },
      {
        src: '/images/team/faculty/kunal-biswas.jpg',
        alt: 'Dr. Kunal Biswas',
        title: 'Dr. Kunal Biswas',
        subtitle: 'Assistant Professor, Dept. of Computer Science & Engineering',
        email: 'kunal.b@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/kunalbiswas29',
        bio: 'Machine Learning Researcher with a PhD in Computer Science having extensive research experience in Multimodal AI, Computer Vision, and Natural Language Processing.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Multimodal AI, CV & NLP' },
        ],
      },
      {
        src: '/images/team/faculty/manjula-r.jpg',
        alt: 'Dr. Manjula R',
        title: 'Dr. Manjula R',
        subtitle: 'Assistant Professor, Dept. of Computer Science & Engineering',
        email: 'manjula.r@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/manjularaja/',
        bio: 'Dr. Manjula R. is an Assistant Professor in the Department of Computer Science and Engineering at SRM University-AP, with research expertise in nano communication and networking, in-vivo wireless nanosensor networks, terahertz and optical communication, biomedical sensing, and Internet of Bio-Nano Things (IoBNT). Her current research focuses on developing next-generation communication, sensing, and privacy-aware solutions for cardiac healthcare and medical Internet of Things (IoT) systems. She is a Senior Member of IEEE and Fellow of IE and IETE.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'IoBNT, Nano Comms & Sensing' },
        ],
      },
      {
        src: '/images/team/faculty/puppala-naga-sravanthi.jpg',
        alt: 'Dr. Puppala Naga Sravanthi',
        title: 'Dr. Puppala Naga Sravanthi',
        subtitle: 'Assistant Professor, Department of CSE',
        email: 'nagasravanthi.p@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/dr-naga-sravanthi-puppala-388494364/',
        bio: 'Specialized in Blockchain architectures, decentralized protocols, and distributed ledger systems for secure applications.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Blockchain & Distributed Systems' },
        ],
      },
      {
        src: '/images/team/faculty/achala-shakya.jpg',
        alt: 'Dr. Achala Shakya',
        title: 'Dr. Achala Shakya',
        subtitle: 'Assistant Professor, Department of Computer Science and Engineering',
        email: 'achala.s@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/dr-achala-shakya-682970126/',
        bio: 'Dr. Achala Shakya is an Assistant Professor in the Department of Computer Science and Engineering. Her research interests include remote sensing, hyperspectral image analysis, machine learning, and deep learning, with a particular focus on land use/land cover classification and change detection using satellite imagery. She is interested in developing practical AI and data-driven approaches for solving real-world problems in geospatial and environmental applications.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Remote Sensing & Hyperspectral AI' },
        ],
      },
      {
        src: '/images/team/faculty/junaid-alam.jpg',
        alt: 'Mr. Junaid Alam',
        title: 'Mr. Junaid Alam',
        subtitle: 'Assistant Professor, Department of Computer Science and Engineering',
        email: 'junaidalam.r@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/junaidalam-iiita/',
        bio: 'I am specialized in applied cryptography and cybersecurity, with research interests spanning verifiable data auditing, privacy-preserving computation, zero-knowledge proofs, blockchain security, and post-quantum cryptography. My work focuses on developing reliable, privacy-preserving, and cryptographically verifiable solutions for distributed systems, edge computing, and secure data storage.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Post-Quantum Crypto & Security' },
        ],
      },
      {
        src: '/images/team/faculty/mallavalli-sitharam.jpg',
        alt: 'Dr. Mallavalli Sitharam',
        title: 'Dr. Mallavalli Sitharam',
        subtitle: 'Assistant Professor, Department of CSE',
        email: 'sitharam.m@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/dr-m-sitha-ram-381a981b6/',
        bio: 'Dr. M. Sitha Ram is an Assistant Professor in the Department of Computer Science and Engineering at SRM University, Andhra Pradesh. He obtained his Ph.D. from Andhra University in 2020. His research focuses on machine learning, deep learning, wireless sensor networks, and information security. He has published several papers in SCI/SCIE and Scopus-indexed journals and conferences. He is a recipient of UGC-JRF and SRF fellowships and has contributed to innovation through patents in emerging technologies.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Wireless Sensor Networks & InfoSec' },
        ],
      },
      {
        src: '/images/team/faculty/rashmi-rathi-upadhyay.jpg',
        alt: 'Dr. Rashmi Rathi Upadhyay',
        title: 'Dr. Rashmi Rathi Upadhyay',
        subtitle: 'Assistant Professor, Department of Computer Science and Engineering',
        email: 'rashmirathi.u@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/rashmirathiupadhyay',
        bio: 'Dr. Rashmi Rathi Upadhyay is an Assistant Professor in the Department of Computer Science and Engineering at SRM University-AP, India. His research focuses on Artificial Intelligence, Machine Learning, Deep Learning, Computer Vision, and Medical Image Analysis, with applications in healthcare and biometric security. He is actively involved in promoting technological innovation and student engagement, having organized and conducted multiple hackathons and technical events, contributed to the organization of the Smart India Hackathon, and currently serving as a Proctor Ambassador for IEEE Xtreme.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Medical Image Analysis & AI' },
        ],
      },
      {
        src: '/images/team/faculty/parakrant-sarkar.jpg',
        alt: 'Dr. Parakrant Sarkar',
        title: 'Dr. Parakrant Sarkar',
        subtitle: 'Assistant Professor, Department of Computer Science and Engineering',
        email: 'parakrant.s@srmap.edu.in',
        linkedin: 'https://parakrant.github.io/',
        bio: 'My research focuses on machine learning and signal processing, with applications in audio, music, and multimodal data. I am interested in developing methods that improve the quality and understanding of real-world signals.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor' },
          { label: 'Focus', value: 'Signal Processing & Multimodal AI' },
        ],
      },
      {
        src: '/images/team/faculty/suresh-kumar-kanaparthi.jpg',
        alt: 'Dr. Suresh Kumar Kanaparthi',
        title: 'Dr. Suresh Kumar Kanaparthi',
        subtitle: 'Assistant Professor (SG), Dept. of Computer Science & Engineering',
        email: 'sureshkumar.k@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/prof-dr-suresh-kr-kanaparthi-acharya-72572a1a/',
        bio: 'Research interests encompass Artificial Intelligence, Machine Learning, Deep Learning, Pattern Recognition, quantum machine learning, Computer Vision and Image Processing.',
        meta: [
          { label: 'Department', value: 'Computer Science & Engineering' },
          { label: 'Designation', value: 'Assistant Professor (SG)' },
          { label: 'Focus', value: 'Quantum Machine Learning & CV' },
        ],
      },
      {
        src: '/images/team/faculty/tarkeshwar-mahto.jpg',
        alt: 'Dr. Tarkeshwar Mahto',
        title: 'Dr. Tarkeshwar Mahto',
        subtitle: 'Associate Professor, Dept. of Electrical and Electronics Engineering',
        email: 'tarkeshwar.m@srmap.edu.in',
        linkedin: 'https://www.linkedin.com/in/dr-tarkeshwar-mahto-aab55527/',
        bio: 'Dr. Tarkeshwar Mahto is an associate professor in the Department of Electrical and Electronics Engineering at SRM University AP, Andhra Pradesh, India. He received his M. Tech from NIT Hamirpur, HP in 2012 and Ph. D. from IIT(ISM) Dhanbad in 2017. He has published more than 25 peer-reviewed papers in scholarly journals. His present research interests are Grid Integrated RES, application of ML/DL in Electrical Engineering and Power Electronics convertors for microgrids & EVs.',
        meta: [
          { label: 'Department', value: 'Electrical & Electronics Engineering' },
          { label: 'Designation', value: 'Associate Professor' },
          { label: 'Focus', value: 'Grid RES, Power Electronics & Microgrids' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 03: CO-ORGANIZER & STUDENT LEAD
  // ─────────────────────────────────────────────────────────────
  'student-lead': {
    id: 'student-lead',
    badge: 'LEVEL 03 • OPERATIONAL EXECUTION',
    title: 'Co-Organizer & Student Lead',
    subtitle: 'Operational Execution & Chapter Coordination',
    description: 'Student leadership steering technical engineering, hackathon administration, volunteer marshals, and daily logistical execution.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Student Coordination Hierarchy',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Harsha Siva Akash',
        title: 'Harsha Siva Akash',
        subtitle: 'Executive',
        meta: [
          { label: 'Role', value: 'Executive' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 04: TRACK 1 — TECHNICAL & INNOVATION
  // ─────────────────────────────────────────────────────────────
  'track-1': {
    id: 'track-1',
    badge: 'TRACK 01 • TECHNICAL & INNOVATION',
    title: 'Track 1: Technical & Innovation',
    subtitle: 'Algorithm Benchmarking, Hackathon & Web Platform',
    description: 'Directing problem track formulation, automated test harnesses on 127-qubit IBM hardware, curriculum design, and the digital web platform.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Track 1 Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Gyan Sah',
        title: 'Gyan Sah',
        subtitle: 'Track Lead • Technical & Innovation',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Baratam Praneeth Gupta',
        title: 'Baratam Praneeth Gupta',
        subtitle: 'Cell Head • Technical Program Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sri Vastava Sri Harsha Gampa',
        title: 'Sri Vastava Sri Harsha Gampa',
        subtitle: 'Cell Head • Hackathon & Competitions Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pigilam Srihaas',
        title: 'Pigilam Srihaas',
        subtitle: 'Cell Head • Website & Technology Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'ECE (M.Tech)' },
          { label: 'Year', value: '1st' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 04: TRACK 2 — INDUSTRY, PARTNERSHIPS & GUEST RELATIONS
  // ─────────────────────────────────────────────────────────────
  'track-2': {
    id: 'track-2',
    badge: 'TRACK 02 • INDUSTRY & GUEST RELATIONS',
    title: 'Track 2: Industry, Partnerships & Guest Relations',
    subtitle: 'IBM Liaison, Keynote Speakers & Enterprise Sponsors',
    description: 'Managing executive institutional channels with IBM Quantum, visiting keynote scientists, VIP dignitaries, and corporate recruitment sponsors.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Track 2 Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Likith',
        title: 'Likith',
        subtitle: 'Track Lead • Industry, Partnerships & Guest Relations',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Likith Konakalla',
        title: 'Likith Konakalla',
        subtitle: 'Cell Head • Industry & Partnerships Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Bhaswanth Y',
        title: 'Bhaswanth Y',
        subtitle: 'Cell Head • Hospitality & Guest Relations Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 04: TRACK 3 — MARKETING, BRAND & MEDIA
  // ─────────────────────────────────────────────────────────────
  'track-3': {
    id: 'track-3',
    badge: 'TRACK 03 • MARKETING, BRAND & MEDIA',
    title: 'Track 3: Marketing, Brand & Media',
    subtitle: 'Visual Identity, Live Broadcast & Inter-University Outreach',
    description: 'Driving national festival awareness across 60+ universities, creative brand stewardship, daily video highlight reels, and press coverage.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Track 3 Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Manikanta',
        title: 'Manikanta',
        subtitle: 'Track Lead • Marketing, Brand & Media',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Madhan',
        title: 'Madhan',
        subtitle: 'Cell Head • Marketing & Outreach Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Naga Nikitha Sanaka',
        title: 'Naga Nikitha Sanaka',
        subtitle: 'Cell Head • Public Relations & Documentation Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Preetham',
        title: 'Preetham',
        subtitle: 'Cell Head • Branding & Creative Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Preetham',
        title: 'Preetham',
        subtitle: 'Cell Head • Digital Media Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 04: TRACK 4 — TECHNOLOGY & PARTICIPANT EXPERIENCE
  // ─────────────────────────────────────────────────────────────
  'track-4': {
    id: 'track-4',
    badge: 'TRACK 04 • TECHNOLOGY & PARTICIPANT EXPERIENCE',
    title: 'Track 4: Technology & Participant Experience',
    subtitle: 'Registration Funnels, On-Site Experience & Tech Expo',
    description: 'Overseeing participant journeys from platform registration and badging to on-site helpdesks, accommodation, and the Hardware Quantum Tech Expo.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Track 4 Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dilip',
        title: 'Dilip',
        subtitle: 'Track Lead • Registrations & Participant Experience',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pardhava Krishna',
        title: 'Pardhava Krishna',
        subtitle: 'Cell Head • Expo & Exhibition Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Devisree Honne',
        title: 'Devisree Honne',
        subtitle: 'Cell Head • Registration Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Reshma',
        title: 'Reshma',
        subtitle: 'Cell Head • Participant Experience Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 04: TRACK 5 — OPERATIONS & ADMINISTRATION
  // ─────────────────────────────────────────────────────────────
  'track-5': {
    id: 'track-5',
    badge: 'TRACK 05 • OPERATIONS & ADMINISTRATION',
    title: 'Track 5: Operations & Administration',
    subtitle: 'Venue Infrastructure, Catering & 24h Logistics',
    description: 'Executing continuous 24-hour campus operations, 600-capacity auditorium setup, high-performance computing labs, buffet dining, and crowd safety.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Track 5 Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Mahadesh',
        title: 'Mahadesh',
        subtitle: 'Track Lead • Operations & Administration',
        meta: [
          { label: 'Role', value: 'Track Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Tanvir Siddique Shaik',
        title: 'Tanvir Siddique Shaik',
        subtitle: 'Cell Head • Operations & Logistics Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aparna Medida',
        title: 'Aparna Medida',
        subtitle: 'Cell Head • Finance & Procurement Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kushitha',
        title: 'Kushitha',
        subtitle: 'Cell Head • Volunteer Management Cell',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'ECE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pradnish Chintada',
        title: 'Pradnish Chintada',
        subtitle: 'Cell Head • Food Safety & Discipline Cell',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 05: THE 16 INDIVIDUAL CELLS
  // ─────────────────────────────────────────────────────────────
  'cell-1': {
    id: 'cell-1',
    badge: 'CELL 01 • TECHNICAL & INNOVATION',
    title: '1. Technical Program Cell',
    subtitle: 'Quantum Pedagogy & Circuit Theory',
    description: 'Curating the academic agenda, quantum algorithm keynotes, faculty lectures, and speaker session timing.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Baratam Praneeth Gupta',
        title: 'Baratam Praneeth Gupta',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Jaswanth Kumar Kondameeda',
        title: 'Jaswanth Kumar Kondameeda',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sri Tejaswini Golakoti',
        title: 'Sri Tejaswini Golakoti',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kadali Yashwanth Vardhan',
        title: 'Kadali Yashwanth Vardhan',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aryan Avinash Vishwakarma',
        title: 'Aryan Avinash Vishwakarma',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'AiTI' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Bhavya Sahasra Ongole',
        title: 'Bhavya Sahasra Ongole',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Syed Humaira Tasneem',
        title: 'Syed Humaira Tasneem',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Komara Charan Kumar',
        title: 'Komara Charan Kumar',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Anmol Mamgain',
        title: 'Anmol Mamgain',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'AiTI' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Shaik Lal John Basha',
        title: 'Shaik Lal John Basha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sathwika Nagavarapu',
        title: 'Sathwika Nagavarapu',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aditya Raj Tiwary',
        title: 'Aditya Raj Tiwary',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Rishika Sharma',
        title: 'Rishika Sharma',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Y Sai Santhosh',
        title: 'Y Sai Santhosh',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pranav Jaiswal',
        title: 'Pranav Jaiswal',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'V. Akshaya',
        title: 'V. Akshaya',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE (Cyber Security)' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'G. Nikhilesh',
        title: 'G. Nikhilesh',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Thoti Manvitha Reddy',
        title: 'Thoti Manvitha Reddy',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Thaneer Anunya',
        title: 'Thaneer Anunya',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE (AI/ML)' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pardhu Gupta Pabbathi',
        title: 'Pardhu Gupta Pabbathi',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Niveditha',
        title: 'Niveditha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'K S H Tanmayi',
        title: 'K S H Tanmayi',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Gadiraju Ramanuja',
        title: 'Gadiraju Ramanuja',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'QuTI' },
        ],
      },
    ],
  },

  'cell-2': {
    id: 'cell-2',
    badge: 'CELL 02 • TECHNICAL & INNOVATION',
    title: '2. Hackathon & Competitions Cell',
    subtitle: 'Competitive Quantum Programming',
    description: 'Crafting problem statements on 127-qubit IBM hardware, automated test harnesses, and evaluation rubrics.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sri Vastava Sri Harsha Gampa',
        title: 'Sri Vastava Sri Harsha Gampa',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Haresh G',
        title: 'Haresh G',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'QuTI' },
          { label: 'Year', value: '1st' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Jyoshna Pilli',
        title: 'Jyoshna Pilli',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sai Pujith Sembeti',
        title: 'Sai Pujith Sembeti',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Jalagam Bhargava Sai',
        title: 'Jalagam Bhargava Sai',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Punumalli Pooja Sri',
        title: 'Punumalli Pooja Sri',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sravan Reddy Buchireddy',
        title: 'Sravan Reddy Buchireddy',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '1st' },
        ],
      },
    ],
  },

  'cell-3': {
    id: 'cell-3',
    badge: 'CELL 03 • TECHNICAL & INNOVATION',
    title: '3. Website & Technology Cell',
    subtitle: 'Digital Platform & Performance',
    description: 'Engineering the Next.js digital experience, real-time schedule synchronizers, interactive component libraries, and edge infrastructure.',
    linkHref: '/team/website',
    linkText: 'Open Website Team Roster',
    slides: [
      {
        src: '/images/team/srihaas-pigilam.webp',
        alt: 'Srihaas Pigilam',
        title: 'Srihaas Pigilam',
        subtitle: 'Team Leader',
        meta: [
          { label: 'Branch', value: 'Website Team' },
          { label: 'Role', value: 'Team Leader' },
          { label: 'Track', value: 'Full-Stack Engineering & Architecture' },
        ],
      },
      {
        src: '/images/team/pradnish-chintada.webp',
        alt: 'Pradnish Chintada',
        title: 'Pradnish Chintada',
        subtitle: 'Lead UI/UX and Frontend',
        meta: [
          { label: 'Branch', value: 'Website Team' },
          { label: 'Role', value: 'Lead UI/UX and Frontend' },
          { label: 'Track', value: 'UI/UX Design & Component Systems' },
        ],
      },
      {
        src: '/images/team/shaik-subhani.webp',
        alt: 'Shaik Mahaboob Subhani',
        title: 'Shaik Mahaboob Subhani',
        subtitle: 'Co-lead UI/UX and Components',
        meta: [
          { label: 'Branch', value: 'Website Team' },
          { label: 'Role', value: 'Co-lead UI/UX and Components' },
          { label: 'Track', value: 'UI/UX Architecture & Primitives' },
        ],
      },
      {
        src: '/images/team/robert-bandaru.webp',
        alt: 'Robert Bandaru',
        title: 'Robert Bandaru',
        subtitle: 'UI/UX and documentation',
        meta: [
          { label: 'Branch', value: 'Website Team' },
          { label: 'Role', value: 'UI/UX and documentation' },
          { label: 'Track', value: 'Design Flow & Technical Docs' },
        ],
      },
      {
        src: '/images/team/sandeep-nambi.webp',
        alt: 'Sandeep Nambi',
        title: 'Sandeep Nambi',
        subtitle: 'UI/UX Technical and Documentation',
        meta: [
          { label: 'Branch', value: 'Website Team' },
          { label: 'Role', value: 'UI/UX Technical and Documentation' },
          { label: 'Track', value: 'Technical UI/UX & Interface Docs' },
        ],
      },
    ],
  },

  'cell-4': {
    id: 'cell-4',
    badge: 'CELL 04 • INDUSTRY & PARTNERSHIPS',
    title: '4. Industry & Partnerships Cell',
    subtitle: 'IBM Alliances & Industry Grants',
    description: 'Direct institutional liaison with IBM Quantum executives, enterprise sponsors, and research consortia.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Likith Konakalla',
        title: 'Likith Konakalla',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Poojith',
        title: 'Poojith',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ananya',
        title: 'Ananya',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Jyoshna',
        title: 'Jyoshna',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kethan',
        title: 'Kethan',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ashritha',
        title: 'Ashritha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-5': {
    id: 'cell-5',
    badge: 'CELL 05 • HOSPITALITY & GUEST RELATIONS',
    title: '5. Hospitality & Guest Relations Cell',
    subtitle: 'Speaker Itineraries & Protocol',
    description: 'Managing protocol, guest itineraries, executive lodging, and VIP dignitary facilitation across 5 days.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Bhaswanth Y',
        title: 'Bhaswanth Y',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'V. Rohith',
        title: 'V. Rohith',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Garimella Sai Tripura Pranathi',
        title: 'Garimella Sai Tripura Pranathi',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'MD. Adaa Fathima',
        title: 'MD. Adaa Fathima',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Puvvada Yaswanth Venkata Saty Sai Narayan',
        title: 'Puvvada Yaswanth Venkata Saty Sai Narayan',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE (M.Tech)' },
          { label: 'Year', value: '1st' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sathvika Kedari',
        title: 'Sathvika Kedari',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'A Pranathi',
        title: 'A Pranathi',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-6': {
    id: 'cell-6',
    badge: 'CELL 06 • MARKETING, BRAND & MEDIA',
    title: '6. Marketing & Outreach Cell',
    subtitle: 'Inter-University Outreach',
    description: 'Promoting national participation, student chapter activations, and outreach across 60+ Indian universities.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Madhan',
        title: 'Madhan',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dev Aryan Patnana',
        title: 'Dev Aryan Patnana',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'AiTI' },
          { label: 'Year', value: '1st' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Yendeti Gargi',
        title: 'Yendeti Gargi',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Shirupa Advaith',
        title: 'Shirupa Advaith',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Samanthula Jnana Sadhasri',
        title: 'Samanthula Jnana Sadhasri',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Nanda Gopal',
        title: 'Nanda Gopal',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dinesh',
        title: 'Dinesh',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Nakshatra',
        title: 'Nakshatra',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'M. Swapnil',
        title: 'M. Swapnil',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sai Aswitha',
        title: 'Sai Aswitha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-7': {
    id: 'cell-7',
    badge: 'CELL 07 • MARKETING, BRAND & MEDIA',
    title: '7. Public Relations & Documentation Cell',
    subtitle: 'Press & Festival Archiving',
    description: 'Press briefings, print media coverage, institutional archiving, and festival recap bulletins.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Naga Nikitha Sanaka',
        title: 'Naga Nikitha Sanaka',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'A. Sindhura',
        title: 'A. Sindhura',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'R. Siva Namesh',
        title: 'R. Siva Namesh',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'V. Hari Kiran',
        title: 'V. Hari Kiran',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'N. Ganga Narayana',
        title: 'N. Ganga Narayana',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Gaurav Gupta',
        title: 'Gaurav Gupta',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'A. Keerthi Reddy',
        title: 'A. Keerthi Reddy',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Khushi Kailasam',
        title: 'Khushi Kailasam',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aditi Bundela',
        title: 'Aditi Bundela',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Rohitha',
        title: 'Rohitha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-8': {
    id: 'cell-8',
    badge: 'CELL 08 • MARKETING, BRAND & MEDIA',
    title: '8. Branding & Creative Cell',
    subtitle: 'Visual Identity & Swag Assets',
    description: 'Visual identity stewardship, badge styling, digital artwork, and festival stage design aesthetics.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Preetham',
        title: 'Preetham',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'J. Bhargava Sai',
        title: 'J. Bhargava Sai',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'M. Sriya',
        title: 'M. Sriya',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'S. Sahithee',
        title: 'S. Sahithee',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'V. Nirupam Teja',
        title: 'V. Nirupam Teja',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Anshul Singh',
        title: 'Anshul Singh',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dhruv Adabala',
        title: 'Dhruv Adabala',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'V. Baradvaj',
        title: 'V. Baradvaj',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'U. Pushkar',
        title: 'U. Pushkar',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Thrishank',
        title: 'Thrishank',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Satvik',
        title: 'Satvik',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Hamsitha Kagitala',
        title: 'Hamsitha Kagitala',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Bommisetty Shanmukha',
        title: 'Bommisetty Shanmukha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-9': {
    id: 'cell-9',
    badge: 'CELL 09 • MARKETING, BRAND & MEDIA',
    title: '9. Digital Media Cell',
    subtitle: 'Livestream Broadcasts & Highlights',
    description: 'Broadcasting live 4K keynotes, producing daily highlight reels, and managing interactive social campaigns.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Preetham',
        title: 'Preetham',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'J. Bhargava Sai',
        title: 'J. Bhargava Sai',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'M. Sriya',
        title: 'M. Sriya',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'S. Sahithee',
        title: 'S. Sahithee',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'V. Nirupam Teja',
        title: 'V. Nirupam Teja',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Anshul Singh',
        title: 'Anshul Singh',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dhruv Adabala',
        title: 'Dhruv Adabala',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'V. Baradvaj',
        title: 'V. Baradvaj',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'U. Pushkar',
        title: 'U. Pushkar',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Thrishank',
        title: 'Thrishank',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Satvik',
        title: 'Satvik',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Hamsitha Kagitala',
        title: 'Hamsitha Kagitala',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Bommisetty Shanmukha',
        title: 'Bommisetty Shanmukha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-10': {
    id: 'cell-10',
    badge: 'CELL 10 • TECHNOLOGY & PARTICIPANT EXPERIENCE',
    title: '10. Expo & Exhibition Cell',
    subtitle: 'Academic Showcases & Posters',
    description: 'Demonstrating hardware prototypes, scientific poster sessions, dilution cryostat models, and quantum research booth installations.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pardhava Krishna',
        title: 'Pardhava Krishna',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Srujana',
        title: 'Srujana',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ankith',
        title: 'Ankith',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Nikhil',
        title: 'Nikhil',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-11': {
    id: 'cell-11',
    badge: 'CELL 11 • TECHNOLOGY & PARTICIPANT EXPERIENCE',
    title: '11. Registration Cell',
    subtitle: 'Participant Registration & Badging Passes',
    description: 'Managing the participant registration funnel, attendee credential verification, and credential allocations.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Devisree Honne',
        title: 'Devisree Honne',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aakanksha Edpuganti',
        title: 'Aakanksha Edpuganti',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE (AI/ML)' },
          { label: 'Year', value: '1st' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Chakka Sahaja',
        title: 'Chakka Sahaja',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Geeta Saisree Jasti',
        title: 'Geeta Saisree Jasti',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '1st' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Potharlanka Rishita Sri',
        title: 'Potharlanka Rishita Sri',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '1st' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'S T Sundar',
        title: 'S T Sundar',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kavuri Sindhura',
        title: 'Kavuri Sindhura',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-12': {
    id: 'cell-12',
    badge: 'CELL 12 • TECHNOLOGY & PARTICIPANT EXPERIENCE',
    title: '12. Participant Experience Cell',
    subtitle: 'Attendee Flow & Support Desks',
    description: 'On-site helpdesks, welcome merchandise distribution, attendee orientation, and hackathon guidance.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Reshma',
        title: 'Reshma',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Vaishnavi',
        title: 'Vaishnavi',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ashmitha',
        title: 'Ashmitha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sai Deep Reddy',
        title: 'Sai Deep Reddy',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-13': {
    id: 'cell-13',
    badge: 'CELL 13 • OPERATIONS & ADMINISTRATION',
    title: '13. Operations & Logistics Cell',
    subtitle: 'Auditorium Operations & AL Labs',
    description: 'Managing auditorium seating, power backup, hardware workstations, and 24-hour campus logistics.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Tanvir Siddique Shaik',
        title: 'Tanvir Siddique Shaik',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Nerella Saiteja',
        title: 'Nerella Saiteja',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '3rd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ajifa Sultana',
        title: 'Ajifa Sultana',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sanjibani Saha',
        title: 'Sanjibani Saha',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'ECE' },
          { label: 'Year', value: '2nd' },
        ],
      },
    ],
  },

  'cell-14': {
    id: 'cell-14',
    badge: 'CELL 14 • OPERATIONS & ADMINISTRATION',
    title: '14. Finance & Procurement Cell',
    subtitle: 'Audited Accounts & Hackathon Prizes',
    description: 'Budget auditing, prize disbursements, purchase orders for computing hardware, and vendor clearances.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aparna Medida',
        title: 'Aparna Medida',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dasaradh',
        title: 'Dasaradh',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
        ],
      },
    ],
  },

  'cell-15': {
    id: 'cell-15',
    badge: 'CELL 15 • OPERATIONS & ADMINISTRATION',
    title: '15. Volunteer Management Cell',
    subtitle: 'Student Volunteer Marshals',
    description: 'Rostering 100+ student volunteers, station coordination, briefing sessions, and shift handovers.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kushitha',
        title: 'Kushitha',
        subtitle: 'Cell Head',
        meta: [
          { label: 'Role', value: 'Cell Head' },
          { label: 'Department', value: 'ECE' },
          { label: 'Year', value: '2nd' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Bhargavi',
        title: 'Bhargavi',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Priyanka',
        title: 'Priyanka',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '2nd' },
        ],
      },
    ],
  },

  'cell-16': {
    id: 'cell-16',
    badge: 'CELL 16 • OPERATIONS & ADMINISTRATION',
    title: '16. Food Safety & Discipline Cell',
    subtitle: 'Catering & Campus Safety',
    description: 'Buffet meal operations, 24-hour hackathon refreshments, medical triage, and campus safety protocols.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pradnish Chintada',
        title: 'Pradnish Chintada',
        subtitle: 'Member',
        meta: [
          { label: 'Role', value: 'Member' },
          { label: 'Department', value: 'CSE' },
          { label: 'Year', value: '4th' },
        ],
      },
    ],
  },
};
