import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings as SettingsIcon, 
  ChevronDown, 
  Menu, 
  Volume2, 
  VolumeX, 
  GitBranch,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Smartphone,
  LogOut,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { firebaseProjectInfo } from '../services/firebaseAuth';

export default function AgriHeader({ 
  onMenuToggle,
  activeField,
  setActiveField,
  presetFields,
  currentLang,
  setCurrentLang,
  audioEnabled,
  setAudioEnabled,
  onOpenGitSync,
  setActiveTab,
  onOpenMobileApp,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Hamburger (mobile) + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crops, fields, soil metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Right: Mobile App Launcher, Location, Notifications, Settings, User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">

          {/* Interconnected Mobile App Launch Button */}
          <button
            onClick={onOpenMobileApp}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-800 text-xs font-bold transition-all shadow-xs hover:scale-102"
            title="Launch Interconnected Mobile App (Auto-GPS)"
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Mobile App</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Firebase Auto-Connected Indicator */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-xs" 
            title={`Connected to Firebase: ${firebaseProjectInfo.projectName} (${firebaseProjectInfo.projectId})`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Firebase: <b className="font-mono text-emerald-900">{firebaseProjectInfo.projectId}</b></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Location Badge (quick field indicator) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[130px]">{activeField?.location || 'Jaffna, Sri Lanka'}</span>
          </div>

          {/* Notifications with Red Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAlertsMenu(!showAlertsMenu);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                1
              </span>
            </button>

            {/* Notification Dropdown */}
            {showAlertsMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-semibold text-sm text-slate-800">Farm Alerts</h4>
                  <span className="text-[11px] text-emerald-600 font-medium">1 new</span>
                </div>
                <div className="divide-y divide-slate-100 mt-2">
                  <div className="py-2.5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Low soil moisture in Field B</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Today, 08:15 AM · Moisture dropped below 25%</p>
                    </div>
                  </div>
                  <div className="py-2.5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">High temperature expected</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Tomorrow, 06:00 AM · Peak 35°C forecasted</p>
                    </div>
                  </div>
                  <div className="py-2.5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Irrigation completed in Field A</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Today, 07:30 AM · Drip cycle 45 mins</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Icon */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* User Profile / Login Thumbnail */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowAlertsMenu(false);
                }}
                className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <img
                  src={currentUser.photoURL || "/avatar.jpg"}
                  alt={currentUser.displayName || "User"}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.displayName || "John Doe"}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 leading-tight">
                    {currentUser.role || "Farm Manager"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="p-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="font-bold text-sm text-slate-900">
                        {currentUser.displayName || "John Doe"}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email || "farmer@agrismart.io"}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Firebase Authenticated
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    {/* Select Farm Location */}
                    <div className="px-2 py-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Select Farm Location
                      </label>
                      <select
                        value={activeField?.id ?? ''}
                        onChange={(e) => {
                          const found = presetFields.find(f => f.id === e.target.value);
                          if (found) setActiveField(found);
                        }}
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {presetFields.map(field => (
                          <option key={field.id} value={field.id}>
                            {field.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Language Selector */}
                    <div className="px-2 py-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-slate-400" /> Language
                      </span>
                      <div className="flex gap-1">
                        {['en', 'mr', 'hi'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setCurrentLang(lang)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              currentLang === lang
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Audio Toggle */}
                    <button
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className="w-full px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                        Voice Audio
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${audioEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {audioEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {/* Git Sync */}
                    <button
                      onClick={() => {
                        onOpenGitSync();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                      GitHub Sync & Backup
                    </button>

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        onLogout?.();
                        setShowProfileMenu(false);
                      }}
                      className="w-full mt-1 px-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
