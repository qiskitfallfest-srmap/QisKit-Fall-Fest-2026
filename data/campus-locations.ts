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
    shortName: 'X-Lab & Audi',
    subtitle: 'University Auditorium & Plenary Stage',
    category: 'venue',
    categoryLabel: 'Main Auditorium',
    isKeyVenue: true,
    description:
      'The primary event pavilion of SRM University-AP housing the Main University Auditorium for opening ceremonies, keynotes, and high-impact plenary talks.',
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
    locationLabel: 'Central Campus Core',
    festRole: 'Keynotes, Opening Ceremony & Plenaries',
    tags: ['Main Auditorium', 'Plenary Stage'],
    metadata: {
      buildingCode: 'XLA',
      facilities: ['University Auditorium', 'Solar Canopy'],
    },
  },
  {
    id: 'jc-bose',
    name: 'J.C. Bose Block',
    shortName: 'JC Bose',
    subtitle: 'Academic Complex & Lecture Theaters',
    category: 'academic',
    categoryLabel: 'Academic Block',
    isKeyVenue: true,
    description:
      'The central academic block of SRM University-AP. Positioned south of the Gate 3 arrival avenue, it features modern lecture theaters and academic chambers.',
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
    locationLabel: 'Central Campus Quad',
    festRole: 'Lecture Halls & Breakout Theaters',
    tags: ['Lecture Theaters', 'Faculty Chambers'],
    metadata: {
      buildingCode: 'JCB',
      facilities: ['Lecture Halls', 'Fountain Plaza'],
    },
  },
  {
    id: 'v-block',
    name: 'V-Block (Vikram Sarabhai)',
    shortName: 'V-Block',
    subtitle: 'Workshop Classrooms & Labs',
    category: 'academic',
    categoryLabel: 'Academic Wing',
    isKeyVenue: true,
    description:
      'North academic wing connected with Homi Bhabha block, housing seminar classrooms and computer labs for hands-on sessions.',
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
    festRole: 'Hands-on Workshops & Code Labs',
    tags: ['Workshops', 'Code Labs'],
    metadata: {
      buildingCode: 'VSB',
      facilities: ['Smart Classrooms', 'Breakout Rooms'],
    },
  },
  {
    id: 'homi-bhabha',
    name: 'Homi J. Bhabha Block',
    shortName: 'Homi Bhabha',
    subtitle: 'Sciences & Research Wing',
    category: 'academic',
    categoryLabel: 'Academic Wing',
    isKeyVenue: true,
    description:
      'Science and research wing situated north of Gate 3 avenue directly adjoining V-Block, accommodating research laboratories and galleries.',
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
    festRole: 'Academic Demos & Research Exhibits',
    tags: ['Research Labs', 'Poster Gallery'],
    metadata: {
      buildingCode: 'HJB',
      facilities: ['Science Labs', 'Classrooms'],
    },
  },
  {
    id: 'food-court',
    name: 'Campus Food Court',
    shortName: 'Food Court',
    subtitle: 'Dining & Refreshments',
    category: 'dining',
    categoryLabel: 'Dining Concourse',
    isKeyVenue: true,
    description:
      'Central multi-cuisine dining hub situated east of the sports ground, offering meal stalls, cafes, and open seating for attendees.',
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
    locationLabel: 'South-East Concourse',
    festRole: 'Attendee Meals & Coffee Lounges',
    tags: ['Dining', 'Cafeteria'],
    metadata: {
      buildingCode: 'FDC',
      facilities: ['Dining Stalls', 'Outdoor Seating'],
    },
  },
  {
    id: 'sr-block',
    name: 'S-Block (Srinivasa Ramanujan)',
    shortName: 'S-Block',
    subtitle: 'Department Classrooms & Mini Theatre',
    category: 'academic',
    categoryLabel: 'Academic Facility',
    isKeyVenue: true,
    description:
      'Landmark multi-story structure along the western avenue with departmental classrooms, computer labs, and mini theatre.',
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
    locationLabel: 'South-West Academic Axis',
    festRole: 'Student Meetups & Mini Theatre Sessions',
    tags: ['Mini Theatre', 'Computer Labs'],
    metadata: {
      buildingCode: 'SRB',
      facilities: ['Mini Theatre', 'Computer Centers'],
    },
  },
  {
    id: 'c-block',
    name: 'C Block',
    shortName: 'C-Block',
    subtitle: 'Department Classrooms',
    category: 'academic',
    categoryLabel: 'Academic Wing',
    description:
      'Departmental facility at the south-western campus periphery below S-Block with lecture classrooms.',
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
    locationLabel: 'South-West Campus',
    festRole: 'Breakout Classrooms',
    tags: ['Classrooms'],
    metadata: {
      buildingCode: 'CBK',
      facilities: ['Lecture Classrooms'],
    },
  },
  {
    id: 'ground',
    name: 'University Sports Ground',
    shortName: 'Ground',
    subtitle: 'Athletics & Recreation Field',
    category: 'sports',
    categoryLabel: 'Athletics Ground',
    description:
      'Large multi-sport field south of X-Lab and J.C. Bose Block with synthetic running track and open grounds.',
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
    locationLabel: 'South Campus Grounds',
    festRole: 'Open Recreation & Gathering',
    tags: ['Track & Field'],
    metadata: {
      buildingCode: 'SPT',
      facilities: ['Running Track', 'Sports Field'],
    },
  },
  {
    id: 'annapurna-mess',
    name: 'Annapurna Dining Hall',
    shortName: 'Annapurna Mess',
    subtitle: 'Student Dining',
    category: 'dining',
    categoryLabel: 'Dining Concourse',
    description:
      'Student dining hall in the north residential quad providing daily meals.',
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
    festRole: 'Resident Dining',
    tags: ['Mess'],
    metadata: {
      buildingCode: 'APM',
    },
  },
  {
    id: 'north-hostels',
    name: 'North Hostel Towers',
    shortName: 'North Hostels',
    subtitle: 'Student Hostels (Kaveri, Godavari, Krishna, Yamuna, Narmada)',
    category: 'facility',
    categoryLabel: 'Accommodation',
    description:
      'Residential hostel blocks in twin north columns providing on-campus accommodation.',
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
    locationLabel: 'North Residential Enclave',
    festRole: 'Accommodations',
    tags: ['Hostels'],
  },
  {
    id: 'west-hostels',
    name: 'West Hostel Enclave',
    shortName: 'West Hostels',
    subtitle: 'Theestha, Vedavathi, Ganga, Brahmaputra',
    category: 'facility',
    categoryLabel: 'Accommodation',
    description:
      'Hostel accommodations aligned along the western avenue: Theestha, Vedavathi, Ganga, and Brahmaputra.',
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
    festRole: 'Accommodations',
    tags: ['Hostels'],
  },
  {
    id: 'gate-3',
    name: 'SRM Gate 3',
    shortName: 'Gate 3',
    subtitle: 'Main Arrival Gateway & Check-in',
    category: 'venue',
    categoryLabel: 'Campus Gateway',
    description:
      'Main entrance gateway on eastern perimeter with arrival registration desks and security check-in.',
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
    locationLabel: 'Eastern Campus Perimeter',
    festRole: 'Check-in & Badge Pickup',
    tags: ['Arrival Gate'],
  },
];
