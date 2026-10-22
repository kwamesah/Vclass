export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  password?: string;
  bio?: string;
  classLevel?: string;
  studentId?: string;
  staffId?: string;
  phone?: string;
  childrenIds?: string[];
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  badgesCount?: number;
  streakDays?: number;
  points?: number;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  isClassTeacherOf?: string;
  isHeadmaster?: boolean;
  title?: string;
}

export interface SlideItem {
  slideNo: number;
  title: string;
  content: string;
  bullets?: string[];
  diagramLabel?: string;
}

export interface Lesson {
  id: string;
  title: string;
  strandId: string;
  weekNumber: number;
  objectives: string[];
  lessonNotes: string;
  videoDuration?: string;
  videoTitle?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  pptSlides?: SlideItem[];
  interactiveActivityId?: string;
  exercisePrompt?: string;
  quizId?: string;
  assignmentId?: string;
  isCompleted?: boolean;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  classLevel: string;
  teacherId: string;
  teacherName: string;
  room?: string;
}

export interface WeekPlan {
  id: string;
  weekNumber: number;
  title: string;
  lessons: Lesson[];
}

export interface Strand {
  id: string;
  name: string;
  strandNumber: number;
  weeks: WeekPlan[];
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  classLevel: string; // e.g., 'B7', 'B4'
  term: string; // 'Term 1'
  academicYear: string;
  teacherName: string;
  teacherId: string;
  teacherAvatar: string;
  description: string;
  progressPercentage: number;
  strands: Strand[];
}

export interface LivePollOption {
  id: string;
  text: string;
  votes: number;
}

export interface LivePoll {
  id: string;
  question: string;
  options: LivePollOption[];
  isActive: boolean;
  totalVotes: number;
  correctOptionId?: string;
}

export interface VClassSession {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  teacherName: string;
  teacherAvatar: string;
  teacherId: string;
  date: string;
  time: string;
  durationMinutes: number;
  isLive: boolean;
  status: 'scheduled' | 'live' | 'ended';
  recordingAvailable: boolean;
  recordingDuration?: string;
  recordingUrl?: string;
  materials: { name: string; type: string; size: string }[];
  attendeesCount: number;
  meetingTopic: string;
  description?: string;
  roomCode?: string;
  activePoll?: LivePoll | null;
}

export interface Assignment {
  id: string;
  title: string;
  classLevel: string;
  subject: string;
  dueDate: string;
  totalMarks: number;
  prompt: string;
  instructions: string;
  submissionsCount: number;
  totalStudents: number;
  teacherName: string;
  teacherId?: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxScore: number;
  score: number;
  description: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  submittedAt: string;
  content: string;
  attachmentName?: string;
  attachmentSize?: string;
  marksAwarded?: number;
  maxMarks: number;
  rubricScores?: RubricCriterion[];
  teacherFeedback?: string;
  status: 'pending' | 'graded';
}

export interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'image_id' | 'theory';
  prompt: string;
  options?: string[];
  correctAnswer?: string | number;
  imageVisual?: string;
  marks: number;
  explanation?: string;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  type: 'quiz' | 'exam';
  durationMinutes: number;
  totalMarks: number;
  term: string;
  questions: Question[];
  dueDate?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  completedAt: string;
  answers: Record<string, any>;
}

export interface MontessoriActivity {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  type: 'drag_drop' | 'identify' | 'sort' | 'matching' | 'counting';
  instruction: string;
  audioPrompt: string;
  targetCategoryA?: string;
  targetCategoryB?: string;
  items: {
    id: string;
    label: string;
    icon: string;
    category?: string;
    isCorrect?: boolean;
    hint?: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classLevel: string;
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late';
  timeRecorded: string;
}

export interface DigitalResource {
  id: string;
  title: string;
  type: 'note' | 'ppt' | 'textbook' | 'worksheet' | 'diagram' | 'video' | 'past_question';
  subject: string;
  classLevel: string;
  fileType: string;
  fileSize: string;
  downloadCount: number;
  uploadedBy: string;
  date: string;
  description: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'urgent' | 'normal';
  targetAudience: 'all' | 'parents' | 'students' | 'teachers';
  author: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedDate?: string;
  description: string;
  unlocked: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'assignment' | 'lesson' | 'vclass' | 'exam' | 'result' | 'announcement' | 'attendance' | 'activity';
  read: boolean;
  actionNav?: string;
  targetRole?: UserRole | 'all';
  targetUserId?: string;
  classLevel?: string;
  createdAt?: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  classLevel?: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'auth' | 'course' | 'assignment' | 'quiz' | 'vclass' | 'attendance' | 'system';
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
}

export interface SchoolClass {
  id: string;
  name: string;
  classLevel: string;
  teacher: string;
  teacherId?: string;
  pupils: number;
  maxCapacity: number;
  room?: string;
}

export interface SchoolSubject {
  id: string;
  name: string;
  code: string;
  head: string;
  classLevels?: string[];
  description?: string;
}

export interface SchoolParent {
  id: string;
  name: string;
  phone: string;
  email: string;
  children: string;
  childrenIds?: string[];
  userId?: string;
  feeStatus: string;
}

export interface StudentNote {
  id: string;
  studentId: string;
  title: string;
  content: string;
  subject: string;
  createdAt: string;
  updatedAt?: string;
}

export type TourRole = UserRole | 'guest';

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  targetNav?: string;
  actionHint?: string;
  tips?: string[];
  badge?: string;
  highlightSelector?: string;
  targetSelector?: string;
  placement?: 'right' | 'bottom' | 'top' | 'left';
}

