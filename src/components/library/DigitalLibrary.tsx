import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Library,
  Video,
  FileText,
  Presentation,
  Book,
  Download,
  Search,
  Filter,
  Eye,
  Sparkles,
  Play,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  BookMarked,
  StickyNote,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DigitalResource, StudentNote } from '../../types';

export const DigitalLibrary: React.FC = () => {
  const {
    currentUser,
    courses,
    digitalResources,
    addDigitalResource,
    deleteDigitalResource,
    notes,
    addNote,
    updateNote,
    deleteNote,
    setActiveNav,
    setActiveLessonId,
    setActiveCourseId,
  } = useApp();

  const [mainTab, setMainTab] = useState<'repository' | 'personal_notes'>('repository');
  const [activeLibraryTab, setActiveLibraryTab] = useState<
    'all' | 'video' | 'note' | 'ppt' | 'textbook' | 'worksheet' | 'past_question'
  >('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Upload modal state (for teachers & admins)
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [resTitle, setResTitle] = useState<string>('');
  const [resType, setResType] = useState<DigitalResource['type']>('note');
  const [resSubject, setResSubject] = useState<string>('Computing');
  const [resClass, setResClass] = useState<string>('B7');
  const [resFileType, setResFileType] = useState<string>('PDF');
  const [resFileSize, setResFileSize] = useState<string>('2.5 MB');
  const [resDescription, setResDescription] = useState<string>('');

  // Personal Notes states
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteSubject, setNoteSubject] = useState<string>('Computing');
  const [noteContent, setNoteContent] = useState<string>('');
  const [editingNote, setEditingNote] = useState<StudentNote | null>(null);

  const canManageResources = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const handleDownloadResource = (resTitle: string) => {
    setDownloadNotice(`Downloading "${resTitle}" to your device...`);
    confetti({ particleCount: 30 });
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    addDigitalResource({
      title: resTitle.trim(),
      type: resType,
      subject: resSubject,
      classLevel: resClass,
      fileType: resFileType,
      fileSize: resFileSize,
      uploadedBy: currentUser?.name || 'Faculty Member',
      description: resDescription.trim() || 'Official educational learning material.',
    });

    confetti({ particleCount: 50, spread: 60 });
    setShowUploadModal(false);
    setResTitle('');
    setResDescription('');
  };

  const handleDeleteResource = (id: string, title: string) => {
    if (window.confirm(`Delete resource "${title}" from the digital library?`)) {
      deleteDigitalResource(id);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, noteTitle.trim(), noteContent.trim(), noteSubject);
      setEditingNote(null);
    } else {
      addNote(noteTitle.trim(), noteContent.trim(), noteSubject);
    }

    confetti({ particleCount: 40 });
    setNoteTitle('');
    setNoteContent('');
  };

  const openEditNote = (note: StudentNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteSubject(note.subject);
    setNoteContent(note.content);
  };

  const handleDeleteNote = (id: string, title: string) => {
    if (window.confirm(`Delete note "${title}"?`)) {
      deleteNote(id);
    }
  };

  const filteredResources = digitalResources.filter((r) => {
    const matchesTab = activeLibraryTab === 'all' || r.type === activeLibraryTab;
    const matchesSubject = subjectFilter === 'all' || r.subject === subjectFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSubject && matchesSearch;
  });

  const myNotes = notes.filter((n) =>
    currentUser?.role === 'student' ? n.studentId === currentUser?.id || n.studentId === 'guest' : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="text-blue-900 font-bold uppercase">Learning Resources Repository</span>
            <span>·</span>
            <span>Salem Montessori Digital Library</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            Digital Resource Center &amp; Video Vault
          </h1>
          <p className="text-xs text-slate-500">
            Access past exam papers, textbook chapters, slide decks, masterclasses, and manage your private study notes.
          </p>
        </div>

        {/* Action Button & Alert */}
        <div className="flex items-center gap-3">
          {downloadNotice && (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold animate-fade-in">
              ✓ {downloadNotice}
            </div>
          )}
          {canManageResources && mainTab === 'repository' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Resource
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Toggle: Repository vs Personal Study Notes */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setMainTab('repository')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            mainTab === 'repository'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Library className="w-4 h-4" /> Curriculum Vault ({digitalResources.length})
        </button>
        <button
          onClick={() => setMainTab('personal_notes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            mainTab === 'personal_notes'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <StickyNote className="w-4 h-4" /> My Study Notes ({myNotes.length})
        </button>
      </div>

      {mainTab === 'repository' ? (
        <>
          {/* Filter Tabs by Resource Type */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
            {[
              { id: 'all', label: 'All Resources' },
              { id: 'video', label: '🎥 Video Library' },
              { id: 'note', label: '📄 Lesson Notes' },
              { id: 'ppt', label: '📊 Presentations' },
              { id: 'textbook', label: '📕 Textbooks' },
              { id: 'worksheet', label: '📑 Worksheets' },
              { id: 'past_question', label: '📝 Past Questions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLibraryTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeLibraryTab === tab.id
                    ? 'bg-white text-blue-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Subject filter bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes, textbooks, slides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-900 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <span className="text-slate-500 font-semibold">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="all">All Subjects</option>
                <option value="Computing">Computing</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Integrated Science</option>
              </select>
            </div>
          </div>

          {/* Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-900 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-900">{res.subject}</span>
                    <div className="flex items-center gap-2">
                      <span>{res.classLevel}</span>
                      {canManageResources && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          title="Delete Resource"
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{res.fileType}</span>
                    <span>{res.fileSize}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {res.type === 'video' ? (
                      <button
                        onClick={() => {
                          const matchedCourse = courses.find(
                            (c) =>
                              (c.subject.toLowerCase() === res.subject.toLowerCase() ||
                                c.classLevel === res.classLevel) &&
                              c.strands?.length > 0
                          ) || courses[0];

                          if (matchedCourse) {
                            setActiveCourseId(matchedCourse.id);
                            const firstLesson =
                              matchedCourse.strands?.[0]?.weeks?.[0]?.lessons?.[0];
                            if (firstLesson) setActiveLessonId(firstLesson.id);
                            setActiveNav('courses');
                          } else {
                            handleDownloadResource(res.title);
                          }
                        }}
                        className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Watch Lecture
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownloadResource(res.title)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-900" /> Download Resource
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* PERSONAL STUDY NOTES VIEW (Full CRUD) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Note Composer / Editor Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-amber-500" />
                {editingNote ? 'Edit Study Note' : 'Create Personal Study Note'}
              </h3>
              {editingNote && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(null);
                    setNoteTitle('');
                    setNoteContent('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Hierarchy Summary"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Computing">Computing</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Integrated Science</option>
                  <option value="English">English Language</option>
                  <option value="Social Studies">Social Studies</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note Details &amp; Key Takeaways:</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your study notes, revision bullet points, and questions here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {editingNote ? 'Save Changes' : 'Save Study Note'}
              </button>
            </form>
          </div>

          {/* List of Notes */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Saved Study Notes ({myNotes.length})
            </h3>
            {myNotes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                You have not created any personal study notes yet. Use the form on the left to write one!
              </div>
            ) : (
              <div className="space-y-3">
                {myNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-bold text-[10px]">
                          {n.subject}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditNote(n)}
                          title="Edit Note"
                          className="p-1.5 text-slate-400 hover:text-blue-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(n.id, n.title)}
                          title="Delete Note"
                          className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD RESOURCE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Upload New Educational Resource
            </h3>
            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computing Term 1 Revision Masterclass"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Type:</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="note">Lesson Note</option>
                    <option value="video">Video Masterclass</option>
                    <option value="ppt">PowerPoint Slide</option>
                    <option value="textbook">Textbook Chapter</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="past_question">Past Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
                  <select
                    value={resSubject}
                    onChange={(e) => setResSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Computing">Computing</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Integrated Science</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level:</label>
                  <select
                    value={resClass}
                    onChange={(e) => setResClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="B7">Basic 7 (B7)</option>
                    <option value="B4">Basic 4 (B4)</option>
                    <option value="B8">Basic 8 (B8)</option>
                    <option value="All">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">File Format:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PDF / MP4 / PPTX"
                    value={resFileType}
                    onChange={(e) => setResFileType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary Description:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the topics and learning objectives covered in this document..."
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Publish to Learning Vault
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
