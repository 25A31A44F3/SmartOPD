import React, { useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldAlert, Printer, Users, 
  ArrowRight, UserPlus, HeartPulse, Building2, Clock, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsPage({ 
  patient, 
  onPrintToken, 
  onNavigate, 
  onOpenOverride,
  lang = 'en', 
  t 
}) {
  useEffect(() => {
    // Subtle congratulatory/token-issued confetti for smooth UX
    if (patient) {
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-700">No Patient Assessment Selected</h2>
        <p className="text-xs text-slate-500">Please register a patient or select a patient from the queue.</p>
        <button
          onClick={() => onNavigate('register')}
          className="px-4 py-2 bg-hospital-700 text-white rounded-xl text-xs font-bold"
        >
          {t.quickRegister}
        </button>
      </div>
    );
  }

  const triage = patient.triage || {};
  const isEmergency = patient.priority === 'Emergency';
  const isUrgent = patient.priority === 'Urgent';

  const theme = isEmergency ? {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-950',
    badge: 'bg-red-600 text-white',
    ring: 'ring-red-200'
  } : isUrgent ? {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-950',
    badge: 'bg-amber-500 text-white',
    ring: 'ring-amber-200'
  } : {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-950',
    badge: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-200'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Top Notice */}
      <div className="bg-hospital-900 text-white rounded-2xl p-6 shadow-md border border-hospital-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-hospital-300 font-bold uppercase tracking-wider mb-1">
            {t.tokenGenerated}
          </div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <span>{t.triageResultsTitle}</span>
            <span className="font-mono text-hospital-300">#{patient.token_number}</span>
          </h1>
          <p className="text-xs text-hospital-200 mt-1">
            {lang === 'te' 
              ? "రోగి వివరాలు మరియు వైటల్ సంకేతాల ఆధారంగా ప్రాధాన్యత వర్గీకరణ పూర్తయింది."
              : "Rule-based risk stratification completed. Patient automatically slotted into priority queue."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => onPrintToken(patient)}
            className="flex items-center gap-2 bg-white text-hospital-900 hover:bg-hospital-50 px-4 py-2 rounded-xl text-xs font-bold shadow transition"
          >
            <Printer className="w-4 h-4 text-hospital-700" />
            <span>{t.printToken}</span>
          </button>
        </div>
      </div>

      {/* Prominent Mandatory Clinical Verification Warning Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 md:p-5 text-amber-950 shadow-sm flex items-start gap-3.5">
        <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-amber-900">
            ⚠️ {t.clinicalNoticeTitle}
          </h2>
          <p className="text-xs leading-relaxed text-amber-900">
            {t.clinicalNoticeBody}
          </p>
          <div className="text-[11px] font-semibold text-amber-800 pt-1 flex items-center gap-1.5">
            <span>• If clinical impression differs from algorithmic output:</span>
            <button
              onClick={() => onOpenOverride(patient)}
              className="text-hospital-800 underline font-bold hover:text-hospital-950"
            >
              Click here to Apply Staff Priority Override
            </button>
          </div>
        </div>
      </div>

      {/* Hero Provisional Priority Card */}
      <div className={`rounded-3xl p-6 md:p-8 border-2 shadow-lg ${theme.bg} ${theme.border} space-y-6`}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest opacity-70 block mb-1">
              {lang === 'te' ? "ప్రతిపాదిత త్రయాజ్ కేటగిరీ" : "PROVISIONAL TRIAGE CLASSIFICATION"}
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-2xl md:text-4xl font-black px-4 py-1.5 rounded-2xl ${theme.badge} shadow`}>
                {lang === 'te' ? patient.triage?.priority_te : patient.priority.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-slate-600 font-mono">
                (Risk Score: {patient.triage?.score || 0}/15)
              </span>
            </div>
            {patient.is_overridden && (
              <div className="mt-2 text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg inline-block border border-purple-200">
                Staff Override: Changed by {patient.override_by} (Reason: {patient.override_reason})
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-black/10 text-right sm:text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
              {t.assignedStation}
            </span>
            <div className="text-sm md:text-base font-extrabold text-slate-900 mt-0.5">
              {patient.assigned_room}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Est. Initial Assessment: <strong className="text-slate-800">~{patient.estimated_wait_minutes} mins</strong>
            </div>
          </div>
        </div>

        {/* Patient Demographics & Presenting Complaint Summary */}
        <div className="bg-white/90 rounded-2xl p-4 border border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500">{t.fullName}:</span>
            <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
            <div className="text-slate-500 font-mono">{patient.age} Yrs • {patient.gender}</div>
          </div>
          <div>
            <span className="text-slate-500">{t.department}:</span>
            <div className="font-semibold text-slate-900">{patient.department}</div>
            <div className="text-slate-500">From: {patient.village_city || 'Local'}</div>
          </div>
          <div>
            <span className="text-slate-500">{t.chiefComplaint}:</span>
            <div className="font-semibold text-slate-900">{patient.chief_complaint}</div>
            <div className="text-slate-500">Duration: {patient.duration}</div>
          </div>
        </div>

        {/* Transparent Rule Justification Section */}
        <div className="bg-white/90 rounded-2xl p-5 border border-black/10 space-y-3 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-hospital-600" />
            <span>Transparent Algorithmic Demonstration Rules</span>
          </h2>
          <p className="text-slate-700 leading-relaxed font-medium">
            {lang === 'te' ? patient.triage?.explanation_te : patient.triage?.explanation}
          </p>

          {/* Triggers Breakdown */}
          {patient.triage?.risk_factors?.length > 0 && (
            <div className="pt-2 border-t space-y-1">
              <span className="font-bold text-red-700 block">Identified Red-Flag Triggers:</span>
              <ul className="space-y-1 text-red-900">
                {patient.triage.risk_factors.map((rf, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vitals Warnings */}
          {patient.triage?.vital_alerts?.length > 0 && (
            <div className="pt-2 border-t space-y-1">
              <span className="font-bold text-amber-800 block">Abnormal Vital Sign Warnings:</span>
              <ul className="space-y-1 text-amber-900">
                {patient.triage.vital_alerts.map((va, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{va}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      {/* Navigation & Action Buttons */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onOpenOverride(patient)}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
        >
          {t.actionOverride}
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('register')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.registerAnother}</span>
          </button>
          <button
            onClick={() => onNavigate('queue')}
            className="flex items-center gap-2 px-5 py-2.5 bg-hospital-700 hover:bg-hospital-800 text-white rounded-xl text-xs font-bold shadow transition"
          >
            <Users className="w-4 h-4" />
            <span>{t.proceedToQueue}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
