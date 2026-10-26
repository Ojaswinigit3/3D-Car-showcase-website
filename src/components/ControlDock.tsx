import React, { useEffect, useState } from 'react';
import { Eye, Layers, Orbit, Play, RotateCcw, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ControlDockProps {
  activeChapter: number;
  manualExplosion: number | null;
  onChangeExplosion: (val: number | null) => void;
  xrayOverride: boolean;
  onToggleXray: () => void;
  freeOrbitEnabled: boolean;
  onToggleFreeOrbit: () => void;
  caliperColor: 'blue' | 'red';
  onChangeCaliperColor: (color: 'blue' | 'red') => void;
  bodyFinish: 'carbon' | 'obsidian' | 'argent';
  onChangeBodyFinish: (finish: 'carbon' | 'obsidian' | 'argent') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onReplayFilm: () => void;
  hiddenDuringFilm: boolean;
}

/**
 * Unified Bottom Control Dock with Cinema/Zen Mode Collapse Drawer (Keyboard `H`)
 * Keeps the central 3D viewport 100% unobstructed and avoids CSS backdrop-filter
 * over active WebGL per Three.js Skill §4.1 & §5.
 */
export const ControlDock: React.FC<ControlDockProps> = ({
  activeChapter,
  manualExplosion,
  onChangeExplosion,
  xrayOverride,
  onToggleXray,
  freeOrbitEnabled,
  onToggleFreeOrbit,
  caliperColor,
  onChangeCaliperColor,
  bodyFinish,
  onChangeBodyFinish,
  isMuted,
  onToggleMute,
  onReplayFilm,
  hiddenDuringFilm,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (hiddenDuringFilm) return null;

  const effectiveExplosionPercent =
    manualExplosion !== null
      ? Math.round(manualExplosion * 100)
      : activeChapter === 4 || activeChapter === 5
      ? 88
      : 0;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94vw] max-w-[940px] pointer-events-none flex flex-col items-center"
      aria-label="3D Stage Controls Dock"
    >
      {/* Collapse / Expand Cinema Zen Mode Toggle */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playTick(540);
          setCollapsed((c) => !c);
        }}
        className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 bg-[#0a0b0e] border border-white/15 border-b-0 text-[11px] font-mono tracking-wider text-[#c9ccd1] hover:text-white transition-colors whitespace-nowrap shrink-0"
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-[#00b7ff]" />
            <span>Show Controls (H)</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-[#c8102e]" />
            <span>Hide Controls (H)</span>
          </>
        )}
      </button>

      {/* Main Unified Dock Bar */}
      <div
        className={`pointer-events-auto w-full bg-[#08090c] border border-white/15 px-4 py-3 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          collapsed ? 'translate-y-[140%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 1. Exploded View Slider */}
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#00b7ff] shrink-0" />
            <label
              htmlFor="explosion-slider"
              className="text-xs font-medium text-[#c9ccd1] whitespace-nowrap shrink-0"
            >
              Explode
            </label>
            <input
              id="explosion-slider"
              type="range"
              min={0}
              max={100}
              value={effectiveExplosionPercent}
              onChange={(e) => onChangeExplosion(Number(e.target.value) / 100)}
              className="w-24 sm:w-28 accent-[#00b7ff] cursor-pointer h-1.5 bg-white/15"
            />
            <span className="text-xs font-mono tabular-nums text-[#f5f5f7] w-9 text-right shrink-0">
              {effectiveExplosionPercent}%
            </span>
            {manualExplosion !== null && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(480);
                  onChangeExplosion(null);
                }}
                title="Sync explosion with scroll"
                className="text-[11px] font-mono text-[#c9ccd1] hover:text-white flex items-center gap-1 px-1.5 py-0.5 border border-white/15 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                Auto
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-white/10 hidden md:block" />

          {/* 2. X-Ray Blueprint & Free 360 Orbit Toggles */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTick(620);
                onToggleXray();
              }}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                xrayOverride
                  ? 'bg-[#00b7ff]/20 border-[#00b7ff] text-white'
                  : 'bg-[#101217] border-white/10 text-[#c9ccd1] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#00b7ff]" />
              X-Ray Wireframe
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playTick(620);
                onToggleFreeOrbit();
              }}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                freeOrbitEnabled || activeChapter === 9
                  ? 'bg-[#c8102e]/20 border-[#c8102e] text-white'
                  : 'bg-[#101217] border-white/10 text-[#c9ccd1] hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5 text-[#c8102e]" />
              {freeOrbitEnabled || activeChapter === 9 ? '360° Orbit Active' : 'Unlock 360°'}
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 hidden lg:block" />

          {/* 3. Body Finish & Brake Caliper Swatches */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#101217] border border-white/10 p-0.5">
              {(['carbon', 'obsidian', 'argent'] as const).map((finish) => (
                <button
                  key={finish}
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(700);
                    onChangeBodyFinish(finish);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                    bodyFinish === finish
                      ? 'bg-white text-[#050505]'
                      : 'text-[#c9ccd1] hover:text-white'
                  }`}
                >
                  {finish}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#101217] border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(720);
                  onChangeCaliperColor('blue');
                }}
                className={`px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  caliperColor === 'blue'
                    ? 'bg-[#00b7ff] text-[#050505]'
                    : 'text-[#c9ccd1] hover:text-white'
                }`}
              >
                Blue Caliper
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(720);
                  onChangeCaliperColor('red');
                }}
                className={`px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  caliperColor === 'red'
                    ? 'bg-[#c8102e] text-white'
                    : 'text-[#c9ccd1] hover:text-white'
                }`}
              >
                Red Caliper
              </button>
            </div>
          </div>

          {/* 4. Audio & Replay Film */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMute}
              className="px-2.5 py-1.5 text-xs font-medium bg-[#101217] border border-white/10 text-[#c9ccd1] hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              aria-label={isMuted ? 'Unmute W16 & Film Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#c9ccd1]" />
                  <span>Sound Off</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#00b7ff]" />
                  <span>W16 Audio</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReplayFilm}
              className="px-2.5 py-1.5 text-xs font-medium bg-[#101217] border border-white/10 text-[#c9ccd1] hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 text-[#c8102e]" />
              <span>Replay Film</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
