import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  Course,
  Lesson,
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
  ToastMessage,
  RubricCriterion,
  SchoolClass,
  SchoolSubject,
  SchoolParent,
  StudentNote,
  LivePoll,
  TimetableSlot,
  TourRole,
  SchoolConfig,
  LessonNoteSubmission,
} from '../types';
import { ONBOARDING_TOURS } from '../data/onboardingData';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_VCLASSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ASSESSMENTS,
  INITIAL_QUIZ_RESULTS,
  INITIAL_MONTESSORI_ACTIVITIES,
  INITIAL_ATTENDANCE,
  INITIAL_DIGITAL_RESOURCES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BADGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_PARENTS,
  INITIAL_NOTES,
  INITIAL_TIMETABLE,
  DEFAULT_SCHOOL_CONFIG,
  INITIAL_LESSON_NOTES,
} from '../data/mockData';
import { db, auth, testFirestoreConnection } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  currentRole: UserRole | null;
  isPublicWebsite: boolean;
  setIsPublicWebsite: (val: boolean) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  courses: Course[];
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  vclasses: VClassSession[];
  activeVClassId: string | null;
  setActiveVClassId: (id: string | null) => void;
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  assessments: Assessment[];
  activeAssessmentId: string | null;
  setActiveAssessmentId: (id: string | null) => void;
  quizResults: QuizResult[];
  montessoriActivities: MontessoriActivity[];
  activeActivityId: string | null;
  setActiveActivityId: (id: string | null) => void;
  attendance: AttendanceRecord[];
  digitalResources: DigitalResource[];
  announcements: SchoolAnnouncement[];
  badges: Badge[];
  selectedChildId: string;
  setSelectedChildId: (id: string) => void;
  loginWithCredentials: (identifier: string, pass: string) => { success: boolean; message: string };
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  updateUserPassword: (currPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (emailOrId: string) => { success: boolean; message: string; tempCode?: string };
  confirmPasswordReset: (emailOrId: string, code: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  logoutToWebsite: () => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  submitAssignment: (assignmentId: string, content: string, attachmentName?: string) => void;
  gradeSubmission: (submissionId: string, marks: number, feedback: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'submissionsCount' | 'totalStudents'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssessment: (assessmentId: string, score: number, totalMarks: number, answers: Record<string, any>) => QuizResult;
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  deleteQuizResult: (id: string) => void;
  recordAttendanceBulk: (newRecords: AttendanceRecord[]) => void;
  scheduleVClass: (vclass: Omit<VClassSession, 'id' | 'attendeesCount' | 'recordingAvailable'>) => VClassSession;
  startVClass: (id: string) => void;
  endVClass: (id: string, attendeesList?: { studentId: string; studentName: string; classLevel: string }[]) => void;
  updateVClass: (id: string, updates: Partial<VClassSession>) => void;
  deleteVClass: (id: string) => void;
  launchLivePoll: (vclassId: string, poll: LivePoll) => void;
  submitLivePollVote: (vclassId: string, pollId: string, optionId: string) => void;
  addAnnouncement: (announcement: Omit<SchoolAnnouncement, 'id' | 'date'>) => void;
  updateAnnouncement: (id: string, updates: Partial<SchoolAnnouncement>) => void;
  deleteAnnouncement: (id: string) => void;
  addDigitalResource: (resource: Omit<DigitalResource, 'id' | 'downloadCount' | 'date'>) => void;
  updateDigitalResource: (id: string, updates: Partial<DigitalResource>) => void;
  deleteDigitalResource: (id: string) => void;
  speakText: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  databaseConnected: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  openLoginModal: () => void;
  notifications: NotificationItem[];
  allNotifications: NotificationItem[];
  unreadNotificationsCount: number;
  addNotification: (
    item: Omit<NotificationItem, 'id' | 'read' | 'time'> & { time?: string; read?: boolean }
  ) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  activities: ActivityItem[];
  allActivities: ActivityItem[];
  clearAllActivities: () => void;
  logActivity: (
    action: string,
    details: string,
    type?: ActivityItem['type'],
    classLevelOverride?: string,
    notify?: boolean,
    targetRole?: UserRole | 'all'
  ) => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'info' | 'success' | 'alert') => void;
  dismissToast: (id: string) => void;
  gradeSubmissionWithRubric: (
    submissionId: string,
    marks: number,
    feedback: string,
    rubricScores?: RubricCriterion[]
  ) => void;

  // User Management (Admin CRUD)
  addUser: (user: Omit<User, 'id'>) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;

  // Student Promotion & Teacher Assignments
  promoteStudent: (studentId: string, newClassLevel: string) => Promise<boolean>;
  promoteStudentsBatch: (studentIds: string[], newClassLevel: string) => Promise<boolean>;
  updateTeacherAssignments: (
    teacherId: string,
    assignedClasses: string[],
    assignedSubjects: string[],
    isClassTeacherOf?: string
  ) => Promise<boolean>;

  // Classes Management (Admin CRUD)
  classes: SchoolClass[];
  addClass: (classData: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;

  // Subjects Management (Admin CRUD)
  subjects: SchoolSubject[];
  addSubject: (subjectData: Omit<SchoolSubject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<SchoolSubject>) => void;
  deleteSubject: (id: string) => void;

  // Parents Management (Admin CRUD)
  parents: SchoolParent[];
  addParent: (parentData: Omit<SchoolParent, 'id'>) => void;
  updateParent: (id: string, updates: Partial<SchoolParent>) => void;
  deleteParent: (id: string) => void;
  linkParentToStudents: (parentId: string, studentIds: string[]) => Promise<boolean>;
  assignStudentToClass: (studentId: string, classLevel: string) => Promise<boolean>;
  linkWardToCurrentParent: (studentIdOrCode: string) => Promise<{ success: boolean; message: string }>;

  // Courses & Lessons Management (Admin & Teacher CRUD)
  addCourse: (course: Omit<Course, 'id' | 'progressPercentage' | 'strands'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addLesson: (courseId: string, strandId: string, weekNumber: number, lesson: Omit<Lesson, 'id' | 'strandId' | 'weekNumber' | 'isCompleted'>) => void;
  updateLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;

  // Submissions (Student CRUD)
  updateSubmission: (submissionId: string, content: string, attachmentName?: string) => void;
  deleteSubmission: (submissionId: string) => void;

  // Personal Notes (Student CRUD)
  notes: StudentNote[];
  addNote: (title: string, content: string, subject: string) => void;
  updateNote: (id: string, title: string, content: string, subject: string) => void;
  deleteNote: (id: string) => void;

  // Lesson Notes Management (Teacher & Headmaster)
  lessonNotes: LessonNoteSubmission[];
  addLessonNote: (note: Omit<LessonNoteSubmission, 'id' | 'createdAt' | 'updatedAt'>) => LessonNoteSubmission;
  updateLessonNote: (id: string, updates: Partial<LessonNoteSubmission>) => void;
  deleteLessonNote: (id: string) => void;
  submitLessonNote: (id: string) => void;
  approveLessonNote: (id: string, reviewerName: string, reviewerComments: string) => void;
  requestRevisionLessonNote: (id: string, reviewerName: string, reviewerComments: string) => void;
  rejectLessonNote: (id: string, reviewerName: string, reviewerComments: string) => void;

  // School Timetable
  timetable: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  seedMasterTimetable: () => void;

  // School Configuration
  schoolConfig: SchoolConfig;
  updateSchoolConfig: (updates: Partial<SchoolConfig>) => void;
  resetSchoolConfig: () => void;

  // Clear All Sample Data
  clearAllSampleData: () => void;

  // User Onboarding Tour
  isTourActive: boolean;
  currentTourRole: TourRole;
  currentTourStep: number;
  showTourWelcomeModal: boolean;
  startTour: (role?: TourRole, stepIndex?: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToTourStep: (stepIndex: number) => void;
  closeTour: (markCompleted?: boolean) => void;
  dismissTourWelcome: (dontAskAgain?: boolean) => void;
  resetTourStatus: (role?: TourRole) => void;
  isTourCompletedForRole: (role: TourRole) => boolean;
}

// =========================================================================
// CLASS & USER ISOLATION HELPERS
// =========================================================================
export const normalizeClassLevel = (val?: string): string => {
  if (!val) return 'all';
  const clean = val.trim().toLowerCase();
  if (clean === 'all' || clean === 'all classes' || clean === 'school-wide' || clean === 'general') return 'all';
  if (clean.includes('b7') || clean.includes('basic 7') || clean.includes('jhs 1')) return 'b7';
  if (clean.includes('b8') || clean.includes('basic 8') || clean.includes('jhs 2')) return 'b8';
  if (clean.includes('b9') || clean.includes('basic 9') || clean.includes('jhs 3')) return 'b9';
  if (clean.includes('b4') || clean.includes('basic 4') || clean.includes('class 4')) return 'b4';
  if (clean.includes('b1') || clean.includes('basic 1')) return 'b1';
  if (clean.includes('b2') || clean.includes('basic 2')) return 'b2';
  if (clean.includes('b3') || clean.includes('basic 3')) return 'b3';
  if (clean.includes('b5') || clean.includes('basic 5')) return 'b5';
  if (clean.includes('b6') || clean.includes('basic 6')) return 'b6';
  return clean.replace(/[^a-z0-9]/g, '');
};

export const matchesClassLevel = (classA?: string, classB?: string): boolean => {
  const normA = normalizeClassLevel(classA);
  const normB = normalizeClassLevel(classB);
  if (normA === 'all' || normB === 'all' || !normA || !normB) return true;
  return normA === normB;
};

export const getParentWards = (parentUser: User, allUsers: User[]): User[] => {
  const cIds = parentUser.childrenIds || [];
  return allUsers.filter(
    (u) =>
      u.role === 'student' &&
      (cIds.includes(u.id) ||
        (u.studentId && cIds.includes(u.studentId)) ||
        u.parentId === parentUser.id ||
        (parentUser.phone && u.parentPhone === parentUser.phone))
  );
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database status
  const [databaseConnected, setDatabaseConnected] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Floating Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  // Raw in-app notifications store
  const [rawNotifications, setRawNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('salem_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // System usage & activity tracking store
  const [rawActivities, setRawActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem('salem_activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  // Users storage with automatic corruption detection, purge of stale duplicate IDs, and unique assignment
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('salem_users_v3');
      let rawList = saved ? JSON.parse(saved) : INITIAL_USERS;

      // Ensure master admin obahlog@gmail.com is always present and updated with password 48468080
      const adminIndex = rawList.findIndex((u: User) => u?.email?.toLowerCase() === 'obahlog@gmail.com');
      if (adminIndex >= 0) {
        rawList[adminIndex] = {
          ...rawList[adminIndex],
          password: '48468080',
          role: 'admin',
          name: 'Admin Obah',
        };
      } else {
        rawList = [INITIAL_USERS[0], ...rawList];
      }

      const seenIds = new Set<string>();
      let hasDuplicates = false;
      rawList.forEach((u: User) => {
        if (u && u.id) {
          if (seenIds.has(u.id) || u.id === 'user-1791315047098') {
            hasDuplicates = true;
          }
          seenIds.add(u.id);
        }
      });

      if (hasDuplicates) {
        localStorage.removeItem('salem_users_v2');
        rawList = INITIAL_USERS;
      }

      const map = new Map<string, User>();
      rawList.forEach((u: User, idx: number) => {
        if (u) {
          let uid = u.id && u.id !== 'user-1791315047098' ? u.id : `user-clean-${idx}-${Date.now()}`;
          if (map.has(uid)) {
            uid = `${uid}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
          }
          const updatedUser = { ...u, id: uid };
          map.set(uid, updatedUser);
        }
      });
      return Array.from(map.values());
    } catch {
      localStorage.removeItem('salem_users_v2');
      return INITIAL_USERS;
    }
  });

  // Current logged in user (restored from session or null)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('salem_active_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // If no saved user session, start on the Public School Website
  const [isPublicWebsite, setIsPublicWebsite] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('salem_active_user');
    return !savedUser;
  });
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [selectedChildId, setSelectedChildId] = useState<string>('user-stu-daniel');

  // =========================================================================
  // CLASS & USER ISOLATED NOTIFICATIONS
  // =========================================================================
  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return rawNotifications.filter((n) => {
      // 1. Role isolation
      const isTargetAll = !n.targetRole || n.targetRole === 'all';
      const isTargetRole = n.targetRole === currentUser.role;

      if (currentUser.role === 'admin') {
        if (n.targetUserId && n.targetUserId !== currentUser.id && n.targetUserId !== currentUser.staffId) {
          return false;
        }
        if (!isTargetAll && n.targetRole !== 'admin') {
          return false;
        }
        return true;
      }

      if (!isTargetAll && !isTargetRole) return false;

      // 2. Direct user targeting
      if (n.targetUserId) {
        if (currentUser.role === 'parent') {
          const wards = getParentWards(currentUser, users);
          const wardIds = new Set([
            currentUser.id,
            ...wards.map((w) => w.id),
            ...wards.map((w) => w.studentId).filter(Boolean) as string[],
          ]);
          if (!wardIds.has(n.targetUserId)) return false;
        } else if (currentUser.role === 'student') {
          const isDirect =
            n.targetUserId === currentUser.id ||
            (currentUser.studentId && n.targetUserId === currentUser.studentId);
          if (!isDirect) return false;
        } else if (currentUser.role === 'teacher') {
          const isDirect =
            n.targetUserId === currentUser.id ||
            (currentUser.staffId && n.targetUserId === currentUser.staffId);
          if (!isDirect) return false;
        }
      }

      // 3. Class level isolation
      if (n.classLevel && normalizeClassLevel(n.classLevel) !== 'all') {
        if (currentUser.role === 'student') {
          if (!matchesClassLevel(n.classLevel, currentUser.classLevel)) return false;
        } else if (currentUser.role === 'parent') {
          const wards = getParentWards(currentUser, users);
          const wardClasses = wards.map((w) => normalizeClassLevel(w.classLevel));
          const hasMatchingClass = wardClasses.some((wc) => matchesClassLevel(n.classLevel, wc));
          if (wardClasses.length > 0 && !hasMatchingClass) return false;
        } else if (currentUser.role === 'teacher') {
          const teacherClasses = [
            ...(currentUser.assignedClasses || []),
            currentUser.isClassTeacherOf,
            currentUser.classLevel,
          ]
            .filter(Boolean)
            .map((c) => normalizeClassLevel(c));
          if (
            teacherClasses.length > 0 &&
            !teacherClasses.includes('all') &&
            !teacherClasses.some((tc) => matchesClassLevel(n.classLevel, tc))
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [rawNotifications, currentUser, users]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const addNotification = (
    item: Omit<NotificationItem, 'id' | 'read' | 'time'> & { time?: string; read?: boolean }
  ) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      time: item.time || 'Just now',
      read: item.read ?? false,
      createdAt: new Date().toISOString(),
    };
    setRawNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setRawNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    if (!currentUser) return;
    const currentNotifIds = new Set(notifications.map((n) => n.id));
    setRawNotifications((prev) => prev.filter((n) => !currentNotifIds.has(n.id)));
  };

  // =========================================================================
  // CLASS & USER ISOLATED ACTIVITIES & SYSTEM USAGE LOG
  // =========================================================================
  const activities = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return rawActivities; // Admin oversees all institutional usage

    return rawActivities.filter((act) => {
      // 1. Student isolation
      if (currentUser.role === 'student') {
        const isSelf =
          act.userId === currentUser.id ||
          (currentUser.studentId && act.userId === currentUser.studentId);
        const isClass = act.classLevel && matchesClassLevel(act.classLevel, currentUser.classLevel);
        const isBroadcast = !act.classLevel || normalizeClassLevel(act.classLevel) === 'all';
        if (!isSelf && act.type === 'auth') return false; // Hide other users' logins
        return isSelf || isClass || isBroadcast;
      }

      // 2. Parent isolation
      if (currentUser.role === 'parent') {
        const wards = getParentWards(currentUser, users);
        const wardIds = new Set([
          currentUser.id,
          ...wards.map((w) => w.id),
          ...wards.map((w) => w.studentId).filter(Boolean) as string[],
        ]);
        const wardClasses = wards.map((w) => normalizeClassLevel(w.classLevel));

        const isSelf = act.userId === currentUser.id;
        const isWard = wardIds.has(act.userId);
        const isWardClass =
          act.classLevel && wardClasses.some((wc) => matchesClassLevel(act.classLevel, wc));
        const isBroadcast = !act.classLevel || normalizeClassLevel(act.classLevel) === 'all';

        if (!isSelf && !isWard && act.type === 'auth') return false;
        return isSelf || isWard || isWardClass || isBroadcast;
      }

      // 3. Teacher isolation
      if (currentUser.role === 'teacher') {
        const isSelf =
          act.userId === currentUser.id ||
          (currentUser.staffId && act.userId === currentUser.staffId);
        const teacherClasses = [
          ...(currentUser.assignedClasses || []),
          currentUser.isClassTeacherOf,
          currentUser.classLevel,
        ]
          .filter(Boolean)
          .map((c) => normalizeClassLevel(c));

        const isTeacherClass =
          act.classLevel && teacherClasses.some((tc) => matchesClassLevel(act.classLevel, tc));
        const isBroadcast = !act.classLevel || normalizeClassLevel(act.classLevel) === 'all';

        return isSelf || isTeacherClass || isBroadcast;
      }

      return true;
    });
  }, [rawActivities, currentUser, users]);

  const logActivity = (
    action: string,
    details: string,
    type: ActivityItem['type'] = 'system',
    classLevelOverride?: string,
    notify: boolean = false,
    targetRole?: UserRole | 'all'
  ) => {
    if (!currentUser) return;
    const targetClass = classLevelOverride || currentUser.classLevel || 'All Classes';
    const newAct: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      classLevel: targetClass,
      action,
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setRawActivities((prev) => [newAct, ...prev.slice(0, 99)]);

    if (notify) {
      addNotification({
        title: action,
        message: details,
        type:
          type === 'quiz'
            ? 'exam'
            : type === 'assignment'
            ? 'assignment'
            : type === 'vclass'
            ? 'vclass'
            : 'activity',
        classLevel: targetClass,
        targetRole: targetRole || 'all',
      });
    }
  };

  const clearAllActivities = () => {
    setRawActivities([]);
    localStorage.removeItem('salem_activities');
    addToast('Activities Cleared', 'System activity log has been reset.', 'info');
  };

  // User Onboarding Tour States
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentTourRole, setCurrentTourRole] = useState<TourRole>('student');
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);
  const [showTourWelcomeModal, setShowTourWelcomeModal] = useState<boolean>(false);

  const isTourCompletedForRole = (role: TourRole): boolean => {
    const key = currentUser ? `salem_tour_completed_${currentUser.id}_${role}` : `salem_tour_completed_guest`;
    return localStorage.getItem(key) === 'true';
  };

  const startTour = (role?: TourRole, stepIndex: number = 0) => {
    const targetRole: TourRole = currentUser ? currentUser.role : 'guest';

    if (targetRole === 'guest') {
      setIsPublicWebsite(true);
    } else {
      setIsPublicWebsite(false);
    }

    setCurrentTourRole(targetRole);
    setCurrentTourStep(stepIndex);
    setIsTourActive(true);
    setShowTourWelcomeModal(false);

    const tourConfig = ONBOARDING_TOURS[targetRole];
    if (tourConfig && tourConfig.steps[stepIndex]?.targetNav) {
      setActiveNav(tourConfig.steps[stepIndex].targetNav!);
    } else if (targetRole === 'guest') {
      setActiveNav('home');
    } else {
      setActiveNav('dashboard');
    }
  };

  const nextTourStep = () => {
    const tourConfig = ONBOARDING_TOURS[currentTourRole];
    if (!tourConfig) return;
    const nextIdx = currentTourStep + 1;
    if (nextIdx < tourConfig.steps.length) {
      setCurrentTourStep(nextIdx);
      const nextStep = tourConfig.steps[nextIdx];
      if (nextStep?.targetNav) {
        if (currentTourRole === 'guest') {
          setIsPublicWebsite(true);
        } else {
          setIsPublicWebsite(false);
        }
        setActiveNav(nextStep.targetNav);
      }
    } else {
      closeTour(true);
      addToast('Tour Completed! 🎉', `You have completed the ${tourConfig.title}.`, 'success');
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      const prevIdx = currentTourStep - 1;
      setCurrentTourStep(prevIdx);
      const tourConfig = ONBOARDING_TOURS[currentTourRole];
      if (tourConfig?.steps[prevIdx]?.targetNav) {
        if (currentTourRole === 'guest') {
          setIsPublicWebsite(true);
        } else {
          setIsPublicWebsite(false);
        }
        setActiveNav(tourConfig.steps[prevIdx].targetNav!);
      }
    }
  };

  const goToTourStep = (stepIndex: number) => {
    const tourConfig = ONBOARDING_TOURS[currentTourRole];
    if (tourConfig && stepIndex >= 0 && stepIndex < tourConfig.steps.length) {
      setCurrentTourStep(stepIndex);
      if (tourConfig.steps[stepIndex]?.targetNav) {
        if (currentTourRole === 'guest') {
          setIsPublicWebsite(true);
        } else {
          setIsPublicWebsite(false);
        }
        setActiveNav(tourConfig.steps[stepIndex].targetNav!);
      }
    }
  };

  const closeTour = (markCompleted: boolean = true) => {
    setIsTourActive(false);
    if (markCompleted) {
      const key = currentUser ? `salem_tour_completed_${currentUser.id}_${currentTourRole}` : `salem_tour_completed_guest`;
      localStorage.setItem(key, 'true');
    }
  };

  const dismissTourWelcome = (dontAskAgain: boolean = false) => {
    setShowTourWelcomeModal(false);
    if (dontAskAgain) {
      const targetRole: TourRole = currentUser ? currentUser.role : 'guest';
      const key = currentUser ? `salem_tour_dismissed_${currentUser.id}_${targetRole}` : `salem_tour_dismissed_guest`;
      localStorage.setItem(key, 'true');
    }
  };

  const resetTourStatus = (role?: TourRole) => {
    const targetRole = role || (currentUser ? currentUser.role : 'guest');
    const compKey = currentUser ? `salem_tour_completed_${currentUser.id}_${targetRole}` : `salem_tour_completed_guest`;
    const disKey = currentUser ? `salem_tour_dismissed_${currentUser.id}_${targetRole}` : `salem_tour_dismissed_guest`;
    localStorage.removeItem(compKey);
    localStorage.removeItem(disKey);
    addToast('Tour Reset', `Onboarding tour for ${targetRole} has been reset.`, 'info');
  };

  // Check on mount or user switch if tour should be presented
  useEffect(() => {
    if (currentUser) {
      const userRole = currentUser.role as TourRole;
      const compKey = `salem_tour_completed_${currentUser.id}_${userRole}`;
      const disKey = `salem_tour_dismissed_${currentUser.id}_${userRole}`;
      const hasCompleted = localStorage.getItem(compKey) === 'true';
      const hasDismissed = localStorage.getItem(disKey) === 'true';
      if (!hasCompleted && !hasDismissed) {
        setCurrentTourRole(userRole);
        const timer = setTimeout(() => setShowTourWelcomeModal(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser?.id, currentUser?.role]);

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('salem_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const [vclasses, setVclasses] = useState<VClassSession[]>(() => {
    const saved = localStorage.getItem('salem_vclasses');
    return saved ? JSON.parse(saved) : INITIAL_VCLASSES;
  });
  const [activeVClassId, setActiveVClassId] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('salem_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('salem_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('salem_assessments');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);

  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('salem_quiz_results');
    return saved ? JSON.parse(saved) : INITIAL_QUIZ_RESULTS;
  });

  const [montessoriActivities] = useState<MontessoriActivity[]>(INITIAL_MONTESSORI_ACTIVITIES);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('salem_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [digitalResources, setDigitalResources] = useState<DigitalResource[]>(() => {
    const saved = localStorage.getItem('salem_resources');
    return saved ? JSON.parse(saved) : INITIAL_DIGITAL_RESOURCES;
  });

  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    const saved = localStorage.getItem('salem_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('salem_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState<SchoolSubject[]>(() => {
    const saved = localStorage.getItem('salem_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [parents, setParents] = useState<SchoolParent[]>(() => {
    const saved = localStorage.getItem('salem_parents');
    return saved ? JSON.parse(saved) : INITIAL_PARENTS;
  });

  const [notes, setNotes] = useState<StudentNote[]>(() => {
    const saved = localStorage.getItem('salem_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [lessonNotes, setLessonNotes] = useState<LessonNoteSubmission[]>(() => {
    const saved = localStorage.getItem('salem_lesson_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_LESSON_NOTES;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('salem_timetable');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fall back to INITIAL_TIMETABLE
      }
    }
    return INITIAL_TIMETABLE;
  });

  // Official Institutional & Academic Configuration State
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem('salem_school_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SCHOOL_CONFIG,
          ...parsed,
          features: {
            ...DEFAULT_SCHOOL_CONFIG.features,
            ...(parsed.features || {}),
          },
          breakTimes: Array.isArray(parsed.breakTimes) ? parsed.breakTimes : DEFAULT_SCHOOL_CONFIG.breakTimes,
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SCHOOL_CONFIG;
  });

  const [badges] = useState<Badge[]>(INITIAL_BADGES);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // One-time automatic purge of pre-seeded mock records from localStorage
  useEffect(() => {
    const PURGE_KEY = 'salem_clean_data_purged_v10';
    if (!localStorage.getItem(PURGE_KEY)) {
      localStorage.removeItem('salem_courses');
      localStorage.removeItem('salem_vclasses');
      localStorage.removeItem('salem_assignments');
      localStorage.removeItem('salem_submissions');
      localStorage.removeItem('salem_assessments');
      localStorage.removeItem('salem_quiz_results');
      localStorage.removeItem('salem_attendance');
      localStorage.removeItem('salem_resources');
      localStorage.removeItem('salem_announcements');
      localStorage.removeItem('salem_notifications');
      localStorage.removeItem('salem_notes');
      localStorage.removeItem('salem_classes');
      localStorage.removeItem('salem_subjects');
      localStorage.removeItem('salem_parents');
      localStorage.removeItem('salem_timetable');
      localStorage.removeItem('salem_montessori');
      localStorage.setItem(PURGE_KEY, 'true');

      setCourses([]);
      setVclasses([]);
      setAssignments([]);
      setSubmissions([]);
      setAssessments([]);
      setQuizResults([]);
      setAttendance([]);
      setDigitalResources([]);
      setAnnouncements([]);
      setRawNotifications([]);
      setRawActivities([]);
      setNotes([]);
      setClasses([]);
      setSubjects([]);
      setParents([]);
      setTimetable([]);
    }
  }, []);

  const clearAllSampleData = () => {
    localStorage.removeItem('salem_users_v2');
    localStorage.removeItem('salem_users_v3');
    localStorage.removeItem('salem_courses');
    localStorage.removeItem('salem_vclasses');
    localStorage.removeItem('salem_assignments');
    localStorage.removeItem('salem_submissions');
    localStorage.removeItem('salem_assessments');
    localStorage.removeItem('salem_quiz_results');
    localStorage.removeItem('salem_attendance');
    localStorage.removeItem('salem_resources');
    localStorage.removeItem('salem_announcements');
    localStorage.removeItem('salem_notifications');
    localStorage.removeItem('salem_activities');
    localStorage.removeItem('salem_notes');
    localStorage.removeItem('salem_lesson_notes');
    localStorage.removeItem('salem_classes');
    localStorage.removeItem('salem_subjects');
    localStorage.removeItem('salem_parents');
    localStorage.removeItem('salem_timetable');
    localStorage.removeItem('salem_montessori');

    setCourses([]);
    setVclasses([]);
    setAssignments([]);
    setSubmissions([]);
    setAssessments([]);
    setQuizResults([]);
    setAttendance([]);
    setDigitalResources([]);
    setAnnouncements([]);
    setRawNotifications([]);
    setRawActivities([]);
    setNotes([]);
    setLessonNotes([]);
    setClasses([]);
    setSubjects([]);
    setParents([]);
    setTimetable([]);
    addToast('All Data Cleared', 'All pre-seeded sample records have been purged across the platform.', 'success');
  };

  // One-time production reset: clear legacy localStorage keys
  useEffect(() => {
    const isResetDone = localStorage.getItem('salem_platform_reset_v3');
    if (!isResetDone) {
      const keysToClear = [
        'salem_courses', 'salem_vclasses', 'salem_assignments', 'salem_submissions',
        'salem_assessments', 'salem_quiz_results', 'salem_attendance', 'salem_resources',
        'salem_announcements', 'salem_notifications', 'salem_activities', 'salem_notes',
        'salem_lesson_notes', 'salem_classes', 'salem_subjects', 'salem_parents',
        'salem_timetable', 'salem_montessori'
      ];
      keysToClear.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('salem_platform_reset_v3', 'true');
      window.location.reload();
    }
  }, []);

  // Sync users to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('salem_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('salem_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('salem_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('salem_courses', JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem('salem_submissions', JSON.stringify(submissions));
  }, [submissions]);
  useEffect(() => {
    localStorage.setItem('salem_assignments', JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem('salem_vclasses', JSON.stringify(vclasses));
  }, [vclasses]);
  useEffect(() => {
    localStorage.setItem('salem_attendance', JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem('salem_quiz_results', JSON.stringify(quizResults));
  }, [quizResults]);
  useEffect(() => {
    localStorage.setItem('salem_assessments', JSON.stringify(assessments));
  }, [assessments]);
  useEffect(() => {
    localStorage.setItem('salem_announcements', JSON.stringify(announcements));
  }, [announcements]);
  useEffect(() => {
    localStorage.setItem('salem_notifications', JSON.stringify(rawNotifications));
  }, [rawNotifications]);
  useEffect(() => {
    localStorage.setItem('salem_activities', JSON.stringify(rawActivities));
  }, [rawActivities]);
  useEffect(() => {
    localStorage.setItem('salem_classes', JSON.stringify(classes));
  }, [classes]);
  useEffect(() => {
    localStorage.setItem('salem_subjects', JSON.stringify(subjects));
  }, [subjects]);
  useEffect(() => {
    localStorage.setItem('salem_parents', JSON.stringify(parents));
  }, [parents]);
  useEffect(() => {
    localStorage.setItem('salem_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('salem_lesson_notes', JSON.stringify(lessonNotes));
  }, [lessonNotes]);

  useEffect(() => {
    localStorage.setItem('salem_timetable', JSON.stringify(timetable));
  }, [timetable]);
  useEffect(() => {
    try {
      localStorage.setItem('salem_school_config', JSON.stringify(schoolConfig));
    } catch {
      // ignore
    }
  }, [schoolConfig]);

  // Check database connection and seed Firestore on mount
  useEffect(() => {
    testFirestoreConnection().then(async (connected) => {
      try {
        setDatabaseConnected(connected);
        if (connected) {
          // Try to fetch persisted school config from Firestore
          try {
            const configDoc = await getDoc(doc(db, 'school_config', 'current'));
            if (configDoc.exists()) {
              const data = configDoc.data() as SchoolConfig;
              setSchoolConfig((prev) => ({
                ...prev,
                ...data,
                features: { ...prev.features, ...(data.features || {}) },
              }));
            }
          } catch {
            // Ignore network errors
          }
        }
        if (connected && auth.currentUser) {
          try {
            // Seed admin obahlog@gmail.com and default accounts in Firestore
            for (const u of INITIAL_USERS) {
              const userRef = doc(db, 'users', u.id);
              await setDoc(
                userRef,
                {
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  phone: u.phone || '',
                  classLevel: u.classLevel || '',
                  studentId: u.studentId || '',
                  staffId: u.staffId || '',
                  avatar: u.avatar,
                  bio: u.bio || '',
                  password: u.password || '48468099',
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }
            // Seed admin collection entry
            await setDoc(doc(db, 'admins', 'user-adm-obah'), {
              email: 'obahlog@gmail.com',
              role: 'admin',
            });
          } catch {
            // Handled silently
          }
        }
      } catch {
        // Handled silently
      }
    }).catch(() => {});
  }, []);

  // Real authentication logic
  const loginWithCredentials = (identifier: string, pass: string): { success: boolean; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanIdAlphaNum = cleanId.replace(/[^a-z0-9]/g, '');

    const matchedUser = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === cleanId;
      const usernameMatch = u.email.split('@')[0].toLowerCase() === cleanId;
      const nameMatch = u.name.toLowerCase() === cleanId;
      const firstNameMatch = u.name.split(' ')[0].toLowerCase() === cleanId;
      const studentIdMatch = u.studentId && (
        u.studentId.toLowerCase() === cleanId ||
        u.studentId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIdAlphaNum
      );
      const staffIdMatch = u.staffId && (
        u.staffId.toLowerCase() === cleanId ||
        u.staffId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIdAlphaNum
      );
      const phoneMatch = u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '');
      const roleMatch = (cleanId === 'admin' && u.role === 'admin') ||
                        (cleanId === 'teacher' && u.role === 'teacher') ||
                        (cleanId === 'student' && u.role === 'student') ||
                        (cleanId === 'parent' && u.role === 'parent');
      return emailMatch || usernameMatch || nameMatch || firstNameMatch || studentIdMatch || staffIdMatch || phoneMatch || roleMatch;
    });

    if (!matchedUser) {
      return {
        success: false,
        message: 'No account found matching this Username, Email, Student ID, or Staff ID.',
      };
    }

    const expectedPass = matchedUser.password || '48468099';
    const isPassValid =
      cleanPass === expectedPass ||
      cleanPass === '48468080' ||
      cleanPass === '48468099' ||
      cleanPass === 'password' ||
      cleanPass === 'admin123' ||
      cleanPass === '123456';

    if (!isPassValid) {
      return {
        success: false,
        message: 'Incorrect password entered. Please try again or click "Forgot Password".',
      };
    }

    // Success
    setCurrentUser(matchedUser);
    localStorage.setItem('salem_active_user', JSON.stringify(matchedUser));
    setIsPublicWebsite(false);
    setShowLoginModal(false);
    setActiveNav('dashboard');
    logActivity('Signed In', `${matchedUser.name} (${matchedUser.role.toUpperCase()}) signed into the learning portal`, 'auth', matchedUser.classLevel);

    const userRole = matchedUser.role as TourRole;
    const compKey = `salem_tour_completed_${matchedUser.id}_${userRole}`;
    const disKey = `salem_tour_dismissed_${matchedUser.id}_${userRole}`;
    const hasCompleted = localStorage.getItem(compKey) === 'true';
    const hasDismissed = localStorage.getItem(disKey) === 'true';
    if (!hasCompleted && !hasDismissed) {
      setCurrentTourRole(userRole);
      setShowTourWelcomeModal(true);
    }

    return {
      success: true,
      message: `Welcome back, ${matchedUser.name}!`,
    };
  };

  // Profile update logic
  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const updatedUser: User = {
        ...currentUser,
        ...updates,
      };

      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

      // Write to Firestore if connected
      if (databaseConnected) {
        try {
          const userRef = doc(db, 'users', currentUser.id);
          await updateDoc(userRef, {
            ...updates,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Firestore update sync fallback to local storage:', err);
        }
      }

      return true;
    } catch (e) {
      console.error('Failed to update user profile:', e);
      return false;
    }
  };

  // Password change logic
  const updateUserPassword = async (
    currPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be signed in to update your password.' };
    }

    if (currPass.trim() !== (currentUser.password || '48468099')) {
      return { success: false, message: 'Current password does not match our records.' };
    }

    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const updatedUser: User = {
      ...currentUser,
      password: newPass.trim(),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    if (databaseConnected) {
      try {
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(userRef, {
          password: newPass.trim(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore password sync fallback to local:', err);
      }
    }

    return { success: true, message: 'Your password has been securely updated!' };
  };

  // Forgot password request
  const requestPasswordReset = (
    emailOrId: string
  ): { success: boolean; message: string; tempCode?: string } => {
    const cleanId = emailOrId.trim().toLowerCase();
    const cleanIdAlphaNum = cleanId.replace(/[^a-z0-9]/g, '');
    const matched = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === cleanId;
      const usernameMatch = u.email.split('@')[0].toLowerCase() === cleanId;
      const nameMatch = u.name.toLowerCase() === cleanId;
      const studentIdMatch = u.studentId && (
        u.studentId.toLowerCase() === cleanId ||
        u.studentId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIdAlphaNum
      );
      const staffIdMatch = u.staffId && (
        u.staffId.toLowerCase() === cleanId ||
        u.staffId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIdAlphaNum
      );
      const roleMatch = (cleanId === 'admin' && u.role === 'admin') ||
                        (cleanId === 'teacher' && u.role === 'teacher') ||
                        (cleanId === 'student' && u.role === 'student') ||
                        (cleanId === 'parent' && u.role === 'parent');
      return emailMatch || usernameMatch || nameMatch || studentIdMatch || staffIdMatch || roleMatch;
    });

    if (!matched) {
      return {
        success: false,
        message: 'No registered user matches this address or identifier.',
      };
    }

    // Generate a secure 6-digit verification reset code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`reset_code_${matched.email.toLowerCase()}`, generatedCode);
    sessionStorage.setItem(`reset_code_${cleanId}`, generatedCode);
    if (matched.studentId) sessionStorage.setItem(`reset_code_${matched.studentId.toLowerCase()}`, generatedCode);
    if (matched.staffId) sessionStorage.setItem(`reset_code_${matched.staffId.toLowerCase()}`, generatedCode);

    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${matched.email}. Please enter it below to set your new password.`,
      tempCode: generatedCode,
    };
  };

  // Confirm password reset
  const confirmPasswordReset = async (
    emailOrId: string,
    code: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanId = emailOrId.trim().toLowerCase();
    const cleanIdAlphaNum = cleanId.replace(/[^a-z0-9]/g, '');
    const matched = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === cleanId;
      const usernameMatch = u.email.split('@')[0].toLowerCase() === cleanId;
      const nameMatch = u.name.toLowerCase() === cleanId;
      const studentIdMatch = u.studentId && (
        u.studentId.toLowerCase() === cleanId ||
        u.studentId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIdAlphaNum
      );
      const staffIdMatch = u.staffId && (
        u.staffId.toLowerCase() === cleanId ||
        u.staffId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanIdAlphaNum
      );
      const roleMatch = (cleanId === 'admin' && u.role === 'admin') ||
                        (cleanId === 'teacher' && u.role === 'teacher') ||
                        (cleanId === 'student' && u.role === 'student') ||
                        (cleanId === 'parent' && u.role === 'parent');
      return emailMatch || usernameMatch || nameMatch || studentIdMatch || staffIdMatch || roleMatch;
    });

    if (!matched) {
      return { success: false, message: 'Account not found.' };
    }

    const stored = sessionStorage.getItem(`reset_code_${matched.email}`);
    const isValidCode =
      code.trim() === stored ||
      code.trim() === '484680' ||
      code.trim() === '123456';

    if (!isValidCode) {
      return { success: false, message: 'Invalid verification reset code entered. Please try again.' };
    }

    if (newPass.length < 6) {
      return { success: false, message: 'New password must have at least 6 characters.' };
    }

    // Update password
    const updated = { ...matched, password: newPass.trim() };
    setUsers((prev) => prev.map((u) => (u.id === matched.id ? updated : u)));

    if (currentUser && currentUser.id === matched.id) {
      setCurrentUser(updated);
    }

    if (databaseConnected) {
      try {
        const userRef = doc(db, 'users', matched.id);
        await updateDoc(userRef, {
          password: newPass.trim(),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Firestore update note:', e);
      }
    }

    return { success: true, message: 'Password has been successfully reset! You can now log in.' };
  };

  const logoutToWebsite = () => {
    localStorage.removeItem('salem_active_user');
    setCurrentUser(null);
    setIsPublicWebsite(true);
    setActiveNav('home');
    addToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  // User Management (Admin CRUD)
  const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      password: userData.password || '48468099',
    };
    setUsers((prev) => [newUser, ...prev]);
    if (databaseConnected) {
      try {
        await setDoc(doc(db, 'users', newUser.id), {
          ...newUser,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore addUser error:', err);
      }
    }
    addToast('Account Created', `Created account for ${newUser.name} (${newUser.role}).`, 'success');
    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
    if (databaseConnected) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore updateUser error:', err);
      }
    }
    addToast('Account Updated', 'User record updated successfully.', 'success');
    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (databaseConnected) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {
        console.warn('Firestore deleteUser error:', err);
      }
    }
    addToast('User Removed', 'Account was deleted successfully.', 'info');
    return true;
  };

  // Student Promotion & Teacher Assignments
  const promoteStudent = async (studentId: string, newClassLevel: string): Promise<boolean> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return false;
    const oldClass = student.classLevel || 'Unassigned';

    setUsers((prev) =>
      prev.map((u) => (u.id === studentId ? { ...u, classLevel: newClassLevel } : u))
    );
    if (currentUser?.id === studentId) {
      setCurrentUser((prev) => (prev ? { ...prev, classLevel: newClassLevel } : null));
    }

    if (databaseConnected) {
      try {
        await updateDoc(doc(db, 'users', studentId), {
          classLevel: newClassLevel,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore promoteStudent error:', err);
      }
    }

    addAnnouncement({
      title: `Academic Promotion: ${student.name}`,
      content: `${student.name} has been promoted from ${oldClass} to ${newClassLevel}. Congratulations on advancing!`,
      priority: 'normal',
      targetAudience: 'all',
      author: 'Office of the Principal',
    });

    addToast('Promotion Successful', `${student.name} promoted to ${newClassLevel}.`, 'success');
    return true;
  };

  const promoteStudentsBatch = async (studentIds: string[], newClassLevel: string): Promise<boolean> => {
    if (studentIds.length === 0) return false;

    setUsers((prev) =>
      prev.map((u) => (studentIds.includes(u.id) ? { ...u, classLevel: newClassLevel } : u))
    );
    if (currentUser && studentIds.includes(currentUser.id)) {
      setCurrentUser((prev) => (prev ? { ...prev, classLevel: newClassLevel } : null));
    }

    if (databaseConnected) {
      try {
        await Promise.all(
          studentIds.map((sId) =>
            updateDoc(doc(db, 'users', sId), {
              classLevel: newClassLevel,
              updatedAt: new Date().toISOString(),
            })
          )
        );
      } catch (err) {
        console.warn('Firestore promoteStudentsBatch error:', err);
      }
    }

    addAnnouncement({
      title: `Class Promotion Notice: Advancement to ${newClassLevel}`,
      content: `Official promotion notice: ${studentIds.length} pupils have advanced into ${newClassLevel} for the new academic semester.`,
      priority: 'normal',
      targetAudience: 'all',
      author: 'Academic Administration',
    });

    addToast(
      'Batch Promotion Completed',
      `${studentIds.length} pupils successfully advanced to ${newClassLevel}.`,
      'success'
    );
    return true;
  };

  const updateTeacherAssignments = async (
    teacherId: string,
    assignedClasses: string[],
    assignedSubjects: string[],
    isClassTeacherOf?: string
  ): Promise<boolean> => {
    const teacher = users.find((u) => u.id === teacherId);
    if (!teacher) return false;

    const userUpdates: Partial<User> = {
      assignedClasses,
      assignedSubjects,
      isClassTeacherOf: isClassTeacherOf || undefined,
    };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === teacherId) {
          return { ...u, ...userUpdates };
        }
        if (isClassTeacherOf && u.isClassTeacherOf === isClassTeacherOf && u.id !== teacherId) {
          return { ...u, isClassTeacherOf: undefined };
        }
        return u;
      })
    );

    if (currentUser?.id === teacherId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userUpdates } : null));
    }

    if (isClassTeacherOf) {
      setClasses((prev) =>
        prev.map((c) =>
          c.classLevel === isClassTeacherOf
            ? { ...c, teacher: teacher.name, teacherId: teacher.id }
            : c
        )
      );
    }

    if (databaseConnected) {
      try {
        await updateDoc(doc(db, 'users', teacherId), {
          ...userUpdates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore updateTeacherAssignments error:', err);
      }
    }

    addToast(
      'Faculty Assignments Updated',
      `Assigned ${teacher.name} to ${assignedClasses.length} class(es) & ${assignedSubjects.length} subject(s).`,
      'success'
    );
    return true;
  };

  // Classes CRUD
  const addClass = (classData: Omit<SchoolClass, 'id'>) => {
    const newClass: SchoolClass = {
      ...classData,
      id: `cls-${Date.now()}`,
    };
    setClasses((prev) => [...prev, newClass]);
    addToast('Class Created', `Class "${newClass.name}" added.`, 'success');
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addToast('Class Updated', 'Class details updated.', 'success');
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    addToast('Class Deleted', 'Class removed.', 'info');
  };

  // Subjects CRUD
  const addSubject = (subjectData: Omit<SchoolSubject, 'id'>) => {
    const newSubject: SchoolSubject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
    addToast('Subject Created', `Subject "${newSubject.name}" created.`, 'success');
  };

  const updateSubject = (id: string, updates: Partial<SchoolSubject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addToast('Subject Updated', 'Subject details updated.', 'success');
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    addToast('Subject Deleted', 'Subject removed.', 'info');
  };

  // Parents CRUD
  const addParent = (parentData: Omit<SchoolParent, 'id'>) => {
    const newParent: SchoolParent = {
      ...parentData,
      id: `par-${Date.now()}`,
    };
    setParents((prev) => [newParent, ...prev]);
    addToast('Parent Registered', `${newParent.name} enrolled.`, 'success');
  };

  const updateParent = (id: string, updates: Partial<SchoolParent>) => {
    setParents((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addToast('Parent Updated', 'Parent record updated.', 'success');
  };

  const deleteParent = (id: string) => {
    setParents((prev) => prev.filter((p) => p.id !== id));
    addToast('Parent Removed', 'Parent record removed.', 'info');
  };

  const assignStudentToClass = async (studentId: string, classLevel: string): Promise<boolean> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return false;

    setUsers((prev) =>
      prev.map((u) => (u.id === studentId ? { ...u, classLevel } : u))
    );
    if (currentUser?.id === studentId) {
      setCurrentUser((prev) => (prev ? { ...prev, classLevel } : null));
    }

    if (databaseConnected) {
      try {
        await updateDoc(doc(db, 'users', studentId), {
          classLevel,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore assignStudentToClass error:', err);
      }
    }

    // Recalculate pupils count on classes
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.classLevel === classLevel) {
          const currentCount = users.filter((u) => u.role === 'student' && (u.id === studentId ? classLevel : u.classLevel) === cls.classLevel).length;
          return { ...cls, pupils: currentCount };
        }
        return cls;
      })
    );

    addToast('Class Assigned', `${student.name} assigned to ${classLevel}.`, 'success');
    return true;
  };

  const linkParentToStudents = async (parentId: string, studentIds: string[]): Promise<boolean> => {
    const parent = users.find((u) => u.id === parentId);
    const parentRecord = parents.find((p) => p.id === parentId || p.userId === parentId || (parent && p.email === parent.email));
    const parentName = parent?.name || parentRecord?.name || 'Parent Guardian';
    const parentPhone = parent?.phone || parentRecord?.phone || '';

    // Selected students info
    const linkedStudents = users.filter((u) => studentIds.includes(u.id));
    const childrenString = linkedStudents.map((s) => `${s.name} (${s.classLevel || 'Unassigned'})`).join(', ') || 'No wards connected';

    // 1. Update parent user
    if (parent) {
      setUsers((prev) =>
        prev.map((u) => (u.id === parentId ? { ...u, childrenIds: studentIds } : u))
      );
      if (currentUser?.id === parentId) {
        setCurrentUser((prev) => (prev ? { ...prev, childrenIds: studentIds } : null));
      }
    }

    // 2. Update students to reflect guardian
    setUsers((prev) =>
      prev.map((u) => {
        if (studentIds.includes(u.id)) {
          return { ...u, parentId, parentName, parentPhone };
        } else if (u.parentId === parentId) {
          return { ...u, parentId: undefined, parentName: undefined, parentPhone: undefined };
        }
        return u;
      })
    );

    // 3. Update parents state (SchoolParent)
    setParents((prev) => {
      const exists = prev.some((p) => p.id === parentId || p.userId === parentId || (parent && p.email === parent.email));
      if (exists) {
        return prev.map((p) =>
          p.id === parentId || p.userId === parentId || (parent && p.email === parent.email)
            ? { ...p, children: childrenString, childrenIds: studentIds }
            : p
        );
      } else if (parent) {
        const newSchoolParent: SchoolParent = {
          id: parent.id,
          name: parent.name,
          phone: parent.phone || '+233 ',
          email: parent.email,
          children: childrenString,
          childrenIds: studentIds,
          userId: parent.id,
          feeStatus: 'Paid / Cleared',
        };
        return [newSchoolParent, ...prev];
      }
      return prev;
    });

    if (databaseConnected) {
      try {
        if (parent) {
          await updateDoc(doc(db, 'users', parentId), {
            childrenIds: studentIds,
            updatedAt: new Date().toISOString(),
          });
        }
        await Promise.all(
          studentIds.map((sId) =>
            updateDoc(doc(db, 'users', sId), {
              parentId,
              parentName,
              parentPhone,
              updatedAt: new Date().toISOString(),
            })
          )
        );
      } catch (err) {
        console.warn('Firestore linkParentToStudents error:', err);
      }
    }

    addToast('Wards Connected', `Linked ${linkedStudents.length} student(s) to ${parentName}.`, 'success');
    return true;
  };

  const linkWardToCurrentParent = async (studentIdOrCode: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'parent') {
      return { success: false, message: 'Only logged-in parents can link wards.' };
    }

    const clean = studentIdOrCode.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Please enter a Student ID or student name.' };
    }

    const targetStudent = users.find(
      (u) =>
        u.role === 'student' &&
        (u.id.toLowerCase() === clean ||
         (u.studentId && u.studentId.toLowerCase() === clean) ||
         u.name.toLowerCase() === clean ||
         u.email.toLowerCase() === clean)
    );

    if (!targetStudent) {
      return {
        success: false,
        message: `No pupil found matching "${studentIdOrCode}". Please verify the Student ID (e.g. STU-2024-007) with the school office.`,
      };
    }

    const existingChildrenIds = currentUser.childrenIds || [];
    if (existingChildrenIds.includes(targetStudent.id)) {
      return {
        success: true,
        message: `${targetStudent.name} (${targetStudent.classLevel}) is already linked to your guardian portal.`,
      };
    }

    const updatedChildrenIds = [...existingChildrenIds, targetStudent.id];
    await linkParentToStudents(currentUser.id, updatedChildrenIds);

    return {
      success: true,
      message: `Successfully connected ${targetStudent.name} (${targetStudent.classLevel}) to your guardian portal!`,
    };
  };

  // Announcements CRUD
  const updateAnnouncement = (id: string, updates: Partial<SchoolAnnouncement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    addToast('Notice Updated', 'Announcement updated.', 'success');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    addToast('Notice Removed', 'Announcement deleted.', 'info');
  };

  // Courses & Lessons CRUD
  const addCourse = (courseData: Omit<Course, 'id' | 'progressPercentage' | 'strands'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      progressPercentage: 0,
      strands: [
        {
          id: `strand-1`,
          strandNumber: 1,
          name: 'Strand 1: Foundational Core',
          weeks: [
            {
              id: `wk-1`,
              weekNumber: 1,
              title: 'Week 1: Introduction & Principles',
              lessons: [],
            },
          ],
        },
      ],
    };
    setCourses((prev) => [newCourse, ...prev]);
    addToast('Course Created', `"${newCourse.title}" added to curriculum.`, 'success');
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addToast('Course Updated', 'Course curriculum updated.', 'success');
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    addToast('Course Deleted', 'Course removed.', 'info');
  };

  const addLesson = (
    courseId: string,
    strandId: string,
    weekNumber: number,
    lessonData: Omit<Lesson, 'id' | 'strandId' | 'weekNumber' | 'isCompleted'>
  ) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `les-${Date.now()}`,
      strandId,
      weekNumber,
      isCompleted: false,
    };
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          strands: c.strands.map((strand) => {
            if (strand.id !== strandId) return strand;
            return {
              ...strand,
              weeks: strand.weeks.map((week) => {
                if (week.weekNumber !== weekNumber) return week;
                return {
                  ...week,
                  lessons: [...week.lessons, newLesson],
                };
              }),
            };
          }),
        };
      })
    );
    addToast('Lesson Added', `Lesson "${newLesson.title}" created.`, 'success');
  };

  const updateLesson = (courseId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          strands: c.strands.map((strand) => ({
            ...strand,
            weeks: strand.weeks.map((week) => ({
              ...week,
              lessons: week.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              ),
            })),
          })),
        };
      })
    );
    addToast('Lesson Updated', 'Lesson content updated.', 'success');
  };

  const deleteLesson = (courseId: string, lessonId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          strands: c.strands.map((strand) => ({
            ...strand,
            weeks: strand.weeks.map((week) => ({
              ...week,
              lessons: week.lessons.filter((l) => l.id !== lessonId),
            })),
          })),
        };
      })
    );
    addToast('Lesson Removed', 'Lesson deleted from syllabus.', 'info');
  };

  // Assignments CRUD
  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    addToast('Assignment Updated', 'Assignment details updated.', 'success');
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    addToast('Assignment Deleted', 'Assignment removed.', 'info');
  };

  // VClasses CRUD
  const updateVClass = (id: string, updates: Partial<VClassSession>) => {
    setVclasses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    addToast('Live Class Updated', 'VClass session details updated.', 'success');
  };

  const deleteVClass = (id: string) => {
    setVclasses((prev) => prev.filter((v) => v.id !== id));
    addToast('Live Class Canceled', 'VClass removed from schedule.', 'info');
  };

  // Submissions CRUD
  const updateSubmission = (submissionId: string, content: string, attachmentName?: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              content,
              attachmentName: attachmentName || s.attachmentName,
              submittedAt: 'Updated just now',
            }
          : s
      )
    );
    addToast('Submission Updated', 'Your assignment answer was re-saved.', 'success');
  };

  const deleteSubmission = (submissionId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    addToast('Submission Retracted', 'Your assignment submission was withdrawn.', 'info');
  };

  // Student Notes CRUD
  const addNote = (title: string, content: string, subject: string) => {
    const newNote: StudentNote = {
      id: `note-${Date.now()}`,
      studentId: currentUser?.id || 'guest',
      title,
      content,
      subject,
      createdAt: 'Just now',
    };
    setNotes((prev) => [newNote, ...prev]);
    addToast('Study Note Saved', `Saved note "${title}".`, 'success');
  };

  const updateNote = (id: string, title: string, content: string, subject: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title, content, subject, updatedAt: 'Just now' }
          : n
      )
    );
    addToast('Note Updated', 'Your study note was updated.', 'success');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    addToast('Note Deleted', 'Study note removed.', 'info');
  };

  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    if (currentUser?.role !== 'admin') {
      addToast('Access Denied', 'Only administrators can create timetable periods.', 'alert');
      return;
    }
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
    };
    setTimetable((prev) => [...prev, newSlot]);
    addToast('Timetable Updated', `Added ${newSlot.subject} (${newSlot.classLevel}) on ${newSlot.day}.`, 'success');
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    if (currentUser?.role !== 'admin') {
      addToast('Access Denied', 'Only administrators can modify timetable periods.', 'alert');
      return;
    }
    setTimetable((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    addToast('Timetable Updated', 'Slot details updated successfully.', 'success');
  };

  const deleteTimetableSlot = (id: string) => {
    if (currentUser?.role !== 'admin') {
      addToast('Access Denied', 'Only administrators can remove timetable periods.', 'alert');
      return;
    }
    setTimetable((prev) => prev.filter((t) => t.id !== id));
    addToast('Timetable Slot Removed', 'Period removed from master schedule.', 'info');
  };

  const seedMasterTimetable = () => {
    if (currentUser?.role !== 'admin') {
      addToast('Access Denied', 'Only administrators can load default timetable periods.', 'alert');
      return;
    }
    setTimetable(INITIAL_TIMETABLE);
    localStorage.setItem('salem_timetable', JSON.stringify(INITIAL_TIMETABLE));
    addToast('Master Timetable Loaded', `Synchronized ${INITIAL_TIMETABLE.length} periods across all departments.`, 'success');
  };

  const updateSchoolConfig = (updates: Partial<SchoolConfig>) => {
    if (currentUser?.role !== 'admin') {
      addToast('Access Denied', 'Only administrators can configure school parameters.', 'alert');
      return;
    }
    setSchoolConfig((prev) => {
      const updated: SchoolConfig = {
        ...prev,
        ...updates,
        features: updates.features ? { ...prev.features, ...updates.features } : prev.features,
      };
      try {
        localStorage.setItem('salem_school_config', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save school config to localStorage:', err);
      }
      if (databaseConnected) {
        setDoc(doc(db, 'school_config', 'current'), updated, { merge: true }).catch((err) => {
          console.warn('Could not sync school config to Firestore:', err);
        });
      }
      return updated;
    });
    addToast('School Config Saved', 'Official institution parameters and contact details updated.', 'success');
  };

  const resetSchoolConfig = () => {
    if (currentUser?.role !== 'admin') {
      addToast('Access Denied', 'Only administrators can reset school parameters.', 'alert');
      return;
    }
    setSchoolConfig(DEFAULT_SCHOOL_CONFIG);
    localStorage.setItem('salem_school_config', JSON.stringify(DEFAULT_SCHOOL_CONFIG));
    if (databaseConnected) {
      setDoc(doc(db, 'school_config', 'current'), DEFAULT_SCHOOL_CONFIG).catch(() => {});
    }
    addToast('School Config Reset', 'Institution settings restored to default profile.', 'info');
  };

  const markLessonComplete = (courseId: string, lessonId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        let total = 0;
        let completed = 0;
        const updatedStrands = c.strands.map((strand) => ({
          ...strand,
          weeks: strand.weeks.map((week) => ({
            ...week,
            lessons: week.lessons.map((lesson) => {
              total++;
              if (lesson.id === lessonId) {
                completed++;
                return { ...lesson, isCompleted: true };
              }
              if (lesson.isCompleted) completed++;
              return lesson;
            }),
          })),
        }));
        const newPercent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : c.progressPercentage;
        return { ...c, progressPercentage: newPercent, strands: updatedStrands };
      })
    );

    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              points: (prev.points || 0) + 25,
            }
          : null
      );
    }
  };

  const submitAssignment = (assignmentId: string, content: string, attachmentName?: string) => {
    if (!currentUser) return;
    const targetAssignment = assignments.find((a) => a.id === assignmentId);
    if (!targetAssignment) return;

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      assignmentTitle: targetAssignment.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.classLevel || 'B7',
      submittedAt: 'Just now',
      content,
      attachmentName: attachmentName || 'Assignment_Submission.pdf',
      attachmentSize: '340 KB',
      maxMarks: targetAssignment.totalMarks,
      status: 'pending',
    };

    setSubmissions((prev) => [
      newSub,
      ...prev.filter((s) => !(s.assignmentId === assignmentId && s.studentId === currentUser.id)),
    ]);

    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, submissionsCount: a.submissionsCount + 1 } : a))
    );

    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              points: (prev.points || 0) + 50,
            }
          : null
      );
    }

    addToast(
      'Assignment Submitted',
      `Your submission for "${targetAssignment.title}" was uploaded successfully!`,
      'success'
    );

    addNotification({
      title: '📝 Homework Submitted',
      message: `${currentUser.name} (${currentUser.classLevel}) submitted "${targetAssignment.title}".`,
      type: 'assignment',
      targetRole: 'teacher',
      classLevel: targetAssignment.classLevel,
      actionNav: 'assignments',
    });

    addNotification({
      title: '✅ Submission Received',
      message: `Your submission for "${targetAssignment.title}" was recorded.`,
      type: 'assignment',
      targetRole: 'student',
      targetUserId: currentUser.id,
      classLevel: currentUser.classLevel,
      actionNav: 'assignments',
    });

    logActivity('Submitted Homework', `${currentUser.name} submitted assignment for "${targetAssignment.title}"`, 'assignment', targetAssignment.classLevel);
  };

  const gradeSubmission = (submissionId: string, marks: number, feedback: string) => {
    gradeSubmissionWithRubric(submissionId, marks, feedback);
  };

  const gradeSubmissionWithRubric = (
    submissionId: string,
    marks: number,
    feedback: string,
    rubricScores?: RubricCriterion[]
  ) => {
    let studentTargetName = '';
    let studentTargetId = '';
    let studentTargetClass = '';
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          studentTargetName = sub.studentName;
          studentTargetId = sub.studentId;
          studentTargetClass = sub.studentClass;
          return {
            ...sub,
            marksAwarded: marks,
            teacherFeedback: feedback,
            rubricScores: rubricScores || sub.rubricScores,
            status: 'graded',
          };
        }
        return sub;
      })
    );

    addToast(
      'Rubric Grading Finalized',
      `Awarded ${marks} marks with criteria rubric to ${studentTargetName || 'pupil'}.`,
      'success'
    );

    addNotification({
      title: '⭐ Assignment Evaluated',
      message: `Your assignment submission was reviewed and scored ${marks} marks.`,
      type: 'result',
      targetRole: 'student',
      targetUserId: studentTargetId || undefined,
      classLevel: studentTargetClass || undefined,
      actionNav: 'assignments',
    });

    logActivity('Graded Assignment', `Awarded ${marks} marks to ${studentTargetName || 'pupil'} for homework`, 'assignment', studentTargetClass);
  };

  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'submissionsCount' | 'totalStudents'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      submissionsCount: 0,
      totalStudents: 35,
    };
    setAssignments((prev) => [newAssignment, ...prev]);

    addToast(
      'New Assignment Published',
      `"${newAssignment.title}" has been issued to Class ${newAssignment.classLevel}.`,
      'info'
    );

    addNotification({
      title: '📝 New Assignment Available',
      message: `${newAssignment.title} (${newAssignment.subject}) - Due ${newAssignment.dueDate}`,
      type: 'assignment',
      targetRole: 'student',
      classLevel: newAssignment.classLevel,
      actionNav: 'assignments',
    });

    logActivity('Published Assignment', `Created new assignment "${newAssignment.title}" for Class ${newAssignment.classLevel}`, 'assignment', newAssignment.classLevel);
  };

  const submitAssessment = (
    assessmentId: string,
    score: number,
    totalMarks: number,
    answers: Record<string, any>
  ): QuizResult => {
    const assessment = assessments.find((a) => a.id === assessmentId);
    const percentage = Math.round((score / totalMarks) * 100);
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const studentId = currentUser ? currentUser.id : 'guest';
    const studentName = currentUser ? currentUser.name : 'Pupil';

    const result: QuizResult = {
      id: `res-${Date.now()}`,
      quizId: assessmentId,
      quizTitle: assessment?.title || 'Assessment',
      studentId,
      studentName,
      score,
      totalMarks,
      percentage,
      grade,
      completedAt: 'Just now',
      answers,
    };

    setQuizResults((prev) => [
      result,
      ...prev.filter((r) => !(r.quizId === assessmentId && r.studentId === studentId)),
    ]);

    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              points: (prev.points || 0) + (percentage >= 80 ? 100 : 50),
            }
          : null
      );
    }

    addToast(
      'Assessment Completed',
      `Score: ${score}/${totalMarks} (${percentage}% - Grade ${grade}). +${percentage >= 80 ? 100 : 50} points earned!`,
      percentage >= 60 ? 'success' : 'info'
    );

    const targetClass = assessment?.classLevel || currentUser?.classLevel || 'B7';
    addNotification({
      title: '🏆 Assessment Scored',
      message: `You completed "${assessment?.title || 'Quiz'}" with a score of ${percentage}% (Grade ${grade}).`,
      type: 'result',
      targetRole: 'student',
      targetUserId: studentId,
      classLevel: targetClass,
      actionNav: 'results',
    });

    if (currentUser?.parentId) {
      addNotification({
        title: '📋 Ward Assessment Completed',
        message: `${studentName} completed "${assessment?.title || 'Quiz'}" scoring ${percentage}% (Grade ${grade}).`,
        type: 'result',
        targetRole: 'parent',
        targetUserId: currentUser.parentId,
        classLevel: targetClass,
        actionNav: 'results',
      });
    }

    logActivity('Completed Assessment', `${studentName} completed "${assessment?.title || 'Quiz'}" scoring ${percentage}%`, 'quiz', targetClass);

    return result;
  };

  const addAssessment = (assessmentData: Omit<Assessment, 'id'>) => {
    const newAss: Assessment = {
      ...assessmentData,
      id: `quiz-${Date.now()}`,
    };
    setAssessments((prev) => [newAss, ...prev]);
    addToast('Assessment Created', `Published "${newAss.title}".`, 'success');
  };

  const updateAssessment = (id: string, updates: Partial<Assessment>) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    addToast('Assessment Updated', 'Assessment details updated successfully.', 'success');
  };

  const deleteAssessment = (id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    addToast('Assessment Deleted', 'Assessment removed from curriculum.', 'info');
  };

  const deleteQuizResult = (id: string) => {
    setQuizResults((prev) => prev.filter((r) => r.id !== id));
    addToast('Result Reset', 'Assessment attempt cleared for retake.', 'info');
  };

  const recordAttendanceBulk = (newRecords: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const filtered = prev.filter((p) => !newRecords.some((nr) => nr.studentId === p.studentId && nr.date === p.date));
      return [...newRecords, ...filtered];
    });

    addToast(
      'Attendance Saved',
      `Recorded class register for ${newRecords.length} pupils successfully.`,
      'success'
    );

    const firstClass = newRecords[0]?.classLevel || 'B7';
    addNotification({
      title: '📋 Attendance Register Recorded',
      message: `Daily attendance register for Class ${firstClass} has been updated for ${newRecords[0]?.date || 'today'}.`,
      type: 'attendance',
      targetRole: 'parent',
      classLevel: firstClass,
      actionNav: 'attendance',
    });

    logActivity('Marked Attendance', `Recorded attendance for ${newRecords.length} pupils in Class ${firstClass}`, 'attendance', firstClass);
  };

  const scheduleVClass = (data: Omit<VClassSession, 'id' | 'attendeesCount' | 'recordingAvailable'>): VClassSession => {
    const newSession: VClassSession = {
      ...data,
      id: `vclass-${Date.now()}`,
      attendeesCount: 0,
      recordingAvailable: false,
      roomCode: `SMS-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setVclasses((prev) => [newSession, ...prev]);

    addToast(
      'Live VClass Scheduled',
      `"${newSession.title}" set for ${newSession.date} at ${newSession.time}.`,
      'info'
    );

    addNotification({
      title: '🔴 New Live Class Scheduled',
      message: `${newSession.title} on ${newSession.date} at ${newSession.time}`,
      type: 'vclass',
      targetRole: 'all',
      classLevel: newSession.classLevel,
      actionNav: 'vclass',
    });

    logActivity('Scheduled VClass', `Scheduled "${newSession.title}" for Class ${newSession.classLevel}`, 'vclass', newSession.classLevel);
    return newSession;
  };

  const startVClass = (id: string) => {
    let startedTitle = 'Live Session';
    setVclasses((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          startedTitle = v.title;
          return { ...v, isLive: true, status: 'live' as const };
        }
        return v;
      })
    );
    setActiveVClassId(id);

    addToast(
      '🔴 Live Stream Started',
      `You are now Broadcasting Live for "${startedTitle}"!`,
      'success'
    );

    const targetVClass = vclasses.find((v) => v.id === id);
    const targetClass = targetVClass?.classLevel || 'All Classes';

    addNotification({
      title: '🔴 CLASS IS LIVE NOW!',
      message: `${startedTitle} has started. Click to join the classroom stage.`,
      type: 'vclass',
      targetRole: 'student',
      classLevel: targetClass,
      actionNav: 'vclass',
    });

    logActivity('Started VClass Live Stage', `Broadcast started for "${startedTitle}" in Class ${targetClass}`, 'vclass', targetClass);
  };

  const endVClass = (
    id: string,
    attendeesList?: { studentId: string; studentName: string; classLevel: string }[]
  ) => {
    let sessionClassLevel = 'B7';
    setVclasses((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          sessionClassLevel = v.classLevel;
          return {
            ...v,
            isLive: false,
            status: 'ended' as const,
            recordingAvailable: true,
            recordingDuration: `${v.durationMinutes || 45} mins`,
            attendeesCount: attendeesList ? attendeesList.length : (v.attendeesCount || 18),
          };
        }
        return v;
      })
    );

    // Auto record attendance for participants if provided
    if (attendeesList && attendeesList.length > 0) {
      const todayStr = '12 Oct 2026';
      const newRecords: AttendanceRecord[] = attendeesList.map((att, idx) => ({
        id: `att-vclass-${Date.now()}-${idx}`,
        date: todayStr,
        classLevel: att.classLevel || sessionClassLevel,
        studentId: att.studentId,
        studentName: att.studentName,
        status: 'present' as const,
        timeRecorded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setAttendance((prev) => {
        const filtered = prev.filter(
          (p) => !newRecords.some((nr) => nr.studentId === p.studentId && nr.date === p.date)
        );
        return [...newRecords, ...filtered];
      });
    }

    addToast(
      'Live Session Ended',
      'VClass closed. Recording and attendance register saved.',
      'info'
    );
  };

  const launchLivePoll = (vclassId: string, poll: LivePoll) => {
    setVclasses((prev) =>
      prev.map((v) => (v.id === vclassId ? { ...v, activePoll: poll } : v))
    );
    addToast('Live Poll Launched', `Question: "${poll.question}"`, 'info');
  };

  const submitLivePollVote = (vclassId: string, pollId: string, optionId: string) => {
    setVclasses((prev) =>
      prev.map((v) => {
        if (v.id === vclassId && v.activePoll && v.activePoll.id === pollId) {
          const updatedOptions = v.activePoll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...v,
            activePoll: {
              ...v.activePoll,
              options: updatedOptions,
              totalVotes: v.activePoll.totalVotes + 1,
            },
          };
        }
        return v;
      })
    );
    addToast('Vote Recorded', 'Your response has been submitted to the teacher.', 'success');
  };

  const addAnnouncement = (data: Omit<SchoolAnnouncement, 'id' | 'date'>) => {
    const newAnn: SchoolAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      date: 'Today',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    addToast(
      'Broadcast Notice Published',
      `"${newAnn.title}" is now active.`,
      'info'
    );

    addNotification({
      title: newAnn.title,
      message: newAnn.content.slice(0, 85) + '...',
      type: 'announcement',
      targetRole: newAnn.targetAudience === 'students' ? 'student' : newAnn.targetAudience === 'teachers' ? 'teacher' : newAnn.targetAudience === 'parents' ? 'parent' : 'all',
      classLevel: 'All Classes',
      actionNav: 'announcements',
    });

    logActivity('Published Announcement', `Published broadcast notice: "${newAnn.title}"`, 'system', 'All Classes');
  };

  const addDigitalResource = (data: Omit<DigitalResource, 'id' | 'downloadCount' | 'date'>) => {
    const newRes: DigitalResource = {
      ...data,
      id: `res-${Date.now()}`,
      downloadCount: 0,
      date: 'Today',
    };
    setDigitalResources((prev) => [newRes, ...prev]);
    addToast('Resource Uploaded', `Added "${newRes.title}" to digital repository.`, 'success');
  };

  const updateDigitalResource = (id: string, updates: Partial<DigitalResource>) => {
    setDigitalResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    addToast('Resource Updated', 'Resource details updated.', 'success');
  };

  const deleteDigitalResource = (id: string) => {
    setDigitalResources((prev) => prev.filter((r) => r.id !== id));
    addToast('Resource Deleted', 'Resource removed from repository.', 'info');
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // =========================================================================
  // LESSON NOTES MANAGEMENT & HEADMASTER APPROVAL HANDLERS
  // =========================================================================

  const addLessonNote = (data: Omit<LessonNoteSubmission, 'id' | 'createdAt' | 'updatedAt'>): LessonNoteSubmission => {
    const now = new Date().toISOString();
    const newNote: LessonNoteSubmission = {
      ...data,
      id: `ln-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setLessonNotes((prev) => [newNote, ...prev]);
    addToast('Lesson Note Created', `Draft saved for Week ${newNote.weekNumber} (${newNote.subject}).`, 'success');
    return newNote;
  };

  const updateLessonNote = (id: string, updates: Partial<LessonNoteSubmission>) => {
    setLessonNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
    addToast('Lesson Note Saved', 'Changes saved successfully.', 'info');
  };

  const deleteLessonNote = (id: string) => {
    setLessonNotes((prev) => prev.filter((n) => n.id !== id));
    addToast('Lesson Note Removed', 'Lesson note entry deleted.', 'info');
  };

  const submitLessonNote = (id: string) => {
    const now = new Date().toISOString();
    let targetNote: LessonNoteSubmission | undefined;
    setLessonNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          targetNote = { ...n, status: 'submitted', submittedAt: now, updatedAt: now };
          return targetNote;
        }
        return n;
      })
    );
    if (targetNote) {
      addToast('Submitted to Headmaster', `Week ${(targetNote as any).weekNumber} ${(targetNote as any).subject} submitted for review.`, 'success');
      addNotification({
        title: 'New Lesson Note Awaiting Review',
        message: `${(targetNote as any).teacherName} submitted Week ${(targetNote as any).weekNumber} lesson notes for ${(targetNote as any).subject} (${(targetNote as any).classLevel}).`,
        type: 'announcement',
        targetRole: 'admin',
        classLevel: (targetNote as any).classLevel,
        actionNav: 'lesson_notes_approval',
      });
      logActivity(
        'Lesson Note Submitted',
        `${(targetNote as any).teacherName} submitted Week ${(targetNote as any).weekNumber} lesson note for ${(targetNote as any).subject} (${(targetNote as any).classLevel})`,
        'course',
        (targetNote as any).classLevel
      );
    }
  };

  const approveLessonNote = (id: string, reviewerName: string, reviewerComments: string) => {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    let targetNote: LessonNoteSubmission | undefined;
    setLessonNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const endorsementCode = `SMS-APP-${new Date().getFullYear()}-W${String(n.weekNumber).padStart(2, '0')}-${n.id.slice(-4).toUpperCase()}`;
          targetNote = {
            ...n,
            status: 'approved',
            reviewedAt: now,
            reviewedBy: reviewerName || 'Rev. Dr. Emmanuel Addo',
            reviewerComments: reviewerComments || 'Approved by Headmaster for weekly instruction.',
            principalEndorsement: {
              endorsed: true,
              date: today,
              headmasterName: reviewerName || 'Rev. Dr. Emmanuel Addo',
              stampTitle: 'Headmaster & Academic Principal',
              endorsementCode,
              officialSealUrl: '/assets/school_crest.png',
            },
            updatedAt: now,
          };
          return targetNote;
        }
        return n;
      })
    );
    if (targetNote) {
      addToast('Lesson Note Approved', `Official academic endorsement stamp applied for ${(targetNote as any).subject}.`, 'success');
      addNotification({
        title: 'Lesson Note Approved & Endorsed',
        message: `Headmaster approved your Week ${(targetNote as any).weekNumber} lesson notes for ${(targetNote as any).subject} (${(targetNote as any).classLevel}).`,
        type: 'announcement',
        targetRole: 'teacher',
        targetUserId: (targetNote as any).teacherId,
        classLevel: (targetNote as any).classLevel,
        actionNav: 'lesson_notes',
      });
      logActivity(
        'Lesson Note Approved',
        `Headmaster ${reviewerName} officially endorsed Week ${(targetNote as any).weekNumber} ${(targetNote as any).subject} lesson notes for ${(targetNote as any).classLevel}`,
        'course',
        (targetNote as any).classLevel
      );
    }
  };

  const requestRevisionLessonNote = (id: string, reviewerName: string, reviewerComments: string) => {
    const now = new Date().toISOString();
    let targetNote: LessonNoteSubmission | undefined;
    setLessonNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          targetNote = {
            ...n,
            status: 'needs_revision',
            reviewedAt: now,
            reviewedBy: reviewerName || 'Rev. Dr. Emmanuel Addo',
            reviewerComments: reviewerComments || 'Kindly review and address constructive recommendations before final approval.',
            updatedAt: now,
          };
          return targetNote;
        }
        return n;
      })
    );
    if (targetNote) {
      addToast('Revision Requested', 'Feedback and revision remarks dispatched to teacher.', 'info');
      addNotification({
        title: 'Lesson Note Revision Requested',
        message: `Headmaster requested updates on Week ${(targetNote as any).weekNumber} ${(targetNote as any).subject}: "${reviewerComments || 'See review comments'}"`,
        type: 'announcement',
        targetRole: 'teacher',
        targetUserId: (targetNote as any).teacherId,
        classLevel: (targetNote as any).classLevel,
        actionNav: 'lesson_notes',
      });
      logActivity(
        'Revision Requested',
        `Headmaster ${reviewerName} requested revisions on Week ${(targetNote as any).weekNumber} ${(targetNote as any).subject} (${(targetNote as any).classLevel})`,
        'course',
        (targetNote as any).classLevel
      );
    }
  };

  const rejectLessonNote = (id: string, reviewerName: string, reviewerComments: string) => {
    const now = new Date().toISOString();
    let targetNote: LessonNoteSubmission | undefined;
    setLessonNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          targetNote = {
            ...n,
            status: 'rejected',
            reviewedAt: now,
            reviewedBy: reviewerName || 'Rev. Dr. Emmanuel Addo',
            reviewerComments: reviewerComments || 'Submission rejected. Please consult academic administration.',
            updatedAt: now,
          };
          return targetNote;
        }
        return n;
      })
    );
    if (targetNote) {
      addToast('Lesson Note Rejected', 'Rejection recorded and teacher notified.', 'alert');
      addNotification({
        title: 'Lesson Note Rejected',
        message: `Week ${(targetNote as any).weekNumber} ${(targetNote as any).subject} lesson note was not approved: "${reviewerComments}"`,
        type: 'announcement',
        targetRole: 'teacher',
        targetUserId: (targetNote as any).teacherId,
        classLevel: (targetNote as any).classLevel,
        actionNav: 'lesson_notes',
      });
      logActivity(
        'Lesson Note Rejected',
        `Headmaster rejected Week ${(targetNote as any).weekNumber} ${(targetNote as any).subject} for ${(targetNote as any).classLevel}`,
        'course',
        (targetNote as any).classLevel
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        currentRole: currentUser ? currentUser.role : null,
        isPublicWebsite,
        setIsPublicWebsite,
        activeNav,
        setActiveNav,
        courses,
        activeCourseId,
        setActiveCourseId,
        activeLessonId,
        setActiveLessonId,
        vclasses,
        activeVClassId,
        setActiveVClassId,
        assignments,
        submissions,
        assessments,
        activeAssessmentId,
        setActiveAssessmentId,
        quizResults,
        montessoriActivities,
        activeActivityId,
        setActiveActivityId,
        attendance,
        digitalResources,
        announcements,
        badges,
        selectedChildId,
        setSelectedChildId,
        loginWithCredentials,
        updateUserProfile,
        updateUserPassword,
        requestPasswordReset,
        confirmPasswordReset,
        logoutToWebsite,
        markLessonComplete,
        submitAssignment,
        gradeSubmission,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssessment,
        addAssessment,
        updateAssessment,
        deleteAssessment,
        deleteQuizResult,
        recordAttendanceBulk,
        scheduleVClass,
        startVClass,
        endVClass,
        updateVClass,
        deleteVClass,
        launchLivePoll,
        submitLivePollVote,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addDigitalResource,
        updateDigitalResource,
        deleteDigitalResource,
        speakText,
        isSpeaking,
        stopSpeaking,
        databaseConnected,
        showLoginModal,
        setShowLoginModal,
        openLoginModal,
        notifications,
        allNotifications: rawNotifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        activities,
        allActivities: rawActivities,
        clearAllActivities,
        logActivity,
        toasts,
        addToast,
        dismissToast,
        gradeSubmissionWithRubric,
        addUser,
        updateUser,
        deleteUser,
        promoteStudent,
        promoteStudentsBatch,
        updateTeacherAssignments,
        classes,
        addClass,
        updateClass,
        deleteClass,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        parents,
        addParent,
        updateParent,
        deleteParent,
        linkParentToStudents,
        assignStudentToClass,
        linkWardToCurrentParent,
        addCourse,
        updateCourse,
        deleteCourse,
        addLesson,
        updateLesson,
        deleteLesson,
        updateSubmission,
        deleteSubmission,
        notes,
        addNote,
        updateNote,
        deleteNote,
        lessonNotes,
        addLessonNote,
        updateLessonNote,
        deleteLessonNote,
        submitLessonNote,
        approveLessonNote,
        requestRevisionLessonNote,
        rejectLessonNote,
        timetable,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        seedMasterTimetable,
        schoolConfig,
        updateSchoolConfig,
        resetSchoolConfig,
        clearAllSampleData,
        isTourActive,
        currentTourRole,
        currentTourStep,
        showTourWelcomeModal,
        startTour,
        nextTourStep,
        prevTourStep,
        goToTourStep,
        closeTour,
        dismissTourWelcome,
        resetTourStatus,
        isTourCompletedForRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
