import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SchoolConfig, BreakTimeConfig } from '../../types';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  Award,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Eye,
  GraduationCap,
  Sliders,
  ExternalLink,
  Layers,
  BookOpen,
  Video,
  Shapes,
  Library,
  Users,
  UserPlus,
  AlertTriangle,
  KeyRound,
  Globe,
  Lock,
} from 'lucide-react';

const PRESET_CRESTS = [
  {
    name: 'Salem Montessori Official Crest (Gold & Navy)',
    url: '/school-crest.jpg',
  },
  {
    name: 'Academic Shield (Classic)',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern Campus Crest',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Montessori Tree & Sprout',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Gold Torch of Knowledge',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=160&auto=format&fit=crop&q=80',
  },
];

const CURRICULUM_OPTIONS = [
  'Ghana Standards-Based & AMI Montessori Curriculum',
  'Ghana Education Service (GES) NaCCA Standard',
  'British National Curriculum (Cambridge Primary & Checkpoint)',
  'International Baccalaureate (IB Primary Years Programme)',
  'American Common Core & Montessori Integrated Standard',
];

export const ConfigureSchool: React.FC = () => {
  const { schoolConfig, updateSchoolConfig, resetSchoolConfig, addToast } = useApp();

  const [formData, setFormData] = useState<SchoolConfig>(schoolConfig);
  const [activeSection, setActiveSection] = useState<
    'identity' | 'academic' | 'bell_schedule' | 'grading' | 'contact' | 'leadership' | 'modules' | 'preview'
  >('identity');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync formData if schoolConfig changes from outside
  useEffect(() => {
    setFormData(schoolConfig);
    setHasUnsavedChanges(false);
  }, [schoolConfig]);

  const handleChange = <K extends keyof SchoolConfig>(key: K, value: SchoolConfig[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleFeatureToggle = (featureKey: keyof SchoolConfig['features']) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey],
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    updateSchoolConfig(formData);
    setHasUnsavedChanges(false);
    try {
      confetti({ particleCount: 35, spread: 60 });
    } catch {}
  };

  const handleReset = () => {
    resetSchoolConfig();
    setShowResetConfirm(false);
    setHasUnsavedChanges(false);
  };

  const addBreakTime = () => {
    const newBreak: BreakTimeConfig = {
      label: 'Afternoon Break',
      time: '02:00 PM - 02:15 PM',
    };
    setFormData((prev) => ({
      ...prev,
      breakTimes: [...prev.breakTimes, newBreak],
    }));
    setHasUnsavedChanges(true);
  };

  const removeBreakTime = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      breakTimes: prev.breakTimes.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const updateBreakTime = (index: number, key: 'label' | 'time', val: string) => {
    setFormData((prev) => ({
      ...prev,
      breakTimes: prev.breakTimes.map((item, i) => (i === index ? { ...item, [key]: val } : item)),
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shrink-0 shadow-inner">
              <img
                src={formData.logoUrl}
                alt={formData.name}
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xs">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{formData.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-950">
                  {formData.academicYear} • {formData.currentTerm}
                </span>
                {hasUnsavedChanges && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white animate-pulse">
                    Unsaved Changes
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-blue-200/90 mt-1 italic">
                &ldquo;{formData.motto}&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-blue-300/80 mt-2">
                <span>Code: {formData.accreditationNumber}</span>
                <span>•</span>
                <span>{formData.city}, {formData.country}</span>
                <span>•</span>
                <span>Head: {formData.headOfSchool}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Reset School Configuration?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will restore all institution parameters, bell schedules, grading scales, and branding back to the official Salem Montessori default baseline.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSection('identity')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'identity'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Identity & Crest</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('academic')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'academic'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Academic Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('bell_schedule')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'bell_schedule'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Bell Schedule & Periods</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('grading')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'grading'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Grading & Weighting</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('contact')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'contact'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>Contact & Campus</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('leadership')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'leadership'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Leadership & Authority</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('modules')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'modules'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Portal Modules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('preview')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSection === 'preview'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        {/* SECTION 1: IDENTITY & CREST */}
        {activeSection === 'identity' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-900" />
                <span>School Brand & Visual Identity</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure official institution name, abbreviation, crest logo, and accreditation license number.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Official School Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Salem Montessori School"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Portal Header Brand / Short Name *
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => handleChange('shortName', e.target.value)}
                  placeholder="e.g. Salem VClass"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  School Slogan / Motto *
                </label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => handleChange('motto', e.target.value)}
                  placeholder="e.g. Inspiring Excellence, Nurturing Curiosity & Practical Mastery"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Accreditation / Registration License *
                </label>
                <input
                  type="text"
                  value={formData.accreditationNumber}
                  onChange={(e) => handleChange('accreditationNumber', e.target.value)}
                  placeholder="e.g. GES / NaCCA / AMI-GH-2024-082"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  placeholder="https://salemmontessori.edu.gh"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-medium"
                />
              </div>
            </div>

            {/* Crest Logo Selection */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Official School Crest / Logo
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-slate-200 p-1.5 bg-slate-50 shrink-0">
                  <img
                    src={formData.logoUrl}
                    alt="Crest Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="Enter custom image URL (https://...)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    Use high-resolution square ratio icon/image or select from verified school templates below.
                  </p>
                </div>
              </div>

              {/* Preset Crests */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_CRESTS.map((preset, idx) => {
                  const isSelected = formData.logoUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange('logoUrl', preset.url)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{preset.name}</p>
                        <p className="text-[10px] text-slate-400">Template</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ACADEMIC CALENDAR */}
        {activeSection === 'academic' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Academic Calendar & Curriculum Terms</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set active academic year, active term, session start and completion dates, and curriculum model.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Session Year *
                </label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value="2024/2025">2024/2025 Session</option>
                  <option value="2025/2026">2025/2026 Session</option>
                  <option value="2026/2027">2026/2027 Session (Current Active)</option>
                  <option value="2027/2028">2027/2028 Session</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Active Term *
                </label>
                <select
                  value={formData.currentTerm}
                  onChange={(e) => handleChange('currentTerm', e.target.value as SchoolConfig['currentTerm'])}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value="Term 1">Term 1 (First Term)</option>
                  <option value="Term 2">Term 2 (Second Term)</option>
                  <option value="Term 3">Term 3 (Third Term)</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Next Term Resumption Date
                </label>
                <input
                  type="date"
                  value={formData.nextResumptionDate}
                  onChange={(e) => handleChange('nextResumptionDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Term Start Date
                </label>
                <input
                  type="date"
                  value={formData.termStartDate}
                  onChange={(e) => handleChange('termStartDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Term End Date
                </label>
                <input
                  type="date"
                  value={formData.termEndDate}
                  onChange={(e) => handleChange('termEndDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Curriculum Framework & Accreditation Model *
                </label>
                <select
                  value={formData.curriculumFramework}
                  onChange={(e) => handleChange('curriculumFramework', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                >
                  {CURRICULUM_OPTIONS.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: BELL SCHEDULE */}
        {activeSection === 'bell_schedule' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Daily Bell Schedule & Timetable Periods</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure standard instructional periods duration, start times, and daily break recesses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  School Day Start Time *
                </label>
                <select
                  value={formData.dayStartTime}
                  onChange={(e) => handleChange('dayStartTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value="07:30 AM">07:30 AM (Early Assembly)</option>
                  <option value="08:00 AM">08:00 AM (Standard)</option>
                  <option value="08:30 AM">08:30 AM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Period Duration (Minutes) *
                </label>
                <select
                  value={formData.periodDurationMinutes}
                  onChange={(e) => handleChange('periodDurationMinutes', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value={35}>35 minutes (Nursery/Kindergarten)</option>
                  <option value={40}>40 minutes</option>
                  <option value={45}>45 minutes (Standard GES Primary/JHS)</option>
                  <option value={50}>50 minutes</option>
                  <option value={60}>60 minutes (Block Teaching)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Periods Per Day *
                </label>
                <select
                  value={formData.totalPeriodsPerDay}
                  onChange={(e) => handleChange('totalPeriodsPerDay', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value={6}>6 Periods / Day</option>
                  <option value={7}>7 Periods / Day</option>
                  <option value={8}>8 Periods / Day (Standard)</option>
                  <option value={9}>9 Periods / Day</option>
                  <option value={10}>10 Periods / Day (Extended Day)</option>
                </select>
              </div>
            </div>

            {/* Recesses & Breaks */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Configured Breaks & Recesses
                </h3>
                <button
                  type="button"
                  onClick={addBreakTime}
                  className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Add Break Interval</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.breakTimes.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                  >
                    <input
                      type="text"
                      value={b.label}
                      onChange={(e) => updateBreakTime(idx, 'label', e.target.value)}
                      placeholder="Break Label (e.g. Snack Break)"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                    />
                    <input
                      type="text"
                      value={b.time}
                      onChange={(e) => updateBreakTime(idx, 'time', e.target.value)}
                      placeholder="Time Range (e.g. 09:30 AM - 10:00 AM)"
                      className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => removeBreakTime(idx)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: GRADING */}
        {activeSection === 'grading' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Grading Standards & Assessment Weighting</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define benchmark passing scores and weighting splits between continuous assessments and exams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Minimum Pass Mark (%) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={40}
                    max={70}
                    step={5}
                    value={formData.passMarkPercentage}
                    onChange={(e) => handleChange('passMarkPercentage', Number(e.target.value))}
                    className="flex-1 accent-blue-900"
                  />
                  <span className="w-12 text-center py-1 bg-blue-50 text-blue-900 font-bold rounded-lg text-xs">
                    {formData.passMarkPercentage}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Continuous Assessment Weight (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={20}
                    max={60}
                    step={10}
                    value={formData.continuousAssessmentWeight}
                    onChange={(e) => {
                      const ca = Number(e.target.value);
                      handleChange('continuousAssessmentWeight', ca);
                      handleChange('examAssessmentWeight', 100 - ca);
                    }}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="w-12 text-center py-1 bg-emerald-50 text-emerald-900 font-bold rounded-lg text-xs">
                    {formData.continuousAssessmentWeight}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  End of Term Exam Weight (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={40}
                    max={80}
                    step={10}
                    value={formData.examAssessmentWeight}
                    onChange={(e) => {
                      const exam = Number(e.target.value);
                      handleChange('examAssessmentWeight', exam);
                      handleChange('continuousAssessmentWeight', 100 - exam);
                    }}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="w-12 text-center py-1 bg-indigo-50 text-indigo-900 font-bold rounded-lg text-xs">
                    {formData.examAssessmentWeight}%
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Grade Scale Reference Table */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Institution Grading Boundaries Reference
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-lg font-black text-emerald-800">Grade A</p>
                  <p className="text-xs font-bold text-emerald-600">80% – 100%</p>
                  <p className="text-[10px] text-emerald-700 mt-1">Excellent / Mastery</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                  <p className="text-lg font-black text-blue-800">Grade B</p>
                  <p className="text-xs font-bold text-blue-600">70% – 79%</p>
                  <p className="text-[10px] text-blue-700 mt-1">Very Good</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                  <p className="text-lg font-black text-indigo-800">Grade C</p>
                  <p className="text-xs font-bold text-indigo-600">60% – 69%</p>
                  <p className="text-[10px] text-indigo-700 mt-1">Good Credit</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                  <p className="text-lg font-black text-amber-800">Grade D</p>
                  <p className="text-xs font-bold text-amber-600">50% – 59%</p>
                  <p className="text-[10px] text-amber-700 mt-1">Pass Benchmark</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                  <p className="text-lg font-black text-rose-800">Grade F</p>
                  <p className="text-xs font-bold text-rose-600">&lt; 50%</p>
                  <p className="text-[10px] text-rose-700 mt-1">Remedial Required</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: CONTACT & CAMPUS */}
        {activeSection === 'contact' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <span>Contact Channels & Physical Campus Location</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official contact phone numbers, inquiries email, and GPS digital addresses displayed on report cards and portals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  General Inquiries Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@salemmontessori.edu.gh"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Main Administrative Telephone *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+233 24 456 7890"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admissions Hotline / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.admissionsHotline}
                  onChange={(e) => handleChange('admissionsHotline', e.target.value)}
                  placeholder="+233 20 890 1234"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  GhanaPost GPS Digital Address *
                </label>
                <input
                  type="text"
                  value={formData.gpsAddress}
                  onChange={(e) => handleChange('gpsAddress', e.target.value)}
                  placeholder="GA-183-4920"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono uppercase font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Physical Campus Location Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="No. 14 Ridge Road, Airport Residential Area"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City / Metropolitan Area *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Accra"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="Ghana"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: LEADERSHIP */}
        {activeSection === 'leadership' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-900" />
                <span>Institutional Leadership & Official Signatories</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Principal and academic head details stamped on student term reports, transcripts, and official bulletins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Head of School / Principal Name *
                </label>
                <input
                  type="text"
                  value={formData.headOfSchool}
                  onChange={(e) => handleChange('headOfSchool', e.target.value)}
                  placeholder="Mrs. Grace Mensah, M.Ed"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Principal Official Title / Office *
                </label>
                <input
                  type="text"
                  value={formData.headTitle}
                  onChange={(e) => handleChange('headTitle', e.target.value)}
                  placeholder="Head of School & Principal"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Dean / Vice Principal Name
                </label>
                <input
                  type="text"
                  value={formData.academicDean}
                  onChange={(e) => handleChange('academicDean', e.target.value)}
                  placeholder="Mr. Emmanuel Osei-Kofi"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: MODULES */}
        {activeSection === 'modules' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>Feature Modules & Policy Enforcements</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enable or temporarily disable specialized platform subsystems and enrollment portals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* VClass Live */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Virtual Classroom (VClass)</p>
                    <p className="text-[11px] text-slate-500">Live video studio & code sandbox</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('vclassEnabled')}
                  className="cursor-pointer"
                >
                  {formData.features.vclassEnabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-900" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Montessori Lab */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                    <Shapes className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Montessori Sensory Lab</p>
                    <p className="text-[11px] text-slate-500">Sensory math & tactile apparatus</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('montessoriLabEnabled')}
                  className="cursor-pointer"
                >
                  {formData.features.montessoriLabEnabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-900" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Digital Library */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                    <Library className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Digital Resource Library</p>
                    <p className="text-[11px] text-slate-500">E-books, lecture slides & past papers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('digitalLibraryEnabled')}
                  className="cursor-pointer"
                >
                  {formData.features.digitalLibraryEnabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-900" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Gamification */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Gamification & Badges</p>
                    <p className="text-[11px] text-slate-500">Learner streaks, badges & points</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('gamificationEnabled')}
                  className="cursor-pointer"
                >
                  {formData.features.gamificationEnabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-900" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Parent Portal */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Parent Portal Access</p>
                    <p className="text-[11px] text-slate-500">Ward performance tracking & notices</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('parentPortalEnabled')}
                  className="cursor-pointer"
                >
                  {formData.features.parentPortalEnabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-900" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Admissions Status */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Admissions Portal Status</p>
                    <p className="text-[11px] text-slate-500">
                      {formData.features.admissionsOpen ? 'Admissions currently OPEN' : 'Admissions CLOSED'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('admissionsOpen')}
                  className="cursor-pointer"
                >
                  {formData.features.admissionsOpen ? (
                    <ToggleRight className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Student & Parent Self-Signup Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${formData.features.signupEnabled !== false ? 'bg-blue-100 text-[#087CF0]' : 'bg-slate-200 text-slate-500'}`}>
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Student &amp; Parent Self-Registration</p>
                    <p className="text-[11px] text-slate-500">
                      {formData.features.signupEnabled !== false
                        ? 'Public signup is currently ACTIVE on login page'
                        : 'Public signup is DISABLED (only admin can register accounts)'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('signupEnabled')}
                  className="cursor-pointer"
                >
                  {formData.features.signupEnabled !== false ? (
                    <ToggleRight className="w-8 h-8 text-[#087CF0]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Google Workspace SSO Configuration Card */}
              <div className="md:col-span-2 p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${formData.features.googleSsoEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">Google Workspace Single Sign-On (SSO)</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          formData.features.googleSsoEnabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {formData.features.googleSsoEnabled ? 'Configured & Enabled' : 'Disabled (No Auto-Login)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Controls whether users can authenticate with Google. When disabled, "Continue with Google" will not automatically log in.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFeatureToggle('googleSsoEnabled')}
                    className="cursor-pointer shrink-0"
                  >
                    {formData.features.googleSsoEnabled ? (
                      <ToggleRight className="w-9 h-9 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Authorized Workspace Domain</span>
                    </label>
                    <input
                      type="text"
                      value={formData.features.googleWorkspaceDomain || ''}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            googleWorkspaceDomain: e.target.value,
                          },
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="e.g. salemmontessori.edu.gh"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Learners and staff must possess an official account ending with this institutional domain.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Google OAuth Client ID (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.features.googleClientId || ''}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            googleClientId: e.target.value,
                          },
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="e.g. 680550430811-apps.googleusercontent.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900 font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Provided from Google Cloud Console for secure Google Identity Services verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 8: LIVE PREVIEW */}
        {activeSection === 'preview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-600" />
                <span>Real-Time Institutional Live Preview</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Preview how your institution configuration renders across student term report cards, letterheads, and top navigation bars.
              </p>
            </div>

            {/* Preview 1: Official Term Report Header */}
            <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-slate-50/50 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                Official Student Report Card Header
              </span>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <img
                    src={formData.logoUrl}
                    alt={formData.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                      {formData.name}
                    </h3>
                    <p className="text-xs text-slate-500 italic">&ldquo;{formData.motto}&rdquo;</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formData.address}, {formData.city} • GPS: {formData.gpsAddress} • Tel: {formData.phone}
                    </p>
                  </div>
                </div>
                <div className="text-center sm:text-right shrink-0 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-900">{formData.academicYear} Academic Year</p>
                  <p className="text-xs font-semibold text-blue-700">{formData.currentTerm}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Lic: {formData.accreditationNumber}</p>
                </div>
              </div>
            </div>

            {/* Preview 2: Portal Navigation Bar Preview */}
            <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-slate-50/50 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                Portal Top Navigation Header
              </span>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{formData.shortName}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">{formData.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-100">
                    {formData.currentTerm} Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className="bg-slate-100/90 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          {hasUnsavedChanges ? (
            <span className="font-semibold text-rose-600">You have unsaved changes in school configuration.</span>
          ) : (
            <span className="text-slate-500">All parameters synchronized with local cache and cloud database.</span>
          )}
        </p>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save School Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
