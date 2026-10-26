import React from 'react';

interface RadialGaugeProps {
  label: string;
  value: number | string;
  unit: string;
  progress: number; // 0..1
  accentColor?: string;
  sublabel?: string;
}

/**
 * High-Precision Automotive Telemetry Radial Gauge (Chapter 07 Performance)
 */
export const RadialGauge: React.FC<RadialGaugeProps> = ({
  label,
  value,
  unit,
  progress,
  accentColor = '#00b7ff',
  sublabel,
}) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  // 270-degree sweep arc (0.75 of circle)
  const arcLength = circumference * 0.75;
  const dashOffset = arcLength * (1 - clamped);

  return (
    <div className="bg-[#08090d]/90 border border-white/10 p-4 flex items-center gap-4">
      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full rotate-[135deg]" viewBox="0 0 108 108">
          <circle
            cx="54"
            cy="54"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="5"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="butt"
          />
          <circle
            cx="54"
            cy="54"
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="5"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            className="transition-all duration-150 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-lg font-semibold tabular-nums text-white leading-none">
            {value}
          </span>
          <span className="font-mono text-[10px] text-[#c9ccd1] mt-1">
            {unit}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-xs font-mono text-[#c9ccd1] truncate">{label}</div>
        {sublabel && (
          <div className="text-[11px] text-[#c9ccd1]/65 mt-1 leading-snug">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};
