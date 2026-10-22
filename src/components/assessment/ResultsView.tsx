import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Award,
  GraduationCap,
  Download,
  Printer,
  CheckCircle2,
  TrendingUp,
  FileText,
  User,
  Filter,
} from 'lucide-react';

export const ResultsView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    quizResults,
    users,
    classes,
    subjects,
    schoolConfig,
  } = useApp();

  const allStudents = users.filter((u) => u.role === 'student');
  const isFacultyOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  // Strict user and class isolation for student transcripts
  const availableStudents = React.useMemo(() => {
    if (currentRole === 'student') {
      return currentUser ? [currentUser] : allStudents.slice(0, 1);
    }
    if (currentRole === 'parent') {
      const cIds = currentUser?.childrenIds || [];
      const wards = allStudents.filter(
        (s) => cIds.includes(s.id) || (s.studentId && cIds.includes(s.studentId))
      );
      return wards.length > 0 ? wards : allStudents.slice(0, 1);
    }
    if (currentRole === 'teacher') {
      const teacherClasses = currentUser?.assignedClasses || [currentUser?.isClassTeacherOf].filter(Boolean);
      if (teacherClasses.length > 0) {
        return allStudents.filter((s) => s.classLevel && teacherClasses.includes(s.classLevel));
      }
      return allStudents;
    }
    return allStudents;
  }, [allStudents, currentRole, currentUser]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    availableStudents[0]?.id || currentUser?.id || ''
  );

  const activeStudent =
    availableStudents.find((s) => s.id === selectedStudentId) ||
    availableStudents[0] ||
    currentUser || {
      id: 'stu-default',
      name: 'Adwoa Mensah',
      classLevel: 'B7',
      studentId: 'SMS-2026-0042',
      email: 'adwoa@salem.edu.gh',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
    };

  // Mock terminal scores for standard Ghanaian basic curriculum
  const termGrades = [
    { subject: 'Computing & ICT', classScore: 28, examScore: 66, total: 94, grade: 'A', remark: 'Exemplary Proficiency' },
    { subject: 'Mathematics (Montessori)', classScore: 27, examScore: 64, total: 91, grade: 'A', remark: 'Exceptional Reasoning' },
    { subject: 'Integrated Science', classScore: 25, examScore: 62, total: 87, grade: 'A', remark: 'Thorough Understanding' },
    { subject: 'English Language', classScore: 26, examScore: 60, total: 86, grade: 'A', remark: 'Fluent Articulation' },
    { subject: 'Social Studies', classScore: 24, examScore: 58, total: 82, grade: 'B+', remark: 'Very Good Comprehension' },
    { subject: 'Creative Arts & Design', classScore: 29, examScore: 65, total: 94, grade: 'A', remark: 'Distinguished Craft' },
    { subject: 'Ghanaian Language (Twi)', classScore: 25, examScore: 57, total: 82, grade: 'B+', remark: 'Commendable Effort' },
  ];

  const overallTotal = termGrades.reduce((sum, g) => sum + g.total, 0);
  const averagePercentage = Math.round(overallTotal / termGrades.length);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Academic Transcripts & Gradebook</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            {isFacultyOrAdmin ? 'Student Terminal Reports' : 'My Terminal Report Card'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Certified continuous assessment scores, end-of-term examinations, and cumulative GPA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {availableStudents.length > 1 && (
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-900 cursor-pointer"
              >
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classLevel})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Score</span>
          <p className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">{averagePercentage}%</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Distinction Standing</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Position</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">2nd / 34</p>
          <span className="text-[10px] text-slate-500">Top 5th Percentile</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">98%</p>
          <span className="text-[10px] text-slate-500">Regular &amp; Punctual</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Grade</span>
          <p className="text-2xl font-bold text-blue-900 mt-1">Grade A</p>
          <span className="text-[10px] text-blue-700 font-semibold">Promoted with Honours</span>
        </div>
      </div>

      {/* Official Report Card Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* School Crest & Report Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-serif text-2xl font-black shadow-md overflow-hidden shrink-0">
              {schoolConfig.logoUrl ? (
                <img src={schoolConfig.logoUrl} alt={schoolConfig.name} className="w-full h-full object-cover" />
              ) : (
                <span>{(schoolConfig.shortName || 'SM').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 uppercase tracking-tight">{schoolConfig.name}</h2>
              <p className="text-xs text-slate-500">Official Terminal Performance Transcript · Academic Year {schoolConfig.academicYear}</p>
              <p className="text-[11px] text-slate-400 italic">&ldquo;{schoolConfig.motto}&rdquo;</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 sm:text-right space-y-0.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p>Term: <strong>{schoolConfig.currentTerm} Final</strong></p>
            <p>Class: <strong>{activeStudent.classLevel || 'B7'}</strong></p>
            <p>Student ID: <strong>{activeStudent.studentId || activeStudent.id}</strong></p>
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={activeStudent.avatar}
              alt={activeStudent.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-300"
            />
            <div>
              <p className="font-bold text-slate-900 text-sm">{activeStudent.name}</p>
              <p className="text-slate-500">{activeStudent.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Directress / Head: <strong>{schoolConfig.headOfSchool}</strong></span>
            <span>·</span>
            <span>Total Subjects: <strong>{termGrades.length}</strong></span>
          </div>
        </div>

        {/* Detailed Grades Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5 text-center">Class Work ({schoolConfig.continuousAssessmentWeight}%)</th>
                <th className="p-3.5 text-center">Exam ({schoolConfig.examAssessmentWeight}%)</th>
                <th className="p-3.5 text-center">Total (100%)</th>
                <th className="p-3.5 text-center">Grade</th>
                <th className="p-3.5">Faculty Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {termGrades.map((g, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{g.subject}</td>
                  <td className="p-3.5 text-center tabular-nums">{g.classScore}</td>
                  <td className="p-3.5 text-center tabular-nums">{g.examScore}</td>
                  <td className="p-3.5 text-center font-bold text-blue-900 tabular-nums">{g.total}%</td>
                  <td className="p-3.5 text-center font-extrabold text-emerald-700">{g.grade}</td>
                  <td className="p-3.5 text-slate-500 text-[11px]">{g.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Remarks and Sign-off */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">Class Master's Remarks:</p>
            <p className="text-slate-600 italic">
              "An outstanding term. Adwoa exhibits exceptional analytical discipline in Computing and active leadership during Montessori peer sessions."
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">Head of School Remarks:</p>
            <p className="text-slate-600 italic">
              "Commendable performance across all disciplines. Keep striving for greater heights in Term 2."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
