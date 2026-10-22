import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  DoorOpen,
  GraduationCap,
  Calendar,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  X,
  UserCheck,
  AlertCircle,
  Building,
} from 'lucide-react';
import { SchoolClass, User } from '../../types';

export const ClassesView: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    users,
    courses,
    timetable,
    currentRole,
    currentUser,
    setActiveCourseId,
    setActiveNav,
    updateTeacherAssignments,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    classLevel: 'B7',
    teacher: '',
    maxCapacity: 35,
    room: '',
  });

  const canManage = currentRole === 'admin' || currentRole === 'teacher';

  const pupils = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.classLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.room && c.room.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getPupilsInClass = (classLevel: string): User[] => {
    return pupils.filter((p) => p.classLevel === classLevel);
  };

  const getCoursesForClass = (classLevel: string) => {
    return courses.filter((c) => c.classLevel === classLevel || c.classLevel === 'All Classes');
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      classLevel: 'B8',
      teacher: teachers[0]?.name || 'Mr. Kwame Mensah',
      maxCapacity: 35,
      room: 'Room 102 - Block B',
    });
    setEditingClassId(null);
    setModalMode('create');
  };

  const openEditModal = (c: SchoolClass) => {
    setFormData({
      name: c.name,
      classLevel: c.classLevel,
      teacher: c.teacher,
      maxCapacity: c.maxCapacity || 35,
      room: c.room || '',
    });
    setEditingClassId(c.id);
    setModalMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classLevel.trim()) return;

    const matchedTeacher = teachers.find(
      (t) => t.name.toLowerCase() === formData.teacher.toLowerCase() || t.id === formData.teacher
    );
    const teacherName = matchedTeacher ? matchedTeacher.name : formData.teacher.trim() || 'Assigned Faculty';
    const teacherId = matchedTeacher ? matchedTeacher.id : undefined;

    if (modalMode === 'create') {
      addClass({
        name: formData.name.trim(),
        classLevel: formData.classLevel.trim().toUpperCase(),
        teacher: teacherName,
        teacherId,
        maxCapacity: Number(formData.maxCapacity) || 35,
        pupils: getPupilsInClass(formData.classLevel.trim()).length,
        room: formData.room.trim() || 'Main Wing',
      });
      if (matchedTeacher) {
        const existingClasses = matchedTeacher.assignedClasses || [];
        const newClasses = existingClasses.includes(formData.classLevel.trim().toUpperCase())
          ? existingClasses
          : [...existingClasses, formData.classLevel.trim().toUpperCase()];
        await updateTeacherAssignments(
          matchedTeacher.id,
          newClasses,
          matchedTeacher.assignedSubjects || [],
          formData.classLevel.trim().toUpperCase()
        );
      }
    } else if (modalMode === 'edit' && editingClassId) {
      updateClass(editingClassId, {
        name: formData.name.trim(),
        classLevel: formData.classLevel.trim().toUpperCase(),
        teacher: teacherName,
        teacherId,
        maxCapacity: Number(formData.maxCapacity) || 35,
        room: formData.room.trim(),
      });
      if (matchedTeacher) {
        const existingClasses = matchedTeacher.assignedClasses || [];
        const newClasses = existingClasses.includes(formData.classLevel.trim().toUpperCase())
          ? existingClasses
          : [...existingClasses, formData.classLevel.trim().toUpperCase()];
        await updateTeacherAssignments(
          matchedTeacher.id,
          newClasses,
          matchedTeacher.assignedSubjects || [],
          formData.classLevel.trim().toUpperCase()
        );
      }
      if (selectedClass && selectedClass.id === editingClassId) {
        setSelectedClass({
          ...selectedClass,
          name: formData.name.trim(),
          classLevel: formData.classLevel.trim().toUpperCase(),
          teacher: teacherName,
          teacherId,
          maxCapacity: Number(formData.maxCapacity) || 35,
          room: formData.room.trim(),
        });
      }
    }

    setModalMode(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete class "${name}"? This action cannot be undone.`)) {
      deleteClass(id);
      if (selectedClass?.id === id) {
        setSelectedClass(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>Academic Structure · Classrooms</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            Class Levels & Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage grade streams, assigned class masters, enrolled student rosters, and room capacities.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Class</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by class name, level code, teacher, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold shrink-0">
          Total: <strong className="text-slate-900">{filteredClasses.length}</strong> classes
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((c) => {
          const classPupils = getPupilsInClass(c.classLevel);
          const classCourses = getCoursesForClass(c.classLevel);
          const occupancy = Math.round((classPupils.length / (c.maxCapacity || 35)) * 100);

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Class Level & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 font-black flex items-center justify-center text-sm border border-blue-100">
                      {c.classLevel}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <DoorOpen className="w-3 h-3 text-slate-400" />
                        {c.room || 'Main Block'}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        title="Edit Class"
                        className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        title="Delete Class"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Class Master */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Master</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
                      {c.teacher.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{c.teacher}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Enrolled Pupils</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {classPupils.length} / {c.maxCapacity || 35} ({occupancy}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancy >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(occupancy, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Info Badges */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <strong>{classCourses.length}</strong> Courses
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{classPupils.length}</strong> Students
                  </span>
                </div>
              </div>

              {/* Bottom Action: View Class Details */}
              <button
                type="button"
                onClick={() => setSelectedClass(c)}
                className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View Class Roster & Info</span>
              </button>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No classes found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Try adjusting your search keywords.' : 'Add your first class to get started.'}
          </p>
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                {modalMode === 'create' ? 'New Classroom' : 'Modify Record'}
              </span>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                {modalMode === 'create' ? 'Add New Class' : 'Edit Class Details'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Class Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basic 7 (B7 JHS)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Level Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="B7"
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl uppercase font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Capacity:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Class Master:</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900 text-slate-900"
                >
                  <option value="">Unassigned Faculty</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.staffId || 'Faculty'}) {t.isClassTeacherOf ? `· Master of ${t.isClassTeacherOf}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Room / Campus Location:</label>
                <input
                  type="text"
                  placeholder="e.g. Room 102 - Block B"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {modalMode === 'create' ? 'Create Class' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASS DETAILS DRAWER / MODAL */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedClass(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white font-black flex items-center justify-center text-xl shadow-md">
                {selectedClass.classLevel}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">Official Class Register</span>
                <h2 className="text-2xl font-bold font-heading text-slate-900">{selectedClass.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Room: <strong>{selectedClass.room || 'Main Wing'}</strong></span>
                  <span>·</span>
                  <span>Class Master: <strong>{selectedClass.teacher}</strong></span>
                  <span>·</span>
                  <span>Capacity: <strong>{selectedClass.maxCapacity} seats</strong></span>
                </div>
              </div>
            </div>

            {/* Enrolled Students Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-900" />
                  <span>Enrolled Students ({getPupilsInClass(selectedClass.classLevel).length})</span>
                </h4>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {getPupilsInClass(selectedClass.classLevel).map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400">ID: {p.studentId || p.id} · {p.email}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Enrolled
                    </span>
                  </div>
                ))}

                {getPupilsInClass(selectedClass.classLevel).length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No pupils currently enrolled in {selectedClass.name}.
                  </div>
                )}
              </div>
            </div>

            {/* Associated Courses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-900" />
                <span>Active Curriculum Courses ({getCoursesForClass(selectedClass.classLevel).length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getCoursesForClass(selectedClass.classLevel).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveCourseId(c.id);
                      setSelectedClass(null);
                      setActiveNav('courses');
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900">{c.title}</p>
                    <p className="text-[10px] text-slate-500">Instructor: {c.teacherName}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = selectedClass;
                    setSelectedClass(null);
                    openEditModal(toEdit);
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Edit Class
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
