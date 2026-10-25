import React from 'react';
import { 
  Users, AlertCircle, Clock, CheckCircle2, ShieldAlert, ArrowRight,
  Activity, TrendingUp, Building2, UserPlus, FileCheck, Stethoscope
} from 'lucide-react';

export default function DashboardPage({ 
  stats, 
  queue = [], 
  onNavigate, 
  onCallPatient, 
  onSelectPatient, 
  lang = 'en', 
  t 
}) {
  const waitingPatients = queue.filter(p => p.status === 'Waiting');
  const inConsultPatients = queue.filter(p => p.status === 'In Consultation');
  const emergencyQueue = queue.filter(p => p.priority === 'Emergency' && p.status === 'Waiting');

  // Priority breakdown
  const emergencyCount = stats?.emergency_cases || 0;
  const urgentCount = stats?.urgent_cases || 0;
  const routineCount = stats?.routine_cases || 0;
  const totalCount = stats?.total_patients || 1;

  const emgPercent = Math.round((emergencyCount / totalCount) * 100);
  const urgPercent = Math.round((urgentCount / totalCount) * 100);
  const rntPercent = Math.max(0, 100 - emgPercent - urgPercent);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Hero Welcome & Emergency Callout */}
      <div className="bg-gradient-to-r from-hospital-900 via-hospital-800 to-hospital-950 rounded-2xl text-white p-6 md:p-8 shadow-xl border border-hospital-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-hospital-700/60 text-hospital-200 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-hospital-600">
              <Building2 className="w-3.5 h-3.5 text-hospital-300" />
              <span>{t.hospitalName} • {lang === 'te' ? "ఓపీడీ త్రయాజ్ కంట్రోల్" : "OPD Triage Control Desk"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t.appTagline}
            </h1>
            <p className="text-hospital-200 text-sm mt-1 max-w-2xl">
              {lang === 'te' 
                ? "ప్రభుత్వ ఆసుపత్రులలో రద్దీని క్రమబద్ధీకరించడానికి మరియు ప్రాణాపాయంలో ఉన్న రోగులకు తక్షణ ప్రాధాన్యత కల్పించడానికి రూపొందించబడింది."
                : "Rapid risk-stratified intake and queue dispatching designed to prevent critical delays in overloaded government civil hospitals."}
            </p>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-2 bg-hospital-600 hover:bg-hospital-500 text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.quickRegister}</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition backdrop-blur-sm"
            >
              <Users className="w-4 h-4" />
              <span>{t.navQueue}</span>
            </button>
          </div>
        </div>

        {/* Emergency Alert Banner if red cases exist */}
        {emergencyQueue.length > 0 && (
          <div className="mt-6 bg-red-600/90 border border-red-400 rounded-xl p-3.5 text-white flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-red-700 rounded-lg font-black text-sm">
                !
              </div>
              <div>
                <div className="text-sm font-bold">
                  {emergencyQueue.length} {lang === 'te' ? "అత్యవసర కేసులు వేచి ఉన్నాయి (Red Zone)" : "Emergency Cases Awaiting Resuscitation!"}
                </div>
                <div className="text-xs text-red-100">
                  {emergencyQueue.map(p => `${p.name} (${p.token_number})`).join(', ')}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('queue')}
              className="bg-white text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-red-50 flex items-center gap-1"
            >
              <span>{lang === 'te' ? "క్యూ చూడండి" : "Prioritize"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Registered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.totalPatients}</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.total_patients ?? 0}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Today's Footfall
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-hospital-50 border border-hospital-200 flex items-center justify-center text-hospital-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Currently Waiting */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.waitingPatients}</span>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">{stats?.waiting_patients ?? 0}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              In consultation: <strong className="text-slate-700">{stats?.in_consultation ?? 0}</strong>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Emergency Cases (Red) */}
        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-600" />
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{t.emergencyCases}</span>
            <div className="text-3xl font-extrabold text-red-700 mt-1">{stats?.emergency_cases ?? 0}</div>
            <span className="text-[11px] text-red-600 font-semibold mt-1 block">
              Priority 1 Immediate Care
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6 animate-pulse-fast" />
          </div>
        </div>

        {/* Completed Visits */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.completedConsultations}</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{stats?.completed_patients ?? 0}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Avg Wait: <strong className="text-slate-700">~{stats?.avg_wait_time_minutes ?? 15}m</strong>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Two Column Layout: Triage Priority Distribution & Department Load */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Triage Priority Distribution Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-hospital-600" />
              <span>{t.priorityDistribution}</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Ratio</span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${emgPercent}%` }} 
              className="bg-red-600 transition-all duration-500" 
              title={`Emergency: ${emergencyCount}`} 
            />
            <div 
              style={{ width: `${urgPercent}%` }} 
              className="bg-amber-500 transition-all duration-500" 
              title={`Urgent: ${urgentCount}`} 
            />
            <div 
              style={{ width: `${rntPercent}%` }} 
              className="bg-emerald-600 transition-all duration-500" 
              title={`Routine: ${routineCount}`} 
            />
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <span className="font-bold text-red-900">{t.priorityEmergency} (Tier 1)</span>
              </div>
              <div className="font-mono font-bold text-red-800 text-sm">
                {emergencyCount} ({emgPercent}%)
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-900">{t.priorityUrgent} (Tier 2)</span>
              </div>
              <div className="font-mono font-bold text-amber-800 text-sm">
                {urgentCount} ({urgPercent}%)
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span className="font-bold text-emerald-900">{t.priorityRoutine} (Tier 3)</span>
              </div>
              <div className="font-mono font-bold text-emerald-800 text-sm">
                {routineCount} ({rntPercent}%)
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-tight">
            ℹ️ {lang === 'te' 
              ? "అత్యవసర (Red) కేసులు మొదట స్వయంచాలకంగా పిలవబడతాయి. సాధారణ కేసులు సమయ ప్రాతిపదికన నడుస్తాయి."
              : "Emergency (Red) cases are automatically placed at the head of queue lines. FIFO rules apply within each tier."}
          </div>
        </div>

        {/* Live Queue Monitor (Top Priority Patients) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-hospital-600" />
                <span>{t.recentQueue}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'te' ? "తక్షణ ప్రాధాన్యత కలిగిన రోగుల ప్రత్యక్ష జాబితా" : "Immediate prioritized queue snapshot"}
              </p>
            </div>
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-800 flex items-center gap-1"
            >
              <span>{t.viewAllQueue}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Queue Snapshot Items */}
          <div className="divide-y divide-slate-100">
            {waitingPatients.slice(0, 5).map((patient, idx) => (
              <div 
                key={patient.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono text-center min-w-[70px] ${
                    patient.priority === 'Emergency' ? 'bg-red-600 text-white shadow-sm' :
                    patient.priority === 'Urgent' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {patient.token_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({patient.age}y / {patient.gender[0]})</span>
                      {patient.is_overridden && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                          OVERRIDDEN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 truncate max-w-md">
                      {patient.chief_complaint}
                    </div>
                    <div className="text-[11px] text-hospital-700 font-medium">
                      📍 {patient.assigned_room}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onCallPatient(patient)}
                    className="px-3 py-1.5 bg-hospital-50 hover:bg-hospital-100 text-hospital-700 border border-hospital-200 rounded-lg text-xs font-semibold transition"
                  >
                    {t.actionCall}
                  </button>
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    {t.printToken}
                  </button>
                </div>
              </div>
            ))}

            {waitingPatients.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm">
                No patients currently waiting in queue.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Hospital Departments Load Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-hospital-600" />
          <span>{t.departmentLoad}</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats?.department_load && Object.entries(stats.department_load).map(([dept, count]) => (
            <div key={dept} className="bg-slate-50 hover:bg-hospital-50/60 p-3 rounded-xl border border-slate-200 transition">
              <span className="text-[11px] text-slate-500 block truncate font-medium">{dept}</span>
              <div className="text-xl font-bold text-slate-800 mt-1">{count}</div>
              <span className="text-[10px] text-hospital-600 font-semibold">Active cases</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
