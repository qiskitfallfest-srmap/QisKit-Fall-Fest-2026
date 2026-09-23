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
    image: '/images/venues/x-lab.jpg',
    map: {
      footprintId: 'bldg-x-lab',
      x: 370,
      y: 335,
      width: 135,
      height: 95,
      rx: 8,
      pinX: 437,
      pinY: 335,
    },
    locationLabel: 'Central Campus',
  },
  {
    id: 'jc-bose',
    name: 'J.C. Bose Block',
    shortName: 'JC Bose',
    category: 'academic',
    categoryLabel: 'Academic Block',
    isKeyVenue: true,
    description:
      'Central academic block on campus housing lecture halls and classrooms.',
    image: '/images/venues/jc-bose.jpg',
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
    categoryLabel: 'Academic Block',
    isKeyVenue: true,
    description:
      'Academic building housing computing laboratories, the Quantum Computing Lab, and classrooms.',
    image: '/images/venues/v-block.jpg',
    map: {
      footprintId: 'bldg-v-block',
      x: 370,
      y: 225,
      width: 125,
      height: 60,
      rx: 8,
      pinX: 430,
      pinY: 225,
    },
    locationLabel: 'North Academic Wing',
  },
  {
    id: 'homi-bhabha',
    name: 'Homi J. Bhabha Block',
    shortName: 'Homi Bhabha',
    category: 'academic',
    categoryLabel: 'Academic Block',
    isKeyVenue: true,
    description:
      'Academic and sciences block adjoining the Vikram Sarabhai block.',
    image: '/images/venues/homi-bhabha.png',
    map: {
      footprintId: 'bldg-homi-bhabha',
      x: 515,
      y: 225,
      width: 135,
      height: 60,
      rx: 8,
      pinX: 580,
      pinY: 225,
    },
    locationLabel: 'North Academic Wing',
  },
  {
    id: 'food-court',
    name: 'Campus Food Court',
    shortName: 'Food Court',
    category: 'dining',
    categoryLabel: 'Dining',
    isKeyVenue: true,
    description:
      'Central dining concourse with food stalls, cafeteria counters, and seating areas.',
    image: '/images/venues/food-court.png',
    map: {
      footprintId: 'bldg-food-court',
      x: 560,
      y: 460,
      width: 135,
      height: 105,
      rx: 8,
      pinX: 625,
      pinY: 465,
    },
    locationLabel: 'Campus Concourse',
  },
  {
    id: 'sr-block',
    name: 'S.R. Block (Srinivasa Ramanujan)',
    shortName: 'S.R. Block',
    category: 'academic',
    categoryLabel: 'Academic Block',
    isKeyVenue: true,
    description:
      'Multi-story academic building along the western avenue with classrooms and seminar halls.',
    image: '/images/venues/sr-block.jpg',
    map: {
      footprintId: 'bldg-sr-block',
      x: 250,
      y: 410,
      width: 60,
      height: 160,
      rx: 8,
      pinX: 280,
      pinY: 410,
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
    image: '/images/venues/c-block.jpg',
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
    image: '/images/venues/ground.png',
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
    image: '/images/venues/campus-generic.png',
    map: {
      footprintId: 'bldg-annapurna-mess',
      x: 490,
      y: 140,
      width: 75,
      height: 40,
      rx: 6,
      pinX: 527,
      pinY: 140,
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
    image: '/images/venues/campus-generic.png',
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
    image: '/images/venues/campus-generic.png',
    map: {
      footprintId: 'bldg-west-hostels',
      x: 165,
      y: 185,
      width: 145,
      height: 165,
      rx: 6,
      pinX: 235,
      pinY: 185,
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
    image: '/images/venues/hero-secondary.png',
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
