export interface FAQItem {
  id: string;
  number: number;
  question: string;
  answer: string;
  category: FAQCategory;
  isTopQuestion?: boolean;
}

export const FAQ_META = {
  title: 'Qiskit Fall Fest 2026 Frequently Asked Questions (FAQ)',
  host: 'SRM University-AP',
  location: 'Amaravati, Andhra Pradesh, India',
  disclaimer:
    'Dates, fees, eligibility, activities, and certificate/prize details are based on the information provided and may be updated by the organizing committee. Please refer to official SRM University-AP announcements for the latest information.',
};

export const FAQ_CATEGORIES = [
  'All',
  'General & Overview',
  'Schedule & Venues',
  'Events & Competitions',
  'Prerequisites & Prep',
  'Registration & Fees',
  'Certificates & Contact',
] as const;

export type FAQCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-01',
    number: 1,
    question: 'What is Qiskit Fall Fest 2026?',
    answer:
      'Qiskit Fall Fest is a global, student- and community-led quantum computing festival organized in partnership with IBM Quantum. SRM University-AP is participating as a host for the 2026 edition.',
    category: 'General & Overview',
    isTopQuestion: true,
  },
  {
    id: 'faq-02',
    number: 2,
    question: 'When will Qiskit Fall Fest 2026 take place?',
    answer:
      'Online Phase: October 8\u201313, 2026\nOffline Phase: October 26\u201330, 2026 at SRM University-AP, Amaravati.',
    category: 'Schedule & Venues',
    isTopQuestion: true,
  },
  {
    id: 'faq-03',
    number: 3,
    question: 'Where will the event take place?',
    answer:
      'The offline phase will be hosted at SRM University-AP, Amaravati, Andhra Pradesh, India.',
    category: 'Schedule & Venues',
  },
  {
    id: 'faq-04',
    number: 4,
    question: 'Who can participate in the event?',
    answer:
      'Students and individuals interested in quantum computing can participate. Register on Unstop, then message us on WhatsApp with your Gmail address to get portal access.',
    category: 'General & Overview',
  },
  {
    id: 'faq-05',
    number: 5,
    question: 'Do I need prior knowledge of quantum computing or Qiskit?',
    answer:
      'Not necessarily. Beginners are welcome in introductory activities such as the essay and poster competitions. The hackathon and coding challenges require basic Python, quantum computing concepts, and Qiskit SDK familiarity.',
    category: 'Prerequisites & Prep',
  },
  {
    id: 'faq-06',
    number: 6,
    question: 'Can I participate in multiple events?',
    answer:
      "Yes. You may participate in the essay, poster, reels, and hackathon simultaneously, as long as you meet each event's individual deadline. For the hackathon, you can only be a member of one team.",
    category: 'Events & Competitions',
  },
  {
    id: 'faq-07',
    number: 7,
    question: 'What events are being conducted?',
    answer:
      'Online competitions (submit via the portal):\n\u2022 Tech Reels Competition \u2014 45\u201390 sec quantum video, prize up to \u20b910,000 \u2014 deadline 12 Oct\n\u2022 Digital Poster Creation \u2014 infographic on Quantum Materials or Sensing, prize up to \u20b95,000 \u2014 deadline 12 Oct\n\u2022 Essay Competition \u2014 800\u20131,200 words on a quantum topic, prize up to \u20b95,000 \u2014 deadline 12 Oct\n\u2022 Flagship Hackathon \u2014 Phase 1 online sprint deadline: 12 October 2026\n\nOffline phase (26\u201330 October at SRM-AP):\n\u2022 Quantum Quiddles quiz, QTalk presentations, Guess the QTech, workshops, and the Hackathon Phase 2 finale.',
    category: 'Events & Competitions',
    isTopQuestion: true,
  },
  {
    id: 'faq-08',
    number: 8,
    question: 'What should I prepare before attending the event?',
    answer:
      'For online competitions and hands-on sessions:\n\u2022 A laptop and a stable internet connection\n\u2022 A GitHub account (required for the hackathon)\n\u2022 Basic Python knowledge\n\u2022 Basic quantum computing concepts\n\u2022 Qiskit SDK familiarity (for advanced hackathon tracks)',
    category: 'Prerequisites & Prep',
  },
  {
    id: 'faq-09',
    number: 9,
    question: 'Will participants receive certificates or prizes?',
    answer:
      'Yes. Participation certificates will be issued after the offline event concludes (post 30 October 2026).\n\u2022 Offline participants: collect in person on campus.\n\u2022 Online participants: certificates sent via email to your registered Gmail.\n\nPrizes:\n\u2022 Tech Reels: up to \u20b910,000\n\u2022 Essay Competition: up to \u20b95,000\n\u2022 Digital Poster: up to \u20b95,000\n\u2022 Hackathon: prizes announced at the closing ceremony on 30 October 2026.',
    category: 'Certificates & Contact',
    isTopQuestion: true,
  },
  {
    id: 'faq-10',
    number: 10,
    question: 'Is Unstop still required after registration?',
    answer:
      'No. Unstop was only for the initial sign-up. All submissions, team formation, hackathon access, and activities now happen exclusively on the official website: https://www.qffsrmap2026.com/learning/\n\nIf the portal says \u201cYou are not in the registered whitelist,\u201d message us on WhatsApp with your Gmail and we will add you within 30 minutes.',
    category: 'Registration & Fees',
    isTopQuestion: true,
  },
  {
    id: 'faq-11',
    number: 11,
    question: 'Whom should I contact for further information?',
    answer:
      'Join the official participant WhatsApp group for fast support:\nhttps://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW\n\nFor whitelist or portal issues, message us there with your full name and Gmail address.',
    category: 'Certificates & Contact',
  },
  {
    id: 'faq-12',
    number: 12,
    question: 'I see \u201cYou are not in the registered whitelist.\u201d What do I do?',
    answer:
      'This means your Gmail has not yet been added to the portal. Steps to fix:\n1. Send your Gmail address via the WhatsApp group.\n2. We will add you within 30 minutes during working hours.\n3. Log in at https://www.qffsrmap2026.com/learning/ once added.\n\nDo not register again \u2014 just send us your Gmail.',
    category: 'Registration & Fees',
    isTopQuestion: true,
  },
  {
    id: 'faq-13',
    number: 13,
    question: 'What topics can I write about for the Essay Competition?',
    answer:
      'You may choose any of the following:\n\u2022 Prompt A: The Post-Quantum Cryptographic Migration \u2014 Balancing Vulnerability and Readiness\n\u2022 Prompt B: Quantum Machine Learning \u2014 Fundamental Advantage vs Classical Baseline Realities\n\u2022 Or any quantum computing topic of your own choice\n\nWord limit: 800\u20131,200 words. Deadline: 12 October 2026, 11:59 PM IST.\nSubmit a PDF/DOCX (up to 15 MB) or a public Google Docs link on the portal under Day 3: Essay Competition.',
    category: 'Events & Competitions',
  },
  {
    id: 'faq-14',
    number: 14,
    question: 'Where and when do I submit my Poster and Essay?',
    answer:
      'Submit on the official portal: https://www.qffsrmap2026.com/learning/\n\n\u2022 Essay \u2014 Day 3 section \u2192 upload PDF/DOCX or paste a public document link\n\u2022 Poster \u2014 Day 2 section \u2192 upload PDF/DOCX or paste a public Canva/Drive link\n\u2022 Deadline for both: 12 October 2026, 11:59 PM IST\n\nEnsure any shared links are set to \u201cAnyone with the link can view.\u201d',
    category: 'Events & Competitions',
  },
  {
    id: 'faq-15',
    number: 15,
    question: 'How do I form a hackathon team and what is the team size?',
    answer:
      "Team size: 2 to 6 members (1 leader + up to 5 teammates) for Phase 1.\n\nSteps:\n1. Log in at https://www.qffsrmap2026.com/learning/hackathon\n2. Select your domain track and problem statement\n3. Enter your team name and add teammates by their Gmail addresses\n4. Teammates receive an invitation to accept on the portal\n\nEvery teammate's Gmail must be whitelisted first. If a teammate shows 'Not Found in Whitelist,' send us their Gmail on WhatsApp.\n\nPhase 1 deadline: 12 October 2026, 11:59 PM IST.",
    category: 'Events & Competitions',
    isTopQuestion: true,
  },
  {
    id: 'faq-16',
    number: 16,
    question: 'Where do I download the Processor A and B files for the hackathon?',
    answer:
      'There are no files to download. Studying and implementing Processor A (5-qubit Linear) and Processor B (7-qubit Heavy-Hex) is part of the Phase 1 hackathon challenge. Research their architectures, simulate them using Qiskit, then design your own custom Processor D. (Processor C is introduced in the offline phase.)\n\nFull technical specifications are available in your problem statement dossier on the hackathon portal once your team is formed.',
    category: 'Events & Competitions',
  },
  {
    id: 'faq-17',
    number: 17,
    question: 'What is the registration fee?',
    answer:
      'The registration fee for Qiskit Fall Fest 2026 is \u20b999 per participant, paid during sign-up on Unstop.',
    category: 'Registration & Fees',
    isTopQuestion: true,
  },
  {
    id: 'faq-18',
    number: 18,
    question: 'What skills can I gain by participating in Qiskit Fall Fest?',
    answer:
      'Participants gain hands-on experience with quantum computing, the Qiskit SDK, algorithm design, hardware-aware circuit optimization, technical writing, and collaborative project development \u2014 all directly applicable to research and industry roles in quantum computing.',
    category: 'General & Overview',
  },
];
