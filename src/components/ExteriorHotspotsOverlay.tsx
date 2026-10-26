import React from 'react';
import { EXTERIOR_HOTSPOTS } from '../config/cinemaConfig';
import { soundEngine } from '../utils/soundEngine';
import { ProjectedPoint2D } from './CanvasStage';

interface ExteriorHotspotsOverlayProps {
  visible: boolean;
  projectedHotspots: Record<string, ProjectedPoint2D>;
  focusedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
}

/**
 * Interactive 3D-Projected Exterior Design Hotspots for Chapter 03.
 * Clicking a hotspot smoothly focuses the 3D camera on that exterior feature.
 */
export const ExteriorHotspotsOverlay: React.FC<ExteriorHotspotsOverlayProps> = ({
  visible,
  projectedHotspots,
  focusedHotspotId,
  onSelectHotspot,
}) => {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {EXTERIOR_HOTSPOTS.map((hs, index) => {
        const pt = projectedHotspots[hs.id];
        if (!pt || !pt.visible) return null;
        const isActive = focusedHotspotId === hs.id;

        return (
          <div
            key={hs.id}
            style={{
              transform: `translate3d(${Math.round(pt.x)}px, ${Math.round(pt.y)}px, 0)`,
            }}
            className="fixed top-0 left-0 -ml-4 -mt-4"
          >
            <button
              type="button"
              onClick={() => {
                soundEngine.playTick(760);
                onSelectHotspot(isActive ? null : hs.id);
              }}
              className={`pointer-events-auto w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[11px] transition-colors ${
                isActive
                  ? 'bg-[#c8102e] border-white text-white'
                  : 'bg-[#06070a]/90 border-[#00b7ff] text-[#f5f5f7] hover:border-white'
              }`}
              aria-label={`Inspect ${hs.title}`}
            >
              0{index + 1}
            </button>

            {isActive && (
              <div className="pointer-events-auto mt-2 -ml-28 w-72 bg-[#08090d] border border-white/20 p-4 shadow-2xl">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#00b7ff] mb-1">
                  <span>{hs.subtitle}</span>
                  <span>{hs.specValue}</span>
                </div>
                <h4 className="font-display text-lg font-semibold text-white mb-1">
                  {hs.title}
                </h4>
                <p className="text-xs text-[#c9ccd1] leading-relaxed mb-3">
                  {hs.description}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(520);
                    onSelectHotspot(null);
                  }}
                  className="px-3 py-1 text-[11px] font-mono border border-white/15 text-[#c9ccd1] hover:text-white whitespace-nowrap shrink-0"
                >
                  Reset Camera View
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
