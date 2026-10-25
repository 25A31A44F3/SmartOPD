import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Activity, AlertTriangle, ShieldCheck, HeartPulse, 
  Wind, Droplets, Baby, UserCheck, ArrowRight, Zap, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function TriagePage({ onNavigate, onTransferToRegister, lang = 'en', t }) {
  const [vitals, setVitals] = useState({
    heart_rate: 78,
    systolic_bp: 120,
    diastolic_bp: 80,
    spo2: 98,
    respiratory_rate: 16,
    temperature_f: 98.4,
    blood_glucose: 110,
    pain_score: 2
  });

  const [redFlags, setRedFlags] = useState({
    severe_chest_pain: false,
    severe_respiratory_distress: false,
    altered_consciousness: false,
    active_severe_bleeding: false,
    severe_trauma_head_injury: false,
    acute_stroke_signs: false,
    pediatric_danger_signs: false,
    high_fever_with_stiff_neck: false,
    severe_acute_abdominal_pain: false,
    persistent_uncontrolled_vomiting: false,
    anaphylaxis_signs: false
  });

  const [age, setAge] = useState(45);
  const [chiefComplaint, setChiefComplaint] = useState("Chest tightness and dizziness");
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);

  // Re-assess whenever vitals, flags, or age change
  useEffect(() => {
    let isCancelled = false;
    const runAssessment = async () => {
      try {
        setLoading(true);
        const res = await api.assessTriage({
          vitals,
          red_flags: redFlags,
          age: Number(age) || 30,
          chief_complaint: chiefComplaint || "General triage"
        });
        if (!isCancelled) {
          setAssessment(res);
        }
      } catch (err) {
        console.error("Assessment preview failed:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const timer = setTimeout(runAssessment, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [vitals, redFlags, age, chiefComplaint]);

  const toggleFlag = (flag) => {
    setRedFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const resetAll = () => {
    setVitals({
      heart_rate: 74,
      systolic_bp: 120,
      diastolic_bp: 80,
      spo2: 98,
      respiratory_rate: 16,
      temperature_f: 98.4,
      blood_glucose: 105,
      pain_score: 1
    });
    setRedFlags({
      severe_chest_pain: false,
      severe_respiratory_distress: false,
      altered_consciousness: false,
      active_severe_bleeding: false,
      severe_trauma_head_injury: false,
      acute_stroke_signs: false,
      pediatric_danger_signs: false,
      high_fever_with_stiff_neck: false,
      severe_acute_abdominal_pain: false,
      persistent_uncontrolled_vomiting: false,
      anaphylaxis_signs: false
    });
    setAge(45);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-hospital-600 font-bold text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>{t.navTriage}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
            {lang === 'te' ? "నిర్మాణాత్మక త్రయాజ్ ప్రశ్నాపత్రం & రెడ్-ఫ్లాగ్ చెక్స్" : "Structured Triage Questionnaire & Red-Flag Matrix"}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {lang === 'te' 
              ? "వైటల్స్ లేదా రెడ్-ఫ్లాగ్ లక్షణాలను మార్చడం ద్వారా త్రయాజ్ ఫలితాన్ని ప్రత్యక్షంగా పరిశీలించండి."
              : "Interactive physiological rule simulation. Test emergency, urgent, and routine priority triggers in real time."}
          </p>
        </div>

        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold self-start md:self-center transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Questionnaire & Vitals (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Demographics Strip */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full text-xs p-2 border rounded-lg focus:ring-2 focus:ring-hospital-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Age &lt;= 2 or &gt;= 75 triggers vulnerability bump</span>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Presenting Complaint</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                className="w-full text-xs p-2 border rounded-lg focus:ring-2 focus:ring-hospital-500"
              />
            </div>
          </div>

          {/* Categorized Red Flag Checks */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>Structured Clinical Red-Flag Checklist</span>
              <span className="text-xs text-hospital-600 font-semibold font-mono">Real-Time Evaluation</span>
            </h2>

            {/* Category 1: Cardiovascular & Circulation */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Cardiovascular & Severe Hemorrhage (Level 1)</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'severe_chest_pain', label: t.flagChestPain },
                  { id: 'active_severe_bleeding', label: t.flagBleeding },
                ].map(flag => (
                  <label key={flag.id} className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    redFlags[flag.id] ? 'bg-red-50 border-red-300 text-red-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={redFlags[flag.id]}
                      onChange={() => toggleFlag(flag.id)}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <span>{flag.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category 2: Respiratory & Airway */}
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs font-bold text-hospital-800 uppercase tracking-wider flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" />
                <span>Airway & Respiratory Distress (Level 1)</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'severe_respiratory_distress', label: t.flagBreathing },
                  { id: 'anaphylaxis_signs', label: t.flagAnaphylaxis },
                ].map(flag => (
                  <label key={flag.id} className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    redFlags[flag.id] ? 'bg-red-50 border-red-300 text-red-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={redFlags[flag.id]}
                      onChange={() => toggleFlag(flag.id)}
                      className="mt-0.5 text-hospital-600 focus:ring-hospital-500"
                    />
                    <span>{flag.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category 3: Neurological & Trauma */}
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Neurological & Major Trauma (Level 1)</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'altered_consciousness', label: t.flagConsciousness },
                  { id: 'acute_stroke_signs', label: t.flagStroke },
                  { id: 'severe_trauma_head_injury', label: t.flagTrauma },
                ].map(flag => (
                  <label key={flag.id} className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    redFlags[flag.id] ? 'bg-red-50 border-red-300 text-red-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={redFlags[flag.id]}
                      onChange={() => toggleFlag(flag.id)}
                      className="mt-0.5 text-purple-600 focus:ring-purple-500"
                    />
                    <span>{flag.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category 4: Pediatric & High Risk Acute Symptoms */}
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Baby className="w-3.5 h-3.5" />
                <span>Pediatric & Acute High-Risk Deterioration (Levels 1 & 2)</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'pediatric_danger_signs', label: t.flagPediatric, badge: 'Level 1' },
                  { id: 'high_fever_with_stiff_neck', label: t.flagFeverStiffNeck, badge: 'Level 2' },
                  { id: 'severe_acute_abdominal_pain', label: t.flagAbdominalPain, badge: 'Level 2' },
                  { id: 'persistent_uncontrolled_vomiting', label: t.flagVomiting, badge: 'Level 2' },
                ].map(flag => (
                  <label key={flag.id} className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    redFlags[flag.id] ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={redFlags[flag.id]}
                      onChange={() => toggleFlag(flag.id)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <span>{flag.label}</span>
                      <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-mono">
                        {flag.badge}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Physiological Vitals Sliders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>Physiological Vitals Simulation</span>
              <span className="text-[11px] text-slate-400">Slide or type to test threshold triggers</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* SpO2 */}
              <div className="bg-slate-50 p-3 rounded-xl border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">SpO2 Oxygen Saturation</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    vitals.spo2 < 90 ? 'bg-red-600 text-white' : vitals.spo2 <= 93 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {vitals.spo2}%
                  </span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="100"
                  value={vitals.spo2}
                  onChange={e => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                  className="w-full accent-hospital-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span className="text-red-600 font-bold">&lt; 90% (Critical)</span>
                  <span>90-93% (Sub-optimal)</span>
                  <span className="text-emerald-600">&gt;= 95% (Normal)</span>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="bg-slate-50 p-3 rounded-xl border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Heart Rate / Pulse</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    vitals.heart_rate >= 130 || vitals.heart_rate < 45 ? 'bg-red-600 text-white' : vitals.heart_rate >= 110 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {vitals.heart_rate} bpm
                  </span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="170"
                  value={vitals.heart_rate}
                  onChange={e => setVitals({ ...vitals, heart_rate: Number(e.target.value) })}
                  className="w-full accent-hospital-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span className="text-red-600 font-bold">&lt; 45 or &gt; 130</span>
                  <span>Normal 60-100</span>
                </div>
              </div>

              {/* Systolic BP */}
              <div className="bg-slate-50 p-3 rounded-xl border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Systolic Blood Pressure</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    vitals.systolic_bp < 90 || vitals.systolic_bp >= 200 ? 'bg-red-600 text-white' : vitals.systolic_bp >= 160 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {vitals.systolic_bp} mmHg
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="230"
                  value={vitals.systolic_bp}
                  onChange={e => setVitals({ ...vitals, systolic_bp: Number(e.target.value) })}
                  className="w-full accent-hospital-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span className="text-red-600 font-bold">&lt; 90 Shock | &gt; 200 Crisis</span>
                  <span>Normal 90-120</span>
                </div>
              </div>

              {/* Respiratory Rate */}
              <div className="bg-slate-50 p-3 rounded-xl border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Respiratory Rate</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    vitals.respiratory_rate >= 30 || vitals.respiratory_rate <= 8 ? 'bg-red-600 text-white' : vitals.respiratory_rate >= 22 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {vitals.respiratory_rate} /min
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="45"
                  value={vitals.respiratory_rate}
                  onChange={e => setVitals({ ...vitals, respiratory_rate: Number(e.target.value) })}
                  className="w-full accent-hospital-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span className="text-red-600 font-bold">&gt;= 30 Distress</span>
                  <span>Normal 12-20</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Live Provisional Triage Assessment Card (Sticky) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border-2 border-hospital-200 shadow-lg sticky top-20 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-hospital-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {lang === 'te' ? "లైవ్ త్రయాజ్ నిర్ధారణ" : "Live Triage Decision"}
                </h3>
              </div>
              {loading && <span className="text-[10px] text-hospital-600 animate-pulse font-mono">Evaluating...</span>}
            </div>

            {assessment ? (
              <div className="space-y-4">
                
                {/* Hero Badge */}
                <div className={`p-5 rounded-2xl text-center border-2 shadow-sm ${
                  assessment.priority === 'Emergency' ? 'bg-red-50 border-red-500 text-red-950' :
                  assessment.priority === 'Urgent' ? 'bg-amber-50 border-amber-500 text-amber-950' :
                  'bg-emerald-50 border-emerald-500 text-emerald-950'
                }`}>
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">
                    {lang === 'te' ? "ప్రతిపాదిత ప్రాధాన్యత" : "PROVISIONAL TIER"}
                  </div>
                  <div className="text-2xl font-black tracking-tight">
                    {lang === 'te' ? assessment.priority_te : assessment.priority.toUpperCase()}
                  </div>
                  <div className="mt-1 text-xs font-semibold">
                    Risk Score: {assessment.score}/15
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-700 bg-white/80 py-1 px-2 rounded-lg border border-slate-200">
                    📍 {lang === 'te' ? assessment.suggested_station_te : assessment.suggested_station}
                  </div>
                </div>

                {/* Explanation text */}
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Transparent Rule Justification:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {lang === 'te' ? assessment.explanation_te : assessment.explanation}
                  </p>
                </div>

                {/* Triggers list */}
                {assessment.risk_factors?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Red Flag Triggers:</span>
                    <ul className="text-xs text-red-700 space-y-1">
                      {assessment.risk_factors.map((rf, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Vital alerts */}
                {assessment.vital_alerts?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Vital Alerts:</span>
                    <ul className="text-xs text-amber-800 space-y-1">
                      {assessment.vital_alerts.map((va, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{va}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 leading-tight">
                  ⚠️ <strong>Notice:</strong> Prototype for demonstration queue sorting. All triage assignments must be verified by clinical staff.
                </div>

                {/* Action: Use these values in registration */}
                <button
                  onClick={() => onNavigate('register')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-hospital-700 hover:bg-hospital-800 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <span>Register Patient with These Vitals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Evaluating parameters...
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
