import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  Send,
  AlertCircle,
  Edit3,
  Trash2,
  Save,
  X,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AssignmentSubmissionModal: React.FC = () => {
  const {
    assignments,
    submissions,
    currentUser,
    submitAssignment,
    updateSubmission,
    deleteSubmission,
  } = useApp();

  // Enforce class isolation: students only see assignments for their enrolled class level
  const availableAssignments = assignments.filter((a) => {
    if (currentUser?.role === 'student') {
      return a.classLevel === currentUser.classLevel || a.classLevel === 'All Classes';
    }
    return true;
  });

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    availableAssignments[0]?.id || ''
  );
  const [typedContent, setTypedContent] = useState<string>('');
  const [mockFileName, setMockFileName] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [editAttachment, setEditAttachment] = useState<string>('');

  if (!currentUser) return null;

  const activeAssignment =
    availableAssignments.find((a) => a.id === selectedAssignmentId) || availableAssignments[0];

  // Check if current user has already submitted
  const userSubmission = submissions.find(
    (s) => s.assignmentId === activeAssignment?.id && s.studentId === currentUser.id
  );

  const handleStartEdit = () => {
    if (!userSubmission) return;
    setEditContent(userSubmission.content);
    setEditAttachment(userSubmission.attachmentName || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSubmission) return;
    updateSubmission(userSubmission.id, editContent, editAttachment || undefined);
    setIsEditing(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleDeleteSubmission = () => {
    if (!userSubmission) return;
    if (window.confirm('Withdraw this submission? You can recompose your response and resubmit.')) {
      deleteSubmission(userSubmission.id);
      setIsEditing(false);
      setIsSuccess(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedContent.trim() && !mockFileName) return;

    submitAssignment(activeAssignment.id, typedContent, mockFileName || undefined);
    setIsSuccess(true);
    confetti({ particleCount: 70, spread: 70 });
  };

  const handleSimulateFileUpload = (fileName: string) => {
    setMockFileName(fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="text-purple-700 font-bold uppercase">Assignments Portal</span>
            <span>·</span>
            <span>{currentUser.classLevel} Level</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            Pupil Homework &amp; Coursework Submissions
          </h1>
          <p className="text-xs text-slate-500">
            Submit typed essays, upload lab photos or scanned PDF documents directly to your class teacher.
          </p>
        </div>

        {/* Assignment Picker */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {availableAssignments.map((ass) => (
            <button
              key={ass.id}
              onClick={() => {
                setSelectedAssignmentId(ass.id);
                setIsSuccess(false);
                setTypedContent('');
                setMockFileName('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeAssignment?.id === ass.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {ass.subject}: {ass.title.split(':')[1] || ass.title}
            </button>
          ))}
        </div>
      </div>

      {activeAssignment ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assignment Description & Instructions (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  {activeAssignment.subject} • {activeAssignment.classLevel}
                </span>
                <h3 className="text-lg font-bold font-heading text-slate-900 mt-0.5">
                  {activeAssignment.title}
                </h3>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5 text-xs text-purple-950">
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <strong className="text-purple-900">{activeAssignment.dueDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Marks Available:</span>
                  <strong className="text-purple-900">{activeAssignment.totalMarks} Marks</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Teacher:</span>
                  <strong>{activeAssignment.teacherName}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Assignment Questions / Prompt:
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                  {activeAssignment.prompt}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                ℹ️ {activeAssignment.instructions}
              </p>
            </div>
          </div>

          {/* Submission Workspace (Right) */}
          <div className="lg:col-span-7 space-y-4">
            {userSubmission ? (
              /* Already submitted card */
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Assignment Submitted</h4>
                      <p className="text-[11px] text-slate-500">{userSubmission.submittedAt}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      userSubmission.status === 'graded'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {userSubmission.status === 'graded'
                      ? `Graded: ${userSubmission.marksAwarded}/${userSubmission.maxMarks} Marks`
                      : 'Pending Teacher Grading'}
                  </span>
                </div>

                {/* Teacher Feedback Banner */}
                {userSubmission.teacherFeedback && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Teacher Feedback from {activeAssignment.teacherName}:
                    </p>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                      "{userSubmission.teacherFeedback}"
                    </p>
                  </div>
                )}

                {/* Pupil's Submitted Content */}
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-blue-900" /> Edit Your Submission
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Edit Your Response:
                      </label>
                      <textarea
                        rows={6}
                        required
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-900 focus:bg-white"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700">Your Submitted Response:</span>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                        {userSubmission.content}
                      </div>
                    </div>

                    {userSubmission.attachmentName && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-800">
                            {userSubmission.attachmentName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({userSubmission.attachmentSize || '380 KB'})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700">Attached</span>
                      </div>
                    )}

                    {userSubmission.status !== 'graded' ? (
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-500">
                          Pending review. You can edit your response or withdraw it anytime before grading.
                        </p>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={handleStartEdit}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Response
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteSubmission}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Withdraw / Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        Graded by {activeAssignment.teacherName}. Submissions are finalized.
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* New Submission Form */
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Compose &amp; Submit Your Response
                </h4>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Type Your Answer:
                    </label>
                    <textarea
                      rows={6}
                      required={!mockFileName}
                      value={typedContent}
                      onChange={(e) => setTypedContent(e.target.value)}
                      placeholder="Type your complete answer here, answering parts 1, 2, 3, and 4..."
                      className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-900 focus:bg-white"
                    ></textarea>
                  </div>

                  {/* File Upload Simulator (PDF / Doc / Photo) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Or Upload Document / Photograph:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleSimulateFileUpload(`${currentUser.name.replace(' ', '_')}_Assignment.pdf`)
                        }
                        className={`p-3 border rounded-xl text-left text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                          mockFileName.endsWith('.pdf')
                            ? 'bg-blue-50 border-blue-900 text-blue-950 font-bold'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-rose-600" />
                        <span>Upload PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSimulateFileUpload(`${currentUser.name.replace(' ', '_')}_Photo_Note.jpg`)
                        }
                        className={`p-3 border rounded-xl text-left text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                          mockFileName.endsWith('.jpg')
                            ? 'bg-blue-50 border-blue-900 text-blue-950 font-bold'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Upload Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSimulateFileUpload(`${currentUser.name.replace(' ', '_')}_Homework.docx`)
                        }
                        className={`p-3 border rounded-xl text-left text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                          mockFileName.endsWith('.docx')
                            ? 'bg-blue-50 border-blue-900 text-blue-950 font-bold'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload Word Doc</span>
                      </button>
                    </div>

                    {mockFileName && (
                      <div className="mt-2 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Paperclip className="w-3.5 h-3.5" /> {mockFileName} (380 KB ready)
                        </span>
                        <button
                          type="button"
                          onClick={() => setMockFileName('')}
                          className="text-rose-600 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Submit Assignment to {activeAssignment.teacherName}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Assignments Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your teachers will publish homework prompts, project briefs, and terminal coursework here.
          </p>
        </div>
      )}
    </div>
  );
};
