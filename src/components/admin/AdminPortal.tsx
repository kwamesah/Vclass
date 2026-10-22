import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  Video,
  FileCheck2,
  Bell,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  ClipboardList,
  Layers,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  X,
  Radio,
  ChevronDown,
  Building2,
  Sliders,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Activity,
  BrainCircuit,
  Key,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConfigureSchool } from './ConfigureSchool';
import { LessonNotesApproval } from './LessonNotesApproval';
import {
  User,
  SchoolClass,
  SchoolSubject,
  SchoolParent,
  Course,
  SchoolAnnouncement,
  Assignment,
  Assessment,
  Question,
  VClassSession,
} from '../../types';

export const AdminPortal: React.FC = () => {
  const {
    currentUser,
    users,
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
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    submissions,
    assessments,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    quizResults,
    vclasses,
    scheduleVClass,
    startVClass,
    updateVClass,
    deleteVClass,
    setActiveVClassId,
    setActiveNav,
    activeNav,
    timetable,
    schoolConfig,
    updateSchoolConfig,
    addToast,
    allActivities,
    allNotifications,
    clearAllActivities,
    lessonNotes,
  } = useApp();

  // Management tabs: 'overview' | 'configure_school' | 'academic_structure' | 'pupils' | 'teachers' | 'parents' | 'courses' | 'assignments' | 'assessments' | 'announcements' | 'vclasses' | 'lesson_notes_approval'
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'overview'
    | 'configure_school'
    | 'academic_structure'
    | 'pupils'
    | 'teachers'
    | 'parents'
    | 'courses'
    | 'assignments'
    | 'assessments'
    | 'announcements'
    | 'vclasses'
    | 'lesson_notes_approval'
  >(currentUser?.isHeadmaster || currentUser?.email === 'headmaster@salemmontessori.edu.gh' ? 'lesson_notes_approval' : 'overview');

  // Activity Audit Log Filter States
  const [activityViewMode, setActivityViewMode] = useState<'activities' | 'notifications'>('activities');
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');
  const [activityClassFilter, setActivityClassFilter] = useState<string>('all');
  const [activityRoleFilter, setActivityRoleFilter] = useState<string>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (activeNav === 'configure_school' || activeNav === 'settings') setActiveAdminTab('configure_school');
    else if (activeNav === 'classes') setActiveAdminTab('academic_structure');
    else if (activeNav === 'courses') setActiveAdminTab('courses');
    else if (activeNav === 'pupils') setActiveAdminTab('pupils');
    else if (activeNav === 'teachers') setActiveAdminTab('teachers');
    else if (activeNav === 'parents') setActiveAdminTab('parents');
    else if (activeNav === 'assignments') setActiveAdminTab('assignments');
    else if (activeNav === 'assessments' || activeNav === 'examinations') setActiveAdminTab('assessments');
    else if (activeNav === 'announcements') setActiveAdminTab('announcements');
    else if (activeNav === 'vclasses') setActiveAdminTab('vclasses');
    else if (activeNav === 'lesson_notes_approval' || activeNav === 'lesson_notes') setActiveAdminTab('lesson_notes_approval');
    else if (activeNav === 'dashboard') setActiveAdminTab('overview');
  }, [activeNav]);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Modal states
  const [activeModal, setActiveModal] = useState<
    | null
    | 'add_pupil'
    | 'edit_pupil'
    | 'add_teacher'
    | 'edit_teacher'
    | 'add_class'
    | 'edit_class'
    | 'add_subject'
    | 'edit_subject'
    | 'add_parent'
    | 'edit_parent'
    | 'add_course'
    | 'edit_course'
    | 'add_assignment'
    | 'edit_assignment'
    | 'add_assessment'
    | 'edit_assessment'
    | 'edit_announcement'
    | 'add_vclass'
    | 'edit_vclass'
    | 'promote_pupil'
    | 'batch_promote'
    | 'assign_class'
    | 'link_wards'
  >(null);

  // Editing targets
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [editingSubject, setEditingSubject] = useState<SchoolSubject | null>(null);
  const [editingParent, setEditingParent] = useState<SchoolParent | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SchoolAnnouncement | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [editingVClass, setEditingVClass] = useState<VClassSession | null>(null);

  // Form states for VClass Live Sessions
  const [adminVClassTitle, setAdminVClassTitle] = useState('B7 Computing: System Bus Architecture');
  const [adminVClassTeacher, setAdminVClassTeacher] = useState('Mr. Kwame Mensah');
  const [adminVClassSubject, setAdminVClassSubject] = useState('Computing');
  const [adminVClassClass, setAdminVClassClass] = useState('B7');
  const [adminVClassDate, setAdminVClassDate] = useState('Today, 12 Oct');
  const [adminVClassTime, setAdminVClassTime] = useState('10:00 AM');
  const [adminVClassDuration, setAdminVClassDuration] = useState(45);
  const [adminVClassAgenda, setAdminVClassAgenda] = useState('Live virtual classroom lecture and interactive Q&A session.');
  const [adminVClassGoLive, setAdminVClassGoLive] = useState(false);

  // Form states for Assignment
  const [assignTitle, setAssignTitle] = useState('');
  const [assignClass, setAssignClass] = useState('B7');
  const [assignSubject, setAssignSubject] = useState('Computing');
  const [assignDue, setAssignDue] = useState('Next Friday');
  const [assignMarks, setAssignMarks] = useState(20);
  const [assignPrompt, setAssignPrompt] = useState('');
  const [assignTeacher, setAssignTeacher] = useState('');

  // Form states for Assessment
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentClass, setAssessmentClass] = useState('B7');
  const [assessmentSubject, setAssessmentSubject] = useState('Computing');
  const [assessmentType, setAssessmentType] = useState<'quiz' | 'exam'>('quiz');
  const [assessmentDuration, setAssessmentDuration] = useState(30);
  const [assessmentMarks, setAssessmentMarks] = useState(25);
  const [assessmentTerm, setAssessmentTerm] = useState('Term 1');
  const [assessmentQPrompt, setAssessmentQPrompt] = useState('');
  const [assessmentQOptA, setAssessmentQOptA] = useState('');
  const [assessmentQOptB, setAssessmentQOptB] = useState('');
  const [assessmentQOptC, setAssessmentQOptC] = useState('');
  const [assessmentQOptD, setAssessmentQOptD] = useState('');
  const [assessmentQCorrect, setAssessmentQCorrect] = useState(0);

  if (!currentUser) return null;

  // Form states for Pupil
  const [pupilName, setPupilName] = useState('');
  const [pupilClass, setPupilClass] = useState('B7');
  const [pupilEmail, setPupilEmail] = useState('');
  const [pupilPhone, setPupilPhone] = useState('');
  const [pupilStudentId, setPupilStudentId] = useState('');

  // Form states for Teacher
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherStaffId, setTeacherStaffId] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherBio, setTeacherBio] = useState('');
  const [teacherTitle, setTeacherTitle] = useState('Teacher');
  const [teacherAssignedClasses, setTeacherAssignedClasses] = useState<string[]>([]);
  const [teacherAssignedSubjects, setTeacherAssignedSubjects] = useState<string[]>([]);
  const [teacherIsClassTeacherOf, setTeacherIsClassTeacherOf] = useState<string>('');

  // Form states for Student Promotion
  const [promotingStudent, setPromotingStudent] = useState<User | null>(null);
  const [promotionTargetClass, setPromotionTargetClass] = useState<string>('B8');
  const [batchSourceClass, setBatchSourceClass] = useState<string>('B7');
  const [batchTargetClass, setBatchTargetClass] = useState<string>('B8');
  const [batchSelectedStudentIds, setBatchSelectedStudentIds] = useState<string[]>([]);

  // Form states for Class
  const [className, setClassName] = useState('');
  const [classLevel, setClassLevel] = useState('B7');
  const [classTeacher, setClassTeacher] = useState('');
  const [classCapacity, setClassCapacity] = useState(35);
  const [classRoom, setClassRoom] = useState('');

  // Form states for Subject
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subHead, setSubHead] = useState('');
  const [subDescription, setSubDescription] = useState('');

  // Form states for Parent
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentChildren, setParentChildren] = useState('');
  const [parentFeeStatus, setParentFeeStatus] = useState('Paid / Cleared');
  const [parentInitialWardIds, setParentInitialWardIds] = useState<string[]>([]);

  // States for Class Assignment & Guardian Linking
  const [pupilGuardianId, setPupilGuardianId] = useState<string>('');
  const [targetStudentForClass, setTargetStudentForClass] = useState<User | null>(null);
  const [selectedClassToAssign, setSelectedClassToAssign] = useState<string>('B7');

  // States for Wards Connection Modal
  const [targetParentForWards, setTargetParentForWards] = useState<{ id: string; name: string; email: string; phone?: string; childrenIds?: string[] } | null>(null);
  const [selectedWardIds, setSelectedWardIds] = useState<string[]>([]);
  const [wardSearchQuery, setWardSearchQuery] = useState<string>('');

  // Form states for Course
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('Computing');
  const [courseClass, setCourseClass] = useState('B7');
  const [courseTeacher, setCourseTeacher] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  // Announcement Form states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'urgent' | 'normal'>('normal');
  const [annAudience, setAnnAudience] = useState<'all' | 'parents' | 'students' | 'teachers'>('all');

  if (!currentUser) return null;

  // Filtered lists
  const pupils = users.filter((u) => u.role === 'student');
  const unassignedPupilsCount = pupils.filter((p) => !p.classLevel || p.classLevel === 'Unassigned').length;

  const filteredPupils = pupils.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.studentId && p.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.parentName && p.parentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClass =
      selectedClassFilter === 'all'
        ? true
        : selectedClassFilter === 'unassigned'
        ? !p.classLevel || p.classLevel === 'Unassigned'
        : p.classLevel === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  // Unified Parents (merges users with role === 'parent' and parents registry)
  const parentUsers = users.filter((u) => u.role === 'parent');
  const unifiedParents: SchoolParent[] = parentUsers.map((u) => {
    const registryEntry = parents.find(
      (p) => p.userId === u.id || p.id === u.id || p.email.toLowerCase() === u.email.toLowerCase()
    );
    const linkedStudents = users.filter((stu) => stu.role === 'student' && u.childrenIds?.includes(stu.id));
    const childrenStr = linkedStudents.length > 0
      ? linkedStudents.map((s) => `${s.name} (${s.classLevel || 'Unassigned'})`).join(', ')
      : registryEntry?.children || 'No wards connected';

    return {
      id: u.id,
      userId: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || registryEntry?.phone || '+233 24 000 0000',
      children: childrenStr,
      childrenIds: u.childrenIds || [],
      feeStatus: registryEntry?.feeStatus || 'Paid / Cleared',
    };
  });

  // Add any legacy parents in registry not in parentUsers
  parents.forEach((p) => {
    if (!unifiedParents.some((up) => up.email.toLowerCase() === p.email.toLowerCase() || up.id === p.id)) {
      unifiedParents.push({
        id: p.id,
        userId: p.userId || p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        children: p.children,
        childrenIds: p.childrenIds || [],
        feeStatus: p.feeStatus,
      });
    }
  });

  const filteredParents = unifiedParents.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.children.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const faculty = users.filter((u) => u.role === 'teacher');
  const filteredFaculty = faculty.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.staffId && t.staffId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- Handlers: PUPIL CRUD & CLASS ASSIGNMENT ---
  const openAddPupil = () => {
    setPupilName('');
    setPupilClass('B7');
    setPupilEmail('');
    setPupilPhone('');
    setPupilGuardianId('');
    setPupilStudentId(`STU-2026-${Math.floor(100 + Math.random() * 900)}`);
    setActiveModal('add_pupil');
  };

  const openEditPupil = (p: User) => {
    setEditingUser(p);
    setPupilName(p.name);
    setPupilClass(p.classLevel || 'B7');
    setPupilEmail(p.email);
    setPupilPhone(p.phone || '');
    setPupilStudentId(p.studentId || '');
    setPupilGuardianId(p.parentId || '');
    setActiveModal('edit_pupil');
  };

  const openAssignClassModal = (p: User) => {
    setTargetStudentForClass(p);
    setSelectedClassToAssign(
      p.classLevel && p.classLevel !== 'Unassigned'
        ? p.classLevel
        : (classes[0]?.classLevel || 'B7')
    );
    setActiveModal('assign_class');
  };

  const handleSaveClassAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForClass) return;
    await assignStudentToClass(targetStudentForClass.id, selectedClassToAssign);
    setActiveModal(null);
    setTargetStudentForClass(null);
    try {
      confetti({ particleCount: 35 });
    } catch {}
  };

  const handleSavePupil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pupilName.trim()) return;

    const matchedGuardian = pupilGuardianId
      ? unifiedParents.find((par) => par.id === pupilGuardianId || par.userId === pupilGuardianId)
      : null;

    if (activeModal === 'add_pupil') {
      const createdStudent = await addUser({
        name: pupilName,
        email: pupilEmail || `${pupilName.toLowerCase().replace(/\s+/g, '.')}@salemmontessori.edu.gh`,
        role: 'student',
        classLevel: pupilClass,
        studentId: pupilStudentId,
        phone: pupilPhone,
        parentId: matchedGuardian ? matchedGuardian.id : undefined,
        parentName: matchedGuardian ? matchedGuardian.name : undefined,
        parentPhone: matchedGuardian ? matchedGuardian.phone : undefined,
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
        bio: `${pupilClass} student at Salem Montessori School.`,
      });

      if (matchedGuardian) {
        const existingWards = matchedGuardian.childrenIds || [];
        if (!existingWards.includes(createdStudent.id)) {
          await linkParentToStudents(matchedGuardian.id, [...existingWards, createdStudent.id]);
        }
      }
      confetti({ particleCount: 40 });
    } else if (activeModal === 'edit_pupil' && editingUser) {
      await updateUser(editingUser.id, {
        name: pupilName,
        classLevel: pupilClass,
        email: pupilEmail,
        phone: pupilPhone,
        studentId: pupilStudentId,
        parentId: matchedGuardian ? matchedGuardian.id : undefined,
        parentName: matchedGuardian ? matchedGuardian.name : undefined,
        parentPhone: matchedGuardian ? matchedGuardian.phone : undefined,
      });

      if (matchedGuardian) {
        const existingWards = matchedGuardian.childrenIds || [];
        if (!existingWards.includes(editingUser.id)) {
          await linkParentToStudents(matchedGuardian.id, [...existingWards, editingUser.id]);
        }
      } else if (editingUser.parentId && !pupilGuardianId) {
        // Guardian unlinked
        const oldGuardian = unifiedParents.find((par) => par.id === editingUser.parentId);
        if (oldGuardian) {
          const filtered = (oldGuardian.childrenIds || []).filter((id) => id !== editingUser.id);
          await linkParentToStudents(oldGuardian.id, filtered);
        }
      }
    }
    setActiveModal(null);
  };

  const handleDeletePupil = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the student database?`)) {
      await deleteUser(id);
    }
  };

  // --- Handlers: TEACHER CRUD & ASSIGNMENTS ---
  const openAddTeacher = () => {
    setTeacherName('');
    setTeacherEmail('');
    setTeacherStaffId(`TEA-SM-${Math.floor(10 + Math.random() * 90)}`);
    setTeacherPhone('+233 24 ');
    setTeacherBio('Certified Montessori and secondary instructor.');
    setTeacherTitle('Teacher');
    setTeacherAssignedClasses(['B7']);
    setTeacherAssignedSubjects([subjects[0]?.name || 'Computing & ICT']);
    setTeacherIsClassTeacherOf('');
    setActiveModal('add_teacher');
  };

  const openEditTeacher = (t: User) => {
    setEditingUser(t);
    setTeacherName(t.name);
    setTeacherEmail(t.email);
    setTeacherStaffId(t.staffId || '');
    setTeacherPhone(t.phone || '');
    setTeacherBio(t.bio || '');
    setTeacherTitle(t.title || 'Teacher');
    setTeacherAssignedClasses(t.assignedClasses || []);
    setTeacherAssignedSubjects(t.assignedSubjects || []);
    setTeacherIsClassTeacherOf(t.isClassTeacherOf || '');
    setActiveModal('edit_teacher');
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) return;

    if (activeModal === 'add_teacher') {
      const newT = await addUser({
        name: teacherName,
        email: teacherEmail || `${teacherName.toLowerCase().replace(/\s+/g, '.')}@salemmontessori.edu.gh`,
        role: 'teacher',
        staffId: teacherStaffId,
        phone: teacherPhone,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: teacherBio,
        title: teacherTitle,
        assignedClasses: teacherAssignedClasses,
        assignedSubjects: teacherAssignedSubjects,
        isClassTeacherOf: teacherIsClassTeacherOf || undefined,
      });
      if (newT?.id) {
        await updateTeacherAssignments(
          newT.id,
          teacherAssignedClasses,
          teacherAssignedSubjects,
          teacherIsClassTeacherOf
        );
      }
      confetti({ particleCount: 40 });
    } else if (activeModal === 'edit_teacher' && editingUser) {
      await updateUser(editingUser.id, {
        name: teacherName,
        email: teacherEmail,
        staffId: teacherStaffId,
        phone: teacherPhone,
        bio: teacherBio,
        title: teacherTitle,
        assignedClasses: teacherAssignedClasses,
        assignedSubjects: teacherAssignedSubjects,
        isClassTeacherOf: teacherIsClassTeacherOf || undefined,
      });
      await updateTeacherAssignments(
        editingUser.id,
        teacherAssignedClasses,
        teacherAssignedSubjects,
        teacherIsClassTeacherOf
      );
    }
    setActiveModal(null);
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from faculty staff?`)) {
      await deleteUser(id);
    }
  };

  // --- Handlers: CLASS CRUD & CLASS TEACHER LINKING ---
  const openAddClass = () => {
    setClassName('');
    setClassLevel('B7');
    setClassTeacher(faculty[0]?.name || '');
    setClassCapacity(35);
    setClassRoom('');
    setActiveModal('add_class');
  };

  const openEditClass = (c: SchoolClass) => {
    setEditingClass(c);
    setClassName(c.name);
    setClassLevel(c.classLevel);
    setClassTeacher(c.teacher || '');
    setClassCapacity(c.maxCapacity);
    setClassRoom(c.room || '');
    setActiveModal('edit_class');
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const matchedFaculty = faculty.find(
      (f) => f.name.toLowerCase() === classTeacher.toLowerCase() || f.id === classTeacher
    );
    const teacherNameVal = matchedFaculty ? matchedFaculty.name : classTeacher || 'Assigned Faculty';
    const teacherIdVal = matchedFaculty ? matchedFaculty.id : undefined;

    if (activeModal === 'add_class') {
      addClass({
        name: className,
        classLevel,
        teacher: teacherNameVal,
        teacherId: teacherIdVal,
        pupils: pupils.filter((p) => p.classLevel === classLevel).length,
        maxCapacity: classCapacity,
        room: classRoom || 'Main Wing',
      });
      if (matchedFaculty) {
        const existingClasses = matchedFaculty.assignedClasses || [];
        const newAssigned = existingClasses.includes(classLevel)
          ? existingClasses
          : [...existingClasses, classLevel];
        await updateTeacherAssignments(
          matchedFaculty.id,
          newAssigned,
          matchedFaculty.assignedSubjects || [],
          classLevel
        );
      }
    } else if (activeModal === 'edit_class' && editingClass) {
      updateClass(editingClass.id, {
        name: className,
        classLevel,
        teacher: teacherNameVal,
        teacherId: teacherIdVal,
        maxCapacity: classCapacity,
        room: classRoom,
      });
      if (matchedFaculty) {
        const existingClasses = matchedFaculty.assignedClasses || [];
        const newAssigned = existingClasses.includes(classLevel)
          ? existingClasses
          : [...existingClasses, classLevel];
        await updateTeacherAssignments(
          matchedFaculty.id,
          newAssigned,
          matchedFaculty.assignedSubjects || [],
          classLevel
        );
      }
    }
    setActiveModal(null);
  };

  // --- Handlers: STUDENT PROMOTION (Individual & Batch) ---
  const openPromotePupil = (p: User) => {
    setPromotingStudent(p);
    const currentCls = p.classLevel || 'B7';
    const nextCls =
      currentCls === 'B4'
        ? 'B5'
        : currentCls === 'B5'
        ? 'B6'
        : currentCls === 'B6'
        ? 'B7'
        : currentCls === 'B7'
        ? 'B8'
        : currentCls === 'B8'
        ? 'B9'
        : 'B9';
    setPromotionTargetClass(nextCls);
    setActiveModal('promote_pupil');
  };

  const handleConfirmSinglePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingStudent || !promotionTargetClass) return;
    await promoteStudent(promotingStudent.id, promotionTargetClass);
    confetti({ particleCount: 50, spread: 60 });
    setActiveModal(null);
    setPromotingStudent(null);
  };

  const openBatchPromote = () => {
    setBatchSourceClass('B7');
    setBatchTargetClass('B8');
    const eligibleStudents = users.filter((u) => u.role === 'student' && u.classLevel === 'B7');
    setBatchSelectedStudentIds(eligibleStudents.map((s) => s.id));
    setActiveModal('batch_promote');
  };

  const handleSourceClassChange = (newSrc: string) => {
    setBatchSourceClass(newSrc);
    const eligibleStudents = users.filter((u) => u.role === 'student' && u.classLevel === newSrc);
    setBatchSelectedStudentIds(eligibleStudents.map((s) => s.id));
    const nextCls =
      newSrc === 'B4'
        ? 'B5'
        : newSrc === 'B5'
        ? 'B6'
        : newSrc === 'B6'
        ? 'B7'
        : newSrc === 'B7'
        ? 'B8'
        : newSrc === 'B8'
        ? 'B9'
        : 'B9';
    setBatchTargetClass(nextCls);
  };

  const handleConfirmBatchPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchSelectedStudentIds.length === 0 || !batchTargetClass) return;
    await promoteStudentsBatch(batchSelectedStudentIds, batchTargetClass);
    confetti({ particleCount: 90, spread: 80 });
    setActiveModal(null);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (window.confirm(`Delete class "${name}"?`)) {
      deleteClass(id);
    }
  };

  // --- Handlers: SUBJECT CRUD ---
  const openAddSubject = () => {
    setSubName('');
    setSubCode('SUB-101');
    setSubHead('');
    setSubDescription('');
    setActiveModal('add_subject');
  };

  const openEditSubject = (s: SchoolSubject) => {
    setEditingSubject(s);
    setSubName(s.name);
    setSubCode(s.code);
    setSubHead(s.head);
    setSubDescription(s.description || '');
    setActiveModal('edit_subject');
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    if (activeModal === 'add_subject') {
      addSubject({
        name: subName,
        code: subCode,
        head: subHead || 'Head of Department',
        description: subDescription,
      });
    } else if (activeModal === 'edit_subject' && editingSubject) {
      updateSubject(editingSubject.id, {
        name: subName,
        code: subCode,
        head: subHead,
        description: subDescription,
      });
    }
    setActiveModal(null);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (window.confirm(`Delete subject "${name}"?`)) {
      deleteSubject(id);
    }
  };

  // --- Handlers: PARENT CRUD & WARDS LINKAGE ---
  const openAddParent = () => {
    setParentName('');
    setParentEmail('');
    setParentPhone('+233 ');
    setParentChildren('');
    setParentFeeStatus('Paid / Cleared');
    setParentInitialWardIds([]);
    setActiveModal('add_parent');
  };

  const openEditParent = (p: any) => {
    setEditingParent(p);
    setParentName(p.name);
    setParentEmail(p.email);
    setParentPhone(p.phone);
    setParentChildren(p.children);
    setParentFeeStatus(p.feeStatus || 'Paid / Cleared');
    setParentInitialWardIds(p.childrenIds || []);
    setActiveModal('edit_parent');
  };

  const openLinkWardsModal = (parent: any) => {
    setTargetParentForWards(parent);
    setSelectedWardIds(parent.childrenIds || []);
    setWardSearchQuery('');
    setActiveModal('link_wards');
  };

  const handleToggleWardCheckbox = (studentId: string) => {
    setSelectedWardIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveWardConnections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetParentForWards) return;
    await linkParentToStudents(targetParentForWards.id, selectedWardIds);
    setActiveModal(null);
    setTargetParentForWards(null);
    try {
      confetti({ particleCount: 45 });
    } catch {}
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim()) return;

    const emailDomain = 'gmail.com';
    const cleanEmail = parentEmail.includes('@')
      ? parentEmail.trim().toLowerCase()
      : `${parentName.trim().toLowerCase().replace(/\s+/g, '.')}@${emailDomain}`;

    const linkedStudents = users.filter((u) => u.role === 'student' && parentInitialWardIds.includes(u.id));
    const childrenDisplay = linkedStudents.length > 0
      ? linkedStudents.map((s) => `${s.name} (${s.classLevel || 'Unassigned'})`).join(', ')
      : parentChildren || 'No wards connected';

    if (activeModal === 'add_parent') {
      // 1. Create User account for Parent so they can sign in
      const createdParentUser = await addUser({
        name: parentName,
        email: cleanEmail,
        role: 'parent',
        password: '48468099',
        phone: parentPhone || '+233 24 000 0000',
        childrenIds: parentInitialWardIds,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parentName)}`,
        bio: `Parent Guardian at Salem Montessori School.`,
      });

      // 2. Add to parents registry
      addParent({
        name: parentName,
        email: cleanEmail,
        phone: parentPhone || '+233 24 000 0000',
        children: childrenDisplay,
        childrenIds: parentInitialWardIds,
        userId: createdParentUser.id,
        feeStatus: parentFeeStatus,
      });

      // 3. Link students
      if (parentInitialWardIds.length > 0) {
        await linkParentToStudents(createdParentUser.id, parentInitialWardIds);
      }
      try {
        confetti({ particleCount: 45 });
      } catch {}
    } else if (activeModal === 'edit_parent' && editingParent) {
      updateParent(editingParent.id, {
        name: parentName,
        email: cleanEmail,
        phone: parentPhone,
        children: childrenDisplay,
        childrenIds: parentInitialWardIds,
        feeStatus: parentFeeStatus,
      });

      // Also update matching User in users if exists
      const matchingUser = users.find(
        (u) =>
          u.id === editingParent.id ||
          u.id === editingParent.userId ||
          u.email.toLowerCase() === editingParent.email.toLowerCase()
      );
      if (matchingUser) {
        await updateUser(matchingUser.id, {
          name: parentName,
          email: cleanEmail,
          phone: parentPhone,
          childrenIds: parentInitialWardIds,
        });
        await linkParentToStudents(matchingUser.id, parentInitialWardIds);
      }
    }
    setActiveModal(null);
  };

  const handleDeleteParent = async (id: string, name: string) => {
    if (window.confirm(`Delete parent record for "${name}"?`)) {
      deleteParent(id);
      const matchingUser = users.find(
        (u) => u.id === id || (u.role === 'parent' && u.name === name)
      );
      if (matchingUser) {
        await deleteUser(matchingUser.id);
      }
    }
  };

  // --- Handlers: COURSE CRUD ---
  const openAddCourse = () => {
    setCourseTitle('');
    setCourseSubject('Computing');
    setCourseClass('B7');
    setCourseTeacher(currentUser.name);
    setCourseDescription('');
    setActiveModal('add_course');
  };

  const openEditCourse = (c: Course) => {
    setEditingCourse(c);
    setCourseTitle(c.title);
    setCourseSubject(c.subject);
    setCourseClass(c.classLevel);
    setCourseTeacher(c.teacherName);
    setCourseDescription(c.description);
    setActiveModal('edit_course');
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    if (activeModal === 'add_course') {
      addCourse({
        title: courseTitle,
        subject: courseSubject,
        classLevel: courseClass,
        term: 'Term 1',
        academicYear: '2026/2027',
        teacherName: courseTeacher || currentUser?.name || 'School Administrator',
        teacherId: currentUser?.id || 'admin-root',
        teacherAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
        description: courseDescription,
      });
    } else if (activeModal === 'edit_course' && editingCourse) {
      updateCourse(editingCourse.id, {
        title: courseTitle,
        subject: courseSubject,
        classLevel: courseClass,
        teacherName: courseTeacher,
        description: courseDescription,
      });
    }
    setActiveModal(null);
  };

  const handleDeleteCourse = (id: string, title: string) => {
    if (window.confirm(`Delete course "${title}" from the curriculum?`)) {
      deleteCourse(id);
    }
  };

  // --- Handlers: ANNOUNCEMENT CRUD ---
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      priority: annPriority,
      targetAudience: annAudience,
      author: currentUser.name,
    });

    setAnnTitle('');
    setAnnContent('');
    confetti({ particleCount: 40 });
  };

  const openEditAnnouncement = (a: SchoolAnnouncement) => {
    setEditingAnnouncement(a);
    setAnnTitle(a.title);
    setAnnContent(a.content);
    setAnnPriority(a.priority);
    setAnnAudience(a.targetAudience);
    setActiveModal('edit_announcement');
  };

  const handleSaveAnnouncementEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !annTitle.trim()) return;

    updateAnnouncement(editingAnnouncement.id, {
      title: annTitle,
      content: annContent,
      priority: annPriority,
      targetAudience: annAudience,
    });
    setActiveModal(null);
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = (id: string, title: string) => {
    if (window.confirm(`Delete announcement "${title}"?`)) {
      deleteAnnouncement(id);
    }
  };

  // --- Handlers: ASSIGNMENT CRUD (Admin) ---
  const openAddAssignment = () => {
    setEditingAssignment(null);
    setAssignTitle('');
    setAssignClass('B7');
    setAssignSubject('Computing');
    setAssignDue('Next Friday');
    setAssignMarks(20);
    setAssignPrompt('');
    setAssignTeacher(currentUser?.name || 'Academic Administrator');
    setActiveModal('add_assignment');
  };

  const openEditAssignment = (ass: Assignment) => {
    setEditingAssignment(ass);
    setAssignTitle(ass.title);
    setAssignClass(ass.classLevel);
    setAssignSubject(ass.subject);
    setAssignDue(ass.dueDate);
    setAssignMarks(ass.totalMarks);
    setAssignPrompt(ass.prompt);
    setAssignTeacher(ass.teacherName);
    setActiveModal('edit_assignment');
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;

    if (activeModal === 'add_assignment') {
      addAssignment({
        title: assignTitle,
        classLevel: assignClass,
        subject: assignSubject,
        dueDate: assignDue,
        totalMarks: assignMarks,
        prompt: assignPrompt,
        instructions: 'Submit typed responses or upload handwritten PDF sheets.',
        teacherName: assignTeacher || currentUser?.name || 'Administrator',
      });
    } else if (activeModal === 'edit_assignment' && editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title: assignTitle,
        classLevel: assignClass,
        subject: assignSubject,
        dueDate: assignDue,
        totalMarks: assignMarks,
        prompt: assignPrompt,
        teacherName: assignTeacher,
      });
    }
    setActiveModal(null);
    setEditingAssignment(null);
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (window.confirm(`Delete assignment "${title}"? This will also remove pupil submissions.`)) {
      deleteAssignment(id);
    }
  };

  // --- Handlers: ASSESSMENT & EXAMINATION CRUD (Admin) ---
  const openAddAssessment = () => {
    setEditingAssessment(null);
    setAssessmentTitle('');
    setAssessmentClass('B7');
    setAssessmentSubject('Computing');
    setAssessmentType('quiz');
    setAssessmentDuration(30);
    setAssessmentMarks(20);
    setAssessmentTerm('Term 1');
    setAssessmentQPrompt('');
    setAssessmentQOptA('');
    setAssessmentQOptB('');
    setAssessmentQOptC('');
    setAssessmentQOptD('');
    setAssessmentQCorrect(0);
    setActiveModal('add_assessment');
  };

  const openEditAssessment = (ass: Assessment) => {
    setEditingAssessment(ass);
    setAssessmentTitle(ass.title);
    setAssessmentClass(ass.classLevel);
    setAssessmentSubject(ass.subject);
    setAssessmentType(ass.type);
    setAssessmentDuration(ass.durationMinutes);
    setAssessmentMarks(ass.totalMarks);
    setAssessmentTerm(ass.term);
    setActiveModal('edit_assessment');
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentTitle.trim()) return;

    if (activeModal === 'add_assessment') {
      const q: Question = {
        id: `q-${Date.now()}`,
        type: 'mcq',
        prompt: assessmentQPrompt || `${assessmentSubject} Core Question 1`,
        options: [
          assessmentQOptA || 'Option A',
          assessmentQOptB || 'Option B',
          assessmentQOptC || 'Option C',
          assessmentQOptD || 'Option D',
        ],
        correctAnswer: assessmentQCorrect,
        marks: assessmentMarks,
      };

      addAssessment({
        title: assessmentTitle,
        classLevel: assessmentClass,
        subject: assessmentSubject,
        type: assessmentType,
        durationMinutes: assessmentDuration,
        totalMarks: assessmentMarks,
        term: assessmentTerm,
        questions: [q],
      });
    } else if (activeModal === 'edit_assessment' && editingAssessment) {
      updateAssessment(editingAssessment.id, {
        title: assessmentTitle,
        classLevel: assessmentClass,
        subject: assessmentSubject,
        type: assessmentType,
        durationMinutes: assessmentDuration,
        totalMarks: assessmentMarks,
        term: assessmentTerm,
      });
    }
    setActiveModal(null);
    setEditingAssessment(null);
  };

  const handleDeleteAssessment = (id: string, title: string) => {
    if (window.confirm(`Delete assessment "${title}"?`)) {
      deleteAssessment(id);
    }
  };

  const openAddVClass = () => {
    setEditingVClass(null);
    setAdminVClassTitle('B7 Computing: System Bus Architecture');
    setAdminVClassTeacher('Mr. Kwame Mensah');
    setAdminVClassSubject('Computing');
    setAdminVClassClass('B7');
    setAdminVClassDate('Today, 12 Oct');
    setAdminVClassTime('10:00 AM');
    setAdminVClassDuration(45);
    setAdminVClassAgenda('Interactive virtual lecture with real-time screen sharing and whiteboard demonstration.');
    setAdminVClassGoLive(false);
    setActiveModal('add_vclass');
  };

  const openEditVClass = (v: VClassSession) => {
    setEditingVClass(v);
    setAdminVClassTitle(v.title);
    setAdminVClassTeacher(v.teacherName);
    setAdminVClassSubject(v.subject);
    setAdminVClassClass(v.classLevel);
    setAdminVClassDate(v.date);
    setAdminVClassTime(v.time);
    setAdminVClassDuration(v.durationMinutes);
    setAdminVClassAgenda(v.meetingTopic || v.title);
    setAdminVClassGoLive(v.isLive);
    setActiveModal('edit_vclass');
  };

  const handleSaveVClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVClass) {
      updateVClass(editingVClass.id, {
        title: adminVClassTitle,
        teacherName: adminVClassTeacher,
        subject: adminVClassSubject,
        classLevel: adminVClassClass,
        date: adminVClassDate,
        time: adminVClassTime,
        durationMinutes: adminVClassDuration,
        meetingTopic: adminVClassAgenda,
      });
      setActiveModal(null);
    } else {
      const newSession = scheduleVClass({
        title: adminVClassTitle,
        teacherName: adminVClassTeacher,
        teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        teacherId: 'tea-admin-assigned',
        subject: adminVClassSubject,
        classLevel: adminVClassClass,
        date: adminVClassDate,
        time: adminVClassTime,
        durationMinutes: adminVClassDuration,
        isLive: adminVClassGoLive,
        status: adminVClassGoLive ? 'live' : 'scheduled',
        materials: [{ name: `${adminVClassSubject}_Lecture_Slides.pdf`, type: 'PDF', size: '2.5 MB' }],
        meetingTopic: adminVClassAgenda,
      });
      setActiveModal(null);
      if (adminVClassGoLive && newSession) {
        startVClass(newSession.id);
        setActiveNav('vclass');
      }
    }
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleDeleteVClassSession = (id: string, title: string) => {
    if (window.confirm(`Cancel and delete live session "${title}"?`)) {
      deleteVClass(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div data-tour="admin-header" className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 font-bold text-white text-[11px]">
                HEAD OF SCHOOL CONSOLE
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-400 font-semibold">Academic Year 2026/2027</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">Term 1 Active</span>
            </div>

            <h1 className="text-2xl font-bold font-heading">
              Salem Montessori Executive Control Center
            </h1>
            <p className="text-xs text-slate-300">
              Administrator: {currentUser.name} • Total Enrollment: {pupils.length} Registered Pupils across {classes.length} Classes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              data-tour="admin-enroll-btn"
              onClick={openAddPupil}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Enroll Pupil
            </button>
            <button
              data-tour="admin-add-faculty-btn"
              onClick={openAddTeacher}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Faculty
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation: Categorized Sub-Menus & Mobile Adaptive Switcher */}
      <div className="space-y-2">
        {/* Mobile View Dropdown (< 640px) */}
        <div className="sm:hidden">
          <label htmlFor="admin-tab-select" className="sr-only">Select Administration Section</label>
          <div className="relative">
            <select
              id="admin-tab-select"
              value={activeAdminTab}
              onChange={(e) => setActiveAdminTab(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs appearance-none pr-9 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            >
              <optgroup label="Overview & Structure">
                <option value="overview">Institutional Metrics</option>
                <option value="configure_school">Configure School & Academic Terms</option>
                <option value="academic_structure">Academic Structure ({classes.length} classes, {subjects.length} subjects)</option>
                <option value="courses">Curriculum Courses ({courses.length})</option>
              </optgroup>
              <optgroup label="School Community">
                <option value="pupils">Pupils Roster ({pupils.length})</option>
                <option value="teachers">Faculty Roster ({faculty.length})</option>
                <option value="parents">Guardians & Parents ({parents.length})</option>
              </optgroup>
              <optgroup label="Operations & Content">
                <option value="assignments">Assignments & Homework ({assignments.length})</option>
                <option value="assessments">Quizzes & Examinations ({assessments.length})</option>
                <option value="announcements">Broadcast Notices ({announcements.length})</option>
                <option value="vclasses">Live VClasses ({vclasses.length})</option>
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Desktop View Grouped Sub-Menus (>= 640px) */}
        <div className="hidden sm:block space-y-2">
          {/* Level 1: Primary Category Tabs */}
          {(() => {
            const currentCat = ['overview', 'configure_school', 'academic_structure', 'courses'].includes(activeAdminTab)
              ? 'structure'
              : ['pupils', 'teachers', 'parents'].includes(activeAdminTab)
              ? 'people'
              : 'operations';

            return (
              <div data-tour="admin-tabs" className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('overview')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentCat === 'structure'
                        ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Overview & Structure</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('pupils')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentCat === 'people'
                        ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>School Community</span>
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 text-slate-700">
                      {pupils.length + faculty.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('assignments')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      currentCat === 'operations'
                        ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Operations & Content</span>
                    {vclasses.some((v) => v.isLive) && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Level 2: Sub-Menu Pills for the Active Category */}
                <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60 overflow-x-auto">
                  {currentCat === 'structure' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('overview')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'overview'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Institutional Metrics</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('configure_school')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'configure_school'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Configure School</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('academic_structure')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'academic_structure'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Classes ({classes.length}) & Subjects ({subjects.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveNav('timetable')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/70"
                        title="Configure whole school period timetable and faculty schedules"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-900" />
                        <span>Master Timetable ({timetable.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('courses')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'courses'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Curriculum Courses ({courses.length})</span>
                      </button>
                    </>
                  )}

                  {currentCat === 'people' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('pupils')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'pupils'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Pupils ({pupils.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('teachers')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'teachers'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Faculty ({faculty.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('parents')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'parents'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Parents ({parents.length})</span>
                      </button>
                    </>
                  )}

                  {currentCat === 'operations' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('assignments')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'assignments'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Assignments ({assignments.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('assessments')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'assessments'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Quizzes & Exams ({assessments.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('announcements')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'announcements'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notices ({announcements.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('vclasses')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'vclasses'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5 text-rose-600" />
                        <span>Live VClasses ({vclasses.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('lesson_notes_approval')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeAdminTab === 'lesson_notes_approval'
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Lesson Notes Vetting</span>
                        {lessonNotes.filter((n) => n.status === 'submitted').length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[9px]">
                            {lessonNotes.filter((n) => n.status === 'submitted').length}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 1. OVERVIEW: 8 KEY METRICS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Registration / Signup Control Banner */}
          <div className="bg-gradient-to-r from-[#082B63] to-[#0A3475] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl ${schoolConfig.features.signupEnabled !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Student &amp; Parent Self-Registration</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${schoolConfig.features.signupEnabled !== false ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'}`}>
                    {schoolConfig.features.signupEnabled !== false ? 'Signup Active' : 'Signup Disabled'}
                  </span>
                </div>
                <p className="text-xs text-blue-100/80 mt-0.5">
                  {schoolConfig.features.signupEnabled !== false
                    ? 'Visitors can register new student and parent accounts on the public login page.'
                    : 'Self-registration is locked. The signup tab on the login page is restricted.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const isCurrentlyEnabled = schoolConfig.features.signupEnabled !== false;
                const nextState = !isCurrentlyEnabled;
                updateSchoolConfig({
                  features: {
                    ...schoolConfig.features,
                    signupEnabled: nextState,
                  },
                });
                addToast(
                  nextState ? 'Self-Registration Enabled' : 'Self-Registration Disabled',
                  nextState
                    ? 'Student and parent self-signup is now active on the login page.'
                    : 'Self-signup is now locked. Only administrators can enroll users.',
                  nextState ? 'success' : 'info'
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-sm ${
                schoolConfig.features.signupEnabled !== false
                  ? 'bg-amber-400 hover:bg-amber-500 text-amber-950'
                  : 'bg-emerald-400 hover:bg-emerald-500 text-emerald-950'
              }`}
            >
              {schoolConfig.features.signupEnabled !== false ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Disable Self-Signup</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Enable Self-Signup</span>
                </>
              )}
            </button>
          </div>

          <div data-tour="admin-overview-metrics" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
              <p className="text-[11px] text-slate-500">Students</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{pupils.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
              <p className="text-[11px] text-slate-500">Faculty</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{faculty.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
              <p className="text-[11px] text-slate-500">Classes</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{classes.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
              <p className="text-[11px] text-slate-500">Subjects</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{subjects.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
              <p className="text-[11px] text-slate-500">Courses</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{courses.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
              <p className="text-[11px] text-slate-500">Parents</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{parents.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Quick Administrative Management</h3>
              <p className="text-xs text-slate-500">Execute centralized CRUD management across all school branches.</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={openAddPupil}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between"
                >
                  <span>Enroll Pupil</span>
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={openAddTeacher}
                  className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-semibold flex items-center justify-between"
                >
                  <span>Add Faculty</span>
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={openAddClass}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between"
                >
                  <span>Add Class</span>
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={openAddCourse}
                  className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between"
                >
                  <span>Create Course</span>
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveAdminTab('configure_school')}
                  className="col-span-2 p-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-semibold flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-700" />
                    <span>Configure School & Academic Terms</span>
                  </div>
                  <Sliders className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Recent Official Announcements</h3>
                <button
                  onClick={() => setActiveAdminTab('announcements')}
                  className="text-xs text-blue-900 font-semibold hover:underline"
                >
                  Manage All
                </button>
              </div>
              <div className="space-y-2">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100 flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{ann.title}</p>
                      <p className="text-slate-500 line-clamp-1">{ann.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{ann.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Institutional Activity & System Usage Audit Log */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Institutional Activity &amp; System Usage Audit Log
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Real-time audit log tracking student submissions, quiz completions, teacher live stages, and class-isolated notifications
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setActivityViewMode('activities')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activityViewMode === 'activities'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    System Activities ({allActivities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityViewMode('notifications')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activityViewMode === 'notifications'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dispatched Alerts ({allNotifications.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={clearAllActivities}
                  className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Reset audit logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user, action, details..."
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-900"
                />
              </div>

              {/* Class Filter */}
              <div>
                <select
                  value={activityClassFilter}
                  onChange={(e) => setActivityClassFilter(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-900 cursor-pointer font-medium"
                >
                  <option value="all">All Classes &amp; General</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.classLevel}>
                      {c.name} ({c.classLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={activityRoleFilter}
                  onChange={(e) => setActivityRoleFilter(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-900 cursor-pointer font-medium"
                >
                  <option value="all">All User Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers / Faculty</option>
                  <option value="parent">Parents / Guardians</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={activityTypeFilter}
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-900 cursor-pointer font-medium"
                >
                  <option value="all">All Activity Types</option>
                  <option value="quiz">Quizzes &amp; Exams</option>
                  <option value="assignment">Homework &amp; Assignments</option>
                  <option value="vclass">Live VClass Stages</option>
                  <option value="course">Lessons &amp; Library</option>
                  <option value="attendance">Daily Attendance Registers</option>
                  <option value="auth">Logins &amp; Authentication</option>
                  <option value="system">System Admin &amp; Settings</option>
                </select>
              </div>
            </div>

            {/* Activities Table/List */}
            {activityViewMode === 'activities' && (() => {
              const filteredActs = allActivities.filter((act) => {
                if (activityClassFilter !== 'all' && act.classLevel && act.classLevel !== 'All Classes' && act.classLevel !== activityClassFilter) {
                  return false;
                }
                if (activityRoleFilter !== 'all' && act.userRole !== activityRoleFilter) {
                  return false;
                }
                if (activityTypeFilter !== 'all' && act.type !== activityTypeFilter) {
                  return false;
                }
                if (activitySearchQuery.trim()) {
                  const q = activitySearchQuery.toLowerCase();
                  const match =
                    act.userName?.toLowerCase().includes(q) ||
                    act.action?.toLowerCase().includes(q) ||
                    act.details?.toLowerCase().includes(q);
                  if (!match) return false;
                }
                return true;
              });

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                    <span>Showing {filteredActs.length} of {allActivities.length} recorded events</span>
                    {activityClassFilter !== 'all' && (
                      <span className="font-semibold text-blue-900">Filtered by Class: {activityClassFilter}</span>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                    {filteredActs.length > 0 ? (
                      filteredActs.map((act) => (
                        <div
                          key={act.id}
                          className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-900 shrink-0 mt-0.5">
                              {act.type === 'quiz' ? (
                                <BrainCircuit className="w-4 h-4 text-purple-700" />
                              ) : act.type === 'assignment' ? (
                                <FileCheck2 className="w-4 h-4 text-amber-700" />
                              ) : act.type === 'vclass' ? (
                                <Video className="w-4 h-4 text-rose-600" />
                              ) : act.type === 'attendance' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : act.type === 'auth' ? (
                                <Key className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Activity className="w-4 h-4 text-blue-900" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <span className="font-bold text-slate-900">{act.action}</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                                  {act.userRole}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                                  {act.classLevel || 'General'}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                                {act.details}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                User: <strong className="text-slate-700">{act.userName}</strong> ({act.userId})
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0 self-start sm:self-auto font-mono">
                            {act.timestamp}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 space-y-1">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-medium">No activity matches the selected filters.</p>
                        <p className="text-[11px]">Try selecting "All Classes" or clearing the search query.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Notifications Table/List */}
            {activityViewMode === 'notifications' && (() => {
              const filteredNotifs = allNotifications.filter((n) => {
                if (activityClassFilter !== 'all' && n.classLevel && n.classLevel !== 'All Classes' && n.classLevel !== activityClassFilter) {
                  return false;
                }
                if (activityRoleFilter !== 'all' && n.targetRole && n.targetRole !== 'all' && n.targetRole !== activityRoleFilter) {
                  return false;
                }
                if (activitySearchQuery.trim()) {
                  const q = activitySearchQuery.toLowerCase();
                  const match =
                    n.title.toLowerCase().includes(q) ||
                    n.message.toLowerCase().includes(q);
                  if (!match) return false;
                }
                return true;
              });

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                    <span>Showing {filteredNotifs.length} of {allNotifications.length} dispatched alert records</span>
                    <span className="text-[11px] text-slate-400">Enforcing Class &amp; Role Delivery Isolation</span>
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                    {filteredNotifs.length > 0 ? (
                      filteredNotifs.map((n) => (
                        <div
                          key={n.id}
                          className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-900 shrink-0 mt-0.5">
                              <Bell className="w-4 h-4 text-blue-900" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <span className="font-bold text-slate-900">{n.title}</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold">
                                  Role: {n.targetRole || 'all'}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                                  Target Class: {n.classLevel || 'All Classes'}
                                </span>
                                {n.targetUserId && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-mono">
                                    Direct: {n.targetUserId}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0 self-start sm:self-auto font-mono">
                            {n.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs">No alerts match the selected criteria.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* CONFIGURE SCHOOL TAB */}
      {activeAdminTab === 'configure_school' && <ConfigureSchool />}

      {/* 2. PUPILS TAB (Full CRUD) */}
      {activeAdminTab === 'pupils' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pupils Roster ({pupils.length})</h3>
              <p className="text-xs text-slate-500">Create, view, update, and manage student enrollments and records.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search pupil..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-900"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="all">All Classes ({pupils.length})</option>
                <option value="unassigned">⚠️ Unassigned / New Signups ({unassignedPupilsCount})</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.classLevel}>
                    {c.name} ({c.classLevel})
                  </option>
                ))}
                {!classes.some((c) => c.classLevel === 'B7') && <option value="B7">Basic 7 (B7)</option>}
                {!classes.some((c) => c.classLevel === 'B4') && <option value="B4">Basic 4 (B4)</option>}
                {!classes.some((c) => c.classLevel === 'B8') && <option value="B8">Basic 8 (B8)</option>}
                {!classes.some((c) => c.classLevel === 'B9') && <option value="B9">Basic 9 (B9)</option>}
              </select>

              <button
                onClick={openBatchPromote}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs transition-colors"
                title="Batch promote an entire class or selected pupils"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Batch Promote Class
              </button>

              <button
                onClick={openAddPupil}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Enroll Pupil
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Pupil Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Assigned Guardian</th>
                  <th className="py-3 px-4">Contact / Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPupils.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No pupils found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredPupils.map((p, idx) => (
                    <tr key={p.id || `pupil-${idx}`} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{p.studentId || 'STU-NEW'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4">
                        {p.classLevel && p.classLevel !== 'Unassigned' ? (
                          <button
                            onClick={() => openAssignClassModal(p)}
                            title="Click to reassign or change class"
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-semibold text-[10px] hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1 border border-blue-200 transition-colors"
                          >
                            <span>{p.classLevel}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssignClassModal(p)}
                            title="Newly registered pupil awaiting classroom placement. Click to assign class."
                            className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] hover:bg-amber-200 cursor-pointer inline-flex items-center gap-1 border border-amber-300 transition-colors"
                          >
                            <span>⚠️ Unassigned</span>
                            <span className="underline ml-0.5">Assign</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.parentName || p.parentId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{p.parentName || 'Linked Guardian'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openEditPupil(p)}
                            className="text-[11px] text-slate-400 hover:text-blue-900 hover:underline cursor-pointer inline-flex items-center gap-1"
                            title="No parent guardian linked. Click Edit to assign guardian."
                          >
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>None (Link)</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.phone || '+233 24 000 0000'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.email}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAssignClassModal(p)}
                            title={`Assign or change class for ${p.name}`}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md cursor-pointer transition-colors flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Assign</span>
                          </button>
                          <button
                            onClick={() => openPromotePupil(p)}
                            title={`Promote ${p.name} to next class level`}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md cursor-pointer transition-colors flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Promote</span>
                          </button>
                          <button
                            onClick={() => openEditPupil(p)}
                            title="Edit Pupil"
                            className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePupil(p.id, p.name)}
                            title="Delete Pupil"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TEACHERS TAB (Full CRUD) */}
      {activeAdminTab === 'teachers' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Teaching Faculty ({faculty.length})</h3>
              <p className="text-xs text-slate-500">Manage teachers, department staff, assigned subjects and credentials.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openAddTeacher}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Faculty Member
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((t, idx) => (
              <div key={t.id || `faculty-${idx}`} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-[10px] text-blue-900 font-semibold">{t.title || 'Teacher'}</p>
                      <p className="font-mono text-[10px] text-slate-500">{t.staffId || 'TEA-STAFF'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditTeacher(t)}
                      title="Edit Teacher"
                      className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-200 rounded-md cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(t.id, t.name)}
                      title="Delete Teacher"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {t.isClassTeacherOf && (
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                      ⭐ Class Teacher of {t.isClassTeacherOf}
                    </span>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classes:</span>
                    {t.assignedClasses && t.assignedClasses.length > 0 ? (
                      t.assignedClasses.map((cls) => (
                        <span key={cls} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 font-semibold text-[10px]">
                          {cls}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None assigned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subjects:</span>
                    {t.assignedSubjects && t.assignedSubjects.length > 0 ? (
                      t.assignedSubjects.map((sub) => (
                        <span key={sub} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 font-semibold text-[10px]">
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None assigned</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px] text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {t.email}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.phone || '+233 24 123 4567'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ACADEMIC STRUCTURE (Classes & Subjects CRUD) */}
      {activeAdminTab === 'academic_structure' && (
        <div className="space-y-6">
          {/* Classes Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Class Levels &amp; Rooms ({classes.length})</h3>
                <p className="text-xs text-slate-500">Add, edit, or configure classroom capacities and assigned class masters.</p>
              </div>
              <button
                onClick={openAddClass}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Class
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {classes.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditClass(c)}
                        title="Edit Class"
                        className="p-1 text-slate-400 hover:text-blue-900 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(c.id, c.name)}
                        title="Delete Class"
                        className="p-1 text-rose-400 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600">Master: <strong className="text-blue-900">{c.teacher}</strong></p>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>Capacity: {c.maxCapacity} pupils</span>
                    <span>{c.room || 'Main Block'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academic Subjects ({subjects.length})</h3>
                <p className="text-xs text-slate-500">Define curriculum courses, departmental leads, and codes.</p>
              </div>
              <button
                onClick={openAddSubject}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {subjects.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1 relative">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-blue-900 font-bold">{s.code}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditSubject(s)}
                        title="Edit Subject"
                        className="p-1 text-slate-400 hover:text-blue-900 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(s.id, s.name)}
                        title="Delete Subject"
                        className="p-1 text-rose-400 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900">{s.name}</h4>
                  <p className="text-[11px] text-slate-500">Lead: {s.head}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. COURSES TAB (Full CRUD) */}
      {activeAdminTab === 'courses' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Curriculum E-Learning Courses ({courses.length})</h3>
              <p className="text-xs text-slate-500">Add syllabus tracks, assign instructors, and update content.</p>
            </div>
            <button
              onClick={openAddCourse}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px]">
                      {c.classLevel} • {c.subject}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{c.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCourse(c)}
                      title="Edit Course"
                      className="p-1.5 text-slate-500 hover:text-blue-900 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      title="Delete Course"
                      className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Instructor: <strong>{c.teacherName}</strong></span>
                  <span>{c.strands?.length || 0} Strands configured</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PARENTS TAB (Full CRUD & Ward Management) */}
      {activeAdminTab === 'parents' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registered Parents &amp; Guardians ({filteredParents.length})
              </h3>
              <p className="text-xs text-slate-500">
                Manage guardian accounts, connect parents to their student wards, and track activity monitoring.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search guardian or ward..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-900"
                />
              </div>
              <button
                onClick={openAddParent}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Register Parent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Parent / Guardian</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Enrolled Wards (Students)</th>
                  <th className="py-3 px-4">Term Fees Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No parent guardian records found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((par) => (
                    <tr key={par.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{par.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{par.phone}</td>
                      <td className="py-3.5 px-4 text-slate-600">{par.email}</td>
                      <td className="py-3.5 px-4">
                        {par.childrenIds && par.childrenIds.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                            {par.childrenIds.map((cId: string) => {
                              const stu = users.find((u) => u.id === cId || u.studentId === cId);
                              return (
                                <span
                                  key={cId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-[11px]"
                                >
                                  <GraduationCap className="w-3 h-3 text-blue-700 shrink-0" />
                                  <span>{stu ? `${stu.name} (${stu.classLevel || 'Unassigned'})` : cId}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            onClick={() => openLinkWardsModal(par)}
                            className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold flex items-center gap-1 hover:bg-amber-100 cursor-pointer"
                            title="No student wards linked to this guardian yet. Click to connect."
                          >
                            <span>⚠️ No Wards Linked</span>
                            <span className="underline ml-0.5 font-bold">Connect Wards</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-sm font-semibold text-[10px]">
                          {par.feeStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openLinkWardsModal(par)}
                            title={`Connect & manage student wards for ${par.name}`}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md cursor-pointer transition-colors flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Connect Wards</span>
                          </button>
                          <button
                            onClick={() => openEditParent(par)}
                            title="Edit Parent"
                            className="p-1.5 text-slate-500 hover:text-blue-900 cursor-pointer rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteParent(par.id, par.name)}
                            title="Delete Parent"
                            className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ANNOUNCEMENTS TAB (Full CRUD) */}
      {activeAdminTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Broadcast Official Notice</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Headline:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 NOTICE: First Term Examinations"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience:</label>
                  <select
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="all">Entire School (All)</option>
                    <option value="parents">Parents Only</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority:</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="normal">Normal Notice</option>
                    <option value="urgent">Urgent / Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type notice message..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Broadcast Notice to School
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Published Notices ({announcements.length})
            </h3>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-xl border space-y-2 text-xs relative ${
                  ann.priority === 'urgent'
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ann.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                    <button
                      onClick={() => openEditAnnouncement(ann)}
                      title="Edit Notice"
                      className="p-1 text-slate-400 hover:text-blue-900 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                      title="Delete Notice"
                      className="p-1 text-rose-400 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">{ann.content}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span>Target: <strong className="capitalize">{ann.targetAudience}</strong></span>
                  <span>Author: {ann.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ASSIGNMENTS TAB (Full CRUD) */}
      {activeAdminTab === 'assignments' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Schoolwide Coursework &amp; Assignments ({assignments.length})
              </h3>
              <p className="text-xs text-slate-500">
                Create new homework, edit submission deadlines, track pupil completion, and inspect grades.
              </p>
            </div>
            <button
              onClick={openAddAssignment}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((ass) => {
              const assSubmissions = submissions.filter((s) => s.assignmentId === ass.id);
              return (
                <div key={ass.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold text-[10px]">
                          {ass.classLevel} • {ass.subject}
                        </span>
                        <span className="text-[10px] text-slate-500">Due: {ass.dueDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{ass.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditAssignment(ass)}
                        title="Edit Assignment"
                        className="p-1.5 text-slate-500 hover:text-blue-900 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(ass.id, ass.title)}
                        title="Delete Assignment"
                        className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 line-clamp-2">{ass.prompt}</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Teacher: <strong>{ass.teacherName}</strong></span>
                    <span>Submissions: <strong className="text-blue-900 font-bold">{assSubmissions.length}</strong> / {ass.totalStudents || 35}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. ASSESSMENTS TAB (Full CRUD) */}
      {activeAdminTab === 'assessments' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                School Quizzes &amp; Examinations ({assessments.length})
              </h3>
              <p className="text-xs text-slate-500">
                Configure auto-graded question banks, set term examinations, and review academic performance.
              </p>
            </div>
            <button
              onClick={openAddAssessment}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((a) => {
              const completedResults = quizResults.filter((r) => r.quizId === a.id);
              return (
                <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          a.type === 'exam' ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {a.type.toUpperCase()} • {a.classLevel} • {a.term}
                        </span>
                        <span className="text-[10px] text-slate-500">{a.durationMinutes} mins</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{a.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditAssessment(a)}
                        title="Edit Assessment"
                        className="p-1.5 text-slate-500 hover:text-blue-900 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(a.id, a.title)}
                        title="Delete Assessment"
                        className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600">
                    Subject: <strong>{a.subject}</strong> · Questions: <strong>{a.questions.length}</strong> · Total Marks: <strong>{a.totalMarks}</strong>
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Grading: <strong>Instant Automated Marking</strong></span>
                    <span>Completed Attempts: <strong className="text-emerald-700 font-bold">{completedResults.length}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 10. VCLASSES & LIVE SESSIONS TAB (Full CRUD) */}
      {activeAdminTab === 'vclasses' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600" />
                Salem Montessori Live Classrooms &amp; Broadcast Studios ({vclasses.length})
              </h3>
              <p className="text-xs text-slate-500">
                Oversee scheduled virtual lectures, start live broadcasts, manage faculty presenters, and review attendance.
              </p>
            </div>
            <button
              onClick={openAddVClass}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule Live VClass
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vclasses.map((v) => (
              <div
                key={v.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                  v.isLive || v.status === 'live'
                    ? 'bg-rose-50/70 border-rose-300 shadow-sm ring-1 ring-rose-400'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {v.isLive || v.status === 'live' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] animate-pulse flex items-center gap-1">
                          <Radio className="w-3 h-3" /> LIVE NOW
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[10px]">
                          Scheduled
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px]">
                        {v.classLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditVClass(v)}
                        title="Edit Session"
                        className="p-1.5 text-slate-500 hover:text-blue-900 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVClassSession(v.id, v.title)}
                        title="Delete Session"
                        className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{v.title}</h4>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{v.meetingTopic || v.title}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Host: <strong className="text-slate-800">{v.teacherName}</strong></span>
                    <span>Room: <strong className="font-mono text-slate-700">{v.roomCode || 'SMS-7841'}</strong></span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{v.date} at {v.time}</span>
                    <span>{v.durationMinutes} mins</span>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    {v.isLive || v.status === 'live' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVClassId(v.id);
                          setActiveNav('vclass');
                        }}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Live Stage
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          startVClass(v.id);
                          setActiveNav('vclass');
                        }}
                        className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                        Launch Live Broadcast
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. LESSON NOTES VETTING & HEADMASTER ENDORSEMENT CONSOLE */}
      {activeAdminTab === 'lesson_notes_approval' && (
        <LessonNotesApproval />
      )}

      {/* --- ALL CRUD MODALS --- */}

      {/* PUPIL MODAL (Add & Edit) */}
      {(activeModal === 'add_pupil' || activeModal === 'edit_pupil') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_pupil' ? 'Enroll New Pupil' : 'Edit Pupil Details'}
            </h3>
            <form onSubmit={handleSavePupil} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={pupilName}
                  onChange={(e) => setPupilName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level:</label>
                  <select
                    value={pupilClass}
                    onChange={(e) => setPupilClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Unassigned">⚠️ Unassigned (Pending)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                    {!classes.some((c) => c.classLevel === 'B1') && <option value="B1">Basic 1 (B1)</option>}
                    {!classes.some((c) => c.classLevel === 'B2') && <option value="B2">Basic 2 (B2)</option>}
                    {!classes.some((c) => c.classLevel === 'B3') && <option value="B3">Basic 3 (B3)</option>}
                    {!classes.some((c) => c.classLevel === 'B4') && <option value="B4">Basic 4 (B4)</option>}
                    {!classes.some((c) => c.classLevel === 'B5') && <option value="B5">Basic 5 (B5)</option>}
                    {!classes.some((c) => c.classLevel === 'B6') && <option value="B6">Basic 6 (B6)</option>}
                    {!classes.some((c) => c.classLevel === 'B7') && <option value="B7">Basic 7 (B7)</option>}
                    {!classes.some((c) => c.classLevel === 'B8') && <option value="B8">Basic 8 (B8)</option>}
                    {!classes.some((c) => c.classLevel === 'B9') && <option value="B9">Basic 9 (B9)</option>}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student ID:</label>
                  <input
                    type="text"
                    required
                    value={pupilStudentId}
                    onChange={(e) => setPupilStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address:</label>
                <input
                  type="email"
                  value={pupilEmail}
                  onChange={(e) => setPupilEmail(e.target.value)}
                  placeholder="e.g. pupil@salemmontessori.edu.gh"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Parent / Guardian:</label>
                  <select
                    value={pupilGuardianId}
                    onChange={(e) => {
                      setPupilGuardianId(e.target.value);
                      const found = unifiedParents.find((par) => par.id === e.target.value || par.userId === e.target.value);
                      if (found?.phone && !pupilPhone) {
                        setPupilPhone(found.phone);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="">No Guardian Linked</option>
                    {unifiedParents.map((par) => (
                      <option key={par.id} value={par.id}>
                        {par.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guardian Phone:</label>
                  <input
                    type="text"
                    value={pupilPhone}
                    onChange={(e) => setPupilPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {activeModal === 'add_pupil' ? 'Complete Enrollment' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL (Add & Edit) */}
      {(activeModal === 'add_teacher' || activeModal === 'edit_teacher') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_teacher' ? 'Add Faculty Member' : 'Edit Faculty Member'}
            </h3>
            <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Full Name:</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff ID:</label>
                  <input
                    type="text"
                    required
                    value={teacherStaffId}
                    onChange={(e) => setTeacherStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official School Email:</label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Title / Role:</label>
                <select
                  value={teacherTitle}
                  onChange={(e) => setTeacherTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Form Master">Form Master</option>
                  <option value="Non-Form Master">Non-Form Master</option>
                  <option value="Headmaster">Headmaster</option>
                  <option value="Department Head">Department Head</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Class Teacher Role (Assigned Class Master):
                </label>
                <select
                  value={teacherIsClassTeacherOf}
                  onChange={(e) => setTeacherIsClassTeacherOf(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="">None / Not a Class Teacher</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.classLevel}>
                      Class Teacher for {c.name} ({c.classLevel})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Designate this teacher as the primary class master responsible for register attendance and student welfare.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Classes (Classes Taught):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {classes.map((c) => {
                    const isChecked = teacherAssignedClasses.includes(c.classLevel);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer text-xs font-semibold transition-colors ${
                          isChecked ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeacherAssignedClasses((prev) => [...prev, c.classLevel]);
                            } else {
                              setTeacherAssignedClasses((prev) => prev.filter((lvl) => lvl !== c.classLevel));
                            }
                          }}
                          className="rounded text-blue-900"
                        />
                        <span>{c.classLevel}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Select all classes this teacher instructs (e.g. Basic 7, Basic 8, and Basic 9).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Subjects:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                  {subjects.map((s) => {
                    const isChecked = teacherAssignedSubjects.includes(s.name);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer text-xs font-semibold transition-colors ${
                          isChecked ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeacherAssignedSubjects((prev) => [...prev, s.name]);
                            } else {
                              setTeacherAssignedSubjects((prev) => prev.filter((sub) => sub !== s.name));
                            }
                          }}
                          className="rounded text-emerald-900"
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Select all subjects this teacher instructs.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bio / Department Notes:</label>
                <textarea
                  rows={2}
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {activeModal === 'add_teacher' ? 'Add Teacher Record' : 'Save Faculty Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLASS MODAL (Add & Edit) */}
      {(activeModal === 'add_class' || activeModal === 'edit_class') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_class' ? 'Add Classroom' : 'Edit Class Level'}
            </h3>
            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basic 7 (B7 JHS)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="B7"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity:</label>
                  <input
                    type="number"
                    value={classCapacity}
                    onChange={(e) => setClassCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Teacher / Master:</label>
                <select
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  <option value="">Unassigned Faculty</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.staffId || 'Faculty'}) {f.isClassTeacherOf ? `· Master of ${f.isClassTeacherOf}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Select a faculty member from the staff list to assign as this classroom's teacher.
                </p>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room / Location:</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 1 / Block B"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {activeModal === 'add_class' ? 'Create Class' : 'Save Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 INDIVIDUAL STUDENT PROMOTION MODAL */}
      {activeModal === 'promote_pupil' && promotingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setActiveModal(null);
                setPromotingStudent(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Promote Student to Next Academic Class
                </h3>
                <p className="text-xs text-slate-500">Official academic progression board</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-800">
                Pupil Name: <span className="font-bold text-slate-900">{promotingStudent.name}</span>
              </p>
              <p className="text-slate-600">
                Student ID: <span className="font-mono text-slate-700">{promotingStudent.studentId || 'STU-ID'}</span>
              </p>
              <p className="text-slate-600">
                Current Class Level:{' '}
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold">
                  {promotingStudent.classLevel || 'Unassigned'}
                </span>
              </p>
            </div>

            <form onSubmit={handleConfirmSinglePromotion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Promote / Advance to New Class Level:
                </label>
                <select
                  value={promotionTargetClass}
                  onChange={(e) => setPromotionTargetClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.classLevel}>
                      {c.name} ({c.classLevel})
                    </option>
                  ))}
                  {!classes.some((c) => c.classLevel === 'B8') && <option value="B8">Basic 8 (B8)</option>}
                  {!classes.some((c) => c.classLevel === 'B9') && <option value="B9">Basic 9 (B9)</option>}
                  {!classes.some((c) => c.classLevel === 'SHS1') && <option value="SHS1">SHS 1 / Secondary</option>}
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
                <p className="font-semibold">Academic Board Promotion Confirmation:</p>
                <p>
                  Promoting will update the pupil's course access, class assessments, attendance roster, and timetable immediately.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setPromotingStudent(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" /> Confirm Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 BATCH CLASS PROMOTION MODAL */}
      {activeModal === 'batch_promote' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Batch Class Student Promotion
                </h3>
                <p className="text-xs text-slate-500">
                  Seamlessly advance all or selected students from one class to another
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmBatchPromotion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current (Source) Class:
                  </label>
                  <select
                    value={batchSourceClass}
                    onChange={(e) => handleSourceClassChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                    {!classes.some((c) => c.classLevel === 'B7') && <option value="B7">Basic 7 (B7)</option>}
                    {!classes.some((c) => c.classLevel === 'B8') && <option value="B8">Basic 8 (B8)</option>}
                    {!classes.some((c) => c.classLevel === 'B4') && <option value="B4">Basic 4 (B4)</option>}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destination (Target) Class:
                  </label>
                  <select
                    value={batchTargetClass}
                    onChange={(e) => setBatchTargetClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                    {!classes.some((c) => c.classLevel === 'B8') && <option value="B8">Basic 8 (B8)</option>}
                    {!classes.some((c) => c.classLevel === 'B9') && <option value="B9">Basic 9 (B9)</option>}
                    {!classes.some((c) => c.classLevel === 'B5') && <option value="B5">Basic 5 (B5)</option>}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Eligible Students in {batchSourceClass} (
                    {users.filter((u) => u.role === 'student' && u.classLevel === batchSourceClass).length}):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = users
                        .filter((u) => u.role === 'student' && u.classLevel === batchSourceClass)
                        .map((s) => s.id);
                      if (batchSelectedStudentIds.length === allIds.length) {
                        setBatchSelectedStudentIds([]);
                      } else {
                        setBatchSelectedStudentIds(allIds);
                      }
                    }}
                    className="text-[11px] text-blue-900 font-bold hover:underline cursor-pointer"
                  >
                    {batchSelectedStudentIds.length ===
                    users.filter((u) => u.role === 'student' && u.classLevel === batchSourceClass).length
                      ? 'Deselect All'
                      : 'Select All Pupils'}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50 p-1">
                  {users
                    .filter((u) => u.role === 'student' && u.classLevel === batchSourceClass)
                    .map((s) => {
                      const isChecked = batchSelectedStudentIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setBatchSelectedStudentIds((prev) => [...prev, s.id]);
                                } else {
                                  setBatchSelectedStudentIds((prev) => prev.filter((id) => id !== s.id));
                                }
                              }}
                              className="rounded text-amber-600"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{s.name}</p>
                              <p className="font-mono text-[10px] text-slate-500">{s.studentId || 'STU-ID'}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-semibold text-[10px]">
                            {s.classLevel}
                          </span>
                        </label>
                      );
                    })}
                  {users.filter((u) => u.role === 'student' && u.classLevel === batchSourceClass).length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No students found currently enrolled in {batchSourceClass}.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
                Advancing <strong className="font-bold">{batchSelectedStudentIds.length}</strong> pupil(s) from{' '}
                <strong className="font-bold">{batchSourceClass}</strong> to{' '}
                <strong className="font-bold">{batchTargetClass}</strong>.
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchSelectedStudentIds.length === 0}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  Promote Selected ({batchSelectedStudentIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL (Add & Edit) */}
      {(activeModal === 'add_subject' || activeModal === 'edit_subject') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_subject' ? 'Add Subject' : 'Edit Subject'}
            </h3>
            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Integrated Science"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="SCI-101"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Head:</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Emmanuel Okyere"
                    value={subHead}
                    onChange={(e) => setSubHead(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {activeModal === 'add_subject' ? 'Add Subject' : 'Save Subject'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PARENT MODAL (Add & Edit) */}
      {(activeModal === 'add_parent' || activeModal === 'edit_parent') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_parent' ? 'Register Parent / Guardian' : 'Edit Parent Details'}
            </h3>
            <form onSubmit={handleSaveParent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Names:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. & Mrs. Mensah"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email:</label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Connect Student Wards (Pupils in School):
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1">
                  {pupils.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No registered pupils yet.</p>
                  ) : (
                    pupils.map((stu) => {
                      const isChecked = parentInitialWardIds.includes(stu.id);
                      return (
                        <label
                          key={stu.id}
                          className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50 border border-blue-200 font-semibold' : 'hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setParentInitialWardIds((prev) => [...prev, stu.id]);
                              } else {
                                setParentInitialWardIds((prev) => prev.filter((id) => id !== stu.id));
                              }
                            }}
                            className="rounded text-blue-900"
                          />
                          <span className="text-slate-800 flex-1">{stu.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                            {stu.classLevel || 'Unassigned'}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Select all pupils belonging to this parent. The parent can track their academic performance in the Parent Portal.
                </p>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Clearance Status:</label>
                <select
                  value={parentFeeStatus}
                  onChange={(e) => setParentFeeStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="Paid / Cleared">Paid / Cleared</option>
                  <option value="Partially Paid (80%)">Partially Paid (80%)</option>
                  <option value="Outstanding Balance">Outstanding Balance</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {activeModal === 'add_parent' ? 'Register Parent' : 'Save Parent Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 ASSIGN CLASS MODAL */}
      {activeModal === 'assign_class' && targetStudentForClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setActiveModal(null);
                setTargetStudentForClass(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Assign Classroom Placement
                </h3>
                <p className="text-xs text-slate-500">
                  Place pupil into an active classroom and update syllabus
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Pupil Name:</span>
                <span className="font-bold text-slate-900">{targetStudentForClass.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {targetStudentForClass.studentId || 'SMS-STU'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Class:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                  {targetStudentForClass.classLevel || 'Unassigned'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveClassAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Classroom / Grade:
                </label>
                <select
                  value={selectedClassToAssign}
                  onChange={(e) => setSelectedClassToAssign(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold text-sm"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.classLevel}>
                      {c.name} ({c.classLevel}) — Room: {c.room || 'General'}
                    </option>
                  ))}
                  {!classes.some((c) => c.classLevel === 'B1') && <option value="B1">Basic 1 (B1)</option>}
                  {!classes.some((c) => c.classLevel === 'B2') && <option value="B2">Basic 2 (B2)</option>}
                  {!classes.some((c) => c.classLevel === 'B3') && <option value="B3">Basic 3 (B3)</option>}
                  {!classes.some((c) => c.classLevel === 'B4') && <option value="B4">Basic 4 (B4)</option>}
                  {!classes.some((c) => c.classLevel === 'B5') && <option value="B5">Basic 5 (B5)</option>}
                  {!classes.some((c) => c.classLevel === 'B6') && <option value="B6">Basic 6 (B6)</option>}
                  {!classes.some((c) => c.classLevel === 'B7') && <option value="B7">Basic 7 (B7)</option>}
                  {!classes.some((c) => c.classLevel === 'B8') && <option value="B8">Basic 8 (B8)</option>}
                  {!classes.some((c) => c.classLevel === 'B9') && <option value="B9">Basic 9 (B9)</option>}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Assigning a classroom grants this learner immediate access to curriculum strands, daily timetable, and teacher assessments.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setTargetStudentForClass(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" /> Save Class Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 CONNECT STUDENT WARDS MODAL */}
      {activeModal === 'link_wards' && targetParentForWards && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setActiveModal(null);
                setTargetParentForWards(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Connect Student Wards
                </h3>
                <p className="text-xs text-slate-500">
                  Assign pupil records to <strong className="text-blue-950">{targetParentForWards.name}</strong> for live portal monitoring
                </p>
              </div>
            </div>

            {/* Parent Info Bar */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">Guardian Contact: </span>
                <span className="font-semibold text-blue-950">{targetParentForWards.phone || 'No phone'}</span>
                <span className="mx-1.5 text-slate-300">|</span>
                <span className="font-mono text-slate-700">{targetParentForWards.email}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-900 text-white font-bold text-[10px]">
                {selectedWardIds.length} Ward{selectedWardIds.length === 1 ? '' : 's'} Selected
              </span>
            </div>

            {/* Search pupils */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search enrolled pupil by name or student ID..."
                  value={wardSearchQuery}
                  onChange={(e) => setWardSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-900"
                />
              </div>

              {/* Student Checklist */}
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/60 divide-y divide-slate-100">
                {pupils
                  .filter((stu) =>
                    stu.name.toLowerCase().includes(wardSearchQuery.toLowerCase()) ||
                    (stu.studentId && stu.studentId.toLowerCase().includes(wardSearchQuery.toLowerCase())) ||
                    (stu.classLevel && stu.classLevel.toLowerCase().includes(wardSearchQuery.toLowerCase()))
                  )
                  .map((stu) => {
                    const isChecked = selectedWardIds.includes(stu.id);
                    return (
                      <label
                        key={stu.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-100/70 border border-blue-300 shadow-xs'
                            : 'hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleWardCheckbox(stu.id)}
                          className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {stu.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 font-semibold text-[10px] border border-blue-200">
                              {stu.classLevel || 'Unassigned'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: {stu.studentId || 'STU-ID'} • {stu.email}
                          </p>
                        </div>
                        {isChecked && (
                          <span className="text-emerald-700 font-bold text-[11px] shrink-0">
                            ✓ Connected
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
            </div>

            <form onSubmit={handleSaveWardConnections} className="space-y-3 pt-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <p className="font-semibold">Parent Portal Synchronization:</p>
                <p>
                  Saving will link these pupils to this parent account immediately. When the parent signs in, they will be able to view their ward's grades, submissions, attendance streaks, and message class teachers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setTargetParentForWards(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4" /> Save Ward Connections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE MODAL (Add & Edit) */}
      {(activeModal === 'add_course' || activeModal === 'edit_course') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_course' ? 'Create New Course' : 'Edit Course Details'}
            </h3>
            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B7 Computing & Information Systems"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
                  <input
                    type="text"
                    required
                    value={courseSubject}
                    onChange={(e) => setCourseSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level:</label>
                  <input
                    type="text"
                    required
                    value={courseClass}
                    onChange={(e) => setCourseClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Instructor:</label>
                <input
                  type="text"
                  value={courseTeacher}
                  onChange={(e) => setCourseTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Description:</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {activeModal === 'add_course' ? 'Create Course' : 'Save Course'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL */}
      {activeModal === 'edit_announcement' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold">
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Edit Broadcast Announcement
            </h3>
            <form onSubmit={handleSaveAnnouncementEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Headline:</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience:</label>
                  <select
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="all">Entire School (All)</option>
                    <option value="parents">Parents Only</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority:</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="normal">Normal Notice</option>
                    <option value="urgent">Urgent / Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content:</label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Announcement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGNMENT MODAL (Add & Edit) */}
      {(activeModal === 'add_assignment' || activeModal === 'edit_assignment') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_assignment' ? 'Create Class Assignment' : 'Edit Assignment'}
            </h3>
            <form onSubmit={handleSaveAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B7 Computing: Storage Hierarchy"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level:</label>
                  <select
                    value={assignClass}
                    onChange={(e) => setAssignClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
                  <select
                    value={assignSubject}
                    onChange={(e) => setAssignSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next Monday, 26 Oct"
                    value={assignDue}
                    onChange={(e) => setAssignDue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Marks:</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    required
                    value={assignMarks}
                    onChange={(e) => setAssignMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher:</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Kwame Mensah"
                  value={assignTeacher}
                  onChange={(e) => setAssignTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Questions / Prompt:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type assignment prompts, questions, and submission requirements..."
                  value={assignPrompt}
                  onChange={(e) => setAssignPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {activeModal === 'add_assignment' ? 'Publish Assignment' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSESSMENT MODAL (Add & Edit) */}
      {(activeModal === 'add_assessment' || activeModal === 'edit_assessment') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              {activeModal === 'add_assessment' ? 'Create Examination / Quiz' : 'Edit Assessment'}
            </h3>
            <form onSubmit={handleSaveAssessment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Term 1 Examination"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level:</label>
                  <select
                    value={assessmentClass}
                    onChange={(e) => setAssessmentClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assessment Type:</label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="quiz">Unit Quiz</option>
                    <option value="exam">Official Examination</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
                  <select
                    value={assessmentSubject}
                    onChange={(e) => setAssessmentSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Mins):</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    required
                    value={assessmentDuration}
                    onChange={(e) => setAssessmentDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {activeModal === 'add_assessment' && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800">Initial Question 1:</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter question prompt..."
                    value={assessmentQPrompt}
                    onChange={(e) => setAssessmentQPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option A"
                      value={assessmentQOptA}
                      onChange={(e) => setAssessmentQOptA(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Option B"
                      value={assessmentQOptB}
                      onChange={(e) => setAssessmentQOptB(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      value={assessmentQOptC}
                      onChange={(e) => setAssessmentQOptC(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Option D"
                      value={assessmentQOptD}
                      onChange={(e) => setAssessmentQOptD(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {activeModal === 'add_assessment' ? 'Publish Assessment' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VCLASS LIVE SESSION MODAL (Add & Edit) */}
      {(activeModal === 'add_vclass' || activeModal === 'edit_vclass') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-600" />
              {activeModal === 'add_vclass' ? 'Schedule Live Virtual Classroom' : 'Edit Live VClass Details'}
            </h3>
            <form onSubmit={handleSaveVClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title / Topic:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basic 7 Computing: System Bus Architecture"
                  value={adminVClassTitle}
                  onChange={(e) => setAdminVClassTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
                  <select
                    value={adminVClassSubject}
                    onChange={(e) => setAdminVClassSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class Level:</label>
                  <select
                    value={adminVClassClass}
                    onChange={(e) => setAdminVClassClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                    <option value="All Classes">All Classes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Teacher / Presenter:</label>
                <select
                  value={adminVClassTeacher}
                  onChange={(e) => setAdminVClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.classLevel || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date:</label>
                  <input
                    type="text"
                    required
                    value={adminVClassDate}
                    onChange={(e) => setAdminVClassDate(e.target.value)}
                    placeholder="Today, 12 Oct"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time:</label>
                  <input
                    type="text"
                    required
                    value={adminVClassTime}
                    onChange={(e) => setAdminVClassTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (M):</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    required
                    value={adminVClassDuration}
                    onChange={(e) => setAdminVClassDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Agenda / Overview:</label>
                <textarea
                  rows={2}
                  value={adminVClassAgenda}
                  onChange={(e) => setAdminVClassAgenda(e.target.value)}
                  placeholder="Topics, learning objectives, and lab demonstration..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 resize-none"
                />
              </div>

              {activeModal === 'add_vclass' && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="adminGoLiveImmediate"
                    checked={adminVClassGoLive}
                    onChange={(e) => setAdminVClassGoLive(e.target.checked)}
                    className="w-4 h-4 accent-blue-900 rounded cursor-pointer"
                  />
                  <label htmlFor="adminGoLiveImmediate" className="font-semibold text-blue-950 cursor-pointer text-xs">
                    🔴 Launch Live Broadcast Immediately
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 text-amber-400" />
                {activeModal === 'add_vclass'
                  ? adminVClassGoLive
                    ? 'Launch & Broadcast Live'
                    : 'Schedule Live VClass'
                  : 'Save Session Updates'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
