import { Complaint, DepartmentMeta, User, Notification } from './types.js';
import { seedNotifications } from './notifications.js';
import { evaluateSlaStatus } from './services/slaEngine.js';

export const DEPARTMENTS: DepartmentMeta[] = [
  {
    id: 'ROADS',
    name: 'Roads, Bridges & Potholes',
    code: 'RBP',
    officerInCharge: 'Er. Rajesh Verma',
    contactEmail: 'roads@city.gov',
    contactPhone: '+1 (555) 019-2831',
    baseSlaHours: { CRITICAL: 12, HIGH: 24, MEDIUM: 48, LOW: 72 },
    icon: 'Hammer',
  },
  {
    id: 'WASTE',
    name: 'Solid Waste Management & Sanitation',
    code: 'SWM',
    officerInCharge: 'Dr. Anita Desai',
    contactEmail: 'sanitation@city.gov',
    contactPhone: '+1 (555) 019-2832',
    baseSlaHours: { CRITICAL: 6, HIGH: 12, MEDIUM: 24, LOW: 48 },
    icon: 'Trash2',
  },
  {
    id: 'WATER',
    name: 'Water Supply & Sewerage Board',
    code: 'WSSB',
    officerInCharge: 'Er. Sandeep Mehta',
    contactEmail: 'water@city.gov',
    contactPhone: '+1 (555) 019-2833',
    baseSlaHours: { CRITICAL: 8, HIGH: 16, MEDIUM: 36, LOW: 48 },
    icon: 'Droplets',
  },
  {
    id: 'ELECTRICITY',
    name: 'Street Lighting & Municipal Power',
    code: 'SLMP',
    officerInCharge: 'Er. Vikram Joshi',
    contactEmail: 'lighting@city.gov',
    contactPhone: '+1 (555) 019-2834',
    baseSlaHours: { CRITICAL: 6, HIGH: 12, MEDIUM: 24, LOW: 48 },
    icon: 'Zap',
  },
  {
    id: 'HEALTH',
    name: 'Public Health, Vector Control & Hygiene',
    code: 'PHVC',
    officerInCharge: 'Dr. Priya Nambiar',
    contactEmail: 'health@city.gov',
    contactPhone: '+1 (555) 019-2835',
    baseSlaHours: { CRITICAL: 12, HIGH: 24, MEDIUM: 48, LOW: 72 },
    icon: 'Activity',
  },
  {
    id: 'PARKS',
    name: 'Parks, Horticulture & Urban Greenery',
    code: 'PHUG',
    officerInCharge: 'Kavita Sundaram',
    contactEmail: 'parks@city.gov',
    contactPhone: '+1 (555) 019-2836',
    baseSlaHours: { CRITICAL: 24, HIGH: 48, MEDIUM: 72, LOW: 96 },
    icon: 'Trees',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-citizen-1',
    name: 'Sarah Jenkins',
    email: 'citizen@city.gov',
    password: '$2b$12$dsCOH5Gax9Ruwp5rp4wG0O8.bh1TQrcWYcgbwIX4xMM79EArwwvSu',
    phone: '+1 (555) 234-5678',
    ward: 'Ward 4',
    role: 'CITIZEN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-officer-1',
    name: 'Er. Rajesh Verma',
    email: 'officer@city.gov',
    password: '$2b$12$dsCOH5Gax9Ruwp5rp4wG0O8.bh1TQrcWYcgbwIX4xMM79EArwwvSu',
    phone: '+1 (555) 019-2831',
    ward: 'Central Zone',
    role: 'OFFICER',
    department: 'ROADS',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-admin-1',
    name: 'Commissioner Robert Sterling',
    email: 'admin@city.gov',
    password: '$2b$12$dsCOH5Gax9Ruwp5rp4wG0O8.bh1TQrcWYcgbwIX4xMM79EArwwvSu',
    phone: '+1 (555) 999-0001',
    ward: 'Headquarters',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

const now = Date.now();
const hourMs = 60 * 60 * 1000;

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2025-1042',
    title: 'Severe Water Main Burst Causing Road Inundation',
    description:
      'A primary 12-inch potable water pipe ruptured under the pavement on 4th Main Road. Clean drinking water is gushing out rapidly, flooding the intersection near St. Jude School and causing traffic standstill.',
    category: 'Water Pipeline Rupture',
    department: 'WATER',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    ward: 'Ward 4',
    address: '4th Main Road, Corner of 9th Cross',
    landmark: 'Opposite St. Jude Elementary School',
    citizenId: 'usr-citizen-1',
    citizenName: 'Sarah Jenkins',
    citizenPhone: '+1 (555) 234-5678',
    citizenEmail: 'citizen@city.gov',
    createdAt: new Date(now - 7 * hourMs).toISOString(),
    updatedAt: new Date(now - 2 * hourMs).toISOString(),
    slaTargetHours: 8,
    slaDeadline: new Date(now + 1 * hourMs).toISOString(), // 1 hour left -> WARNING
    slaStatus: 'WARNING',
    imageUrl:
      'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80',
    assignedOfficer: 'Er. Sandeep Mehta (Water Board)',
    upvotes: 24,
    upvotedBy: ['usr-citizen-1', 'usr-citizen-2', 'usr-citizen-3'],
    tags: ['Water Burst', 'Flooding', 'Critical', 'Traffic Disruption'],
    aiAnalysis: {
      confidence: 0.96,
      reasoning:
        'Immediate hazard: Potable water waste combined with active intersection flooding directly in front of an educational institution.',
      detectedKeywords: ['water pipe burst', 'burst pipe flooding', 'school route'],
      hazardLevel: 'CRITICAL',
    },
    timeline: [
      {
        id: 't-1',
        timestamp: new Date(now - 7 * hourMs).toISOString(),
        title: 'Grievance Registered',
        description: 'Citizen filed grievance via web portal with attached photo evidence.',
        actorName: 'Sarah Jenkins',
        actorRole: 'CITIZEN',
        status: 'OPEN',
      },
      {
        id: 't-2',
        timestamp: new Date(now - 6.8 * hourMs).toISOString(),
        title: 'AI Priority & Routing Assigned',
        description:
          'Automated AI engine classified priority as CRITICAL and routed ticket directly to Water Supply & Sewerage Board with an 8-hour emergency SLA.',
        actorName: 'CivicResolve AI Engine',
        actorRole: 'SYSTEM',
        status: 'OPEN',
      },
      {
        id: 't-3',
        timestamp: new Date(now - 5 * hourMs).toISOString(),
        title: 'Work Order Dispatched',
        description: 'Ground crew emergency van 04 deployed with excavation excavator and isolation valves.',
        actorName: 'Er. Sandeep Mehta',
        actorRole: 'OFFICER',
        status: 'IN_PROGRESS',
      },
      {
        id: 't-4',
        timestamp: new Date(now - 2 * hourMs).toISOString(),
        title: 'Isolation Valve Closed',
        description:
          'Upstream isolation valve locked. Excavation underway to weld replacement collar sleeve on the 12-inch duct.',
        actorName: 'Er. Sandeep Mehta',
        actorRole: 'OFFICER',
        status: 'IN_PROGRESS',
      },
    ],
  },
  {
    id: 'CMP-2025-0988',
    title: 'Deep Hazardous Crater Pothole on Commuter Expressway Flyover',
    description:
      'A dangerous 8-inch deep crater pothole has developed on the central lane of the flyover descent. Multiple two-wheelers have almost lost control in wet conditions.',
    category: 'Potholes & Road Damage',
    department: 'ROADS',
    priority: 'HIGH',
    status: 'OPEN',
    ward: 'Ward 2',
    address: 'Outer Ring Flyover, Southbound Exit Ramp',
    landmark: 'Near Milestone 14B',
    citizenId: 'usr-citizen-2',
    citizenName: 'Michael Chang',
    citizenPhone: '+1 (555) 345-6789',
    citizenEmail: 'm.chang@example.com',
    createdAt: new Date(now - 14 * hourMs).toISOString(),
    updatedAt: new Date(now - 14 * hourMs).toISOString(),
    slaTargetHours: 24,
    slaDeadline: new Date(now + 10 * hourMs).toISOString(),
    slaStatus: 'ON_TRACK',
    imageUrl:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    assignedOfficer: 'Er. Rajesh Verma',
    upvotes: 18,
    upvotedBy: ['usr-citizen-2', 'usr-citizen-4'],
    tags: ['Pothole', 'Flyover', 'Accident Risk', 'Roads'],
    aiAnalysis: {
      confidence: 0.92,
      reasoning: 'High vehicular accident risk on high-speed flyover descent.',
      detectedKeywords: ['deep pothole', 'accident prone', 'flyover'],
      hazardLevel: 'HIGH',
    },
    timeline: [
      {
        id: 't-11',
        timestamp: new Date(now - 14 * hourMs).toISOString(),
        title: 'Grievance Lodged',
        description: 'Submitted by commuter with geolocated photo of pothole depth.',
        actorName: 'Michael Chang',
        actorRole: 'CITIZEN',
        status: 'OPEN',
      },
    ],
  },
  {
    id: 'CMP-2025-0951',
    title: 'Overflowing Commercial Dumpster & Illegal Debris Dumping',
    description:
      'The municipal waste bin has not been cleared for over 48 hours. Rotting biological waste has spilled onto the walkway, emitting severe stench and attracting stray animals.',
    category: 'Garbage Dump Overflow',
    department: 'WASTE',
    priority: 'HIGH',
    status: 'OPEN',
    ward: 'Ward 4',
    address: 'Central Vegetable Market, Gate 3',
    landmark: 'Behind Commercial Bank ATM',
    citizenId: 'usr-citizen-3',
    citizenName: 'Ramesh Patel',
    citizenPhone: '+1 (555) 456-7890',
    citizenEmail: 'ramesh.p@example.com',
    createdAt: new Date(now - 28 * hourMs).toISOString(),
    updatedAt: new Date(now - 28 * hourMs).toISOString(),
    slaTargetHours: 12,
    slaDeadline: new Date(now - 16 * hourMs).toISOString(), // Breached!
    slaStatus: 'BREACHED',
    imageUrl:
      'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    assignedOfficer: 'Dr. Anita Desai',
    upvotes: 31,
    upvotedBy: ['usr-citizen-1', 'usr-citizen-3', 'usr-citizen-5'],
    tags: ['Garbage', 'Sanitation', 'Public Health', 'SLA Breached'],
    aiAnalysis: {
      confidence: 0.94,
      reasoning: 'Sanitation emergency: Uncollected decomposing organic waste in busy market zone.',
      detectedKeywords: ['garbage dumped', 'foul smell', 'stray animals'],
      hazardLevel: 'HIGH',
    },
    timeline: [
      {
        id: 't-21',
        timestamp: new Date(now - 28 * hourMs).toISOString(),
        title: 'Grievance Submitted',
        description: 'Resident reported persistent commercial waste overflow.',
        actorName: 'Ramesh Patel',
        actorRole: 'CITIZEN',
        status: 'OPEN',
      },
      {
        id: 't-22',
        timestamp: new Date(now - 16 * hourMs).toISOString(),
        title: 'SLA Escalation Triggered',
        description:
          '12-hour resolution SLA expired without on-site confirmation. Ticket flagged to District Sanitation Supervisor.',
        actorName: 'CivicResolve SLA Bot',
        actorRole: 'SYSTEM',
        status: 'OPEN',
      },
    ],
  },
  {
    id: 'CMP-2025-0912',
    title: 'Series of 5 Streetlights Inoperative Creating Dark Corridor',
    description:
      'Streetlights from pole #42 to #46 have been dead for 4 nights consecutively. The pedestrian path is in pitch black, causing major safety concerns for women and evening commuters.',
    category: 'Street Lighting & Darkness',
    department: 'ELECTRICITY',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    ward: 'Ward 7',
    address: 'Oakwood Avenue, Between 12th & 15th Lane',
    landmark: 'Adjacent to Community Center Park',
    citizenId: 'usr-citizen-1',
    citizenName: 'Sarah Jenkins',
    citizenPhone: '+1 (555) 234-5678',
    citizenEmail: 'citizen@city.gov',
    createdAt: new Date(now - 20 * hourMs).toISOString(),
    updatedAt: new Date(now - 6 * hourMs).toISOString(),
    slaTargetHours: 24,
    slaDeadline: new Date(now + 4 * hourMs).toISOString(),
    slaStatus: 'WARNING',
    imageUrl:
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    assignedOfficer: 'Er. Vikram Joshi',
    upvotes: 12,
    upvotedBy: ['usr-citizen-1', 'usr-citizen-6'],
    tags: ['Streetlight', 'Darkness', 'Safety', 'Electricity'],
    aiAnalysis: {
      confidence: 0.88,
      reasoning: 'Public safety concern: Long dark pedestrian stretch in residential community.',
      detectedKeywords: ['street light dark', 'pitch black', 'safety'],
      hazardLevel: 'MEDIUM',
    },
    timeline: [
      {
        id: 't-31',
        timestamp: new Date(now - 20 * hourMs).toISOString(),
        title: 'Grievance Registered',
        description: 'Resident reported dark corridor with pole numbers.',
        actorName: 'Sarah Jenkins',
        actorRole: 'CITIZEN',
        status: 'OPEN',
      },
      {
        id: 't-32',
        timestamp: new Date(now - 6 * hourMs).toISOString(),
        title: 'Electrical Inspection Assigned',
        description: 'Crew dispatched to test local circuit breaker box CB-07.',
        actorName: 'Er. Vikram Joshi',
        actorRole: 'OFFICER',
        status: 'IN_PROGRESS',
      },
    ],
  },
  {
    id: 'CMP-2025-0870',
    title: 'Vandalized Children Swing Set with Exposed Rusty Metal',
    description:
      'The children’s swing seat was snapped off and a jagged rusty metal chain is dangling at child eye height in the public playground.',
    category: 'Parks & Playground Safety',
    department: 'PARKS',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    ward: 'Ward 3',
    address: 'Pinecrest Memorial Park, Play Zone B',
    landmark: 'Near the toddler sand pit',
    citizenId: 'usr-citizen-4',
    citizenName: 'David Lee',
    citizenPhone: '+1 (555) 567-8901',
    citizenEmail: 'david.lee@example.com',
    createdAt: new Date(now - 40 * hourMs).toISOString(),
    updatedAt: new Date(now - 12 * hourMs).toISOString(),
    resolvedAt: new Date(now - 12 * hourMs).toISOString(),
    slaTargetHours: 72,
    slaDeadline: new Date(now + 32 * hourMs).toISOString(),
    slaStatus: 'ON_TRACK',
    imageUrl:
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80',
    resolutionImageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
    resolutionRemarks:
      'Ground maintenance crew replaced the damaged chain assembly and installed two brand new heavy-duty rubber molded toddler swings with safety carabiners. Full playground inspected.',
    assignedOfficer: 'Kavita Sundaram',
    upvotes: 9,
    upvotedBy: ['usr-citizen-4'],
    tags: ['Parks', 'Playground', 'Resolved', 'Child Safety'],
    aiAnalysis: {
      confidence: 0.91,
      reasoning: 'Sharp rusty metal edge in toddler playground posing laceration risk.',
      detectedKeywords: ['swing', 'rusty metal', 'playground', 'child'],
      hazardLevel: 'MEDIUM',
    },
    timeline: [
      {
        id: 't-41',
        timestamp: new Date(now - 40 * hourMs).toISOString(),
        title: 'Grievance Submitted',
        description: 'Reported by visiting parent.',
        actorName: 'David Lee',
        actorRole: 'CITIZEN',
        status: 'OPEN',
      },
      {
        id: 't-42',
        timestamp: new Date(now - 24 * hourMs).toISOString(),
        title: 'Requisition Approved',
        description: 'Replacement swing parts requisitioned from city central warehouse.',
        actorName: 'Kavita Sundaram',
        actorRole: 'OFFICER',
        status: 'IN_PROGRESS',
      },
      {
        id: 't-43',
        timestamp: new Date(now - 12 * hourMs).toISOString(),
        title: 'Repairs Completed & Verified',
        description:
          'Installed new swing equipment. Before & after photographic proof attached to ticket.',
        actorName: 'Kavita Sundaram',
        actorRole: 'OFFICER',
        status: 'RESOLVED',
        proofImageUrl:
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'CMP-2025-0820',
    title: 'Stagnant Drain Water Leading to Mosquito Infestation',
    description:
      'Open stormwater drain is completely blocked with plastic waste and black sludge. Water has been stagnant for 3 weeks, resulting in intense mosquito swarm and dengue cases reported in neighborhood.',
    category: 'Public Health & Pest Control',
    department: 'HEALTH',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    ward: 'Ward 4',
    address: 'Behind Silver Oak Apartments, North Drain',
    landmark: 'Boundary wall of Plot 18',
    citizenId: 'usr-citizen-1',
    citizenName: 'Sarah Jenkins',
    citizenPhone: '+1 (555) 234-5678',
    citizenEmail: 'citizen@city.gov',
    createdAt: new Date(now - 18 * hourMs).toISOString(),
    updatedAt: new Date(now - 8 * hourMs).toISOString(),
    slaTargetHours: 24,
    slaDeadline: new Date(now + 6 * hourMs).toISOString(),
    slaStatus: 'ON_TRACK',
    imageUrl:
      'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80',
    assignedOfficer: 'Dr. Priya Nambiar',
    upvotes: 15,
    upvotedBy: ['usr-citizen-1', 'usr-citizen-3'],
    tags: ['Mosquito', 'Dengue', 'Drainage', 'Health'],
    aiAnalysis: {
      confidence: 0.93,
      reasoning: 'Public health vector control alert: stagnant water with reported dengue risk.',
      detectedKeywords: ['dengue', 'mosquito', 'stagnant water', 'drain blocked'],
      hazardLevel: 'HIGH',
    },
    timeline: [
      {
        id: 't-51',
        timestamp: new Date(now - 18 * hourMs).toISOString(),
        title: 'Grievance Submitted',
        description: 'Citizen lodged report on mosquito menace and clogged open drain.',
        actorName: 'Sarah Jenkins',
        actorRole: 'CITIZEN',
        status: 'OPEN',
      },
      {
        id: 't-52',
        timestamp: new Date(now - 8 * hourMs).toISOString(),
        title: 'Fogging Team Dispatched',
        description: 'Vector control team conducted pyrethrum thermal fogging across 200m perimeter.',
        actorName: 'Dr. Priya Nambiar',
        actorRole: 'OFFICER',
        status: 'IN_PROGRESS',
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-citizen-1',
    title: 'Grievance Update: CMP-2025-1042',
    message: 'Water board ground crew has arrived on site at 4th Main Road and closed the main isolation valve.',
    type: 'STATUS_UPDATE',
    complaintId: 'CMP-2025-1042',
    read: false,
    createdAt: new Date(now - 2 * hourMs).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'usr-citizen-1',
    title: 'Team Assigned: CMP-2025-0912',
    message: 'Electrical technician Er. Vikram Joshi has been assigned to inspect the dark streetlights on Oakwood Ave.',
    type: 'ASSIGNMENT',
    complaintId: 'CMP-2025-0912',
    read: false,
    createdAt: new Date(now - 6 * hourMs).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'ADMIN',
    title: 'SLA Escalation Alert',
    message: 'Grievance CMP-2025-0951 (Garbage Overflow, Ward 4) has breached its 12-hour resolution SLA.',
    type: 'SLA_ALERT',
    complaintId: 'CMP-2025-0951',
    read: false,
    createdAt: new Date(now - 16 * hourMs).toISOString(),
  },
];

class Database {
  private complaints: Complaint[] = [...INITIAL_COMPLAINTS];
  private users: User[] = [...INITIAL_USERS];

  constructor() {
    seedNotifications(INITIAL_NOTIFICATIONS);
    this.refreshAllSlaStatuses();
  }

  public refreshAllSlaStatuses(): void {
    this.complaints.forEach((c) => {
      c.slaStatus = evaluateSlaStatus(c.slaDeadline, c.resolvedAt);
    });
  }

  public getComplaints(): Complaint[] {
    this.refreshAllSlaStatuses();
    return this.complaints;
  }

  public getComplaintById(id: string): Complaint | undefined {
    this.refreshAllSlaStatuses();
    return this.complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
  }

  public addComplaint(complaint: Complaint): Complaint {
    this.complaints.unshift(complaint);
    return complaint;
  }

  public updateComplaint(id: string, updates: Partial<Complaint>): Complaint | undefined {
    const idx = this.complaints.findIndex((c) => c.id.toUpperCase() === id.toUpperCase());
    if (idx === -1) return undefined;

    this.complaints[idx] = {
      ...this.complaints[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.complaints[idx].slaStatus = evaluateSlaStatus(
      this.complaints[idx].slaDeadline,
      this.complaints[idx].resolvedAt
    );

    return this.complaints[idx];
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public addUser(user: User): User {
    this.users.push(user);
    return user;
  }
}

export const db = new Database();
