import React from 'react';
import { PART_EXPLOSIONS } from '../config/cinemaConfig';
import { ProjectedPoint2D } from './CanvasStage';

interface ExplodedLeaderOverlayProps {
  visible: boolean;
  projectedLeaders: Record<string, ProjectedPoint2D>;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
}

/**
 * Draws dynamic SVG leader lines and engineering callouts anchored to the
 * live 3D separated part groups during Chapter 04 (Exploded View).
 */
export const ExplodedLeaderOverlay: React.FC<ExplodedLeaderOverlayProps> = ({
  visible,
  projectedLeaders,
  selectedPartId,
  onSelectPart,
}) => {
  if (!visible) return null;

  // Show a curated subset of 8 key structural assemblies simultaneously so the viewport stays crisp
  const primaryDisplayIds = new Set([
    'roof',
    'hood',
    'doorLeft',
    'frontBumper',
    'rearDiffuser',
    'wheelFL',
    'engineBlock',
    'monocoque',
  ]);

  const activeConfigs = PART_EXPLOSIONS.filter(
    (cfg) => primaryDisplayIds.has(cfg.id) && projectedLeaders[cfg.id]?.visible
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden hidden md:block">
      <svg className="w-full h-full">
        {activeConfigs.map((cfg) => {
          const pt = projectedLeaders[cfg.id];
          if (!pt) return null;

          const dx =
            cfg.labelSide === 'left'
              ? -115
              : cfg.labelSide === 'right'
              ? 115
              : cfg.labelSide === 'top'
              ? -65
              : 65;
          const dy =
            cfg.labelSide === 'top'
              ? -75
              : cfg.labelSide === 'bottom'
              ? 75
              : -28;

          const elbowX = pt.x + dx * 0.55;
          const elbowY = pt.y + dy;
          const endX = pt.x + dx;
          const endY = elbowY;
          const isSelected = selectedPartId === cfg.id;

          return (
            <g key={cfg.id}>
              {/* Leader Polyline */}
              <polyline
                points={`${pt.x},${pt.y} ${elbowX},${elbowY} ${endX},${endY}`}
                fill="none"
                stroke={isSelected ? '#c8102e' : '#00b7ff'}
                strokeWidth={isSelected ? 1.6 : 1.1}
                strokeOpacity={isSelected ? 0.95 : 0.65}
              />
              {/* 3D Part Anchor Reticle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={3.5}
                fill="#050505"
                stroke={isSelected ? '#c8102e' : '#00b7ff'}
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>

      {/* Interactive Engineering Callout Cards at Leader Endpoints */}
      {activeConfigs.map((cfg) => {
        const pt = projectedLeaders[cfg.id];
        if (!pt) return null;

        const dx =
          cfg.labelSide === 'left'
            ? -115
            : cfg.labelSide === 'right'
            ? 115
            : cfg.labelSide === 'top'
            ? -65
            : 65;
        const dy =
          cfg.labelSide === 'top'
            ? -75
            : cfg.labelSide === 'bottom'
            ? 75
            : -28;

        const endX = pt.x + dx;
        const endY = pt.y + dy;
        const alignRight = dx < 0;
        const isSelected = selectedPartId === cfg.id;

        return (
          <button
            key={cfg.id}
            type="button"
            onClick={() => onSelectPart(isSelected ? null : cfg.id)}
            style={{
              transform: `translate3d(${Math.round(
                alignRight ? endX - 210 : endX + 8
              )}px, ${Math.round(endY - 18)}px, 0)`,
            }}
            className={`pointer-events-auto fixed top-0 left-0 w-[205px] text-left px-2.5 py-1.5 border transition-colors ${
              isSelected
                ? 'bg-[#0c0e14] border-[#c8102e] text-white'
                : 'bg-[#07080c]/90 border-white/15 text-[#c9ccd1] hover:border-[#00b7ff] hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#00b7ff]">
              <span>{cfg.code}</span>
              <span>·</span>
              <span>CAD-SPEC</span>
            </div>
            <div className="text-xs font-medium text-[#f5f5f7] truncate">
              {cfg.label}
            </div>
            {isSelected && (
              <div className="mt-1 text-[11px] text-[#c9ccd1] leading-snug">
                {cfg.detail}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
