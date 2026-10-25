import React from 'react';

export default function VitalBadge({ label, value, unit, normalRange, type }) {
  if (value === null || value === undefined || value === '') return null;

  let status = 'normal'; // normal, abnormal, critical
  const num = parseFloat(value);

  if (type === 'spo2') {
    if (num < 90) status = 'critical';
    else if (num <= 93) status = 'abnormal';
  } else if (type === 'hr') {
    if (num >= 130 || num < 45) status = 'critical';
    else if (num >= 110 || num < 55) status = 'abnormal';
  } else if (type === 'sbp') {
    if (num >= 200 || num < 90) status = 'critical';
    else if (num >= 160 || num < 100) status = 'abnormal';
  } else if (type === 'rr') {
    if (num >= 30 || num <= 8) status = 'critical';
    else if (num >= 22) status = 'abnormal';
  } else if (type === 'temp') {
    if (num >= 103.5 || num < 95.0) status = 'critical';
    else if (num >= 100.5) status = 'abnormal';
  } else if (type === 'pain') {
    if (num >= 8) status = 'critical';
    else if (num >= 5) status = 'abnormal';
  }

  const styles = {
    normal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    abnormal: 'bg-amber-50 text-amber-800 border-amber-300',
    critical: 'bg-rose-50 text-rose-800 border-rose-300 font-bold animate-pulse-fast',
  };

  return (
    <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex flex-col justify-between ${styles[status]}`}>
      <span className="text-[11px] opacity-75 font-medium">{label}</span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-sm font-semibold">{value}</span>
        <span className="text-[10px] opacity-75">{unit}</span>
      </div>
      {normalRange && (
        <span className="text-[9px] opacity-60 mt-0.5">Norm: {normalRange}</span>
      )}
    </div>
  );
}
