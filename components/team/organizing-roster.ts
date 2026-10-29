/**
 * Organizing team roster. Source of truth: QFF2026_Team_List_by_Track.pdf.
 * Contact details (phone, email, registration numbers) are intentionally not published.
 */

export interface RosterPerson {
  name: string;
  role: string;
  department?: string;
  year?: string;
}

export interface RosterCell {
  id: string;
  number: number;
  name: string;
  focusArea: string;
  description: string;
  responsibilities: string[];
  people: RosterPerson[]; // people[0] is the cell head
}

export interface RosterTrack {
  id: string;
  number: number;
  name: string;
  acronym: string;
  shortDescription: string;
  lead: RosterPerson;
  cellIds: number[];
}

export const EXECUTIVE: RosterPerson = { name: 'Harsha Siva Akash', role: 'Executive' };

export const TRACK_LEADS: Record<string, RosterPerson> = {
  'track-1': { name: 'Gyan Sah', role: 'Track Lead, Technical & Innovation' },
  'track-2': { name: 'Likith', role: 'Track Lead, Industry, Partnerships & Guest Relations' },
  'track-3': { name: 'Manikanta', role: 'Track Lead, Marketing, Brand & Media' },
  'track-4': { name: 'Dilip', role: 'Track Lead, Registration & Participant Experience' },
  'track-5': { name: 'Mahadesh', role: 'Track Lead, Operations & Administration' },
};

const H = 'Cell Head';
const M = 'Member';

export const ROSTER_TRACKS: RosterTrack[] = [
  {
    id: 'track-1', number: 1, name: 'Technical & Innovation', acronym: 'TI',
    shortDescription: 'The technical programme, the hackathon and competitions, and the festival website and platform.',
    lead: TRACK_LEADS['track-1'], cellIds: [1, 2, 3],
  },
  {
    id: 'track-2', number: 2, name: 'Industry, Partnerships & Guest Relations', acronym: 'IPGR',
    shortDescription: 'Industry partners, guest hospitality, and the expo and exhibition.',
    lead: TRACK_LEADS['track-2'], cellIds: [4, 5, 6],
  },
  {
    id: 'track-3', number: 3, name: 'Marketing, Brand & Media', acronym: 'MBM',
    shortDescription: 'Marketing and outreach, writing and documentation, branding and digital media.',
    lead: TRACK_LEADS['track-3'], cellIds: [7, 8, 9],
  },
  {
    id: 'track-4', number: 4, name: 'Registration & Participant Experience', acronym: 'RPE',
    shortDescription: 'Registration, the participant experience, and support and coordination.',
    lead: TRACK_LEADS['track-4'], cellIds: [10, 11, 12],
  },
  {
    id: 'track-5', number: 5, name: 'Operations & Administration', acronym: 'OA',
    shortDescription: 'Operations and logistics, finance and procurement, food safety and discipline.',
    lead: TRACK_LEADS['track-5'], cellIds: [13, 14, 15],
  },
];

