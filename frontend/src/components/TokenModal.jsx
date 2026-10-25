import React from 'react';
import { X, Printer, CheckCircle, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';

export default function TokenModal({ patient, onClose, lang = 'en', t }) {
  if (!patient) return null;

  const priorityStyles = {
    Emergency: {
      badge: 'bg-red-600 text-white',
      border: 'border-red-500',
      light: 'bg-red-50 text-red-950',
      tag: lang === 'te' ? 'అత్యవసరము (EMERGENCY)' : 'EMERGENCY (RED)'
    },
    Urgent: {
      badge: 'bg-amber-500 text-white',
      border: 'border-amber-400',
      light: 'bg-amber-50 text-amber-950',
      tag: lang === 'te' ? 'తక్షణము (URGENT)' : 'URGENT (YELLOW)'
    },
    Routine: {
      badge: 'bg-emerald-600 text-white',
      border: 'border-emerald-500',
      light: 'bg-emerald-50 text-emerald-950',
      tag: lang === 'te' ? 'సాధారణము (ROUTINE)' : 'ROUTINE (GREEN)'
    }
  };

  const style = priorityStyles[patient.priority] || priorityStyles.Routine;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-fade-in my-8">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-hospital-400" />
            <span className="font-semibold text-sm">
              {lang === 'te' ? "ఓపీడీ త్రయాజ్ టోకెన్ స్లిప్" : "OPD Triage Token Slip"}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable OPD Slip Body */}
        <div id="opd-token-print-area" className="p-6 text-slate-800">
          
          {/* Hospital Official Header */}
          <div className="text-center border-b pb-4 mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Department of Health & Family Welfare
            </div>
            <h2 className="text-lg font-bold text-hospital-950 mt-0.5">
              {lang === 'te' ? "సర్వజన ప్రభుత్వ ఆసుపత్రి" : "GOVERNMENT GENERAL HOSPITAL"}
            </h2>
            <div className="text-xs text-slate-600">
              District Civil Hospital & Medical College Campus
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              SmartOPD Electronic Triage & Queue Management
            </div>
          </div>

          {/* Token Number Card */}
          <div className={`p-4 rounded-xl border-2 ${style.border} ${style.light} text-center mb-4 shadow-sm`}>
            <div className="text-xs uppercase font-bold tracking-widest text-slate-600 mb-1">
              {lang === 'te' ? "ఓపీడీ టోకెన్ సంఖ్య" : "OPD TOKEN NUMBER"}
            </div>
            <div className="text-4xl font-extrabold tracking-tight font-mono">
              {patient.token_number}
            </div>
            <div className="mt-2 inline-block">
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${style.badge}`}>
                {style.tag}
              </span>
            </div>
            <div className="text-xs font-semibold mt-2 text-slate-700">
              {lang === 'te' ? "కేటాయించిన గది / విభాగం:" : "Assigned Station:"} <span className="font-bold underline text-hospital-900">{patient.assigned_room}</span>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">{lang === 'te' ? "రోగి పేరు:" : "Patient Name:"}</span>
                <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
              </div>
              <div>
                <span className="text-slate-500">{lang === 'te' ? "వయస్సు / లింగం:" : "Age / Gender:"}</span>
                <div className="font-semibold text-slate-900">{patient.age} Yrs / {patient.gender}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t pt-2">
              <div>
                <span className="text-slate-500">{lang === 'te' ? "ఆభా ఐడీ:" : "ABHA / MRN ID:"}</span>
                <div className="font-mono text-slate-800">{patient.abha_id || "N/A (General)"}</div>
              </div>
              <div>
                <span className="text-slate-500">{lang === 'te' ? "నమోదు సమయం:" : "Reg Time:"}</span>
                <div className="font-mono text-slate-800">
                  {new Date(patient.registered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="border-t pt-2">
              <span className="text-slate-500">{lang === 'te' ? "ప్రధాన సమస్య:" : "Chief Complaint:"}</span>
              <div className="font-medium text-slate-900">{patient.chief_complaint} ({patient.duration})</div>
            </div>
          </div>

          {/* Vitals Summary Pill Grid */}
          {patient.vitals && (
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">
                {lang === 'te' ? "నమోదైన వైటల్స్ (Frontline Vitals):" : "Recorded Vital Signs:"}
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                <div className="bg-white border rounded p-1">
                  <div className="text-slate-400">HR</div>
                  <div className="font-bold">{patient.vitals.heart_rate || '-'} bpm</div>
                </div>
                <div className="bg-white border rounded p-1">
                  <div className="text-slate-400">BP</div>
                  <div className="font-bold">
                    {patient.vitals.systolic_bp && patient.vitals.diastolic_bp 
                      ? `${patient.vitals.systolic_bp}/${patient.vitals.diastolic_bp}` 
                      : '-'}
                  </div>
                </div>
                <div className="bg-white border rounded p-1">
                  <div className="text-slate-400">SpO2</div>
                  <div className="font-bold text-hospital-700">{patient.vitals.spo2 ? `${patient.vitals.spo2}%` : '-'}</div>
                </div>
                <div className="bg-white border rounded p-1">
                  <div className="text-slate-400">Temp</div>
                  <div className="font-bold">{patient.vitals.temperature_f ? `${patient.vitals.temperature_f}°F` : '-'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Barcode & Mock QR Area */}
          <div className="flex items-center justify-between border-t border-dashed pt-3 pb-2 text-[10px] text-slate-500">
            <div>
              <div className="font-mono font-bold tracking-widest text-slate-800 text-xs">
                |||| | |||||| || ||||| |||||||
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Verification Hash: {patient.token_number}-GOV-IN
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded border">
              <QrCode className="w-6 h-6 text-slate-700" />
              <span className="text-[9px] font-mono leading-tight">
                Scan at<br />Counter
              </span>
            </div>
          </div>

          {/* Mandatory verification disclaimer */}
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-900 flex items-start gap-1.5 leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>{lang === 'te' ? "వైద్య సిబ్బందికి సూచన:" : "Notice to Medical Staff:"}</strong>{" "}
              {lang === 'te' 
                ? "ఇది కంప్యూటర్ త్రయాజ్ వర్గీకరణ. చికిత్సకు ముందు నర్సు / వైద్యులు రోగిని పరీక్షించి ప్రాధాన్యతను ధృవీకరించాలి."
                : "Algorithmic triage recommendation for queue pacing. Clinical staff verification is mandatory before treatment."}
            </span>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="bg-slate-50 px-6 py-3 border-t flex items-center justify-end gap-2.5 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            {lang === 'te' ? "మూసివేయి" : "Close"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-hospital-700 hover:bg-hospital-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'te' ? "స్లిప్ ప్రింట్ చేయండి" : "Print OPD Slip"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
