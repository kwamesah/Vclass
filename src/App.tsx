/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/navigation/TopBar';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { Login } from './components/login/Login';
import { StudentPortal } from './components/student/StudentPortal';
import { CourseView } from './components/courses/CourseView';
import { VClassStudio } from './components/vclass/VClassStudio';
import { MontessoriLab } from './components/montessori/MontessoriLab';
import { AssessmentTaker } from './components/assessment/AssessmentTaker';
import { AssignmentSubmissionModal } from './components/assignments/AssignmentSubmissionModal';
import { TeacherPortal } from './components/teacher/TeacherPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { HeadmasterPortal } from './components/headmaster/HeadmasterPortal';
import { DigitalLibrary } from './components/library/DigitalLibrary';
import { BadgesView } from './components/student/BadgesView';
import { AnnouncementsView } from './components/student/AnnouncementsView';
import { ProfileView } from './components/student/ProfileView';
import { ClassesView } from './components/classes/ClassesView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { ExaminationsView } from './components/assessment/ExaminationsView';
import { ResultsView } from './components/assessment/ResultsView';
import { TimetableView } from './components/timetable/TimetableView';
import { ToastContainer } from './components/shared/ToastContainer';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { SEOManager } from './components/shared/SEOManager';

const MainLayout: React.FC = () => {
  const { currentRole, isPublicWebsite, activeNav, currentUser, setActiveNav, setIsPublicWebsite, setActiveVClassId } = useApp();

  // Support incoming deep-linked query parameters from shared VClass links
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const vclassParam = params.get('vclass');
      const navParam = params.get('nav');

      if (vclassParam) {
        setIsPublicWebsite(false);
        setActiveNav('vclass');
        if (vclassParam !== 'live') {
          setActiveVClassId(vclassParam);
        }
      } else if (navParam) {
        setIsPublicWebsite(false);
        setActiveNav(navParam);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [setActiveNav, setIsPublicWebsite, setActiveVClassId]);

  if (isPublicWebsite || !currentUser) {
    return (
      <ErrorBoundary fallbackName="Login">
        <Login />
      </ErrorBoundary>
    );
  }

  // Render role-specific content
  const renderContent = () => {
    // Shared views across all roles if specifically clicked
    if (activeNav === 'library') return <DigitalLibrary />;
    if (activeNav === 'announcements') return <AnnouncementsView />;
    if (activeNav === 'profile') return <ProfileView />;
    if (activeNav === 'vclass') return <VClassStudio />;
    if (activeNav === 'courses') return <CourseView />;
    if (activeNav === 'classes') return <ClassesView />;
    if (activeNav === 'attendance') return <AttendanceView />;
    if (activeNav === 'examinations') return <ExaminationsView />;
    if (activeNav === 'results') return <ResultsView />;
    if (activeNav === 'timetable') return <TimetableView />;
    if (activeNav === 'quizzes') return <AssessmentTaker />;
    if (activeNav === 'badges') return <BadgesView />;

    // STUDENT ROLE
    if (currentRole === 'student') {
      switch (activeNav) {
        case 'dashboard':
          return <StudentPortal />;
        case 'montessori':
          return <MontessoriLab />;
        case 'assignments':
          return <AssignmentSubmissionModal />;
        default:
          return <StudentPortal />;
      }
    }

    // TEACHER ROLE
    if (currentRole === 'teacher') {
      switch (activeNav) {
        case 'dashboard':
        case 'assignments':
        case 'attendance':
          return <TeacherPortal />;
        case 'quizzes':
          return <AssessmentTaker />;
        case 'results':
          return <TeacherPortal />;
        default:
          return <TeacherPortal />;
      }
    }

    // PARENT ROLE
    if (currentRole === 'parent') {
      switch (activeNav) {
        case 'dashboard':
        case 'children':
        case 'attendance':
        case 'messages':
          return <ParentPortal />;
        case 'assignments':
          return <AssignmentSubmissionModal />;
        case 'results':
          return <AssessmentTaker />;
        default:
          return <ParentPortal />;
      }
    }

    // ADMIN / HEADMASTER ROLE
    if (currentRole === 'admin') {
      if (currentUser?.isHeadmaster || currentUser?.email === 'headmaster@salemmontessori.edu.gh' || activeNav === 'lesson_notes_approval') {
        return <HeadmasterPortal />;
      }
      switch (activeNav) {
        case 'dashboard':
        case 'pupils':
        case 'teachers':
        case 'classes':
        case 'attendance':
        case 'configure_school':
          return <AdminPortal />;
        default:
          return <AdminPortal />;
      }
    }

    return <StudentPortal />;
  };

  // Dedicated Fit-Screen, Non-Scrollable Layout for Virtual Classroom Studio
  if (activeNav === 'vclass') {
    return (
      <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950 flex flex-col">
        <ErrorBoundary fallbackName="VClassStudio">
          <VClassStudio />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          <ErrorBoundary fallbackName={activeNav || 'MainContent'}>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary fallbackName="RootLayout">
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
          {/* Global Top Bar Contract */}
          <TopBar />

          {/* Global Floating Toast Alert Stream */}
          <ToastContainer />

          {/* User Onboarding Tour & Interactive Orientation */}
          <OnboardingTour />

          {/* Main App Arena */}
          <MainLayout />
        </div>
      </ErrorBoundary>
    </AppProvider>
  );
}
