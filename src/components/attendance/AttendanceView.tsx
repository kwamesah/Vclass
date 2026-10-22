import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Save,
  Users,
  Search,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { AttendanceRecord } from '../../types';

export const AttendanceView: React.FC = () => {
  const {
    currentRole,
    currentUser,
    users,
    classes,
    attendance,
    recordAttendanceBulk,
    addToast,
  } = useApp();

  const isTeacherOrAdmin = currentRole === 'teacher' || currentRole === 'admin';

  // Selected class for register with strict role isolation
  const parentWardClasses = currentRole === 'parent'
    ? classes.filter((c) => {
        const cIds = currentUser?.childrenIds || [];
        const wardClasses = users
          .filter((u) => cIds.includes(u.id) || (u.studentId && cIds.includes(u.studentId)))
          .map((w) => w.classLevel);
        return wardClasses.includes(c.classLevel);
      })
    : [];

  const availableClasses =
    currentRole === 'teacher'
      ? (currentUser?.assignedClasses && currentUser.assignedClasses.length > 0
          ? classes.filter(
              (c) =>
                currentUser.assignedClasses?.includes(c.classLevel) ||
                c.classLevel === currentUser.isClassTeacherOf
            )
          : classes)
      : currentRole === 'student'
      ? classes.filter((c) => c.classLevel === (currentUser?.classLevel || 'B7'))
      : currentRole === 'parent'
      ? (parentWardClasses.length > 0 ? parentWardClasses : classes)
      : classes;

  const defaultClass =
    currentRole === 'student'
      ? currentUser?.classLevel || 'B7'
      : currentRole === 'teacher'
      ? currentUser?.isClassTeacherOf || currentUser?.assignedClasses?.[0] || 'B7'
      : currentRole === 'parent'
      ? parentWardClasses[0]?.classLevel || 'B7'
      : classes[0]?.classLevel || 'B7';

  const [selectedClassLevel, setSelectedClassLevel] = useState<string>(defaultClass);
  const [selectedDate, setSelectedDate] = useState<string>('12 Oct 2026');

  // Local editing register for teacher/admin
  const pupilsInClass = users.filter(
    (u) => u.role === 'student' && (u.classLevel === selectedClassLevel || !selectedClassLevel)
  );

  const existingClassAttendance = attendance.filter(
    (a) => a.classLevel === selectedClassLevel && a.date === selectedDate
  );

  const [registerStatus, setRegisterStatus] = useState<Record<string, 'present' | 'absent' | 'late'>>(() => {
    const map: Record<string, 'present' | 'absent' | 'late'> = {};
    pupilsInClass.forEach((p) => {
      const match = existingClassAttendance.find((a) => a.studentId === p.id);
      map[p.id] = match ? match.status : 'present';
    });
    return map;
  });

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setRegisterStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
    const updated: Record<string, 'present' | 'absent' | 'late'> = {};
    pupilsInClass.forEach((p) => {
      updated[p.id] = status;
    });
    setRegisterStatus(updated);
    addToast('Batch Update', `Marked all pupils in ${selectedClassLevel} as ${status}.`, 'info');
  };

  const handleSaveRegister = () => {
    const recordsToSave: AttendanceRecord[] = pupilsInClass.map((p) => ({
      id: `att-${selectedClassLevel}-${p.id}-${selectedDate.replace(/\s+/g, '-')}`,
      date: selectedDate,
      classLevel: selectedClassLevel,
      studentId: p.id,
      studentName: p.name,
      status: registerStatus[p.id] || 'present',
      timeRecorded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    recordAttendanceBulk(recordsToSave);
    addToast(
      'Register Saved',
      `Attendance for ${selectedClassLevel} on ${selectedDate} committed successfully.`,
      'success'
    );
  };

  // Metrics calculation
  const totalStudents = pupilsInClass.length;
  const presentCount = Object.values(registerStatus).filter((s) => s === 'present').length;
  const lateCount = Object.values(registerStatus).filter((s) => s === 'late').length;
  const absentCount = Object.values(registerStatus).filter((s) => s === 'absent').length;
  const presenceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 100;

  // Student specific history
  const studentAttendanceHistory = attendance.filter((a) => a.studentId === currentUser?.id);
  const studentTotalPresent = studentAttendanceHistory.filter((a) => a.status === 'present').length;
  const studentTotalLate = studentAttendanceHistory.filter((a) => a.status === 'late').length;
  const studentTotalAbsent = studentAttendanceHistory.filter((a) => a.status === 'absent').length;
  const studentTotalDays = studentAttendanceHistory.length || 1;
  const studentRate = Math.round(((studentTotalPresent + studentTotalLate) / studentTotalDays) * 100) || 96;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Attendance & Daily Presence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            {isTeacherOrAdmin ? 'Daily Attendance Register' : 'My Attendance Record'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isTeacherOrAdmin
              ? 'Record and audit roll calls, daily presence, and punctuality across classes.'
              : `Review your official school attendance rate, punctuality streak, and daily log.`}
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            type="button"
            onClick={handleSaveRegister}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer self-start md:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Save Class Register</span>
          </button>
        )}
      </div>

      {/* TEACHER & ADMIN REGISTER VIEW */}
      {isTeacherOrAdmin && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Classroom:
                </label>
                <div className="relative">
                  <select
                    value={selectedClassLevel}
                    onChange={(e) => setSelectedClassLevel(e.target.value)}
                    className="px-3 py-1.5 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  >
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel}) {c.classLevel === currentUser?.isClassTeacherOf ? '★ (Class Master)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Date:
                </label>
                <input
                  type="text"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
              >
                ✓ Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
              >
                ✕ Mark All Absent
              </button>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Pupils</span>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{totalStudents}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Present</span>
              <p className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">{presentCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Late Arrivals</span>
              <p className="text-xl font-bold text-amber-700 mt-1 tabular-nums">{lateCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Absent</span>
              <p className="text-xl font-bold text-rose-700 mt-1 tabular-nums">{absentCount}</p>
            </div>
          </div>

          {/* Student Register Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pupils Register — {selectedClassLevel}
              </h3>
              <span className="text-xs font-bold text-emerald-700">
                Attendance Rate: {presenceRate}%
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pupilsInClass.map((p, idx) => {
                const status = registerStatus[p.id] || 'present';
                return (
                  <div
                    key={p.id}
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500">ID: {p.studentId || p.id} · Level: {p.classLevel}</p>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(p.id, 'present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        ✓ Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(p.id, 'late')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          status === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        ⏱ Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(p.id, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        ✕ Absent
                      </button>
                    </div>
                  </div>
                );
              })}

              {pupilsInClass.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No students currently enrolled in {selectedClassLevel}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT & PARENT VIEW */}
      {!isTeacherOrAdmin && (
        <div className="space-y-6">
          {/* Rate Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Official Roll Call Standing</span>
              <h3 className="text-xl font-bold font-heading text-slate-900">
                Punctuality &amp; Attendance Record
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                Continuous high attendance earns Montessori distinction badges and fulfills school graduation criteria.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100 min-w-[120px]">
                <p className="text-3xl font-extrabold text-blue-900 tabular-nums">{studentRate}%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mt-1">Presence Rate</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Present Days</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{studentTotalPresent || 18}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Late Days</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{studentTotalLate || 1}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
              <XCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Absences</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{studentTotalAbsent || 0}</p>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Term Daily Activity Log
              </h4>
              <span className="text-xs font-semibold text-slate-500">Class: {currentUser?.classLevel || 'B7'}</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { date: '12 Oct 2026', day: 'Monday', status: 'present', time: '07:48 AM', teacher: 'Mr. Kwame Mensah' },
                { date: '09 Oct 2026', day: 'Friday', status: 'present', time: '07:52 AM', teacher: 'Mr. Kwame Mensah' },
                { date: '08 Oct 2026', day: 'Thursday', status: 'present', time: '07:44 AM', teacher: 'Mrs. Faustina Osei' },
                { date: '07 Oct 2026', day: 'Wednesday', status: 'late', time: '08:12 AM', teacher: 'Mr. Kwame Mensah' },
                { date: '06 Oct 2026', day: 'Tuesday', status: 'present', time: '07:50 AM', teacher: 'Mr. Kofi Boateng' },
                { date: '05 Oct 2026', day: 'Monday', status: 'present', time: '07:45 AM', teacher: 'Mr. Kwame Mensah' },
              ].map((rec, i) => (
                <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">{rec.date} ({rec.day})</p>
                      <p className="text-[10px] text-slate-500">Logged by: {rec.teacher} at {rec.time}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      rec.status === 'present'
                        ? 'bg-emerald-50 text-emerald-800'
                        : rec.status === 'late'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {rec.status === 'present' ? '✓ Present' : rec.status === 'late' ? '⏱ Late' : '✕ Absent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
