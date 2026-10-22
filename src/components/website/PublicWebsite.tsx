import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  ShieldCheck,
  Video,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Layers,
  Cpu,
  Microscope,
  Palette,
  Globe2,
  Clock,
  ArrowRight,
  Send,
  Building,
  School,
  Play
} from 'lucide-react';

export const PublicWebsite: React.FC = () => {
  const {
    schoolConfig,
    currentUser,
    setIsPublicWebsite,
    setActiveNav,
    openLoginModal,
    startTour,
    loginWithCredentials,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'montessori' | 'facilities' | 'admissions'>('overview');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryClass, setInquiryClass] = useState('Basic 7');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Quick 1-click demo login helper
  const handleQuickDemoLogin = (roleIdentifier: string, label: string) => {
    const res = loginWithCredentials(roleIdentifier, '48468099');
    if (res.success) {
      addToast('Welcome Back!', `Signed in as ${label}`, 'success');
    } else {
      openLoginModal();
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) {
      addToast('Required Fields', 'Please provide your full name and email address.', 'alert');
      return;
    }
    setInquirySubmitted(true);
    addToast(
      'Inquiry Received',
      `Thank you, ${inquiryName}. Our Admissions Director will reach out at ${inquiryEmail} within 24 hours.`,
      'success'
    );
    setInquiryName('');
    setInquiryEmail('');
    setInquiryPhone('');
    setInquiryMessage('');
  };

  const schoolName = schoolConfig?.name || 'Salem Montessori School';
  const schoolShortName = schoolConfig?.shortName || 'Salem VClass';
  const motto = schoolConfig?.motto || 'Inspiring Excellence, Nurturing Curiosity & Practical Mastery';
  const logoUrl = schoolConfig?.logoUrl || '/school-crest.jpg';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* ─── RETURN TO DASHBOARD BANNER (IF LOGGED IN) ─── */}
      {currentUser && (
        <div className="bg-blue-900 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b border-blue-800 shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsPublicWebsite(false);
                setActiveNav('dashboard');
              }}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Back to Portal Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── HERO ARENA ─── */}
      <section
        data-tour="public-hero"
        className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white pt-12 pb-20 md:pt-20 md:pb-28"
      >
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Core Value */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Institutional Crest Pill */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/60 backdrop-blur-md">
                <img
                  src={logoUrl}
                  alt="Salem Montessori Crest"
                  className="w-5 h-5 rounded-full object-cover border border-amber-400/80"
                />
                <span className="text-xs font-semibold text-blue-200 tracking-wide">
                  Accra, Ghana · Basic 1 to JHS 3 · GES & Montessori Blended
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Inspiring Excellence, Nurturing Curiosity &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                  Practical Mastery
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                {schoolName} combines the hands-on sensory exploration of Maria Montessori with the academic rigor of the
                Ghana Education Service (GES) and synchronized live virtual classrooms for world-class learning continuity.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  data-tour="public-portal-btn"
                  onClick={() => {
                    if (currentUser) {
                      setIsPublicWebsite(false);
                      setActiveNav('dashboard');
                    } else {
                      openLoginModal();
                    }
                  }}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Video className="w-4 h-4 text-amber-300" />
                  <span>Enter VClass &amp; Learning Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  data-tour="public-tour-btn"
                  onClick={() => startTour('guest', 0)}
                  className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Take Guided Campus Tour</span>
                </button>
              </div>

              {/* 1-Click Interactive Demo Role Switcher */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant 1-Click Portal Demo Accounts:</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('daniel', 'Daniel Mensah (Student)')}
                    className="p-2.5 bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-blue-300">Daniel Mensah</div>
                    <div className="text-[10px] text-slate-400">Basic 7 Pupil</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('eric', 'Eric Darko (Teacher)')}
                    className="p-2.5 bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-blue-300">Mr. Eric Darko</div>
                    <div className="text-[10px] text-slate-400">Computing Faculty</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('beatrice', 'Beatrice Quartey (Parent)')}
                    className="p-2.5 bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-blue-300">Mrs. B. Quartey</div>
                    <div className="text-[10px] text-slate-400">Guardian Parent</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin', 'Admin Obah (Head of School)')}
                    className="p-2.5 bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-blue-300">Head of School</div>
                    <div className="text-[10px] text-slate-400">Administrator</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Stage Graphic */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <img
                  src="/og-banner.jpg"
                  alt="Salem Montessori Campus"
                  className="w-full h-64 sm:h-80 object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded bg-amber-400 text-blue-950 font-extrabold text-[10px] uppercase tracking-wider">
                      Term 1 • 2026/2027
                    </span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      GES Accredited
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Airport Residential Campus &amp; Digital Studio
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Equipped with state-of-the-art Montessori sensorial apparatus, high-speed ICT laboratory, and live VClass broadcasting suites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INSTITUTIONAL METRICS ─── */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 border-r last:border-r-0 border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-blue-950">500+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Scholars Enrolled
              </div>
            </div>
            <div className="p-4 border-r last:border-r-0 border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-amber-600">100%</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                BECE Distinction Rate
              </div>
            </div>
            <div className="p-4 border-r last:border-r-0 border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-blue-950">1 : 12</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Teacher-Student Ratio
              </div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-600">18+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Virtual Classrooms
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION NAVIGATION TABS ─── */}
      <section className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar text-xs font-semibold">
            {[
              { id: 'overview', label: 'School Overview' },
              { id: 'academics', label: 'GES Curriculum & Strands' },
              { id: 'montessori', label: 'Montessori Sensory Method' },
              { id: 'facilities', label: 'Campus Grounds & Labs' },
              { id: 'admissions', label: 'Admissions & Calendar' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TAB CONTENT ARENA ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* TAB 1: OVERVIEW & PILLARS */}
        {activeTab === 'overview' && (
          <div className="space-y-16 animate-in fade-in duration-300">
            {/* The 4 Foundational Pillars */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  Our Pedagogical Foundation
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Why Families Choose Salem Montessori
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  We blend hands-on sensory materials with contemporary digital literacy to raise well-rounded leaders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Tactile &amp; Sensory Learning</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Direct manipulation of golden beads, binomial cubes, and movable alphabets builds concrete conceptual mastery before abstract computation.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">National GES Standards</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Comprehensive adherence to the Ghana Education Service syllabus ensuring seamless progression and exceptional BECE distinctions.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Synchronous VClass Platform</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Interactive live broadcast classrooms, collaborative blackboard drawing, lecture slide carousels, and automated quizzes.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Character &amp; Leadership</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Inculcating integrity, self-discipline, curiosity, mutual respect, and independent discovery from early childhood through Junior High.
                  </p>
                </div>
              </div>
            </div>

            {/* Principal's Message */}
            <div className="p-8 bg-gradient-to-br from-blue-900 to-slate-950 text-white rounded-3xl shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4 text-left">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                    Message from the Head of School
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    "Every Child is Naturally Curious; Our Calling is to Guide That Wonder."
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    At Salem Montessori School, we reject passive memorization. By fusing Dr. Maria Montessori's proven
                    prepared environments with cutting-edge digital virtual studios, our pupils develop both deep analytical
                    thinking and genuine creative agency. Whether conducting hands-on biology experiments on campus or logging into
                    live ICT VClasses from home, our learners excel in every sphere.
                  </p>
                  <div className="pt-2">
                    <div className="font-bold text-white text-sm">Mrs. Elizabeth Arthur</div>
                    <div className="text-xs text-amber-300">Head of School &amp; Academic Director</div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-2xl bg-white/10 border-2 border-amber-400/80 p-2 shadow-inner">
                    <img
                      src={logoUrl}
                      alt="Salem Crest"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center italic">
                    "{motto}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMICS & GES STRANDS */}
        {activeTab === 'academics' && (
          <div className="space-y-12 animate-in fade-in duration-300 text-left">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                Academic Framework
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Rigorous Curriculum Aligned to National &amp; Global Standards
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                Our academic program covers Basic 1 through Basic 9 (Junior High School 1–3), systematically preparing
                pupils for the Basic Education Certificate Examination (BECE) while fostering higher-order computational problem solving.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Computing & ICT */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Computing &amp; ICT</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Binary numbering, algorithmic thinking, software applications, cybersecurity, and beginner programming logic.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-semibold text-blue-900 flex items-center gap-1">
                  <span>Weekly live coding drills &amp; slide decks</span>
                </div>
              </div>

              {/* Integrated Science */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                  <Microscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Integrated Science</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Life cycles, plant and animal taxonomy, environmental ecology, physical energy principles, and laboratory experiments.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <span>Sensorial apparatus &amp; physical lab experiments</span>
                </div>
              </div>

              {/* Mathematics */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Mathematics &amp; Geometry</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Decimal system operations with golden beads, fraction insets, plane geometry proofs, algebraic expressions, and statistics.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                  <span>Concrete sensorial beads to abstract algebra</span>
                </div>
              </div>
            </div>

            {/* Departmental Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900 text-white font-bold text-sm">
                Complete Academic Subject Offerings (Basic 1 – JHS 3)
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { code: 'COMP', name: 'Computing & Digital Information Technology', lead: 'Mr. Eric Darko', division: 'B4–B9' },
                  { code: 'SCI', name: 'Integrated Science & Experimental Labs', lead: 'Mrs. Sarah Mensah', division: 'B1–B9' },
                  { code: 'MATH', name: 'Mathematics & Spatial Geometry', lead: 'Mr. Kwame Boateng', division: 'B1–B9' },
                  { code: 'ENG', name: 'English Language & Phonetics Literature', lead: 'Ms. Clara Asare', division: 'B1–B9' },
                  { code: 'SOC', name: 'Social Studies & Citizenship Education', lead: 'Mr. David Osei', division: 'B7–B9' },
                  { code: 'ARTS', name: 'Creative Arts & Montessori Practical Life', lead: 'Mrs. Abena Poku', division: 'B1–B6' },
                ].map((s) => (
                  <div key={s.code} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-blue-900 mr-2">[{s.code}]</span>
                      <span className="font-semibold text-slate-900">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500">
                      <span>Faculty: {s.lead}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">{s.division}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MONTESSORI APPARATUS */}
        {activeTab === 'montessori' && (
          <div className="space-y-12 animate-in fade-in duration-300 text-left">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                Hands-on Sensorial Mastery
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                The Prepared Montessori Environment
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                Dr. Maria Montessori proved that sensory manipulation precedes abstract understanding. Our classrooms
                feature authentic sensorial materials bridged seamlessly into our digital Virtual Classroom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900">Golden Beads &amp; Decimal Cards</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pupils physically hold a single bead (unit), a 10-bead bar (ten), a 100-bead square (hundred), and a heavy 1000-bead cube (thousand).
                  This physical weight and volume makes place-value arithmetic deeply intuitive before paper computation begins.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 font-medium">
                  Also available in our interactive digital <strong>Montessori Virtual Lab</strong> inside the portal!
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900">Binomial &amp; Trinomial Cubes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A concrete representation of the algebraic formula (a + b)³ and (a + b + c)³. Children assemble color-coded geometric blocks,
                  developing visual spatial acuity that later translates into effortless secondary algebra mastery.
                </p>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/60 text-xs text-blue-900 font-medium">
                  Assists 3D spatial reasoning for geometry, physics, and architecture.
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900">Movable Alphabet &amp; Phonetics</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Wooden letter cutouts arranged in phonetic compartments enable early learners to construct words and complete sentences
                  months before their fine motor skills can comfortably hold a pencil for extended writing.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  04
                </div>
                <h3 className="text-lg font-bold text-slate-900">Botany &amp; Zoology Cabinets</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Anatomical wooden puzzles depicting internal leaf structures, root systems, vertebrate anatomy, and insect morphology.
                  Children physically dismantle and reconstruct living systems with correct scientific taxonomy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="space-y-12 animate-in fade-in duration-300 text-left">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                Airport Residential Campus
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Modern Campus Facilities &amp; Specialized Grounds
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                Strategically located in Accra's serene Airport Residential Area, our campus provides safe, technologically advanced environments
                designed for exploratory childhood learning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Computer &amp; Coding Suite</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Fiber-optic connected workstation stations, interactive smart boards, robotics starter kits, and dedicated VClass terminals.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                  <Microscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Science Demonstration Lab</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Fully equipped with safe optical microscopes, chemical apparatus, biological specimens, and renewable energy demonstration kits.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Digital &amp; Physical Library</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Curated physical repository of African literature, world classics, scientific journals, plus our 24/7 in-app digital e-library.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center mb-4">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Sports &amp; Recreation Pavilion</h3>
                <p className="text-xs text-slate-600 mt-2">
                  AstroTurf football pitch, basketball court, table tennis hall, and shaded Montessori sensory play garden for early years.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Infirmary &amp; Wellness Center</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Staffed full-time by a licensed pediatric nurse with immediate first aid, wellness screenings, and private recuperation bays.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Multipurpose Assembly Hall</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Acoustically treated auditorium for academic debates, musical recitals, drama performances, and parent-teacher association forums.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADMISSIONS & CALENDAR */}
        {activeTab === 'admissions' && (
          <div className="space-y-12 animate-in fade-in duration-300 text-left">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                Join Our Academic Community
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Admissions for Term 1, 2026/2027 Academic Year
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                We accept applications for Basic 1 through Basic 9. Due to our strict 1:12 teacher-to-student ratio,
                places are allocated following a student interview and diagnostic readiness review.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Admission Steps */}
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Simple 3-Step Enrollment Process</h3>

                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Application Submission</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Submit birth certificate, past academic reports, and complete the enrollment questionnaire.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-blue-950 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Placement Assessment &amp; Interview</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        A friendly evaluation of reading phonetics, mathematical numeracy, and social readiness.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Orientation &amp; VClass Activation</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Receive student ID credentials, uniform package, and full access to our digital learning suite.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1 text-blue-950">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    <span>School Hours &amp; Bell Schedule</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Monday to Friday: 7:45 AM – 3:30 PM (Co-curricular activities to 4:30 PM). Live VClass evening review broadcasts: 6:00 PM – 7:30 PM.
                  </p>
                </div>
              </div>

              {/* Inquiry & Request Form */}
              <div className="lg:col-span-6 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900">Request Prospectus &amp; School Tour</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Fill in your details and our Admissions Secretary will contact you within 24 hours.
                </p>

                {inquirySubmitted ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-900 text-sm">Thank You for Inquiring!</h4>
                    <p className="text-xs text-emerald-800">
                      We have sent our full 2026/2027 Prospectus, fee structure, and admissions handbook to your email.
                    </p>
                    <button
                      type="button"
                      onClick={() => setInquirySubmitted(false)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parent / Guardian Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="e.g. Dr. Kwame Mensah"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="e.g. kwame@example.com"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={inquiryPhone}
                          onChange={(e) => setInquiryPhone(e.target.value)}
                          placeholder="e.g. +233 24 123 4567"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Prospective Class Level
                      </label>
                      <select
                        value={inquiryClass}
                        onChange={(e) => setInquiryClass(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:bg-white"
                      >
                        <option value="Pre-School">Pre-School / Kindergarten</option>
                        <option value="Basic 1">Basic 1 (Primary 1)</option>
                        <option value="Basic 4">Basic 4 (Primary 4)</option>
                        <option value="Basic 6">Basic 6 (Primary 6)</option>
                        <option value="Basic 7">Basic 7 (JHS 1)</option>
                        <option value="Basic 8">Basic 8 (JHS 2)</option>
                        <option value="Basic 9">Basic 9 (JHS 3)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Questions or Special Notes
                      </label>
                      <textarea
                        rows={3}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Tell us about your child's background and any specific learning goals..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:bg-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry &amp; Request Tour</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── CAMPUS LOCATION & CONTACT ─── */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Salem Crest" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-bold text-base">{schoolName}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering Ghana's youth with the highest caliber of sensory Montessori exploration,
                academic rigor, and synchronous digital classrooms.
              </p>
              <div className="text-xs text-amber-400 font-medium">
                GES Reg. No: GES/GAR/PVT/048/2012
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Campus Contact</h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>No. 14 Ridge Road, Airport Residential Area, Accra, Ghana</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>+233 24 456 7890 / +233 30 212 3456</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>info@salemmontessori.edu.gh</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">VClass Learning Portal</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access your terminal report cards, live virtual broadcasts, daily timetables, homework assignments, and teacher messages.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    setIsPublicWebsite(false);
                    setActiveNav('dashboard');
                  } else {
                    openLoginModal();
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{currentUser ? 'Return to Dashboard' : 'Student & Faculty Sign In'}</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              &copy; {new Date().getFullYear()} {schoolName}. All Rights Reserved.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button
                type="button"
                onClick={() => startTour('guest', 0)}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Launch Campus Tour
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveTab('academics')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Curriculum
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveTab('admissions')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Admissions
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
