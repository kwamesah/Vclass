import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  Video,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Send,
  Smartphone,
  Globe,
} from 'lucide-react';

interface ShareVClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTarget?: 'portal' | 'vclass' | 'results' | 'library';
  roomCode?: string;
}

export const ShareVClassModal: React.FC<ShareVClassModalProps> = ({
  isOpen,
  onClose,
  defaultTarget = 'portal',
  roomCode,
}) => {
  const { schoolConfig, addToast } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const [previewPlatform, setPreviewPlatform] = useState<'whatsapp' | 'twitter' | 'facebook' | 'imessage'>('whatsapp');
  const [shareTarget, setShareTarget] = useState<'portal' | 'vclass' | 'results' | 'library'>(defaultTarget);
  const [activeTab, setActiveTab] = useState<'share' | 'preview' | 'qr'>('share');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://salemmontessori.edu.gh';
  
  // Build URL based on target
  let shareUrl = origin;
  let targetTitle = `${schoolConfig.shortName || 'Salem VClass'} – Official E-Learning Portal`;
  let targetDescription = `Official Virtual Classroom and school portal for ${schoolConfig.name}. Access live lessons, interactive Montessori labs, and grade transcripts.`;

  if (shareTarget === 'vclass') {
    shareUrl = roomCode ? `${origin}?vclass=${roomCode}` : `${origin}?vclass=live`;
    targetTitle = `Live Virtual Classroom – ${schoolConfig.name}`;
    targetDescription = `Join live interactive virtual classroom sessions, interactive whiteboard lessons, and hands-on explorations at ${schoolConfig.name}.`;
  } else if (shareTarget === 'results') {
    shareUrl = `${origin}?nav=results`;
    targetTitle = `Terminal Performance Transcripts & Reports – ${schoolConfig.name}`;
    targetDescription = `Check student continuous assessments, terminal examination results, and official academic performance transcripts online.`;
  } else if (shareTarget === 'library') {
    shareUrl = `${origin}?nav=library`;
    targetTitle = `Digital E-Library & Research Hub – ${schoolConfig.name}`;
    targetDescription = `Explore digital textbooks, Montessori research guides, and educational materials.`;
  }

  const schoolLogo = schoolConfig.logoUrl || '/school-crest.jpg';
  const schoolMotto = schoolConfig.motto || 'Inspiring Excellence, Nurturing Curiosity & Practical Mastery';

  const shareTextWhatsApp = `🎓 *${schoolConfig.name}* (${schoolConfig.shortName || 'Salem VClass'})\n\n_${schoolMotto}_\n\n📌 *${targetTitle}*\n${targetDescription}\n\n👉 Join & Access here:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast('Link Copied!', 'Share link copied to clipboard. Ready to paste.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      addToast('Copied', shareUrl, 'info');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: targetTitle,
          text: `${schoolConfig.name} – ${schoolMotto}`,
          url: shareUrl,
        });
        addToast('Shared Successfully', 'Thank you for sharing the school portal link.', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(shareTextWhatsApp);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`${schoolConfig.name} – ${targetTitle}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Access ${schoolConfig.name} Virtual Classroom & E-Learning Portal:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`${schoolConfig.name} - ${targetTitle}`);
    const body = encodeURIComponent(
      `Dear Parent / Student / Colleague,\n\nPlease find below the official link to ${schoolConfig.name} Virtual Learning Portal:\n\n${targetTitle}\n${targetDescription}\n\nPortal Link: ${shareUrl}\n\nSchool Motto: "${schoolMotto}"\nAccreditation: ${schoolConfig.accreditationNumber}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-md border border-amber-400/40 shrink-0 overflow-hidden">
              <img
                src={schoolLogo}
                alt={schoolConfig.name}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/school-crest.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Official Share Hub
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline">• Verified Crest Preview</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight mt-1">
                Share {schoolConfig.shortName || 'VClass'} Link
              </h2>
              <p className="text-xs text-blue-200/90 italic truncate max-w-md">
                &ldquo;{schoolMotto}&rdquo;
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-blue-800/60 pt-3">
            <button
              onClick={() => setActiveTab('share')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'share'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share &amp; Export</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Social Media Preview Card</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mobile QR Code</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Target Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Link Destination
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setShareTarget('portal')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  shareTarget === 'portal'
                    ? 'border-blue-900 bg-blue-50/70 text-blue-950 ring-2 ring-blue-900/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-900 mb-1" />
                <p className="text-xs font-bold truncate">VClass Portal</p>
                <p className="text-[10px] text-slate-500 truncate">Main Gateway</p>
              </button>

              <button
                type="button"
                onClick={() => setShareTarget('vclass')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  shareTarget === 'vclass'
                    ? 'border-blue-900 bg-blue-50/70 text-blue-950 ring-2 ring-blue-900/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Video className="w-4 h-4 text-rose-600 mb-1" />
                <p className="text-xs font-bold truncate">Live Classroom</p>
                <p className="text-[10px] text-slate-500 truncate">Direct Session</p>
              </button>

              <button
                type="button"
                onClick={() => setShareTarget('results')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  shareTarget === 'results'
                    ? 'border-blue-900 bg-blue-50/70 text-blue-950 ring-2 ring-blue-900/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 mb-1" />
                <p className="text-xs font-bold truncate">Report Cards</p>
                <p className="text-[10px] text-slate-500 truncate">Grade Portal</p>
              </button>

              <button
                type="button"
                onClick={() => setShareTarget('library')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  shareTarget === 'library'
                    ? 'border-blue-900 bg-blue-50/70 text-blue-950 ring-2 ring-blue-900/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-600 mb-1" />
                <p className="text-xs font-bold truncate">E-Library</p>
                <p className="text-[10px] text-slate-500 truncate">Montessori Books</p>
              </button>
            </div>
          </div>

          {/* TAB 1: Share & Export */}
          {activeTab === 'share' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* URL Field with One-Click Copy */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono select-all truncate">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-900 hover:bg-blue-800 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Native Device Share (AirDrop / WhatsApp / Messages on mobile) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Open System Share Sheet (AirDrop, Messages, WhatsApp)</span>
                </button>
              )}

              {/* Direct Instant Channels */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Direct One-Click Sharing
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={handleShareWhatsApp}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareTelegram}
                    className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-sky-600" />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={handleShareTwitter}
                    className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>𝕏 (Twitter)</span>
                  </button>

                  <button
                    onClick={handleShareEmail}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Email Link</span>
                  </button>
                </div>
              </div>

              {/* Verified School Crest Card Callout */}
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold">Rich Social Graph Metadata Active</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    When recipient receives this link, social media platforms (WhatsApp, iMessage, Facebook, Twitter) automatically display the <strong>{schoolConfig.name}</strong> official crest, slogan, and accreditation badge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Social Media Preview Card */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select Channel Preview
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                  <button
                    onClick={() => setPreviewPlatform('whatsapp')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                      previewPlatform === 'whatsapp' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('twitter')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                      previewPlatform === 'twitter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Twitter / 𝕏
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('facebook')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                      previewPlatform === 'facebook' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('imessage')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                      previewPlatform === 'imessage' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    iMessage
                  </button>
                </div>
              </div>

              {/* Render Selected Platform Mockup */}
              {previewPlatform === 'whatsapp' && (
                <div className="bg-[#e5ddd5] p-4 sm:p-6 rounded-2xl border border-slate-300">
                  <div className="max-w-md ml-auto bg-[#dcf8c6] rounded-2xl shadow-md border border-[#c1e7a6] p-2.5 space-y-2">
                    {/* Embedded Link Card */}
                    <div className="bg-white/90 rounded-xl overflow-hidden border border-slate-200/60 shadow-xs">
                      <div className="relative h-40 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
                        <img
                          src={schoolLogo}
                          alt="School Crest"
                          className="w-20 h-20 object-contain drop-shadow-xl rounded-xl border border-amber-400/50 bg-white/10 p-1"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/school-crest.jpg';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                          vclass portal
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 space-y-1">
                        <p className="text-[11px] font-bold text-slate-900 line-clamp-1">
                          {targetTitle}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          {targetDescription}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono truncate pt-1 border-t border-slate-200">
                          {shareUrl}
                        </p>
                      </div>
                    </div>

                    {/* Chat Bubble Text */}
                    <div className="text-xs text-slate-800 px-1 pt-1 space-y-1">
                      <p className="font-semibold text-emerald-950">
                        🎓 {schoolConfig.name} • {schoolConfig.shortName || 'VClass'}
                      </p>
                      <p className="text-[11px] italic text-slate-600">&ldquo;{schoolMotto}&rdquo;</p>
                      <p className="text-[11px] text-blue-900 font-medium underline break-all">
                        {shareUrl}
                      </p>
                      <div className="text-right text-[9px] text-slate-400 pt-0.5">
                        12:45 PM <Check className="w-3 h-3 inline text-sky-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {previewPlatform === 'twitter' && (
                <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 text-white">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-blue-900 p-1 shrink-0 overflow-hidden">
                        <img src={schoolLogo} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{schoolConfig.shortName || 'Salem VClass'}</span>
                          <span className="text-[11px] text-slate-400">@salem_vclass</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Virtual Learning Platform</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200">
                      Access the official e-learning portal for <strong>{schoolConfig.name}</strong>. Real-time virtual classrooms, interactive Montessori labs, and grade records online! 🚀
                    </p>

                    {/* Large Image Summary Card */}
                    <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl">
                      <div className="h-44 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 relative flex items-center justify-center p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={schoolLogo}
                            alt="Crest"
                            className="w-20 h-20 object-contain rounded-2xl shadow-xl border border-amber-400/40 bg-white/10 p-1.5"
                          />
                          <div className="text-left">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                              Official Crest
                            </span>
                            <h4 className="text-sm font-bold text-white line-clamp-1">{schoolConfig.name}</h4>
                            <p className="text-[10px] text-slate-300 italic max-w-[200px] line-clamp-1">&ldquo;{schoolMotto}&rdquo;</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 border-t border-slate-800">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                          {typeof window !== 'undefined' ? window.location.host : 'salemmontessori.edu.gh'}
                        </p>
                        <p className="text-xs font-bold text-white mt-0.5 line-clamp-1">{targetTitle}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{targetDescription}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {previewPlatform === 'facebook' && (
                <div className="bg-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-300">
                  <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="p-3 flex items-center gap-2.5">
                      <img src={schoolLogo} alt="Logo" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{schoolConfig.name}</p>
                        <p className="text-[10px] text-slate-400">Just now • 🌐</p>
                      </div>
                    </div>
                    {/* Card Graphic */}
                    <div className="h-44 bg-gradient-to-r from-blue-950 to-indigo-900 flex items-center justify-center relative p-4">
                      <img src={schoolLogo} alt="Crest" className="w-20 h-20 object-contain drop-shadow-xl" />
                      <div className="absolute bottom-2 left-3 bg-blue-900/80 backdrop-blur-xs text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded">
                        {schoolConfig.shortName || 'VClass Portal'}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-200">
                      <p className="text-[10px] text-slate-500 uppercase font-mono">{shareUrl.replace(/^https?:\/\//, '')}</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{targetTitle}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{targetDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {previewPlatform === 'imessage' && (
                <div className="bg-slate-200 p-4 sm:p-6 rounded-2xl border border-slate-300 flex justify-center">
                  <div className="max-w-xs bg-blue-600 text-white rounded-2xl p-2.5 shadow-md space-y-2">
                    <div className="bg-white text-slate-900 rounded-xl overflow-hidden shadow-xs">
                      <div className="h-28 bg-gradient-to-br from-blue-950 to-indigo-900 flex items-center justify-center p-3">
                        <img src={schoolLogo} alt="Crest" className="w-14 h-14 object-contain drop-shadow" />
                      </div>
                      <div className="p-2.5 bg-slate-50">
                        <p className="text-[11px] font-bold line-clamp-1">{schoolConfig.name}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{targetDescription}</p>
                        <p className="text-[9px] text-blue-600 font-mono mt-1">{shareUrl}</p>
                      </div>
                    </div>
                    <p className="text-xs px-1">Here is our school virtual classroom link! 🎓</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Instant Mobile QR Code */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center animate-in fade-in duration-150">
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Scan with any smartphone camera or iPad to open <strong>{schoolConfig.shortName || 'VClass'}</strong> immediately without typing.
              </p>

              {/* Crisp High-Res QR Code Representation */}
              <div className="inline-block p-4 sm:p-6 bg-white rounded-2xl shadow-xl border-2 border-slate-200">
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 mx-auto flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-3">
                  {/* Generate QR using standard QR API with high error correction */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      shareUrl
                    )}&margin=4&color=0f172a`}
                    alt={`QR Code for ${schoolConfig.name}`}
                    className="w-full h-full object-contain"
                  />
                  {/* School Crest Center Watermark */}
                  <div className="absolute w-12 h-12 bg-white rounded-full p-1 shadow-lg border border-amber-400 flex items-center justify-center">
                    <img
                      src={schoolLogo}
                      alt="Crest"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/school-crest.jpg';
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-bold text-slate-900">{schoolConfig.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs mx-auto mt-0.5">{shareUrl}</p>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  download="vclass-qr-code.png"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>Open Full QR Image</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Accredited: {schoolConfig.accreditationNumber}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
