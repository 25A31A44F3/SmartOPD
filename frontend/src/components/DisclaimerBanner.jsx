import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner({ lang = 'en', t }) {
  return (
    <aside aria-label="Clinical safety notice" className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong className="font-semibold uppercase tracking-wide mr-1.5 text-amber-950">
              {lang === 'te' ? "ముఖ్యమైన గమనిక:" : "Non-Clinical Prototype:"}
            </strong>
            {lang === 'te' 
              ? "ఇది పరిశోధన మరియు ప్రదర్శన నమూనా మాత్రమే. వాస్తవ చికిత్సకు ముందు వైద్య సిబ్బంది తప్పనిసరిగా రోగిని క్లినికల్‌గా ధృవీకరించాలి."
              : "This is a demonstration triage & queue prototype, not a certified diagnostic device. Frontline clinical verification is strictly mandatory."}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>{lang === 'te' ? "వైద్య ధృవీకరణ అవసరం" : "Verification Mandatory"}</span>
        </div>
      </div>
    </aside>
  );
}
