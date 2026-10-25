import React, { useState, useEffect } from 'react';
import { 
  BarChart3, ShieldCheck, Users, Clock, RotateCcw, Building2, 
  CheckCircle2, AlertTriangle, FileText, ArrowRight, Stethoscope
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPage({ 
  stats, 
  queue = [], 
  onRefresh, 
  onUpdateStatus, 
  onSelectPatient,
  lang = 'en', 
  t 
}) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await api.getAuditLogs();
      setAuditLogs(data || []);
    } catch (e) {
      console.error("Failed to fetch logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm(t.resetConfirm)) return;
    try {
      setResetting(true);
      await api.resetSeedData();
      await onRefresh();
      await fetchLogs();
      setResetSuccessMsg(t.resetSuccess);
      setTimeout(() => setResetSuccessMsg(''), 4000);
    } catch (err) {
      alert("Failed to reset database: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  const counters = [
    { room: "Resuscitation Bay 1 (Red Zone)", doctor: "Dr. K. Srinivas (Emergency Physician)", duty: "Sister Radhika (Triage RN)", status: "Active (2 cases)" },
    { room: "Yellow Zone Observation (Counter 2)", doctor: "Dr. A. Venkat Rao (Critical Care MO)", duty: "Staff Nurse Kavitha", status: "Active (3 cases)" },
    { room: "General Medicine Room 3", doctor: "Dr. Sudha Rani (Civil Surgeon)", duty: "ANM Lakshmi", status: "Active (Routine OPD)" },
    { room: "General Medicine Room 4", doctor: "Dr. B. Mahesh (Medical Officer)", duty: "Health Worker Ravi", status: "Active (Routine OPD)" },
    { room: "Pediatrics Clinic Room 5", doctor: "Dr. Pooja Reddy (Pediatrician)", duty: "Sister Mary", status: "Active (Well Child & Acute)" },
    { room: "Orthopedics & Minor OT Room 6", doctor: "Dr. C. Naveen (Orthopedic Surgeon)", duty: "Dresser Raju", status: "Active (Plaster & Trauma)" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-hospital-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>{t.navAdmin}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
            {t.adminTitle}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {t.adminSubtitle}
          </p>
        </div>

        {/* Database Seed Reset Button */}
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-sm transition disabled:opacity-50 self-start md:self-center"
        >
          <RotateCcw className={`w-4 h-4 text-hospital-600 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? "Resetting..." : t.resetSeedData}</span>
        </button>
      </div>

      {resetSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Total OPD Registrations</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.total_patients ?? 0}</div>
          <span className="text-[10px] text-slate-400">100% locally logged in SQLite</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Currently in Active Queue</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.waiting_patients ?? 0}</div>
          <span className="text-[10px] text-slate-400">Waiting for physician callout</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Staff Priority Overrides</span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">{stats?.overridden_count ?? 0}</div>
          <span className="text-[10px] text-slate-400">Clinical justification logged</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Avg Simulated Wait</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">~{stats?.avg_wait_time_minutes ?? 15}m</div>
          <span className="text-[10px] text-slate-400">Prioritized triage efficiency</span>
        </div>
      </div>

      {/* Doctor & Counter Duty Allocation Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
          <Stethoscope className="w-4 h-4 text-hospital-600" />
          <span>{t.doctorAllocation}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {counters.map((c, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-hospital-950">{c.room}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-slate-700 font-semibold">{c.doctor}</div>
              <div className="text-slate-500 text-[11px]">Nurse: {c.duty}</div>
              <div className="text-[10px] text-hospital-700 bg-hospital-100/70 px-2 py-0.5 rounded font-mono font-semibold inline-block">
                {c.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Status Management Quick Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-hospital-600" />
            <span>Patient Status Management</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Total {queue.length} Patients in System</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
              <tr>
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Manage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{p.token_number}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{p.name} ({p.age}y/{p.gender[0]})</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      p.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                      p.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{p.department}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-700">{p.status}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={p.status}
                      onChange={(e) => onUpdateStatus(p.id, e.target.value)}
                      className="py-1 px-2 border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hospital-500"
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="In Consultation">In Consultation</option>
                      <option value="Completed">Completed</option>
                      <option value="Transferred">Transferred</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triage Decision & Override Clinical Audit Trail */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-hospital-600" />
            <span>{t.triageAuditTrail}</span>
          </h2>
          <button 
            onClick={fetchLogs} 
            className="text-xs text-hospital-600 hover:underline font-semibold"
          >
            Refresh Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Clinical Details / Justification</th>
                <th className="py-2.5 px-3">Authorized Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-800">{log.token_number || '-'}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'PRIORITY_OVERRIDE' ? 'bg-purple-100 text-purple-800' :
                      log.action === 'PATIENT_REGISTERED' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-sans max-w-md truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-2 px-3 text-slate-600 font-sans">{log.staff_name || 'System'}</td>
                </tr>
              ))}

              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                    {loadingLogs ? "Loading audit logs..." : "No audit trail logs recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
