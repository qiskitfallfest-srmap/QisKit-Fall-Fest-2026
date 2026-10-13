export type CampusLocationCategory =
  | 'academic'
  | 'lab'
  | 'venue'
  | 'dining'
  | 'sports'
  | 'facility';

export interface CampusLocation {
  id: string;
  name: string;
  shortName?: string;
  category: CampusLocationCategory;
  categoryLabel: string;
  subtitle?: string;
  description: string;
  image: string;
  isKeyVenue?: boolean;
  map: {
    footprintId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rx?: number;
    pinX?: number;
    pinY?: number;
  };
  locationLabel: string;
  festRole?: string;
  tags?: string[];
  metadata?: {
    buildingCode?: string;
    facilities?: string[];
  };
}

export const KEY_FEST_VENUES = [
  'x-lab',
  'jc-bose',
  'v-block',
  'food-court',
  'sr-block',
];

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'x-lab',
    name: 'Main Auditorium (X-Lab)',
    shortName: 'X-Lab Audi',
    category: 'venue',
    categoryLabel: 'Auditorium',
    isKeyVenue: true,
    description:
      "Houses the university's main auditorium for keynote presentations, ceremonies, and plenary sessions.",
    image: '/images/venues/x-lab.webp',
    map: {
      footprintId: 'bldg-x-lab',
      x: 380,
      y: 335,
      width: 105,
      height: 105,
      rx: 8,
      pinX: 404,
      pinY: 388,
    },
    locationLabel: 'Central Campus',
  },
  {
    id: 'jc-bose',
    name: 'J.C. Bose Block',
    shortName: 'JC Bose (PhD)',
    category: 'academic',
    categoryLabel: 'PhD & Research Block',
    isKeyVenue: true,
    description:
      'Dedicated academic and research block primarily housing PhD scholars, research chambers, and advanced seminar spaces.',
    image: '/images/venues/jc-bose.webp',
    map: {
      footprintId: 'bldg-jc-bose',
      x: 525,
      y: 335,
      width: 125,
      height: 95,
      rx: 8,
      pinX: 585,
      pinY: 335,
    },
    locationLabel: 'Central Campus',
  },
  {
    id: 'v-block',
    name: 'V-Block (Vikram Sarabhai)',
    shortName: 'V-Block',
    category: 'academic',
    categoryLabel: 'Academic & Lab Block',
    isKeyVenue: true,
    description:
      'Academic building housing student laboratories, computing centers, and the Quantum Computing Lab. Connected to Homi J. Bhabha Block via the 5th-floor skybridge.',
    image: '/images/venues/v-block.webp',
    map: {
      footprintId: 'bldg-v-block',
      x: 370,
      y: 225,
      width: 125,
      height: 60,
      rx: 8,
      pinX: 505,
      pinY: 255,
    },
    locationLabel: 'North Academic Wing',
  },
  {
    id: 'homi-bhabha',
    name: 'Homi J. Bhabha Block',
    shortName: 'Homi Bhabha',
    category: 'academic',
    categoryLabel: 'Administrative & Depts',
    isKeyVenue: true,
    description:
      'Houses the CR-CS Department, Examination Department, Finance Department, and central university offices. Connected to V-Block via the 5th-floor skybridge.',
    image: '/images/venues/homi-bhabha.webp',
    map: {
      footprintId: 'bldg-homi-bhabha',
      x: 515,
      y: 225,
      width: 135,
      height: 60,
      rx: 8,
      pinX: 505,
      pinY: 255,
    },
    locationLabel: 'North Academic Wing',
  },
  {
    id: 'food-court',
    name: 'Campus Food Court',
    shortName: 'Food Court',
    category: 'dining',
    categoryLabel: 'Dining & Outlets',
    isKeyVenue: true,
    description:
      'Central dining concourse and commercial hub featuring Total Fresh Supermarket, Domino\'s, Belgian Waffle, Baskin Robbins, US Pizza, Hello Idly, and Chat & Chill.',
    image: '/images/venues/food-court.webp',
    map: {
      footprintId: 'bldg-food-court',
      x: 560,
      y: 460,
      width: 135,
      height: 105,
      rx: 8,
      pinX: 560,
      pinY: 480,
    },
    locationLabel: 'Campus Concourse',
  },
  {
    id: 'sr-block',
    name: 'S.R. Block (Srinivasa Ramanujan)',
    shortName: 'S.R. Block',
    category: 'academic',
    categoryLabel: 'Academic & Mini Audi',
    isKeyVenue: true,
    description:
      'Major multi-story academic block featuring student classrooms, engineering labs, and the university Mini Auditorium.',
    image: '/images/venues/sr-block.webp',
    map: {
      footprintId: 'bldg-sr-block',
      x: 250,
      y: 425,
      width: 60,
      height: 155,
      rx: 8,
      pinX: 280,
      pinY: 425,
    },
    locationLabel: 'Western Avenue',
  },
  {
    id: 'c-block',
    name: 'C-Block',
    shortName: 'C-Block',
    category: 'academic',
    categoryLabel: 'Academic Block',
    description:
      'Academic building situated in the southwestern campus area.',
    image: '/images/venues/c-block.webp',
    map: {
      footprintId: 'bldg-c-block',
      x: 80,
      y: 610,
      width: 160,
      height: 60,
      rx: 8,
      pinX: 160,
      pinY: 610,
    },
    locationLabel: 'Southwestern Campus',
  },
  {
    id: 'ground',
    name: 'University Sports Ground',
    shortName: 'Sports Ground',
    category: 'sports',
    categoryLabel: 'Sports & Athletics',
    description:
      'Campus athletics ground with running track and open sports field.',
    image: '/images/venues/ground.webp',
    map: {
      footprintId: 'bldg-ground',
      x: 345,
      y: 460,
      width: 195,
      height: 175,
      rx: 12,
      pinX: 440,
      pinY: 465,
    },
    locationLabel: 'South Campus',
  },
  {
    id: 'annapurna-mess',
    name: 'Annapurna Dining Hall',
    shortName: 'Annapurna Mess',
    category: 'dining',
    categoryLabel: 'Dining',
    description:
      'Student dining facility located near the north residential towers.',
    image: '/images/venues/campus-generic.webp',
    map: {
      footprintId: 'bldg-annapurna-mess',
      x: 520,
      y: 145,
      width: 95,
      height: 42,
      rx: 6,
      pinX: 520,
      pinY: 165,
    },
    locationLabel: 'North Residential Quad',
  },
  {
    id: 'north-hostels',
    name: 'North Hostels',
    shortName: 'North Hostels',
    category: 'facility',
    categoryLabel: 'Student Hostels',
    description:
      'Student residential towers: Kaveri, Godavari, Krishna, Yamuna, and Narmada.',
    image: '/images/venues/campus-generic.webp',
    map: {
      footprintId: 'bldg-north-hostels',
      x: 395,
      y: 40,
      width: 170,
      height: 90,
      rx: 6,
      pinX: 480,
      pinY: 40,
    },
    locationLabel: 'North Residential Quad',
  },
  {
    id: 'west-hostels',
    name: 'West Hostels',
    shortName: 'West Hostels',
    category: 'facility',
    categoryLabel: 'Student Hostels',
    description:
      'Student residential blocks: Theestha, Vedavathi, Ganga, and Brahmaputra.',
    image: '/images/venues/campus-generic.webp',
    map: {
      footprintId: 'bldg-west-hostels',
      x: 155,
      y: 227,
      width: 165,
      height: 168,
      rx: 6,
      pinX: 315,
      pinY: 310,
    },
    locationLabel: 'Western Residential Corridor',
  },
  {
    id: 'gate-3',
    name: 'SRM Gate 3',
    shortName: 'Gate 3',
    category: 'venue',
    categoryLabel: 'Main Entrance',
    description:
      'Main entry gateway on the eastern perimeter with festival arrival and registration check-in.',
    image: '/images/venues/hero-secondary.webp',
    map: {
      footprintId: 'bldg-gate-3',
      x: 740,
      y: 310,
      width: 40,
      height: 35,
      rx: 6,
      pinX: 740,
      pinY: 310,
    },
    locationLabel: 'Eastern Perimeter',
  },
];
