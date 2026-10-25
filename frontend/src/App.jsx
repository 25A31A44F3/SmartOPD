import React, { useState, useEffect } from 'react';
import { translations } from './i18n';
import { api } from './services/api';
import { playHospitalChime, announceToken } from './utils/audio';

import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import TokenModal from './components/TokenModal';
import OverrideModal from './components/OverrideModal';

import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import TriagePage from './pages/TriagePage';
import ResultsPage from './pages/ResultsPage';
import QueuePage from './pages/QueuePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('smart_opd_lang') || 'en');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Selected Patient
  const [selectedPatientForSlip, setSelectedPatientForSlip] = useState(null);
  const [selectedPatientForOverride, setSelectedPatientForOverride] = useState(null);
  const [lastAssessedPatient, setLastAssessedPatient] = useState(null);

  // Audio announcements toggle
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('smart_opd_lang', lang);
  }, [lang]);

  const t = translations[lang] || translations.en;

  // Initial and periodic data fetch
  const refreshData = async () => {
    try {
      const [queueData, statsData] = await Promise.all([
        api.getQueue({ include_completed: true }),
        api.getStats()
      ]);
      setQueue(queueData || []);
      setStats(statsData || null);
      setError(null);
    } catch (err) {
      console.error("Failed to load queue data:", err);
      setError("Unable to connect to SmartOPD backend server. Please verify backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 15000); // 15s polling for multi-counter sync
    return () => clearInterval(interval);
  }, []);

  // Handle patient registration from RegisterPage
  const handleRegisterPatient = async (payload) => {
    const newPatient = await api.registerPatient(payload);
    await refreshData();
    setLastAssessedPatient(newPatient);
    setCurrentTab('results');
    if (audioEnabled && newPatient.priority === 'Emergency') {
      playHospitalChime(true);
    }
    return newPatient;
  };

  // Handle calling a patient in queue
  const handleCallPatient = (patient) => {
    if (audioEnabled) {
      announceToken(patient.token_number, patient.assigned_room, lang);
    }
  };

  // Handle priority override
  const handleConfirmOverride = async (patientId, payload) => {
    const updated = await api.overridePriority(patientId, payload);
    await refreshData();
    if (lastAssessedPatient?.id === patientId) {
      setLastAssessedPatient(updated);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (patientId, newStatus) => {
    await api.updatePatientStatus(patientId, { status: newStatus });
    await refreshData();
  };

  const emergencyWaitingCount = queue.filter(p => p.priority === 'Emergency' && p.status === 'Waiting').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner lang={lang} t={t} />

      {/* Main Responsive Hospital Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        t={t}
        emergencyCount={emergencyWaitingCount}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
      />

      {/* Backend Connection Error Notice */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4 w-full">
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-800 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button 
              onClick={refreshData}
              className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Body Pages */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !queue.length ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-600">Connecting to SmartOPD Local Hospital System...</div>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardPage
                stats={stats}
                queue={queue}
                onNavigate={setCurrentTab}
                onCallPatient={handleCallPatient}
                onSelectPatient={setSelectedPatientForSlip}
                lang={lang}
                t={t}
              />
            )}

            {currentTab === 'register' && (
              <RegisterPage
                onSubmitPatient={handleRegisterPatient}
                onNavigate={setCurrentTab}
                lang={lang}
                t={t}
              />
            )}

            {currentTab === 'triage' && (
              <TriagePage
                onNavigate={setCurrentTab}
                lang={lang}
                t={t}
              />
            )}

            {currentTab === 'results' && (
              <ResultsPage
                patient={lastAssessedPatient || queue[0]}
                onPrintToken={setSelectedPatientForSlip}
                onNavigate={setCurrentTab}
                onOpenOverride={setSelectedPatientForOverride}
                lang={lang}
                t={t}
              />
            )}

            {currentTab === 'queue' && (
              <QueuePage
                queue={queue}
                onCallPatient={handleCallPatient}
                onSelectPatient={setSelectedPatientForSlip}
                onOpenOverride={setSelectedPatientForOverride}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={refreshData}
                lang={lang}
                t={t}
              />
            )}

            {currentTab === 'admin' && (
              <AdminPage
                stats={stats}
                queue={queue}
                onRefresh={refreshData}
                onUpdateStatus={handleUpdateStatus}
                onSelectPatient={setSelectedPatientForSlip}
                lang={lang}
                t={t}
              />
            )}
          </>
        )}
      </main>

      {/* Token Print Modal */}
      {selectedPatientForSlip && (
        <TokenModal
          patient={selectedPatientForSlip}
          onClose={() => setSelectedPatientForSlip(null)}
          lang={lang}
          t={t}
        />
      )}

      {/* Staff Priority Override Modal */}
      {selectedPatientForOverride && (
        <OverrideModal
          patient={selectedPatientForOverride}
          onClose={() => setSelectedPatientForOverride(null)}
          onConfirm={handleConfirmOverride}
          lang={lang}
          t={t}
        />
      )}

      {/* Clean Hospital Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            <div className="font-bold text-slate-200">
              SmartOPD – Intelligent Patient Triage & Queue Management System
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Developed for Indian Overloaded Government Hospitals • Problem Statement H1
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Non-clinical demonstration prototype • Verified with deterministic physiological rules
          </div>
        </div>
      </footer>

    </div>
  );
}