export interface OnboardingTourConfig {
  role: TourRole;
  title: string;
  subtitle: string;
  badge: string;
  roleGreeting: string;
  steps: TourStep[];
}

export interface BreakTimeConfig {
  label: string;
  time: string;
}

export interface SchoolFeaturesConfig {
  vclassEnabled: boolean;
  montessoriLabEnabled: boolean;
  digitalLibraryEnabled: boolean;
  gamificationEnabled: boolean;
  parentPortalEnabled: boolean;
  admissionsOpen: boolean;
  signupEnabled?: boolean;
  googleSsoEnabled?: boolean;
  googleWorkspaceDomain?: string;
  googleClientId?: string;
}

export interface SchoolConfig {
  // Identity & Branding
  name: string;
  shortName: string;
  motto: string;
  logoUrl: string;
  crestBadge: string;
  websiteUrl: string;
  accreditationNumber: string;

  // Academic Calendar & Terms
  academicYear: string;
  currentTerm: 'Term 1' | 'Term 2' | 'Term 3' | 'Semester 1' | 'Semester 2';
  termStartDate: string;
  termEndDate: string;
  nextResumptionDate: string;
  curriculumFramework: string;

  // Bell Schedule & Periods
  dayStartTime: string;
  periodDurationMinutes: number;
  totalPeriodsPerDay: number;
  breakTimes: BreakTimeConfig[];

  // Grading & Assessment Policy
  passMarkPercentage: number;
  continuousAssessmentWeight: number;
  examAssessmentWeight: number;

  // Contact & Campus Location
  email: string;
  phone: string;
  admissionsHotline: string;
  address: string;
  city: string;
  country: string;
  gpsAddress: string;

  // Leadership & Authority
  headOfSchool: string;
  headTitle: string;
  academicDean: string;

  // Feature Modules & Portal Controls
  features: SchoolFeaturesConfig;
  themeColor: string;
}

// =========================================================================
// LESSON NOTES SUBMISSION & HEADMASTER APPROVAL SUITE
// =========================================================================

export type LessonNoteStatus = 'draft' | 'submitted' | 'needs_revision' | 'approved' | 'rejected';

export interface LessonNoteAttachment {
  id: string;
  name: string;
  size: number;
  type: string; // e.g. 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'
  dataUrl: string; // base64 encoded document
  uploadedAt: string;
}

export interface PrincipalEndorsement {
  endorsed: boolean;
  date: string;
  headmasterName: string;
  stampTitle: string; // e.g. 'Head of School & Academic Principal'
  endorsementCode: string; // e.g. 'SMS-HN-2026-W04-098'
  officialSealUrl?: string;
}

export interface LessonNoteSubmission {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  classLevel: string; // e.g. 'Basic 7', 'Basic 8', 'Basic 9', 'Basic 4'
  weekNumber: number;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string; // e.g. '2026/2027'
  startDate: string;
  endDate: string;
  topic: string;

  // Ghana NaCCA / Montessori Standards
  strand: string;
  subStrand: string;
  contentStandard: string;
  indicators: string[];
  coreCompetencies: string[];
  learningMaterials: string[];

  // 3-Phase Teaching & Learning Flow
  phase1Starter: string;
  phase2MainActivities: string;
  phase3Reflection: string;
  assessmentRemarks: string;

  // Document Attachments (Word / PDF)
  attachments: LessonNoteAttachment[];

  // Status & Review Workflow
  status: LessonNoteStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string; // Headmaster name
  reviewerComments?: string;
  principalEndorsement?: PrincipalEndorsement;

  createdAt: string;
  updatedAt: string;
}

export interface LessonNoteReviewAction {
  status: 'approved' | 'needs_revision' | 'rejected';
  reviewerName: string;
  reviewerComments: string;
  endorsementCode?: string;
}



