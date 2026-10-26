import React from 'react';
import { FastForward, Volume2, VolumeX } from 'lucide-react';
import { FILM_SHOTS, FILM_TRAILER_DURATION } from '../config/cinemaConfig';
import { soundEngine } from '../utils/soundEngine';

interface OpeningFilmOverlayProps {
  preloaderProgress: number;
  isPreloading: boolean;
  isFilmPlaying: boolean;
  filmTime: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onSkipFilm: () => void;
}

/**
 * Preloader + 25-Second Opening Film Trailer Overlay (Chapter 01).
 * Positions the final "LA VOITURE NOIRE" title in the top studio sky band
 * so it never overlaps the car silhouette.
 */
export const OpeningFilmOverlay: React.FC<OpeningFilmOverlayProps> = ({
  preloaderProgress,
  isPreloading,
  isFilmPlaying,
  filmTime,
  isMuted,
  onToggleMute,
  onSkipFilm,
}) => {
  if (isPreloading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#c9ccd1] mb-3">
            <span>ATELIER MOLSHEIM · FILM STAGE INITIALIZATION</span>
            <span className="tabular-nums text-white">{preloaderProgress}%</span>
          </div>
          <div className="w-full h-[1px] bg-white/15 overflow-hidden">
            <div
              className="h-full bg-[#c8102e] transition-all duration-150 ease-out"
              style={{ width: `${preloaderProgress}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-[#c9ccd1]/60">
            <span>LA VOITURE NOIRE · PIECE UNIQUE</span>
            <span>W16 · 1,500 PS</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isFilmPlaying) return null;

  const activeShot =
    FILM_SHOTS.find((s) => filmTime >= s.startTime && filmTime <= s.endTime) ||
    FILM_SHOTS[FILM_SHOTS.length - 1];

  const isDramaticBlackout = filmTime >= 20.75 && filmTime < 21.35;
  const isFinalReveal = filmTime >= 21.35;
  const filmPercent = Math.min(100, (filmTime / FILM_TRAILER_DURATION) * 100);
  const heroTitle = 'LA VOITURE NOIRE';

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between overflow-hidden film-grain-overlay">
      {/* Brief Dramatic Blackout Before Final Hero Shot */}
      <div
        className={`fixed inset-0 bg-[#050505] transition-opacity duration-300 ${
          isDramaticBlackout ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Shot 01 Red Line Sweep Graphic */}
      {filmTime < 3.4 && (
        <div className="fixed inset-x-0 top-[21vh] flex items-center justify-center">
          <div
            className="h-[1px] bg-[#c8102e] transition-all duration-300"
            style={{
              width: `${Math.min(100, (filmTime / 2.8) * 75)}vw`,
              opacity: filmTime < 2.9 ? 0.9 : 0,
            }}
          />
        </div>
      )}

      {/* Top 2.39:1 Anamorphic Cinema Letterbox Bar */}
      <div className="relative z-10 w-full h-[9.5vh] min-h-[58px] bg-[#050505] border-b border-white/10 px-6 md:px-12 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-4">
          <span className="font-display text-lg tracking-wider font-semibold text-white whitespace-nowrap shrink-0">
            BUGATTI
          </span>
          <span className="text-xs font-mono text-[#c9ccd1]/60 hidden sm:inline">
            ·
          </span>
          <span className="text-xs font-mono text-[#c9ccd1] hidden sm:inline whitespace-nowrap shrink-0">
            THE FILM · 2.39:1 CINEMA EDITION
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMute}
            className="px-3.5 py-1.5 text-xs font-mono border border-white/15 bg-[#0b0c10] text-[#c9ccd1] hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#c9ccd1]" />
                <span>Sound Off (Muted)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#00b7ff]" />
                <span>Sound Active</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTick(600);
              onSkipFilm();
            }}
            className="px-4 py-1.5 text-xs font-mono bg-[#c8102e] text-white hover:bg-[#a50d26] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Upper Frame Band (Above Car Roofline): Final Letter-by-Letter Title Reveal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-5 sm:pt-7 px-6 text-center">
        {isFinalReveal && (
          <div className="max-w-5xl mx-auto">
            <div className="text-[11px] font-mono tracking-[0.28em] text-[#00b7ff] mb-1.5">
              GENEVA MOTOR SHOW · ONE OF ONE
            </div>
            <h1
              className="font-display text-3xl sm:text-5xl md:text-6xl font-semibold tracking-wider text-white"
              aria-label={heroTitle}
            >
              {heroTitle.split('').map((ch, idx) => {
                const revealTime = 21.45 + idx * 0.085;
                const shown = filmTime >= revealTime;
                return (
                  <span
                    key={idx}
                    className="inline-block transition-all duration-500 ease-out"
                    style={{
                      opacity: shown ? 1 : 0,
                      transform: shown ? 'translateY(0px)' : 'translateY(18px)',
                      filter: shown ? 'blur(0px)' : 'blur(6px)',
                    }}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                );
              })}
            </h1>
          </div>
        )}
      </div>

      {/* Bottom 2.39:1 Anamorphic Cinema Letterbox Bar */}
      <div className="relative z-10 w-full h-[9.5vh] min-h-[62px] bg-[#050505] border-t border-white/10 px-6 md:px-12 flex flex-col justify-center pointer-events-auto">
        <div className="flex items-center justify-between text-xs font-mono text-[#c9ccd1] mb-2">
          <div className="flex items-center gap-3 truncate">
            <span className="text-[#c8102e] font-semibold">{activeShot.title}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#c9ccd1]/80 truncate">{activeShot.caption}</span>
          </div>
          <div className="tabular-nums text-white shrink-0 ml-4">
            00:{Math.floor(filmTime).toString().padStart(2, '0')} / 00:25
          </div>
        </div>
        <div className="w-full h-[2px] bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[#c8102e] transition-all duration-100 ease-linear"
            style={{ width: `${filmPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
