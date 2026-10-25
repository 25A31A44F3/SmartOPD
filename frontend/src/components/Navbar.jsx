import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, FileText, CheckSquare, BarChart3, 
  Languages, Bell, Clock, AlertCircle, Volume2, VolumeX, Menu, X
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  lang, 
  setLang, 
  t, 
  emergencyCount = 0,
  audioEnabled,
  setAudioEnabled
}) {
  const [time, setTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: Activity },
    { id: 'register', label: t.navRegister, icon: FileText },
    { id: 'triage', label: t.navTriage, icon: CheckSquare },
    { id: 'queue', label: t.navQueue, icon: Users, badge: emergencyCount > 0 ? emergencyCount : null },
    { id: 'admin', label: t.navAdmin, icon: BarChart3 },
  ];

  return (
    <header className="bg-hospital-900 text-white shadow-lg sticky top-0 z-40 border-b border-hospital-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Hospital Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hospital-500 to-hospital-700 flex items-center justify-center shadow-md border border-hospital-400/30">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">{t.appTitle}</span>
                <span className="text-[10px] bg-hospital-700/80 text-hospital-100 px-1.5 py-0.5 rounded font-mono border border-hospital-600">
                  v1.0-GOV
                </span>
              </div>
              <div className="text-xs text-hospital-200 hidden sm:block truncate max-w-xs font-normal">
                {t.hospitalName}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    isActive 
                      ? 'bg-hospital-800 text-white shadow-inner border border-hospital-700' 
                      : 'text-hospital-200 hover:text-white hover:bg-hospital-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-hospital-300' : 'text-hospital-300'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse-fast ml-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls (Clock, Emergency Alert, Audio, Language) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-hospital-200 bg-hospital-950/60 px-2.5 py-1.5 rounded-lg border border-hospital-800/80 font-mono">
              <Clock className="w-3.5 h-3.5 text-hospital-400" />
              <span>{time}</span>
            </div>

            {/* Emergency Alert Indicator */}
            {emergencyCount > 0 && (
              <button 
                onClick={() => setCurrentTab('queue')}
                className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold animate-pulse border border-red-400 shadow-sm"
                title={`${emergencyCount} emergency patient(s) waiting in queue!`}
              >
                <AlertCircle className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">{lang === 'te' ? "అత్యవసరం:" : "EMG:"}</span>
                <span className="bg-white text-red-700 text-[11px] font-black px-1.5 py-0.2 rounded-full">
                  {emergencyCount}
                </span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? "Audio announcements enabled" : "Audio muted"}
              className={`p-2 rounded-lg border text-xs transition ${
                audioEnabled 
                  ? 'bg-hospital-800/80 text-hospital-200 border-hospital-700 hover:text-white' 
                  : 'bg-hospital-950 text-slate-400 border-hospital-800'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-hospital-700 to-hospital-800 hover:from-hospital-600 hover:to-hospital-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-hospital-600 shadow-sm transition"
              title="Switch Language / భాష మార్చండి"
            >
              <Languages className="w-4 h-4 text-hospital-300" />
              <span>{t.langToggle}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-hospital-200 hover:text-white hover:bg-hospital-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-hospital-950 border-t border-hospital-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive 
                    ? 'bg-hospital-800 text-white font-bold' 
                    : 'text-hospital-200 hover:bg-hospital-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-hospital-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