export const ROSTER_CELLS: RosterCell[] = [
  {
    id: 'cell-1', number: 1, name: 'Technical Program Cell', focusArea: 'Technical Programme',
    description: 'Plans the technical programme: sessions, speakers, and the learning content for participants.',
    responsibilities: ['Planning the technical session schedule', 'Coordinating speakers and session materials', 'Supporting the learning track and quizzes'],
    people: [
      { name: 'Baratam Praneeth Gupta', role: H },
      { name: 'Jaswanth Kumar Kondameeda', role: M, department: 'CSE' },
      { name: 'Sri Tejaswini Golakoti', role: M, department: 'ECE' },
      { name: 'Kadali Yashwanth Vardhan', role: M, department: 'CSE' },
      { name: 'Aryan Avinash Vishwakarma', role: M, department: 'AiTI' },
      { name: 'Bhavya Sahasra Ongole', role: M, department: 'CSE' },
      { name: 'Syed Humaira Tasneem', role: M, department: 'CSE' },
      { name: 'Komara Charan Kumar', role: M, department: 'ECE' },
      { name: 'Anmol Mamgain', role: M, department: 'AiTI' },
      { name: 'Shaik Lal John Basha', role: M, department: 'CSE' },
      { name: 'Sathwika Nagavarapu', role: M, department: 'CSE' },
      { name: 'Aditya Raj Tiwary', role: M, department: 'ECE' },
      { name: 'Rishika Sharma', role: M, department: 'CSE' },
      { name: 'Y Sai Santhosh', role: M, department: 'CSE' },
      { name: 'Pranav Jaiswal', role: M, department: 'ECE' },
      { name: 'V. Akshaya', role: M, department: 'CSE (Cyber Security)' },
      { name: 'G. Nikhilesh', role: M, department: 'ECE' },
      { name: 'Thoti Manvitha Reddy', role: M, department: 'CSE' },
      { name: 'Thaneer Anunya', role: M, department: 'CSE (AI/ML)' },
      { name: 'Pardhu Gupta Pabbathi', role: M, department: 'CSE' },
      { name: 'Niveditha', role: M, department: 'CSE' },
      { name: 'K S H Tanmayi', role: M, department: 'CSE' },
      { name: 'Gadiraju Ramanuja', role: M, department: 'QuTI' },
    ],
  },
  {
    id: 'cell-2', number: 2, name: 'Hackathon & Competitions Cell', focusArea: 'Hackathon & Competitions',
    description: 'Runs the hackathon and the creative competitions, from problem statements to submissions.',
    responsibilities: ['Hackathon problem statements and team formation', 'Submission handling for the creative competitions', 'Coordinating evaluation'],
    people: [
      { name: 'Sri Vastava Sri Harsha Gampa', role: H, department: 'CSE', year: '2nd' },
      { name: 'Haresh G', role: M, department: 'QuTI', year: '1st' },
      { name: 'Jyoshna Pilli', role: M, department: 'CSE', year: '2nd' },
      { name: 'Sai Pujith Sembeti', role: M, department: 'CSE', year: '2nd' },
      { name: 'Jalagam Bhargava Sai', role: M, department: 'CSE', year: '2nd' },
      { name: 'Punumalli Pooja Sri', role: M, department: 'ECE', year: '3rd' },
      { name: 'Sravan Reddy Buchireddy', role: M, department: 'CSE', year: '1st' },
    ],
  },
  {
    id: 'cell-3', number: 3, name: 'Website & Technology Cell', focusArea: 'Website & Platform',
    description: 'Builds and runs the festival website, learning portal, and registration platform.',
    responsibilities: ['Website and learning portal', 'Registration and pass verification systems', 'Platform reliability during the festival'],
    people: [
      { name: 'Pigilam Srihaas', role: H, department: 'ECE (M.Tech)', year: '1st' },
      { name: 'Sandeep Nambi', role: M, department: 'CSE', year: '4th' },
      { name: 'Bandaru Jessy Robert', role: M, department: 'CSE', year: '4th' },
      { name: 'Kamma Ullas', role: M, department: 'CSE', year: '4th' },
      { name: 'Shaik Mahaboob Subhani', role: M, department: 'CSE', year: '1st' },
    ],
  },
  {
    id: 'cell-4', number: 4, name: 'Industry & Partnerships Cell', focusArea: 'Industry & Partnerships',
    description: 'Builds relationships with industry partners and sponsors for the festival.',
    responsibilities: ['Industry outreach and partner coordination', 'Sponsor communication', 'Supporting the Quantum Startup Pitch'],
    people: [
      { name: 'Likith Konakalla', role: H },
      { name: 'Poojith', role: M },
      { name: 'Ananya', role: M },
      { name: 'Jyoshna', role: M },
      { name: 'Kethan', role: M },
      { name: 'Ashritha', role: M },
    ],
  },
  {
    id: 'cell-5', number: 5, name: 'Hospitality & Guest Relations Cell', focusArea: 'Guest Relations',
    description: 'Looks after invited speakers and guests: protocol, travel, and on-campus hosting.',
    responsibilities: ['Guest and speaker hosting', 'Itineraries and protocol', 'Welcome and hospitality on campus'],
    people: [
      { name: 'Bhaswanth Y', role: H, department: 'CSE', year: '4th' },
      { name: 'V. Rohith', role: M, department: 'CSE', year: '4th' },
      { name: 'Garimella Sai Tripura Pranathi', role: M, department: 'CSE', year: '2nd' },
      { name: 'MD. Adaa Fathima', role: M, department: 'CSE', year: '2nd' },
      { name: 'Puvvada Yaswanth Venkata Saty Sai Narayan', role: M, department: 'ECE (M.Tech)', year: '1st' },
      { name: 'Sathvika Kedari', role: M, department: 'CSE', year: '2nd' },
      { name: 'A Pranathi', role: M },
    ],
  },
  {
    id: 'cell-6', number: 6, name: 'Expo & Exhibition Cell', focusArea: 'Expo & Exhibition',
    description: 'Organises the on-campus exhibitions and showcase stalls.',
    responsibilities: ['Exhibition layout and stalls', 'Coordinating exhibitors', 'On-site expo support'],
    people: [
      { name: 'Pardhava Krishna', role: H },
      { name: 'Srujana', role: M },
      { name: 'Ankith', role: M },
      { name: 'Nikhil', role: M },
    ],
  },
  {
    id: 'cell-7', number: 7, name: 'Marketing, Outreach & PR Cell', focusArea: 'Marketing & Outreach',
    description: 'Promotes the festival across campuses and social channels and handles public relations.',
    responsibilities: ['Outreach to colleges and student communities', 'Public relations and announcements', 'Promotional campaigns'],
    people: [
      { name: 'Madhan', role: H, department: 'CSE', year: '3rd' },
      { name: 'Dev Aryan Patnana', role: M, department: 'AiTI', year: '1st' },
      { name: 'Yendeti Gargi', role: M, department: 'ECE', year: '2nd' },
      { name: 'Shirupa Advaith', role: M, department: 'CSE', year: '2nd' },
      { name: 'Samanthula Jnana Sadhasri', role: M, department: 'CSE', year: '2nd' },
      { name: 'Nanda Gopal', role: M, department: 'CSE', year: '2nd' },
      { name: 'Dinesh', role: M, department: 'CSE', year: '3rd' },
      { name: 'Nakshatra', role: M, department: 'CSE', year: '3rd' },
      { name: 'M. Swapnil', role: M, department: 'CSE', year: '3rd' },
      { name: 'Sai Aswitha', role: M },
    ],
  },
  {
    id: 'cell-8', number: 8, name: 'Writers & Documentation Cell', focusArea: 'Writing & Documentation',
    description: 'Writes festival content and documents the event.',
    responsibilities: ['Announcements, emails, and web copy', 'Event documentation and reports', 'Content review'],
    people: [
      { name: 'Naga Nikitha Sanaka', role: H },
      { name: 'A. Sindhura', role: M },
      { name: 'R. Siva Namesh', role: M },
      { name: 'V. Hari Kiran', role: M },
      { name: 'N. Ganga Narayana', role: M },
      { name: 'Gaurav Gupta', role: M },
      { name: 'A. Keerthi Reddy', role: M },
      { name: 'Khushi Kailasam', role: M },
      { name: 'Aditi Bundela', role: M },
      { name: 'Rohitha', role: M },
    ],
  },
  {
    id: 'cell-9', number: 9, name: 'Branding & Digital Media Cell', focusArea: 'Branding & Digital Media',
    description: 'Owns the visual identity, designs, and digital media for the festival.',
    responsibilities: ['Posters, graphics, and visual identity', 'Reels and social media content', 'Event photography and video'],
    people: [
      { name: 'Preetham', role: H },
      { name: 'J. Bhargava Sai', role: M },
      { name: 'M. Sriya', role: M },
      { name: 'S. Sahithee', role: M },
      { name: 'V. Nirupam Teja', role: M },
      { name: 'Anshul Singh', role: M },
      { name: 'Dhruv Adabala', role: M },
      { name: 'V. Baradvaj', role: M },
      { name: 'U. Pushkar', role: M },
      { name: 'Thrishank', role: M },
      { name: 'Satvik', role: M },
      { name: 'Hamsitha Kagitala', role: M },
      { name: 'Bommisetty Shanmukha', role: M },
    ],
  },
  {
    id: 'cell-10', number: 10, name: 'Registration Cell', focusArea: 'Registration',
    description: 'Handles participant registration, passes, and the on-campus registration desk.',
    responsibilities: ['Registration and whitelist support', 'On-campus pass desk', 'Participant queries on registration'],
    people: [
      { name: 'Devisree Honne', role: H, department: 'CSE', year: '4th' },
      { name: 'Aakanksha Edpuganti', role: M, department: 'CSE (AI/ML)', year: '1st' },
      { name: 'Chakka Sahaja', role: M, department: 'CSE', year: '4th' },
      { name: 'Geeta Saisree Jasti', role: M, department: 'CSE', year: '1st' },
      { name: 'Potharlanka Rishita Sri', role: M, department: 'CSE', year: '1st' },
      { name: 'S T Sundar', role: M, department: 'CSE', year: '2nd' },
      { name: 'Kavuri Sindhura', role: M },
    ],
  },
  {
    id: 'cell-11', number: 11, name: 'Participant Experience Cell', focusArea: 'Participant Experience',
    description: 'Looks after participants on site: guidance, help desks, and overall experience.',
    responsibilities: ['Participant help desk', 'Guidance across venues and sessions', 'Collecting participant feedback'],
    people: [
      { name: 'Reshma', role: H },
      { name: 'Vaishnavi', role: M },
      { name: 'Ashmitha', role: M },
      { name: 'Sai Deep Reddy', role: M },
    ],
  },
  {
    id: 'cell-12', number: 12, name: 'Support and Coordination Cell', focusArea: 'Support & Coordination',
    description: 'Provides cross-team support and coordination during the festival.',
    responsibilities: ['Cross-team coordination', 'Backup support for cells on event days', 'Escalations and issue tracking'],
    people: [
      { name: 'Kushitha', role: H, department: 'ECE', year: '2nd' },
      { name: 'Bhargavi', role: M, department: 'CSE', year: '4th' },
      { name: 'Priyanka', role: M, department: 'CSE', year: '2nd' },
    ],
  },
  {
    id: 'cell-13', number: 13, name: 'Operations & Logistics Cell', focusArea: 'Operations & Logistics',
    description: 'Manages venues, equipment, and day-to-day logistics.',
    responsibilities: ['Venue and seating arrangements', 'Equipment and materials', 'Daily schedule logistics'],
    people: [
      { name: 'Tanvir Siddique Shaik', role: H, department: 'CSE', year: '3rd' },
      { name: 'Nerella Saiteja', role: M, department: 'CSE', year: '3rd' },
      { name: 'Ajifa Sultana', role: M, department: 'CSE', year: '2nd' },
      { name: 'Sanjibani Saha', role: M, department: 'ECE', year: '2nd' },
    ],
  },
  {
    id: 'cell-14', number: 14, name: 'Finance & Procurement Cell', focusArea: 'Finance & Procurement',
    description: 'Handles the budget, payments, and procurement for the festival.',
    responsibilities: ['Budget tracking', 'Purchases and vendor payments', 'Prize and expense records'],
    people: [
      { name: 'Aparna Medida', role: H, department: 'CSE', year: '4th' },
      { name: 'Dasaradh', role: M },
    ],
  },
  {
    id: 'cell-15', number: 15, name: 'Food Safety & Discipline Cell', focusArea: 'Food Safety & Discipline',
    description: 'Oversees food arrangements, hygiene, and discipline at venues.',
    responsibilities: ['Meal and refreshment arrangements', 'Food safety checks', 'Discipline and conduct at venues'],
    people: [
      { name: 'Pradnish Chintada', role: M, department: 'CSE', year: '4th' },
    ],
  },
];

export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
