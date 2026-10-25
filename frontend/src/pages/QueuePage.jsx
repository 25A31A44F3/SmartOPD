import React, { useState } from 'react';
import { 
  Users, Search, Filter, Volume2, ShieldAlert, CheckCircle2, 
  Clock, Printer, Stethoscope, ArrowUpDown, Monitor, ChevronRight, AlertCircle
} from 'lucide-react';

export default function QueuePage({ 
  queue = [], 
  onCallPatient, 
  onSelectPatient, 
  onOpenOverride, 
  onUpdateStatus, 
  onRefresh, 
  lang = 'en', 
  t 
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [tvMode, setTvMode] = useState(false);

  // Departments list from queue
  const departments = ['All', ...new Set(queue.map(p => p.department).filter(Boolean))];

  // Filter queue
  const filteredQueue = queue.filter(patient => {
    if (selectedDept !== 'All' && patient.department !== selectedDept) return false;
    if (selectedPriority !== 'All' && patient.priority !== selectedPriority) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = patient.name?.toLowerCase().includes(q);
      const matchToken = patient.token_number?.toLowerCase().includes(q);
      const matchAbha = patient.abha_id?.toLowerCase().includes(q);
      const matchComplaint = patient.chief_complaint?.toLowerCase().includes(q);
      return matchName || matchToken || matchAbha || matchComplaint;
    }
    return true;
  });

  const waitingCount = filteredQueue.filter(p => p.status === 'Waiting').length;
  const inConsultCount = filteredQueue.filter(p => p.status === 'In Consultation').length;
  const emergencyCount = filteredQueue.filter(p => p.priority === 'Emergency' && p.status === 'Waiting').length;

  return (
    <div className={`space-y-6 animate-fade-in pb-16 ${tvMode ? 'bg-slate-900 text-white min-h-screen p-6 -m-6' : ''}`}>
      
      {/* Header & Controls */}
      <div className={`rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        tvMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-hospital-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{t.navQueue}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">
            {t.queueTitle}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {t.queueSubtitle}
          </p>
        </div>

        {/* Mode Toggle & Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold rounded-lg border border-red-200">
              {emergencyCount} EMG
            </span>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200">
              {waitingCount} {lang === 'te' ? "వేచి ఉన్నారు" : "Waiting"}
            </span>
          </div>

          <button
            onClick={() => setTvMode(!tvMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              tvMode 
                ? 'bg-hospital-600 text-white border-hospital-500' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>{tvMode ? "Exit TV Display" : "Waiting Hall TV Mode"}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`rounded-2xl p-4 border shadow-sm grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 ${
        tvMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
      }`}>
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
              tvMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className={`w-full py-2 px-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
              tvMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'All' ? t.filterDepartment : d}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className={`w-full py-2 px-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-hospital-500 ${
              tvMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="All">{t.filterPriority}</option>
            <option value="Emergency">🚨 Emergency (Red)</option>
            <option value="Urgent">⚠️ Urgent (Yellow)</option>
            <option value="Routine">✅ Routine (Green)</option>
          </select>
        </div>
      </div>

      {/* Prioritized Patient Queue List */}
      <div className="space-y-3">
        {filteredQueue.map((patient, index) => {
          const isEmergency = patient.priority === 'Emergency';
          const isUrgent = patient.priority === 'Urgent';
          const isInConsult = patient.status === 'In Consultation';
          const isCompleted = patient.status === 'Completed';

          const cardStyles = isEmergency 
            ? 'border-l-4 border-l-red-600 bg-red-50/40 border-red-200' 
            : isUrgent 
            ? 'border-l-4 border-l-amber-500 bg-amber-50/30 border-amber-200' 
            : 'border-l-4 border-l-emerald-600 bg-emerald-50/20 border-slate-200';

          return (
            <div
              key={patient.id}
              className={`rounded-2xl p-4 md:p-5 border shadow-sm transition hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                tvMode ? 'bg-slate-800 border-slate-700 text-white' : `bg-white ${cardStyles}`
              }`}
            >
              
              {/* Left Column: Token + Patient Info */}
              <div className="flex items-start gap-4">
                {/* Token Badge */}
                <div className={`flex flex-col items-center justify-center min-w-[85px] p-2.5 rounded-xl text-center shadow-sm font-mono ${
                  isEmergency ? 'bg-red-600 text-white' :
                  isUrgent ? 'bg-amber-500 text-white' :
                  'bg-emerald-600 text-white'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">
                    #{index + 1}
                  </span>
                  <span className="text-base md:text-lg font-black tracking-tight">
                    {patient.token_number}
                  </span>
                  <span className="text-[9px] uppercase font-bold mt-0.5">
                    {lang === 'te' ? patient.triage?.priority_te : patient.priority}
                  </span>
                </div>

                {/* Patient Information */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                      {patient.name}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      {patient.age}y • {patient.gender}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {patient.department}
                    </span>
                    {patient.is_overridden && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200" title={`Reason: ${patient.override_reason}`}>
                        OVERRIDE: {patient.override_by}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <strong className="text-slate-700">Chief Complaint:</strong>
                    <span>{patient.chief_complaint}</span>
                    <span className="text-slate-400 font-mono">({patient.duration})</span>
                  </div>

                  {/* Vitals Summary Pill */}
                  {patient.vitals && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                      {patient.vitals.spo2 && (
                        <span className={`px-1.5 py-0.5 rounded border ${
                          patient.vitals.spo2 < 90 ? 'bg-red-100 text-red-800 border-red-300 font-bold' : 'bg-slate-100 border-slate-200'
                        }`}>
                          SpO2: {patient.vitals.spo2}%
                        </span>
                      )}
                      {patient.vitals.heart_rate && (
                        <span className={`px-1.5 py-0.5 rounded border ${
                          patient.vitals.heart_rate >= 130 ? 'bg-red-100 text-red-800 border-red-300 font-bold' : 'bg-slate-100 border-slate-200'
                        }`}>
                          HR: {patient.vitals.heart_rate} bpm
                        </span>
                      )}
                      {patient.vitals.systolic_bp && (
                        <span className="px-1.5 py-0.5 rounded border bg-slate-100 border-slate-200">
                          BP: {patient.vitals.systolic_bp}/{patient.vitals.diastolic_bp}
                        </span>
                      )}
                      {patient.vitals.pain_score > 0 && (
                        <span className={`px-1.5 py-0.5 rounded border ${
                          patient.vitals.pain_score >= 8 ? 'bg-red-100 text-red-800 border-red-300 font-bold' : 'bg-slate-100 border-slate-200'
                        }`}>
                          Pain: {patient.vitals.pain_score}/10
                        </span>
                      )}
                    </div>
                  )}

                  {/* Assigned Room */}
                  <div className="text-xs text-hospital-800 font-semibold pt-1 flex items-center gap-1">
                    <span>📍 {patient.assigned_room}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Operational Staff Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                
                {/* Status Indicator */}
                <div className="text-right sm:text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    isInConsult ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse' :
                    isCompleted ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{patient.status}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Registered: {new Date(patient.registered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Action Buttons */}
                {!tvMode && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Call Patient */}
                    <button
                      onClick={() => onCallPatient(patient)}
                      title="Play hospital announcement chime for this patient"
                      className="px-3 py-1.5 bg-hospital-50 hover:bg-hospital-100 text-hospital-800 border border-hospital-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-hospital-600" />
                      <span>{t.actionCall}</span>
                    </button>

                    {/* Status Flow Buttons */}
                    {patient.status === 'Waiting' && (
                      <button
                        onClick={() => onUpdateStatus(patient.id, 'In Consultation')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                      >
                        {t.actionStart}
                      </button>
                    )}

                    {patient.status === 'In Consultation' && (
                      <button
                        onClick={() => onUpdateStatus(patient.id, 'Completed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                      >
                        {t.actionComplete}
                      </button>
                    )}

                    {/* Staff Override */}
                    <button
                      onClick={() => onOpenOverride(patient)}
                      title="Override triage priority"
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      {t.actionOverride}
                    </button>

                    {/* Print Slip */}
                    <button
                      onClick={() => onSelectPatient(patient)}
                      title="View & Print OPD Token"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>

            </div>
          );
        })}

        {filteredQueue.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Patients in Current Filter</h3>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or register a new patient.</p>
          </div>
        )}
      </div>

    </div>
  );
}
