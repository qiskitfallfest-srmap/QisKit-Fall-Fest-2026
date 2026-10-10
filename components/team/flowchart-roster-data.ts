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
        alt: 'Dr. K. S. Ramanujan',
        title: 'Dr. K. S. Ramanujan',
        subtitle: 'Faculty Co-Lead • Quantum Algorithms',
        meta: [
          { label: 'Role', value: 'Faculty Lead' },
          { label: 'Focus', value: '127-Qubit Eagle Benchmarks' },
          { label: 'Affiliation', value: 'Dept. of CSE, SRM AP' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Prof. Meera Sundaram',
        title: 'Prof. Meera Sundaram',
        subtitle: 'Curriculum Chair & Associate Professor',
        meta: [
          { label: 'Role', value: 'Faculty Co-Lead' },
          { label: 'Focus', value: 'Qiskit 1.x Algorithmic Pedagogy' },
          { label: 'Affiliation', value: 'Physics & Computational Sciences' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dr. Vasudha Rao',
        title: 'Dr. Vasudha Rao',
        subtitle: 'IBM University Liaison Chair',
        meta: [
          { label: 'Role', value: 'Faculty Co-Lead' },
          { label: 'Focus', value: 'IBM Quantum Fall Fest Charter' },
          { label: 'Affiliation', value: 'Dean of International Alliances' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Col. V. R. Patnaik',
        title: 'Col. V. R. Patnaik',
        subtitle: 'Venue Operations & Logistics Director',
        meta: [
          { label: 'Role', value: 'Faculty Co-Lead' },
          { label: 'Focus', value: '600-Capacity Auditorium & HPC Labs' },
          { label: 'Affiliation', value: 'Estate & Infrastructure Office' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Srihaas Pigilam',
        title: 'Srihaas Pigilam',
        subtitle: 'Student General Chair & Engineering Lead',
        meta: [
          { label: 'Role', value: 'Student Lead' },
          { label: 'Focus', value: 'Platform Systems & Execution' },
          { label: 'Track', value: 'Technical & Innovation' },
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
        alt: 'Srihaas Pigilam',
        title: 'Srihaas Pigilam',
        subtitle: 'Student General Chair & Engineering Lead',
        meta: [
          { label: 'Responsibility', value: 'Full-Stack & Systems Architecture' },
          { label: 'Chapter', value: 'Quantum Computing Student Chapter' },
          { label: 'Program', value: 'B.Tech CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aditi Sharma',
        title: 'Aditi Sharma',
        subtitle: 'Hackathon Student Chair',
        meta: [
          { label: 'Responsibility', value: 'Problem Statements & Test Rubrics' },
          { label: 'Chapter', value: 'Algorithmic Competitions Cell' },
          { label: 'Program', value: 'B.Tech CSE Honors' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pravin Nair',
        title: 'Pravin Nair',
        subtitle: 'Operations & Registration Co-Lead',
        meta: [
          { label: 'Responsibility', value: 'Unstop Funnel & On-Site Passes' },
          { label: 'Team', value: 'Participant Services' },
          { label: 'Program', value: 'B.Tech CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pradnish Chintada',
        title: 'Pradnish Chintada',
        subtitle: 'Lead UI/UX & Frontend Architecture',
        meta: [
          { label: 'Responsibility', value: 'Design Systems & Component Library' },
          { label: 'Team', value: 'Website & Technology Cell' },
          { label: 'Program', value: 'B.Tech CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kalyan Sundaram',
        title: 'Kalyan Sundaram',
        subtitle: 'Participant Experience Lead',
        meta: [
          { label: 'Responsibility', value: 'Helpdesk Rotations & Welcome Kits' },
          { label: 'Team', value: 'Participant Services' },
          { label: 'Program', value: 'B.Tech ECE' },
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
        alt: 'Dr. K. S. Ramanujan',
        title: 'Dr. K. S. Ramanujan',
        subtitle: 'Faculty Track Lead • Quantum Algorithms',
        meta: [
          { label: 'Focus', value: 'Eagle Hardware Benchmarking' },
          { label: 'Division', value: 'TI-01 Problem Statements' },
          { label: 'Affiliation', value: 'Dept. of CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Prof. Meera Sundaram',
        title: 'Prof. Meera Sundaram',
        subtitle: 'Curriculum Chair & Workshop Lead',
        meta: [
          { label: 'Focus', value: '10-Session Masterclass Syllabus' },
          { label: 'Division', value: 'TI-02 Workshop Design' },
          { label: 'Affiliation', value: 'Physics & Computational Sciences' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dr. Arvind Chidambaram',
        title: 'Dr. Arvind Chidambaram',
        subtitle: 'Mentorship Director • Technical Jury',
        meta: [
          { label: 'Focus', value: '20+ Specialized Code Mentors' },
          { label: 'Division', value: 'TI-03 Technical Mentorship' },
          { label: 'Affiliation', value: 'Dept. of CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Srihaas Pigilam',
        title: 'Srihaas Pigilam',
        subtitle: 'Website & Technology Lead',
        meta: [
          { label: 'Focus', value: 'App Router & Serverless Infrastructure' },
          { label: 'Division', value: 'Cell 03 Website & Technology' },
          { label: 'Role', value: 'Architecture & Full-Stack' },
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
        alt: 'Dr. Vasudha Rao',
        title: 'Dr. Vasudha Rao',
        subtitle: 'IBM University Liaison Chair',
        meta: [
          { label: 'Focus', value: 'IBM Quantum Fall Fest Charter' },
          { label: 'Division', value: 'IPGR-01 Academic Relations' },
          { label: 'Office', value: 'Dean of International Alliances' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Prof. S. R. Mukhopadhyay',
        title: 'Prof. S. R. Mukhopadhyay',
        subtitle: 'Speaker Protocol Dean & Plenary Liaison',
        meta: [
          { label: 'Focus', value: 'Keynote & Plenary Scientists' },
          { label: 'Division', value: 'IPGR-02 Guest Protocol' },
          { label: 'Council', value: 'Senior Advisory Council' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Rajeshwar Mittal',
        title: 'Rajeshwar Mittal',
        subtitle: 'Corporate Relations & Sponsor Lead',
        meta: [
          { label: 'Focus', value: 'Quantum Career Fair & Grants' },
          { label: 'Division', value: 'IPGR-03 Industry Sponsorship' },
          { label: 'Office', value: 'Corporate Relations Cell' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Archana Hegde',
        title: 'Archana Hegde',
        subtitle: 'Hospitality & Protocol Lead',
        meta: [
          { label: 'Focus', value: 'VIP Transit & Executive Lodging' },
          { label: 'Division', value: 'IPGR-04 Hospitality & Protocol' },
          { label: 'Office', value: 'Public Protocol Cell' },
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
        alt: 'Pallavi Nambiar',
        title: 'Pallavi Nambiar',
        subtitle: 'Creative Director • Brand & Visual Media',
        meta: [
          { label: 'Focus', value: 'Editorial Print & Stage Identity' },
          { label: 'Division', value: 'MBM-01 Creative Direction' },
          { label: 'Cell', value: 'Design & Visual Arts Cell' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Farhan Siddiqui',
        title: 'Farhan Siddiqui',
        subtitle: 'Media Production & Broadcast Lead',
        meta: [
          { label: 'Focus', value: 'Live 4K Keynote Livestreams' },
          { label: 'Division', value: 'MBM-03 Media Production' },
          { label: 'Cell', value: 'Broadcast Engineering' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dr. Leela Krishnan',
        title: 'Dr. Leela Krishnan',
        subtitle: 'Editorial Chair & Scientific Chronicler',
        meta: [
          { label: 'Focus', value: 'Press Bulletins & Archiving' },
          { label: 'Division', value: 'MBM-04 Publishing' },
          { label: 'Affiliation', value: 'School of Sciences' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Deepak Varghese',
        title: 'Deepak Varghese',
        subtitle: 'Community & National Outreach Lead',
        meta: [
          { label: 'Focus', value: '60+ Indian University Chapters' },
          { label: 'Division', value: 'MBM-02 Outreach' },
          { label: 'Affiliation', value: 'Student Affairs' },
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
    description: 'Overseeing participant journeys from Unstop registration and badging to on-site helpdesks, accommodation, and the Hardware Quantum Tech Expo.',
    linkHref: '/team/organizing',
    linkText: 'Inspect Track 4 Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pravin Nair',
        title: 'Pravin Nair',
        subtitle: 'Registration Supervisor • Unstop Lead',
        meta: [
          { label: 'Focus', value: 'Unstop Funnel & Badging Verification' },
          { label: 'Division', value: 'TP-02 Registration' },
          { label: 'Affiliation', value: 'Student Chapter' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kalyan Sundaram',
        title: 'Kalyan Sundaram',
        subtitle: 'Participant Experience Lead',
        meta: [
          { label: 'Focus', value: 'Helpdesk Rotations & Attendee Flow' },
          { label: 'Division', value: 'TP-03 Participant Services' },
          { label: 'Affiliation', value: 'Operations Core' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sunita Reddy',
        title: 'Sunita Reddy',
        subtitle: 'Digital Badging & Certification Lead',
        meta: [
          { label: 'Focus', value: 'NFT Credentials & Swag Kits' },
          { label: 'Division', value: 'TP-04 Credentials' },
          { label: 'Affiliation', value: 'Computer Applications' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Sanjay Kulkarni',
        title: 'Sanjay Kulkarni',
        subtitle: 'Hardware Expo & Lab Installations Lead',
        meta: [
          { label: 'Focus', value: 'Cryostat & Hardware Exhibits' },
          { label: 'Division', value: 'Cell 10 Expo & Exhibition' },
          { label: 'Affiliation', value: 'HPC & Quantum Lab' },
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
        alt: 'Col. V. R. Patnaik',
        title: 'Col. V. R. Patnaik',
        subtitle: 'Venue Operations & Logistics Director',
        meta: [
          { label: 'Focus', value: '600-Capacity Auditorium & Campus Hub' },
          { label: 'Division', value: 'OA-01 Venue Logistics' },
          { label: 'Office', value: 'Estate & Infrastructure Office' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'R. Ramanathan',
        title: 'R. Ramanathan',
        subtitle: 'Catering Operations Supervisor',
        meta: [
          { label: 'Focus', value: '24-Hour Hackathon Refreshments' },
          { label: 'Division', value: 'OA-02 Dining Services' },
          { label: 'Affiliation', value: 'Campus Hospitality' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Maj. Gen. (Retd.) B. Sharma',
        title: 'Maj. Gen. (Retd.) B. Sharma',
        subtitle: 'Chief Security Officer',
        meta: [
          { label: 'Focus', value: 'Campus Perimeter & Crowd Triage' },
          { label: 'Division', value: 'OA-03 Campus Security' },
          { label: 'Affiliation', value: 'Security Directorate' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Suresh Babu',
        title: 'Suresh Babu',
        subtitle: 'Stage Tech & Acoustics Specialist',
        meta: [
          { label: 'Focus', value: 'Sound Engineering & Stage Power' },
          { label: 'Division', value: 'OA-01 Venue Logistics' },
          { label: 'Office', value: 'Central Electrical & Audio' },
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
        alt: 'Dr. K. S. Ramanujan',
        title: 'Dr. K. S. Ramanujan',
        subtitle: 'Faculty Co-Lead (Quantum Algorithms)',
        meta: [
          { label: 'Department', value: 'Dept. of CSE, SRM AP' },
          { label: 'Focus', value: '127-Qubit Eagle Benchmarks' },
          { label: 'Role', value: 'Program Chair' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Aditi Sharma',
        title: 'Aditi Sharma',
        subtitle: 'Hackathon Problem Lead',
        meta: [
          { label: 'Chapter', value: 'Quantum Student Chapter' },
          { label: 'Focus', value: 'Algorithmic Problem Tracks' },
          { label: 'Role', value: 'Technical Co-Chair' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Rohan Varma',
        title: 'Rohan Varma',
        subtitle: 'Benchmarking Specialist',
        meta: [
          { label: 'Department', value: 'M.Tech CSE' },
          { label: 'Focus', value: 'Circuit Noise & Fidelity' },
          { label: 'Role', value: 'Test Harness Engineer' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pooja Nair',
        title: 'Pooja Nair',
        subtitle: 'Algorithm Evaluator',
        meta: [
          { label: 'Department', value: 'B.Tech CSE Honors' },
          { label: 'Focus', value: 'Qiskit 1.x Transpilation' },
          { label: 'Role', value: 'Rubric Specialist' },
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
        alt: 'Dr. Arvind Chidambaram',
        title: 'Dr. Arvind Chidambaram',
        subtitle: 'Mentorship Director & Associate Professor',
        meta: [
          { label: 'Department', value: 'Dept. of CSE' },
          { label: 'Focus', value: 'Jury Coordination' },
          { label: 'Role', value: 'Lead Judge' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Divya Patel',
        title: 'Divya Patel',
        subtitle: 'Mentor Coordinator',
        meta: [
          { label: 'Affiliation', value: 'Research Scholar' },
          { label: 'Focus', value: 'Round-Robin Mentor Rotations' },
          { label: 'Role', value: 'Mentor Operations' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Vikram Sethi',
        title: 'Vikram Sethi',
        subtitle: 'Jury Secretary',
        meta: [
          { label: 'Department', value: 'B.Tech CSE' },
          { label: 'Focus', value: 'Double-Blind Review Portals' },
          { label: 'Role', value: 'Scoring Secretary' },
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
        alt: 'Dr. Vasudha Rao',
        title: 'Dr. Vasudha Rao',
        subtitle: 'IBM University Liaison Chair',
        meta: [
          { label: 'Office', value: 'Dean of International Alliances' },
          { label: 'Focus', value: 'IBM Quantum Global Network' },
          { label: 'Role', value: 'Alliances Chair' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Rajeshwar Mittal',
        title: 'Rajeshwar Mittal',
        subtitle: 'Corporate Relations Lead',
        meta: [
          { label: 'Office', value: 'Corporate Relations Cell' },
          { label: 'Focus', value: 'Enterprise Tech Grants' },
          { label: 'Role', value: 'Sponsorship Lead' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Karthik Raja',
        title: 'Karthik Raja',
        subtitle: 'Academic Outreach Lead',
        meta: [
          { label: 'Affiliation', value: 'Higher Education Cell' },
          { label: 'Focus', value: 'Inter-University Consortium' },
          { label: 'Role', value: 'Liaison Associate' },
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
        alt: 'Prof. S. R. Mukhopadhyay',
        title: 'Prof. S. R. Mukhopadhyay',
        subtitle: 'Speaker Protocol Dean & Plenary Liaison',
        meta: [
          { label: 'Council', value: 'Senior Advisory Council' },
          { label: 'Focus', value: 'Visiting Keynote Scientists' },
          { label: 'Role', value: 'Dean of Protocol' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Archana Hegde',
        title: 'Archana Hegde',
        subtitle: 'Hospitality Lead',
        meta: [
          { label: 'Office', value: 'Estate & Protocol Directorate' },
          { label: 'Focus', value: 'Executive Guest Transit' },
          { label: 'Role', value: 'Hospitality Head' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Gaurav Malhotra',
        title: 'Gaurav Malhotra',
        subtitle: 'Keynote Coordinator',
        meta: [
          { label: 'Department', value: 'Academic Events Bureau' },
          { label: 'Focus', value: 'Stage Facilitation' },
          { label: 'Role', value: 'Speaker Coordinator' },
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
        alt: 'Deepak Varghese',
        title: 'Deepak Varghese',
        subtitle: 'Community Manager & Outreach Lead',
        meta: [
          { label: 'Focus', value: '60+ University Chapters' },
          { label: 'Role', value: 'Campus Ambassador Lead' },
          { label: 'Affiliation', value: 'Student Affairs' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Nisha Agarwal',
        title: 'Nisha Agarwal',
        subtitle: 'PR Associate',
        meta: [
          { label: 'Focus', value: 'National Media Syndication' },
          { label: 'Role', value: 'Press Coordinator' },
          { label: 'Affiliation', value: 'Communications' },
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
        alt: 'Dr. Leela Krishnan',
        title: 'Dr. Leela Krishnan',
        subtitle: 'Editorial Chair & Science Publisher',
        meta: [
          { label: 'Affiliation', value: 'School of Sciences' },
          { label: 'Focus', value: 'Conference Archive' },
          { label: 'Role', value: 'Chief Editor' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Anandita Bose',
        title: 'Anandita Bose',
        subtitle: 'Science Writer',
        meta: [
          { label: 'Focus', value: 'Research Keynote Summaries' },
          { label: 'Role', value: 'Senior Chronicler' },
          { label: 'Department', value: 'Physics' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Varun Teja',
        title: 'Varun Teja',
        subtitle: 'Conference Chronicler',
        meta: [
          { label: 'Focus', value: 'Daily Festival Recaps' },
          { label: 'Role', value: 'Archival Assistant' },
          { label: 'Department', value: 'CSE' },
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
        alt: 'Pallavi Nambiar',
        title: 'Pallavi Nambiar',
        subtitle: 'Creative Director',
        meta: [
          { label: 'Domain', value: 'Identity & Stage Architecture' },
          { label: 'Cell', value: 'Design & Visual Arts Cell' },
          { label: 'Role', value: 'Lead Art Director' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pradnish Chintada',
        title: 'Pradnish Chintada',
        subtitle: 'Digital Brand System Architect',
        meta: [
          { label: 'Domain', value: 'Design System Primitives' },
          { label: 'Cell', value: 'UI/UX Creative Cell' },
          { label: 'Role', value: 'Design Lead' },
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
        alt: 'Farhan Siddiqui',
        title: 'Farhan Siddiqui',
        subtitle: 'Media Production Lead',
        meta: [
          { label: 'Focus', value: 'Multi-Camera 4K Broadcast' },
          { label: 'Role', value: 'Director of Photography' },
          { label: 'Team', value: 'Media Broadcast' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Rahul Dev',
        title: 'Rahul Dev',
        subtitle: 'Cinematographer',
        meta: [
          { label: 'Focus', value: 'Hackathon Night Highlights' },
          { label: 'Role', value: 'Lead Videographer' },
          { label: 'Team', value: 'Media Production' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Megha Pillai',
        title: 'Megha Pillai',
        subtitle: 'Live Stream Engineer',
        meta: [
          { label: 'Focus', value: 'YouTube / OBS Cloud Uplink' },
          { label: 'Role', value: 'Streaming Tech' },
          { label: 'Team', value: 'Broadcasting' },
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
        alt: 'Sanjay Kulkarni',
        title: 'Sanjay Kulkarni',
        subtitle: 'Lab Systems Specialist',
        meta: [
          { label: 'Focus', value: 'Cryostat & Quantum Hardware' },
          { label: 'Lab', value: 'Quantum Computing Laboratory' },
          { label: 'Role', value: 'Expo Floor Director' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Tariq Mansoor',
        title: 'Tariq Mansoor',
        subtitle: 'Network & Hardware Rig Engineer',
        meta: [
          { label: 'Focus', value: 'Hardware Booth Power & Display' },
          { label: 'Role', value: 'Technical Installer' },
          { label: 'Office', value: 'IT Infrastructure' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ananya Iyer',
        title: 'Ananya Iyer',
        subtitle: 'Poster Session Curator',
        meta: [
          { label: 'Focus', value: 'Academic Research Standees' },
          { label: 'Role', value: 'Curator' },
          { label: 'Program', value: 'B.Tech CSE' },
        ],
      },
    ],
  },

  'cell-11': {
    id: 'cell-11',
    badge: 'CELL 11 • TECHNOLOGY & PARTICIPANT EXPERIENCE',
    title: '11. Registration Cell',
    subtitle: 'Unstop Funnel & Badging Passes',
    description: 'Managing the Unstop registration funnel, attendee credential verification, and waitlist allocations.',
    linkHref: '/team/organizing',
    linkText: 'Open Full Organizing Roster',
    slides: [
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Pravin Nair',
        title: 'Pravin Nair',
        subtitle: 'Registration Supervisor',
        meta: [
          { label: 'Focus', value: 'Unstop Funnel Allocations' },
          { label: 'Role', value: 'Registration Head' },
          { label: 'Department', value: 'Student Affairs' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Kavya Menon',
        title: 'Kavya Menon',
        subtitle: 'Unstop Portal Liaison',
        meta: [
          { label: 'Focus', value: 'Application Ingestion & Waitlists' },
          { label: 'Role', value: 'Portal Manager' },
          { label: 'Department', value: 'CSE' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ashwin Pillai',
        title: 'Ashwin Pillai',
        subtitle: 'Credential Verification Officer',
        meta: [
          { label: 'Focus', value: 'On-Site QR Pass Scanning' },
          { label: 'Role', value: 'Verification Officer' },
          { label: 'Department', value: 'ECE' },
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
        alt: 'Kalyan Sundaram',
        title: 'Kalyan Sundaram',
        subtitle: 'Helpdesk Coordinator',
        meta: [
          { label: 'Focus', value: '24-Hour Attendee Support Desk' },
          { label: 'Role', value: 'Experience Lead' },
          { label: 'Department', value: 'Operations Core' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Siddhi Gupta',
        title: 'Siddhi Gupta',
        subtitle: 'Accessibility Desk Lead',
        meta: [
          { label: 'Focus', value: 'Special Needs & Accommodations' },
          { label: 'Role', value: 'Accessibility Head' },
          { label: 'Department', value: 'Student Services' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Mohit Jain',
        title: 'Mohit Jain',
        subtitle: 'Attendee Support Associate',
        meta: [
          { label: 'Focus', value: 'Orientation & Hackathon Floor' },
          { label: 'Role', value: 'Support Marshal' },
          { label: 'Department', value: 'CSE' },
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
        alt: 'Col. V. R. Patnaik',
        title: 'Col. V. R. Patnaik',
        subtitle: 'Venue Operations Director',
        meta: [
          { label: 'Facility', value: '600-Capacity Central Auditorium' },
          { label: 'Role', value: 'Logistics Commander' },
          { label: 'Office', value: 'Estate & Infrastructure' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Suresh Babu',
        title: 'Suresh Babu',
        subtitle: 'Acoustics & Stage Tech Lead',
        meta: [
          { label: 'Facility', value: 'Audio Array & Stage Power' },
          { label: 'Role', value: 'Technical Supervisor' },
          { label: 'Department', value: 'Electrical Directorate' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Dinesh Reddy',
        title: 'Dinesh Reddy',
        subtitle: 'Workstation Setup Lead',
        meta: [
          { label: 'Facility', value: 'Lab Computing Workstations' },
          { label: 'Role', value: 'Setup Coordinator' },
          { label: 'Department', value: 'Systems Maintenance' },
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
        alt: 'K. Venkatesh',
        title: 'K. Venkatesh',
        subtitle: 'Finance Comptroller & Chief Auditor',
        meta: [
          { label: 'Office', value: 'Finance & Accounts Division' },
          { label: 'Focus', value: 'Prize Disbursal & Compliance' },
          { label: 'Role', value: 'Chief Auditor' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Ritu Sachdeva',
        title: 'Ritu Sachdeva',
        subtitle: 'Procurement Officer',
        meta: [
          { label: 'Office', value: 'Central Stores & Procurement' },
          { label: 'Focus', value: 'Hardware POs & Swag Orders' },
          { label: 'Role', value: 'Purchasing Lead' },
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
        alt: 'Sameer Khan',
        title: 'Sameer Khan',
        subtitle: 'Volunteer Corps Marshal',
        meta: [
          { label: 'Focus', value: '100+ Student Marshals' },
          { label: 'Role', value: 'Volunteer Chief' },
          { label: 'Department', value: 'Student Affairs' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Lavanya Chandran',
        title: 'Lavanya Chandran',
        subtitle: 'Shift & Roster Coordinator',
        meta: [
          { label: 'Focus', value: '24h Round-the-Clock Shifts' },
          { label: 'Role', value: 'Shift Supervisor' },
          { label: 'Program', value: 'B.Tech CSE' },
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
        alt: 'R. Ramanathan',
        title: 'R. Ramanathan',
        subtitle: 'Catering Operations Supervisor',
        meta: [
          { label: 'Facility', value: 'Dining Commons & Midnight Snack Bar' },
          { label: 'Role', value: 'Catering Head' },
          { label: 'Affiliation', value: 'Hospitality Office' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Vinod Chandran',
        title: 'Vinod Chandran',
        subtitle: 'Midnight Refreshments Lead',
        meta: [
          { label: 'Focus', value: 'Hackathon Nutrition & Energy Bars' },
          { label: 'Role', value: 'Refreshment Coordinator' },
          { label: 'Department', value: 'Catering Services' },
        ],
      },
      {
        src: GENERIC_PERSON_AVATAR,
        alt: 'Geetha S.',
        title: 'Geetha S.',
        subtitle: 'Nutrition & Dietary Compliance',
        meta: [
          { label: 'Focus', value: 'Hygienic Audits & Medical Triage' },
          { label: 'Role', value: 'Safety Officer' },
          { label: 'Affiliation', value: 'Campus Health Centre' },
        ],
      },
    ],
  },
};
