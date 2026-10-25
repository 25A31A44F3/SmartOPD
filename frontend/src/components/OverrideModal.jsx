import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, X, Check } from 'lucide-react';

export default function OverrideModal({ patient, onClose, onConfirm, lang = 'en', t }) {
  const [newPriority, setNewPriority] = useState(
    patient?.priority === 'Emergency' ? 'Urgent' : 'Emergency'
  );
  const [reason, setReason] = useState('');
  const [staffName, setStaffName] = useState('Sister Kavitha (Triage RN)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!patient) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError(lang === 'te' ? "కనీసం 5 అక్షరాల వైద్య కారణం రాయండి" : "Please enter a clinical reason (min 5 chars)");
      return;
    }
    if (!staffName.trim()) {
      setError(lang === 'te' ? "సిబ్బంది పేరు నమోదు చేయండి" : "Please enter staff member name");
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm(patient.id, {
        new_priority: newPriority,
        reason: reason.trim(),
        staff_name: staffName.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to override priority");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-fade-in my-8">
        
        {/* Header */}
        <div className="bg-hospital-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-sm">
              {t.overrideTitle}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-hospital-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Patient Header Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-800 text-sm">{patient.name}</span>
              <div className="text-slate-500 font-mono">{patient.token_number} • {patient.age} Y / {patient.gender}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Tier</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                patient.priority === 'Emergency' ? 'bg-red-100 text-red-700' :
                patient.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {patient.priority}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Priority Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.selectNewPriority} *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Emergency', label: lang === 'te' ? 'అత్యవసరము' : 'Emergency', color: 'border-red-500 text-red-700 bg-red-50' },
                { id: 'Urgent', label: lang === 'te' ? 'తక్షణము' : 'Urgent', color: 'border-amber-500 text-amber-800 bg-amber-50' },
                { id: 'Routine', label: lang === 'te' ? 'సాధారణము' : 'Routine', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setNewPriority(opt.id)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border-2 transition ${
                    newPriority === opt.id 
                      ? `${opt.color} shadow-sm ring-2 ring-offset-1 ring-hospital-600` 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.overrideReason} *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.overrideReasonPlaceholder}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500"
              required
            />
          </div>

          {/* Staff Member Name & Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.staffName} *
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder={t.staffNamePlaceholder}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-hospital-500"
              required
            />
          </div>

          {/* Warning notice */}
          <p className="text-[11px] text-slate-500 leading-tight">
            * All priority overrides are permanently logged to the hospital clinical audit trail.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-hospital-700 hover:bg-hospital-800 rounded-lg shadow transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Saving..." : t.confirmOverride}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
