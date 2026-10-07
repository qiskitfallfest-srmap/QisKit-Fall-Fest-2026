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
      'Planned schedule:\nOnline Phase: October 5–9, 2026\nOffline Phase: October 26–30, 2026',
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
      'Students and individuals interested in quantum computing can participate, subject to the eligibility criteria specified by the organizers.',
    category: 'General & Overview',
  },
  {
    id: 'faq-05',
    number: 5,
    question: 'Do I need prior knowledge of quantum computing or Qiskit?',
    answer:
      'Not necessarily. Beginners are welcome in introductory activities. Some advanced workshops, competitions, or hackathon activities may require basic Python, quantum computing, or Qiskit knowledge.',
    category: 'Prerequisites & Prep',
  },
  {
    id: 'faq-06',
    number: 6,
    question: 'Can I participate in multiple events?',
    answer:
      'You may participate in multiple events, provided that the schedules do not overlap and the event-specific rules permit it.',
    category: 'Events & Competitions',
  },
  {
    id: 'faq-07',
    number: 7,
    question: 'What events are being conducted at SRM University-AP?',
    answer:
      'The proposed activities include:\n• Quantum Quiddles: An individual quiz-and-riddle competition featuring 20 quantum-themed questions.\n• QTalk: A 2-minute presentation on a quantum concept or project-related topic.\n• Guess the QTech: A team-based game involving the identification of quantum technologies through clues.\n• Technical Activities: Quantum computing challenges and topics such as quantum repeaters and long-distance entanglement.',
    category: 'Events & Competitions',
    isTopQuestion: true,
  },
  {
    id: 'faq-08',
    number: 8,
    question: 'What should I prepare before attending the event?',
    answer:
      'For online activities and hands-on sessions, participants are advised to have:\n• A laptop and a stable internet connection.\n• A GitHub account, where required.\n• Basic Python knowledge.\n• Basic knowledge of quantum computing.\n• Familiarity with Qiskit, particularly for advanced technical activities.',
    category: 'Prerequisites & Prep',
  },
  {
    id: 'faq-09',
    number: 9,
    question: 'Will participants receive certificates or prizes?',
    answer:
      'Certificate and prize details will be announced by the organizing committee. Participants should refer to the official event announcements for the latest information.',
    category: 'Certificates & Contact',
  },
  {
    id: 'faq-10',
    number: 10,
    question: 'How can I register and receive event updates?',
    answer:
      'Follow the official SRM University-AP Qiskit Fall Fest 2026 announcements for registration links, schedules, eligibility requirements, and event updates.',
    category: 'Registration & Fees',
  },
  {
    id: 'faq-11',
    number: 11,
    question: 'Whom should I contact for further information?',
    answer:
      'Contact the SRMAP Qiskit Fall Fest 2026 organizing committee through the official event communication channels.',
    category: 'Certificates & Contact',
  },
  {
    id: 'faq-12',
    number: 12,
    question: 'Is there an online phase for Qiskit Fall Fest 2026?',
    answer:
      'Yes. The planned online phase will take place from October 5–9, 2026. Participants should follow the official announcements for online session links and activity details.',
    category: 'Schedule & Venues',
  },
  {
    id: 'faq-13',
    number: 13,
    question: 'Is there an offline phase at SRM University-AP?',
    answer:
      'Yes. The planned offline phase will be held from October 26–30, 2026, at SRM University-AP, Amaravati, Andhra Pradesh.',
    category: 'Schedule & Venues',
  },
  {
    id: 'faq-14',
    number: 14,
    question: 'What is the registration fee for the online course?',
    answer:
      'The registration fee for the Qiskit Fall Fest 2026 online course is ₹99 per participant. Participants can register by following the official registration instructions provided by the organizing committee.',
    category: 'Registration & Fees',
    isTopQuestion: true,
  },
  {
    id: 'faq-15',
    number: 15,
    question: 'What skills can I gain by participating in Qiskit Fall Fest?',
    answer:
      'Participants can develop an understanding of quantum computing, explore Qiskit, improve problem-solving and technical communication skills, and gain experience through collaborative activities and competitions.',
    category: 'General & Overview',
  },
];
