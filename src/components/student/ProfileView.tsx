import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    updateUserPassword,
    logoutToWebsite,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile edit states
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [bio, setBio] = useState<string>(currentUser?.bio || '');
  const [avatar, setAvatar] = useState<string>(currentUser?.avatar || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Password edit states
  const [currPassword, setCurrPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);

    const success = await updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
    });

    if (success) {
      setProfileSuccessMsg('Profile information updated successfully.');
      confetti({ particleCount: 40, spread: 50 });
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    const res = await updateUserPassword(currPassword, newPassword);
    if (res.success) {
      setPassSuccessMsg(res.message);
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
      confetti({ particleCount: 50, spread: 60 });
      setTimeout(() => setPassSuccessMsg(null), 4000);
    } else {
      setPassError(res.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100 shadow-sm"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                {currentUser.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
                {currentUser.role}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              {currentUser.email} • {currentUser.studentId || currentUser.staffId || 'Verified Member'}
            </p>
          </div>
        </div>

        <button
          onClick={logoutToWebsite}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Tabs: Edit Profile vs Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-white text-blue-900 border-b-2 border-blue-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Update Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'password'
                ? 'bg-white text-blue-900 border-b-2 border-blue-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Security &amp; Change Password
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Contact:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    placeholder="+233 24 111 2233"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Avatar Image URL:
                  </label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Notes:
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or subject specialization..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleSavePassword} className="space-y-5 max-w-md">
              {passError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (minimum 6 characters):
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" /> Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
