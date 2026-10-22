/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Course,
  VClassSession,
  Assignment,
  AssignmentSubmission,
  Assessment,
  QuizResult,
  MontessoriActivity,
  AttendanceRecord,
  DigitalResource,
  SchoolAnnouncement,
  Badge,
  NotificationItem,
  ActivityItem,
  SchoolClass,
  SchoolSubject,
  SchoolParent,
  StudentNote,
  TimetableSlot,
  SchoolConfig,
  LessonNoteSubmission,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-adm-obah',
    name: 'Admin Obah',
    email: 'obahlog@gmail.com',
    role: 'admin',
    staffId: 'ADM-OBAH-01',
    phone: '+233 24 111 2233',
    password: '48468080',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Chief System Administrator & E-Learning Platform Director for Salem Montessori School.',
  },
];

export const INITIAL_CLASSES: SchoolClass[] = [];

export const INITIAL_SUBJECTS: SchoolSubject[] = [];

export const INITIAL_PARENTS: SchoolParent[] = [];

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_VCLASSES: VClassSession[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [];

export const INITIAL_ASSESSMENTS: Assessment[] = [];

export const INITIAL_QUIZ_RESULTS: QuizResult[] = [];

export const INITIAL_MONTESSORI_ACTIVITIES: MontessoriActivity[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_DIGITAL_RESOURCES: DigitalResource[] = [];

export const INITIAL_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'ann-welcome',
    title: 'Welcome to Salem Montessori VClass & E-Learning Platform',
    content: 'System initialized successfully. Please log in with the administrator credentials (obahlog@gmail.com / 48468080) to configure academic terms, classes, teachers, and student accounts in real time.',
    date: new Date().toISOString().split('T')[0],
    priority: 'urgent',
    targetAudience: 'all',
    author: 'Admin Obah',
  },
];

export const INITIAL_BADGES: Badge[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-init',
    userId: 'user-adm-obah',
    userName: 'Admin Obah',
    userRole: 'admin',
    classLevel: 'All Classes',
    action: 'System Initialized',
    details: 'Salem Montessori VClass & E-Learning Platform database cleared of all mock data. Only master admin obahlog@gmail.com initialized.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'system',
  },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [];

export const INITIAL_NOTES: StudentNote[] = [];

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  name: 'Salem Montessori School',
  shortName: 'Salem Montessori',
  motto: 'Excellence in Montessori & Academic Foundation',
  logoUrl: '/school-crest.jpg',
  crestBadge: '/school-crest.jpg',
  websiteUrl: 'https://salemmontessori.edu.gh',
  accreditationNumber: 'GES/NaCCA/MS-2026-001',
  academicYear: '2026/2027',
  currentTerm: 'Term 1',
  termStartDate: '2026-09-07',
  termEndDate: '2026-12-18',
  nextResumptionDate: '2027-01-11',
  curriculumFramework: 'Ghana NaCCA Standards & Montessori Integrated Method',
  dayStartTime: '07:30',
  periodDurationMinutes: 45,
  totalPeriodsPerDay: 8,
  breakTimes: [
    { label: 'Morning Snack & Recess', time: '10:00 - 10:30' },
    { label: 'Lunch & Montessori Exploration', time: '12:30 - 13:30' },
  ],
  passMarkPercentage: 50,
  continuousAssessmentWeight: 30,
  examAssessmentWeight: 70,
  email: 'info@salemmontessori.edu.gh',
  phone: '+233 30 222 4455',
  admissionsHotline: '+233 24 111 2233',
  address: 'Accra, Ghana',
  city: 'Accra',
  country: 'Ghana',
  gpsAddress: 'GA-183-4920',
  headOfSchool: 'Rev. Dr. Emmanuel Addo',
  headTitle: 'Headmaster & Academic Principal',
  academicDean: 'Mrs. Abigail Mensah',
  features: {
    vclassEnabled: true,
    montessoriLabEnabled: true,
    digitalLibraryEnabled: true,
    gamificationEnabled: true,
    parentPortalEnabled: true,
    admissionsOpen: true,
  },
  themeColor: '#1e3a8a',
};

export const INITIAL_LESSON_NOTES: LessonNoteSubmission[] = [];
