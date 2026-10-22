import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  DoorOpen,
  Filter,
  Radio,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Video,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  GraduationCap,
  Users,
} from 'lucide-react';
import {
  getCurrentSchoolDay,
  isSlotActiveNow,
  getTeacherTimetable,
  DayOfWeek,
  DAYS_OF_WEEK,
} from '../../utils/timetable';
import { TimetableSlot } from '../../types';

export const TimetableView: React.FC = () => {
  const {
    timetable,
    classes,
    subjects,
    users,
    currentUser,
    currentRole,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    seedMasterTimetable,
    setActiveNav,
    scheduleVClass,
    startVClass,
    setActiveVClassId,
  } = useApp();

  const teachers = users.filter((u) => u.role === 'teacher');
  const defaultClass = currentUser?.classLevel || classes[0]?.classLevel || 'B7';

  // Mode state: 'class' | 'teacher' | 'all'
  const defaultMode: 'class' | 'teacher' | 'all' =
    currentRole === 'teacher' ? 'teacher' : 'class';
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'all'>(defaultMode);

  // Filters
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>(defaultClass);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    currentUser?.role === 'teacher' ? currentUser.id : teachers[0]?.id || ''
  );
  const [displayLayout, setDisplayLayout] = useState<'daily' | 'weekly_matrix'>('daily');

  const currentDay = getCurrentSchoolDay();
  const [activeDayTab, setActiveDayTab] = useState<DayOfWeek>(currentDay || 'Monday');

  // Modal state for Add/Edit
  const [slotModal, setSlotModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    slotId?: string;
  }>({ isOpen: false, isEditing: false });

  // Delete confirm modal
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<TimetableSlot | null>(null);

  // Form fields
  const [formDay, setFormDay] = useState<DayOfWeek>('Monday');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formStartTime, setFormStartTime] = useState<string>('08:00 AM');
  const [formEndTime, setFormEndTime] = useState<string>('08:45 AM');
  const [formSubject, setFormSubject] = useState<string>(subjects[0]?.name || 'Computing & ICT');
  const [formClassLevel, setFormClassLevel] = useState<string>(defaultClass);
  const [formTeacherId, setFormTeacherId] = useState<string>(
    currentUser?.role === 'teacher' ? currentUser.id : teachers[0]?.id || ''
  );
  const [formRoom, setFormRoom] = useState<string>('Room 201 - JHS Wing');

  // Standard GES period timings map
  const STANDARD_PERIOD_TIMES: Record<number, { start: string; end: string }> = {
    1: { start: '08:00 AM', end: '08:45 AM' },
    2: { start: '08:45 AM', end: '09:30 AM' },
    3: { start: '10:00 AM', end: '10:45 AM' },
    4: { start: '10:45 AM', end: '11:30 AM' },
    5: { start: '11:45 AM', end: '12:30 PM' },
    6: { start: '01:15 PM', end: '02:00 PM' },
    7: { start: '02:00 PM', end: '02:45 PM' },
    8: { start: '02:45 PM', end: '03:30 PM' },
  };

  const handlePeriodChange = (periodNum: number) => {
    setFormPeriod(periodNum);
    const standard = STANDARD_PERIOD_TIMES[periodNum];
    if (standard) {
      setFormStartTime(standard.start);
      setFormEndTime(standard.end);
    }
  };

  const openAddModal = (dayPreset?: DayOfWeek, periodPreset?: number) => {
    if (currentRole !== 'admin') return;
    const day = dayPreset || activeDayTab;
    const period = periodPreset || 1;
    const timings = STANDARD_PERIOD_TIMES[period] || { start: '08:00 AM', end: '08:45 AM' };

    setFormDay(day);
    setFormPeriod(period);
    setFormStartTime(timings.start);
    setFormEndTime(timings.end);
    setFormSubject(subjects[0]?.name || 'Computing & ICT');
    setFormClassLevel(selectedClassLevel);
    setFormTeacherId(
      currentUser?.role === 'teacher' ? currentUser.id : teachers[0]?.id || ''
    );
    setFormRoom('Room 201 - JHS Wing');

    setSlotModal({ isOpen: true, isEditing: false });
  };

  const openEditModal = (slot: TimetableSlot) => {
    if (currentRole !== 'admin') return;
    setFormDay(slot.day);
    setFormPeriod(slot.periodNumber);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormSubject(slot.subject);
    setFormClassLevel(slot.classLevel);
    setFormTeacherId(slot.teacherId || teachers[0]?.id || '');
    setFormRoom(slot.room || 'Room 201');

    setSlotModal({ isOpen: true, isEditing: true, slotId: slot.id });
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'admin') return;
    const assignedTeacher = teachers.find((t) => t.id === formTeacherId);
    const teacherName = assignedTeacher ? assignedTeacher.name : 'Assigned Faculty';

    if (slotModal.isEditing && slotModal.slotId) {
      updateTimetableSlot(slotModal.slotId, {
        day: formDay,
        periodNumber: formPeriod,
        startTime: formStartTime,
        endTime: formEndTime,
        subject: formSubject,
        classLevel: formClassLevel,
        teacherId: formTeacherId,
        teacherName: teacherName,
        room: formRoom,
      });
    } else {
      addTimetableSlot({
        day: formDay,
        periodNumber: formPeriod,
        startTime: formStartTime,
        endTime: formEndTime,
        subject: formSubject,
        classLevel: formClassLevel,
        teacherId: formTeacherId,
        teacherName: teacherName,
        room: formRoom,
      });
    }

    setSlotModal({ isOpen: false, isEditing: false });
  };

  // Launch live session directly from a timetable slot
  const handleLaunchVClassForSlot = (slot: TimetableSlot) => {
    const sessionTitle = `${slot.classLevel} ${slot.subject} Live (Period ${slot.periodNumber})`;
    const newSession = scheduleVClass({
      title: sessionTitle,
      subject: slot.subject,
      classLevel: slot.classLevel,
      teacherId: currentUser?.id || slot.teacherId,
      teacherName: currentUser?.name || slot.teacherName,
      teacherAvatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      date: 'Today',
      time: slot.startTime,
      durationMinutes: 45,
      isLive: true,
      status: 'live',
      materials: [{ name: `${slot.subject}_Period_${slot.periodNumber}.pdf`, type: 'PDF', size: '2.1 MB' }],
      meetingTopic: `Instructional Period ${slot.periodNumber} - ${slot.subject}`,
      description: `Official instructional broadcast for Period ${slot.periodNumber} (${slot.startTime} - ${slot.endTime}).`,
    });

    startVClass(newSession.id);
    setActiveVClassId(newSession.id);
    setActiveNav('vclass');
  };

  // Filter slots based on active mode
  const activeTeacher = teachers.find((t) => t.id === selectedTeacherId);

  const getFilteredSlots = () => {
    if (viewMode === 'teacher') {
      const targetId =
        currentRole === 'teacher' ? currentUser?.id : selectedTeacherId;
      const targetName =
        currentRole === 'teacher' ? currentUser?.name : activeTeacher?.name;
      return getTeacherTimetable(timetable, targetId, targetName);
    }
    if (viewMode === 'class') {
      return timetable.filter(
        (slot) => slot.classLevel === selectedClassLevel || slot.classLevel === 'All Classes'
      );
    }
    // 'all' (Master School Overview)
    return timetable;
  };

  const filteredSlots = getFilteredSlots();

  // Daily filtered slots
  const daySlots = filteredSlots
    .filter((slot) => slot.day === activeDayTab)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1.5">
            <span className="p-1 rounded-md bg-blue-100 text-blue-900 font-bold">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <span>Master Academic Routine &amp; Period Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            {currentRole === 'teacher' && viewMode === 'teacher'
              ? `My Teaching Timetable · ${currentUser?.name}`
              : 'School Master Timetable'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Official GES-aligned period schedules, subject faculty allocations, classroom locations, and direct virtual class launch integrations.
          </p>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Admin-only Seed Master Timetable */}
          {currentRole === 'admin' && (
            <button
              type="button"
              onClick={seedMasterTimetable}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset or load standard Ghanaian timetable schedule"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Load Default Timetable</span>
            </button>
          )}

          {/* Admin-only Add Period Slot */}
          {currentRole === 'admin' && (
            <button
              type="button"
              onClick={() => openAddModal()}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Period Slot</span>
            </button>
          )}

          {/* View-Only Indicator for Students and Teachers */}
          {currentRole !== 'admin' && (
            <div className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />
              <span>Official School Timetable (View-Only)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="bg-slate-100/90 p-2 sm:p-2.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {currentRole === 'teacher' ? (
            <>
              <button
                type="button"
                onClick={() => setViewMode('teacher')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'teacher'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>My Teaching Schedule</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('class')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'class'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Class Timetable</span>
              </button>
            </>
          ) : currentRole === 'admin' ? (
            <>
              <button
                type="button"
                onClick={() => setViewMode('class')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'class'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>By Class Level</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('teacher')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'teacher'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>By Faculty Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'all'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Whole School Matrix</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-2 py-1">
              <GraduationCap className="w-4 h-4 text-blue-900" />
              <span>Student Schedule View</span>
            </div>
          )}
        </div>

        {/* Dynamic Secondary Dropdowns & Layout Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === 'class' && (
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600">Class:</span>
              <select
                value={selectedClassLevel}
                onChange={(e) => setSelectedClassLevel(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.classLevel}>
                    {c.name} ({c.classLevel})
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'teacher' && currentRole === 'admin' && (
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600">Faculty:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Daily vs Weekly Matrix Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDisplayLayout('daily')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayLayout === 'daily'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setDisplayLayout('weekly_matrix')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayLayout === 'weekly_matrix'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5-Day Grid
            </button>
          </div>
        </div>
      </div>

      {/* DAILY VIEW LAYOUT */}
      {displayLayout === 'daily' && (
        <div className="space-y-4">
          {/* Day of Week Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {DAYS_OF_WEEK.map((day) => {
              const isToday = day === currentDay;
              const isSelected = day === activeDayTab;
              const dayCount = filteredSlots.filter((s) => s.day === day).length;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayTab(day)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {dayCount}
                  </span>
                  {isToday && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      title="Today"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Periods List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {activeDayTab} Schedule
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {viewMode === 'teacher'
                    ? `· Teaching slots for ${currentRole === 'teacher' ? currentUser?.name : activeTeacher?.name || 'Selected Faculty'}`
                    : viewMode === 'class'
                    ? `· Class ${selectedClassLevel}`
                    : '· All Classes Routine'}
                </span>
                {activeDayTab === currentDay && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active School Day
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  {daySlots.length} period{daySlots.length === 1 ? '' : 's'} scheduled
                </span>
                {currentRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => openAddModal(activeDayTab)}
                    className="p-1 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title={`Add period for ${activeDayTab}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {daySlots.map((slot) => {
                const isLive = isSlotActiveNow(slot);
                const isTeacherOfSlot =
                  currentRole === 'teacher' &&
                  (slot.teacherId === currentUser?.id ||
                    (currentUser?.name &&
                      slot.teacherName &&
                      slot.teacherName.toLowerCase().includes(currentUser.name.toLowerCase())));

                return (
                  <div
                    key={slot.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isLive
                        ? 'bg-blue-50/70 border-l-4 border-l-blue-900'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Period Badge */}
                      <div className="w-13 h-13 rounded-2xl bg-slate-100 flex flex-col items-center justify-center shrink-0 border border-slate-200/80">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Period
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          {slot.periodNumber}
                        </span>
                      </div>

                      {/* Lesson Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {slot.subject}
                          </h4>

                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                            Class {slot.classLevel}
                          </span>

                          {isLive && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1 animate-pulse shadow-xs">
                              <Radio className="w-2.5 h-2.5" />
                              <span>LIVE NOW</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-blue-900" />
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {slot.teacherName}
                          </span>
                          {slot.room && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                                {slot.room}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions on Slot */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {/* If teacher: Launch Live VClass */}
                      {isTeacherOfSlot && (
                        <button
                          type="button"
                          onClick={() => handleLaunchVClassForSlot(slot)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isLive
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs animate-bounce'
                              : 'bg-blue-900 hover:bg-blue-800 text-white'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isLive ? 'Broadcast Live Now' : 'Launch VClass'}</span>
                        </button>
                      )}

                      {/* Admin CRUD controls */}
                      {currentRole === 'admin' && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(slot)}
                            className="p-2 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Edit slot"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmSlot(slot)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {daySlots.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    No teaching periods scheduled on {activeDayTab}{' '}
                    {viewMode === 'class' ? `for ${selectedClassLevel}` : 'for this selection'}.
                  </p>
                  {currentRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => openAddModal(activeDayTab)}
                      className="px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Program Period for {activeDayTab}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5-DAY WEEKLY GRID MATRIX */}
      {displayLayout === 'weekly_matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                5-Day Weekly Master Timetable Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {viewMode === 'teacher'
                  ? `Instructional layout for ${currentRole === 'teacher' ? currentUser?.name : activeTeacher?.name}`
                  : `Class ${selectedClassLevel} full weekly layout`}
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
              {filteredSlots.length} Total Weekly Slots
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3 w-28">Day</th>
                  {[1, 2, 3, 4, 5, 6, 7].map((pNum) => (
                    <th key={pNum} className="p-3 min-w-[130px]">
                      <div>Period {pNum}</div>
                      <div className="text-[9px] font-normal text-slate-400">
                        {STANDARD_PERIOD_TIMES[pNum]?.start || ''}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS_OF_WEEK.map((day) => {
                  const isToday = day === currentDay;
                  return (
                    <tr
                      key={day}
                      className={isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}
                    >
                      <td className="p-3 font-bold text-slate-900 align-top bg-slate-50/60 border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span>{day}</span>
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>
                      </td>

                      {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                        const slot = filteredSlots.find(
                          (s) => s.day === day && s.periodNumber === pNum
                        );

                        if (!slot) {
                          return (
                            <td
                              key={pNum}
                              className="p-2 align-top text-center text-slate-300 font-mono text-[11px] border-r border-slate-50"
                            >
                              —
                            </td>
                          );
                        }

                        const isLive = isSlotActiveNow(slot);

                        return (
                          <td
                            key={pNum}
                            className={`p-2 align-top border-r border-slate-100 transition-colors ${
                              isLive ? 'bg-blue-100/60' : ''
                            }`}
                          >
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-950 truncate max-w-[100px]">
                                  {slot.subject}
                                </span>
                                {isLive && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                )}
                              </div>

                              <p className="text-[10px] text-slate-600 font-medium">
                                Class {slot.classLevel}
                              </p>

                              <p className="text-[10px] text-slate-400 truncate">
                                {slot.teacherName}
                              </p>

                              {slot.room && (
                                <p className="text-[9px] text-slate-400 font-mono">
                                  {slot.room}
                                </p>
                              )}

                              {currentRole === 'admin' && (
                                <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(slot)}
                                    className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-slate-300">·</span>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmSlot(slot)}
                                    className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                                  >
                                    Del
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT TIMETABLE SLOT MODAL */}
      {slotModal.isOpen && currentRole === 'admin' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-900 font-bold">
                  <Calendar className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {slotModal.isEditing ? 'Edit Timetable Period' : 'Program New Timetable Period'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSlotModal({ isOpen: false, isEditing: false })}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              {/* Day & Period Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Day of Week:
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 cursor-pointer"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Period Number:
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => handlePeriodChange(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        Period {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start and End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Time:
                  </label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Time:
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="e.g. 08:45 AM"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Subject & Class Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Instructional Subject:
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-900 cursor-pointer"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Class:
                  </label>
                  <select
                    value={formClassLevel}
                    onChange={(e) => setFormClassLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-900 cursor-pointer"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.classLevel}>
                        {c.name} ({c.classLevel})
                      </option>
                    ))}
                    <option value="All Classes">All Classes (General Assembly)</option>
                  </select>
                </div>
              </div>

              {/* Teacher Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Faculty Teacher:
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-900 cursor-pointer"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.assignedSubjects?.join(', ') || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Location */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Physical / Virtual Room:
                </label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="e.g. Computer Lab 1, Room 201 - JHS Wing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSlotModal({ isOpen: false, isEditing: false })}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>{slotModal.isEditing ? 'Save Changes' : 'Save Timetable Slot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmSlot && currentRole === 'admin' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Delete Timetable Slot?
                </h4>
                <p className="text-slate-600 mt-1">
                  Are you sure you want to remove <strong>Period {deleteConfirmSlot.periodNumber} ({deleteConfirmSlot.subject})</strong> for{' '}
                  <strong>Class {deleteConfirmSlot.classLevel}</strong> on{' '}
                  <strong>{deleteConfirmSlot.day}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmSlot(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTimetableSlot(deleteConfirmSlot.id);
                  setDeleteConfirmSlot(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Delete Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
