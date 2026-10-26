/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  CHAPTERS,
  EXTERIOR_HOTSPOTS,
  FILM_TRAILER_DURATION,
  JOURNEY_LOCATIONS,
  PART_EXPLOSIONS,
  SPEC_TABS,
} from './config/cinemaConfig';
import {
  CanvasStage,
  ProjectedPoint2D,
  TimelineSharedState,
} from './components/CanvasStage';
import { ControlDock } from './components/ControlDock';
import { CustomCursor } from './components/CustomCursor';
import { EnquireModal } from './components/EnquireModal';
import { ExplodedLeaderOverlay } from './components/ExplodedLeaderOverlay';
import { OpeningFilmOverlay } from './components/OpeningFilmOverlay';
import { PhotoCinemaStage } from './components/PhotoCinemaStage';
import { RadialGauge } from './components/RadialGauge';
import { SplitHeadline, SplitParagraph } from './components/SplitTextReveal';
import { soundEngine } from './utils/soundEngine';

gsap.registerPlugin(ScrollTrigger);

const FILM_SESSION_KEY = 'bugatti_lvn_film_played_v1';

export default function App() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloaderProgress, setPreloaderProgress] = useState(0);
  const [isFilmPlaying, setIsFilmPlaying] = useState<boolean>(() => {
    try {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) return false;
      return sessionStorage.getItem(FILM_SESSION_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [filmTime, setFilmTime] = useState(0);

  // Scroll & Chapter UI States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(1);
  const [focusedHotspotId, setFocusedHotspotId] = useState<string | null>(null);
  const [selectedExplodedPartId, setSelectedExplodedPartId] = useState<string | null>('engineBlock');
  const [manualExplosion, setManualExplosion] = useState<number | null>(null);
  const [xrayOverride, setXrayOverride] = useState(false);
  const [freeOrbitEnabled, setFreeOrbitEnabled] = useState(false);
  const [caliperColor, setCaliperColor] = useState<'blue' | 'red'>('blue');
  const [bodyFinish, setBodyFinish] = useState<'carbon' | 'obsidian' | 'argent'>('carbon');
  const [interiorFocus, setInteriorFocus] = useState<'auto' | 'cockpit' | 'w16'>('auto');
  const [activeSpecTab, setActiveSpecTab] = useState<string>('powertrain');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);

  // Live 2D Projected Coordinates & Telemetry from Stage
  const [projectedLeaders, setProjectedLeaders] = useState<Record<string, ProjectedPoint2D>>({});
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    rpm: 900,
    hp: 120,
    torqueNm: 320,
    boostBar: 0.1,
    heritageYear: 1936,
    activeJourneyIndex: 0,
    hologramOpacity: 0,
  });

  // Mutable shared ref read at 60fps by PhotoCinemaStage & CanvasStage
  const sharedStateRef = useRef<TimelineSharedState>({
    scrollProgress: 0,
    scrollVelocity: 0,
    activeChapter: 1,
    isFilmPlaying: true,
    filmTime: 0,
    focusedHotspotId: null,
    manualExplosion: null,
    xrayOverride: false,
    freeOrbitEnabled: false,
    caliperColor: 'blue',
    bodyFinish: 'carbon',
    interiorFocus: 'auto',
  });

  const lenisRef = useRef<Lenis | null>(null);
  const lastUiSyncRef = useRef<number>(0);

  useEffect(() => {
    sharedStateRef.current.isFilmPlaying = isFilmPlaying;
    sharedStateRef.current.filmTime = filmTime;
    sharedStateRef.current.focusedHotspotId = focusedHotspotId;
    sharedStateRef.current.manualExplosion = manualExplosion;
    sharedStateRef.current.xrayOverride = xrayOverride;
    sharedStateRef.current.freeOrbitEnabled = freeOrbitEnabled;
    sharedStateRef.current.caliperColor = caliperColor;
    sharedStateRef.current.bodyFinish = bodyFinish;
    sharedStateRef.current.interiorFocus = interiorFocus;
  }, [
    isFilmPlaying,
    filmTime,
    focusedHotspotId,
    manualExplosion,
    xrayOverride,
    freeOrbitEnabled,
    caliperColor,
    bodyFinish,
    interiorFocus,
  ]);

  // 1. Preloader Counter (0% -> 100%)
  useEffect(() => {
    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 16;
      if (progress >= 100) {
        setPreloaderProgress(100);
        window.clearInterval(interval);
        window.setTimeout(() => setIsPreloading(false), 160);
      } else {
        setPreloaderProgress(progress);
      }
    }, 50);
    return () => window.clearInterval(interval);
  }, []);

  // 2. 25-Second Opening Film Trailer Playback Timer
  useEffect(() => {
    if (isPreloading || !isFilmPlaying) {
      document.body.style.overflowY = 'auto';
      return;
    }

    document.body.style.overflowY = 'hidden';
    let rafId = 0;
    const startStamp = performance.now() - filmTime * 1000;

    const stepFilm = (now: number) => {
      const elapsedSec = (now - startStamp) / 1000;
      if (elapsedSec >= FILM_TRAILER_DURATION) {
        setFilmTime(FILM_TRAILER_DURATION);
        sharedStateRef.current.filmTime = FILM_TRAILER_DURATION;
        setIsFilmPlaying(false);
        sharedStateRef.current.isFilmPlaying = false;
        document.body.style.overflowY = 'auto';
        try {
          sessionStorage.setItem(FILM_SESSION_KEY, 'true');
        } catch {
          // ignore
        }
        return;
      }
      setFilmTime(elapsedSec);
      sharedStateRef.current.filmTime = elapsedSec;
      rafId = requestAnimationFrame(stepFilm);
    };

    rafId = requestAnimationFrame(stepFilm);
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflowY = 'auto';
    };
  }, [isPreloading, isFilmPlaying]);

  // 3. Lenis Smooth Scroll + Master GSAP ScrollTrigger Timeline
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      const prog = Math.max(0, Math.min(1, e.progress || 0));
      sharedStateRef.current.scrollProgress = prog;
      sharedStateRef.current.scrollVelocity = e.velocity || 0;

      let foundChapter = 1;
      for (let i = 0; i < CHAPTERS.length; i++) {
        if (prog >= CHAPTERS[i].scrollRange[0] && prog <= CHAPTERS[i].scrollRange[1]) {
          foundChapter = CHAPTERS[i].index;
          break;
        } else if (prog > CHAPTERS[i].scrollRange[1]) {
          foundChapter = CHAPTERS[i].index;
        }
      }
      sharedStateRef.current.activeChapter = foundChapter;
      setActiveChapter(foundChapter);
      setScrollProgress(prog);
      ScrollTrigger.update();
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // 4. Smooth Navigation Helper to Any Chapter (1..9) + Keyboard Shortcuts
  const scrollToChapter = useCallback((chapterIndex: number) => {
    const targetChapter = CHAPTERS.find((c) => c.index === chapterIndex);
    if (!targetChapter) return;
    soundEngine.playTick(640);

    const el = document.getElementById(targetChapter.id);
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0, duration: 1.35 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isFilmPlaying || isEnquireOpen) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToChapter(Math.min(9, activeChapter + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToChapter(Math.max(1, activeChapter - 1));
      } else if (/^[1-9]$/.test(e.key)) {
        scrollToChapter(Number(e.key));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeChapter, isFilmPlaying, isEnquireOpen, scrollToChapter]);

  // 5. Throttled Projection Callback from 3D Hologram Stage
  const handleUpdateProjections = useCallback(
    (
      leaders: Record<string, ProjectedPoint2D>,
      nextTelemetry: typeof telemetry
    ) => {
      const now = performance.now();
      if (now - lastUiSyncRef.current < 45) return;
      lastUiSyncRef.current = now;
      setProjectedLeaders(leaders);
      setTelemetry(nextTelemetry);
    },
    []
  );

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSkipFilm = () => {
    setIsFilmPlaying(false);
    sharedStateRef.current.isFilmPlaying = false;
    try {
      sessionStorage.setItem(FILM_SESSION_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleReplayFilm = () => {
    soundEngine.playTick(580);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0 });
    }
    setFilmTime(0);
    sharedStateRef.current.filmTime = 0;
    setIsFilmPlaying(true);
    sharedStateRef.current.isFilmPlaying = true;
  };

  const currentChapterConfig =
    CHAPTERS.find((c) => c.index === activeChapter) || CHAPTERS[0];
  const currentJourneyLocation =
    JOURNEY_LOCATIONS[telemetry.activeJourneyIndex] || JOURNEY_LOCATIONS[0];
  const activeHotspotObj = EXTERIOR_HOTSPOTS.find((h) => h.id === focusedHotspotId);

  // Photo stage is 100% visible in Chapters 01, 02, 03, 07, 08, 09 and cross-fades cleanly
  // into the 3D Blueprint Hologram during Chapters 04–06
  const photoStageOpacity = Math.max(0, Math.min(1, 1 - telemetry.hologramOpacity));

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#f5f5f7] select-none">
      {/* Custom Magnetic Ring Cursor */}
      <CustomCursor />

      {/* 3D Electric-Blue Blueprint / Hologram Stage (Chapters 04–06) */}
      <CanvasStage
        sharedStateRef={sharedStateRef}
        onUpdateProjections={handleUpdateProjections}
      />

      {/* Full-Screen Hero Photo Cinema Stage (Chapters 01, 02, 03, 07, 08, 09) */}
      <PhotoCinemaStage
        sharedStateRef={sharedStateRef}
        photoOpacity={photoStageOpacity}
        focusedHotspotId={focusedHotspotId}
        onSelectHotspot={setFocusedHotspotId}
        activeChapter={activeChapter}
        caliperColor={caliperColor}
        bodyFinish={bodyFinish}
      />

      {/* Chapter 04 Live SVG Leader Lines & Exploded Part Callouts */}
      <ExplodedLeaderOverlay
        visible={
          !isFilmPlaying &&
          telemetry.hologramOpacity > 0.35 &&
          (activeChapter === 4 || (manualExplosion !== null && manualExplosion > 0.25))
        }
        projectedLeaders={projectedLeaders}
        selectedPartId={selectedExplodedPartId}
        onSelectPart={setSelectedExplodedPartId}
      />

      {/* Chapter 01 Preloader & 25-Second Film Trailer Overlay */}
      <OpeningFilmOverlay
        preloaderProgress={preloaderProgress}
        isPreloading={isPreloading}
        isFilmPlaying={isFilmPlaying}
        filmTime={filmTime}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSkipFilm={handleSkipFilm}
      />

      {/* TOP BAR CONTRACT: Strictly 3 Zones Separated by gap-8 */}
      {!isFilmPlaying && (
        <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-6 md:px-10 py-3.5 bg-[#050505]/90 border-b border-white/10">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <a
            href="#chapter-home"
            onClick={(e) => {
              e.preventDefault();
              scrollToChapter(1);
            }}
            className="font-display text-xl font-bold tracking-[0.22em] text-white whitespace-nowrap shrink-0"
          >
            BUGATTI
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-6 text-xs font-mono text-[#c9ccd1]"
            aria-label="Primary Chapter Navigation"
          >
            {[
              { idx: 1, label: '01 · Film' },
              { idx: 2, label: '02 · Legend' },
              { idx: 4, label: '04 · Blueprint' },
              { idx: 7, label: '07 · Telemetry' },
              { idx: 9, label: '09 · Bespoke' },
            ].map((item) => (
              <a
                key={item.idx}
                href={`#${CHAPTERS[item.idx - 1].id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToChapter(item.idx);
                }}
                className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 ${
                  activeChapter === item.idx
                    ? 'border-[#c8102e] text-white'
                    : 'border-transparent hover:text-white hover:border-white/40'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTick(760);
                setIsEnquireOpen(true);
              }}
              className="px-4 py-1.5 text-xs font-mono font-medium text-white bg-[#c8102e] hover:bg-[#a50d26] transition-colors whitespace-nowrap shrink-0"
            >
              Enquire
            </button>
          </div>
        </header>
      )}

      {/* Fixed Chapter Indicator (01/09) & Right-Edge Progress Bar with 9 Chapter Dots */}
      {!isFilmPlaying && (
        <aside
          className="fixed right-4 md:right-7 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-3 pointer-events-auto"
          aria-label="Chapter Progress Navigation"
        >
          <div className="bg-[#08090d] border border-white/15 px-2.5 py-1 text-right mb-1">
            <div className="font-mono text-xs font-semibold tabular-nums text-white">
              0{activeChapter} <span className="text-[#c9ccd1]/50">/ 09</span>
            </div>
            <div className="font-mono text-[10px] text-[#00b7ff] truncate max-w-[110px]">
              {currentChapterConfig.navLabel.split('·')[1]?.trim()}
            </div>
          </div>

          <div className="relative flex flex-col items-center py-1">
            <div className="absolute top-2 bottom-2 w-[1px] bg-white/15">
              <div
                className="w-full bg-[#c8102e] transition-all duration-150"
                style={{ height: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>

            {CHAPTERS.map((chap) => {
              const isCurrent = activeChapter === chap.index;
              const isPassed = activeChapter > chap.index;
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => scrollToChapter(chap.index)}
                  title={`${chap.code} — ${chap.title}`}
                  className="group relative z-10 py-2 px-2 flex items-center justify-end"
                  aria-label={`Jump to chapter ${chap.code}: ${chap.title}`}
                >
                  <span className="mr-3 px-2 py-0.5 bg-[#08090d] border border-white/15 text-[10px] font-mono text-[#c9ccd1] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {chap.navLabel}
                  </span>
                  <span
                    className={`block transition-all ${
                      isCurrent
                        ? 'w-2.5 h-2.5 bg-[#c8102e] border border-white'
                        : isPassed
                        ? 'w-2 h-2 bg-[#00b7ff]'
                        : 'w-2 h-2 bg-[#22252d] border border-white/30 group-hover:border-white'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Collapsible Unified Bottom Control Dock */}
      <ControlDock
        activeChapter={activeChapter}
        manualExplosion={manualExplosion}
        onChangeExplosion={setManualExplosion}
        xrayOverride={xrayOverride}
        onToggleXray={() => setXrayOverride((v) => !v)}
        freeOrbitEnabled={freeOrbitEnabled}
        onToggleFreeOrbit={() => setFreeOrbitEnabled((v) => !v)}
        caliperColor={caliperColor}
        onChangeCaliperColor={setCaliperColor}
        bodyFinish={bodyFinish}
        onChangeBodyFinish={setBodyFinish}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onReplayFilm={handleReplayFilm}
        hiddenDuringFilm={isFilmPlaying || isPreloading}
      />

      {/* Private Collector Enquiry Modal */}
      <EnquireModal
        isOpen={isEnquireOpen}
        onClose={() => setIsEnquireOpen(false)}
        selectedFinish={bodyFinish}
        selectedCaliper={caliperColor}
      />

      {/* =====================================================================
          MASTER 1000VH SCROLL CONTAINER: 9 CONTINUOUS CINEMATIC CHAPTERS
          All titles and text panels are positioned in the top header sky band
          and bottom studio floor band so they NEVER overlap the car in the center.
         ===================================================================== */}
      <main className="relative z-10 pointer-events-none">
        {/* -------------------------------------------------------------------
            CHAPTER 01: HOME, THE FILM (0vh – 112vh)
            Top Band: Title + Description + CTAs (Above Car Roofline)
            Bottom Band: 4 Compact Key Specs (Below Car Wheels)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-home"
          className="min-h-[112vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between"
        >
          {/* Top Architectural Band — Never touches the car (which starts below 24vh) */}
          <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pointer-events-auto">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#00b7ff] mb-1">
                <span>{CHAPTERS[0].kicker}</span>
                <span aria-hidden="true">·</span>
                <span>MOLSHEIM ATELIER</span>
              </div>
              <SplitHeadline
                text={CHAPTERS[0].title}
                active={activeChapter === 1 && !isFilmPlaying}
                as="h1"
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white"
              />
            </div>

            <div className="max-w-md flex flex-col items-start lg:items-end gap-3">
              <SplitParagraph
                text={CHAPTERS[0].description}
                active={activeChapter === 1 && !isFilmPlaying}
                className="text-xs sm:text-sm text-[#c9ccd1] lg:text-right"
              />
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleReplayFilm}
                  className="px-4 py-2 text-xs font-mono font-medium bg-[#c8102e] text-white hover:bg-[#a50d26] transition-colors whitespace-nowrap shrink-0"
                >
                  Watch 25s Opening Film
                </button>
                <button
                  type="button"
                  onClick={() => scrollToChapter(4)}
                  className="px-4 py-2 text-xs font-mono font-medium bg-[#0a0b0f]/90 border border-white/20 text-[#f5f5f7] hover:border-[#00b7ff] transition-colors whitespace-nowrap shrink-0"
                >
                  Explore 3D Blueprint
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Floor Band — Compact 4-Column Telemetry Strip Below the Car */}
          <div className="pointer-events-auto grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
            {[
              { label: 'ENGINE', val: '8.0L W16', sub: 'Quad-Turbocharged' },
              { label: 'OUTPUT', val: '1,500 PS', sub: '1,600 Nm Torque' },
              { label: 'EXHAUST', val: '6 Outlets', sub: 'Acid-Washed Titanium' },
              { label: 'ALLOCATION', val: '1 of 1', sub: 'Piece Unique' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#08090d]/85 border border-white/15 px-4 py-2.5"
              >
                <div className="text-[10px] font-mono text-[#c9ccd1]">
                  {stat.label}
                </div>
                <div className="font-display text-xl sm:text-2xl font-semibold text-white tabular-nums">
                  {stat.val}
                </div>
                <div className="text-[11px] text-[#c9ccd1]/70">{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 02: THE LEGEND (112vh – 224vh)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-legend"
          className="min-h-[112vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between"
        >
          {/* Top Band: Title on Left, Year Counter 1936->2019 on Right */}
          <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-6 pointer-events-auto">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#00b7ff] mb-1">
                <span>{CHAPTERS[1].kicker}</span>
                <span aria-hidden="true">·</span>
                <span>CHASSIS NO. 57453</span>
              </div>
              <SplitHeadline
                text={CHAPTERS[1].title}
                active={activeChapter === 2}
                className="font-display text-4xl sm:text-5xl font-semibold text-white mb-2"
              />
              <SplitParagraph
                text={CHAPTERS[1].description}
                active={activeChapter === 2}
                className="text-xs sm:text-sm text-[#c9ccd1]"
              />
            </div>

            <div className="bg-[#07080c]/90 border border-white/15 px-6 py-4 text-right shrink-0">
              <div className="text-[10px] font-mono text-[#c9ccd1] mb-0.5">
                CHRONOLOGICAL DISSOLVE · 83 YEARS
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-semibold tabular-nums text-white tracking-tight">
                {activeChapter === 2 ? telemetry.heritageYear : 2019}
              </div>
              <div className="mt-1 flex items-center justify-end gap-2 text-[11px] font-mono text-[#00b7ff]">
                <span>1936 ATLANTIC</span>
                <span>→</span>
                <span>2019 LA VOITURE NOIRE</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto max-w-md bg-[#07080c]/85 border border-white/15 px-4 py-2.5 text-xs font-mono text-[#c9ccd1] flex items-center justify-between">
            <span>1936 Type 57 SC Atlantic Ghost Silhouette</span>
            <span className="text-[#00b7ff]">Aligned to Dorsal Fin</span>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 03: OUTER DESIGN (224vh – 336vh)
            Scroll-scrubbed punch-ins + interactive photo hotspots
           ------------------------------------------------------------------- */}
        <section
          id="chapter-exterior"
          className="min-h-[112vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between"
        >
          {/* Top Band: Heading + Camera Punch-In Selector Buttons */}
          <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pointer-events-auto">
            <div className="max-w-lg">
              <div className="text-[11px] font-mono text-[#00b7ff] mb-1">
                {CHAPTERS[2].kicker}
              </div>
              <SplitHeadline
                text={CHAPTERS[2].title}
                active={activeChapter === 3}
                className="font-display text-4xl sm:text-5xl font-semibold text-white mb-2"
              />
              <SplitParagraph
                text={CHAPTERS[2].description}
                active={activeChapter === 3}
                className="text-xs sm:text-sm text-[#c9ccd1]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(620);
                  setFocusedHotspotId(null);
                }}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
                  focusedHotspotId === null
                    ? 'bg-[#c8102e] border-[#c8102e] text-white'
                    : 'bg-[#08090d]/90 border-white/15 text-[#c9ccd1] hover:text-white'
                }`}
              >
                Auto Scroll Tour
              </button>
              {EXTERIOR_HOTSPOTS.map((hs, idx) => (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(680);
                    setFocusedHotspotId(hs.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
                    focusedHotspotId === hs.id
                      ? 'bg-[#00b7ff] border-[#00b7ff] text-[#050505] font-semibold'
                      : 'bg-[#08090d]/90 border-white/15 text-[#c9ccd1] hover:text-white'
                  }`}
                >
                  0{idx + 1} · {hs.title.split(' ')[1] || hs.title}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Band: Active Hotspot Detail Card (if selected) */}
          <div className="pointer-events-auto max-w-lg">
            {activeHotspotObj ? (
              <div className="bg-[#08090d]/90 border border-[#00b7ff]/60 p-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#00b7ff] mb-1">
                  <span>{activeHotspotObj.subtitle}</span>
                  <span>{activeHotspotObj.specValue}</span>
                </div>
                <div className="font-display text-xl font-semibold text-white mb-1">
                  {activeHotspotObj.title}
                </div>
                <p className="text-xs text-[#c9ccd1] leading-relaxed mb-2">
                  {activeHotspotObj.description}
                </p>
                <button
                  type="button"
                  onClick={() => setFocusedHotspotId(null)}
                  className="text-[11px] font-mono text-[#00b7ff] hover:text-white"
                >
                  ← Return to Full Studio Framing
                </button>
              </div>
            ) : (
              <div className="bg-[#08090d]/85 border border-white/15 px-4 py-2.5 text-xs font-mono text-[#c9ccd1]">
                Click any numbered hotspot on the car or select a camera punch-in above.
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 04: ZOOM-IN EXPLODED VIEW & HOLOGRAM (336vh – 468vh)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-exploded"
          className="min-h-[120vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between"
        >
          {/* Top Band */}
          <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pointer-events-auto">
            <div className="max-w-xl">
              <div className="text-[11px] font-mono text-[#00b7ff] mb-1">
                {CHAPTERS[3].kicker}
              </div>
              <SplitHeadline
                text={CHAPTERS[3].title}
                active={activeChapter === 4}
                className="font-display text-4xl sm:text-5xl font-semibold text-white mb-2"
              />
              <SplitParagraph
                text={CHAPTERS[3].description}
                active={activeChapter === 4}
                className="text-xs sm:text-sm text-[#c9ccd1]"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-[#070a12]/90 border border-[#00b7ff]/40 px-4 py-2 text-xs font-mono text-[#00b7ff]">
                3D CAD HOLOGRAM ACTIVE · 17 ASSEMBLIES
              </div>
            </div>
          </div>

          {/* Bottom Band: Named Assembly Selector */}
          <div className="pointer-events-auto max-w-2xl bg-[#07080c]/90 border border-white/15 p-4">
            <div className="text-[11px] font-mono text-[#00b7ff] mb-2">
              HOLOGRAM ASSEMBLY ARCHITECTURE (CLICK TO INSPECT):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PART_EXPLOSIONS.slice(0, 10).map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(640);
                    setSelectedExplodedPartId(part.id);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-mono border transition-colors whitespace-nowrap shrink-0 ${
                    selectedExplodedPartId === part.id
                      ? 'bg-[#c8102e] border-[#c8102e] text-white'
                      : 'bg-[#0d0f15] border-white/10 text-[#c9ccd1] hover:text-white'
                  }`}
                >
                  {part.code} · {part.label.split(' ')[0]}
                </button>
              ))}
            </div>
            {selectedExplodedPartId && (
              <div className="mt-2.5 pt-2 border-t border-white/10 text-xs text-[#c9ccd1]">
                <span className="font-semibold text-white">
                  {PART_EXPLOSIONS.find((p) => p.id === selectedExplodedPartId)?.label}:
                </span>{' '}
                {PART_EXPLOSIONS.find((p) => p.id === selectedExplodedPartId)?.detail}
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 05: INNER VIEW — COCKPIT & W16 ENGINE BAY (468vh – 588vh)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-interior"
          className="min-h-[115vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between"
        >
          {/* Top Band */}
          <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pointer-events-auto">
            <div className="max-w-xl">
              <div className="text-[11px] font-mono text-[#c8102e] mb-1">
                {CHAPTERS[4].kicker}
              </div>
              <SplitHeadline
                text={CHAPTERS[4].title}
                active={activeChapter === 5}
                className="font-display text-4xl sm:text-5xl font-semibold text-white mb-2"
              />
              <SplitParagraph
                text={CHAPTERS[4].description}
                active={activeChapter === 5}
                className="text-xs sm:text-sm text-[#c9ccd1]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'auto', label: 'Scroll Pass-Through' },
                  { id: 'cockpit', label: 'Cockpit & Steering' },
                  { id: 'w16', label: 'W16 Pistons & 4 Turbos' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTick(680);
                    setInteriorFocus(mode.id);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-mono border transition-colors whitespace-nowrap shrink-0 ${
                    interiorFocus === mode.id
                      ? 'bg-[#c8102e] border-[#c8102e] text-white'
                      : 'bg-[#0d0f15] border-white/15 text-[#c9ccd1] hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Band: W16 Telemetry */}
          <div className="pointer-events-auto max-w-lg bg-[#07080c]/90 border border-white/15 p-4 grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] font-mono text-[#c9ccd1]">CRANKSHAFT RPM</div>
              <div className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-white mt-0.5">
                {telemetry.rpm.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#00b7ff]">Scroll-Velocity Linked</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#c9ccd1]">ACTIVE CYLINDERS</div>
              <div className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-white mt-0.5">
                16 / W16
              </div>
              <div className="text-[11px] text-[#c9ccd1]/70">Titanium Rods</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#c9ccd1]">QUAD-TURBO GLOW</div>
              <div className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-[#c8102e] mt-0.5">
                940°C
              </div>
              <div className="text-[11px] text-[#c9ccd1]/70">Inconel Housings</div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 06: ZOOM-OUT REASSEMBLY (588vh – 690vh)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-reassembly"
          className="min-h-[105vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between"
        >
          <div className="max-w-xl pointer-events-auto">
            <div className="text-[11px] font-mono text-[#00b7ff] mb-1">
              {CHAPTERS[5].kicker}
            </div>
            <SplitHeadline
              text={CHAPTERS[5].title}
              active={activeChapter === 6}
              className="font-display text-4xl sm:text-5xl font-semibold text-white mb-2"
            />
            <SplitParagraph
              text={CHAPTERS[5].description}
              active={activeChapter === 6}
              className="text-xs sm:text-sm text-[#c9ccd1]"
            />
          </div>

          <div className="pointer-events-auto max-w-md bg-[#07080c]/85 border border-white/15 px-4 py-2.5 flex items-center justify-between text-xs font-mono text-[#c9ccd1]">
            <span>Hologram-to-Photo Convergence</span>
            <span className="text-[#00b7ff]">50,000 Nm / Degree</span>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 07: PERFORMANCE & WIND TUNNEL TELEMETRY (690vh – 800vh)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-performance"
          className="min-h-[112vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between"
        >
          <div className="max-w-xl pointer-events-auto">
            <div className="text-[11px] font-mono text-[#c8102e] mb-1">
              {CHAPTERS[6].kicker}
            </div>
            <SplitHeadline
              text={CHAPTERS[6].title}
              active={activeChapter === 7}
              className="font-display text-4xl sm:text-5xl font-semibold text-white mb-2"
            />
            <SplitParagraph
              text={CHAPTERS[6].description}
              active={activeChapter === 7}
              className="text-xs sm:text-sm text-[#c9ccd1]"
            />
          </div>

          <div className="pointer-events-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <RadialGauge
              label="POWER OUTPUT"
              value={activeChapter === 7 ? telemetry.hp.toLocaleString() : '1,500'}
              unit="PS / HP"
              progress={activeChapter === 7 ? telemetry.hp / 1500 : 1}
              accentColor="#c8102e"
              sublabel="Peak power @ 6,700 rpm from 8.0L quad-turbo W16"
            />
            <RadialGauge
              label="PEAK TORQUE"
              value={activeChapter === 7 ? telemetry.torqueNm.toLocaleString() : '1,600'}
              unit="Nm"
              progress={activeChapter === 7 ? telemetry.torqueNm / 1600 : 1}
              accentColor="#00b7ff"
              sublabel="Flat torque plateau from 2,000 to 6,000 rpm"
            />
            <RadialGauge
              label="0 – 100 KM/H"
              value="2.4"
              unit="SECONDS"
              progress={0.92}
              accentColor="#00b7ff"
              sublabel="0–200 km/h in 6.1s · 0–300 km/h in 13.1s"
            />
            <RadialGauge
              label="VELOCITY"
              value={activeChapter === 7 ? telemetry.speedKmh : 420}
              unit="KM/H"
              progress={activeChapter === 7 ? telemetry.speedKmh / 420 : 1}
              accentColor="#c8102e"
              sublabel="Electronically limited for grand touring tyres"
            />
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 08: THE JOURNEY (800vh – 910vh)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-journey"
          className="min-h-[115vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col justify-between overflow-hidden"
        >
          {/* Top Band: Location Title + Outlined Kinetic Banner Above the Car */}
          <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pointer-events-auto">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#00b7ff] mb-1">
                <span>{CHAPTERS[7].kicker}</span>
                <span>·</span>
                <span>{currentJourneyLocation.cameraMode}</span>
              </div>
              <SplitHeadline
                text={currentJourneyLocation.name}
                active={activeChapter === 8}
                className="font-display text-4xl sm:text-5xl font-semibold text-white mb-1"
              />
              <p className="text-xs font-mono text-[#c9ccd1]">
                {currentJourneyLocation.region} · {currentJourneyLocation.timeOfDay}
              </p>
            </div>

            <div className="overflow-hidden max-w-xl hidden lg:block">
              <div
                className="font-display text-5xl font-bold stroke-title whitespace-nowrap tracking-wider transition-transform duration-150 ease-out"
                style={{
                  transform: `translate3d(${Math.round((0.85 - scrollProgress) * 420)}px, 0, 0)`,
                }}
              >
                {currentJourneyLocation.name} · {currentJourneyLocation.region}
              </div>
            </div>
          </div>

          {/* Bottom Band: 4 Stage Cards Below the Car */}
          <div className="pointer-events-auto grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
            {JOURNEY_LOCATIONS.map((loc, idx) => {
              const isCurr = telemetry.activeJourneyIndex === idx && activeChapter === 8;
              return (
                <div
                  key={loc.id}
                  className={`p-3 border transition-colors ${
                    isCurr
                      ? 'bg-[#0c0f17]/95 border-[#00b7ff] text-white'
                      : 'bg-[#07080c]/85 border-white/10 text-[#c9ccd1]'
                  }`}
                >
                  <div className="text-[10px] font-mono text-[#00b7ff]">
                    STAGE 0{idx + 1}
                  </div>
                  <div className="font-display text-base font-semibold text-white mt-0.5 truncate">
                    {loc.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#c9ccd1]/70 mt-0.5 truncate">
                    {loc.cameraMode}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------------------
            CHAPTER 09: FINALE & SPECIFICATIONS (910vh – 1008vh)
           ------------------------------------------------------------------- */}
        <section
          id="chapter-finale"
          className="min-h-[115vh] w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-28 flex flex-col justify-between"
        >
          {/* Top Band: Closing Quote & Action Buttons (Above the Car) */}
          <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 pointer-events-auto">
            <div className="max-w-xl">
              <div className="text-[11px] font-mono text-[#c8102e] mb-1">
                {CHAPTERS[8].kicker}
              </div>
              <p className="font-display italic text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-2">
                “Some things are not meant to be repeated.”
              </p>
              <p className="text-xs sm:text-sm text-[#c9ccd1]">
                {CHAPTERS[8].description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(720);
                  setCaliperColor((c) => (c === 'blue' ? 'red' : 'blue'));
                }}
                className="px-4 py-2 text-xs font-mono bg-[#0b0d13]/90 border border-white/20 text-white hover:border-[#00b7ff] transition-colors whitespace-nowrap shrink-0"
              >
                Caliper: {caliperColor === 'blue' ? 'French Blue' : 'Crimson Red'}
              </button>
              <button
                type="button"
                onClick={handleReplayFilm}
                className="px-4 py-2 text-xs font-mono font-medium bg-[#11131a] border border-white/20 text-white hover:border-[#00b7ff] transition-colors whitespace-nowrap shrink-0"
              >
                Replay the Film
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTick(800);
                  setIsEnquireOpen(true);
                }}
                className="px-5 py-2 text-xs font-mono font-medium bg-[#c8102e] text-white hover:bg-[#a50d26] transition-colors whitespace-nowrap shrink-0"
              >
                Enquire
              </button>
            </div>
          </div>

          {/* Bottom Band: Compact Specification Dossier Tabs & Footer Note (Below the Car) */}
          <div className="pointer-events-auto w-full pt-8">
            <div className="bg-[#07080c]/90 border border-white/15 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#00b7ff]">
                    TECHNICAL SPECIFICATION DOSSIER
                  </span>
                  <span className="text-xs font-mono text-[#c9ccd1]/50">·</span>
                  <span className="font-display text-lg font-semibold text-white">
                    Bugatti La Voiture Noire (2019)
                  </span>
                </div>

                <div className="flex items-center bg-[#0f1117] border border-white/10 p-0.5">
                  {SPEC_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playTick(650);
                        setActiveSpecTab(tab.id);
                      }}
                      className={`px-3 py-1 text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                        activeSpecTab === tab.id
                          ? 'bg-[#c8102e] text-white'
                          : 'text-[#c9ccd1] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {(
                  SPEC_TABS.find((t) => t.id === activeSpecTab) || SPEC_TABS[0]
                ).items.map((item) => (
                  <div
                    key={item.label}
                    className="p-2.5 bg-[#0c0e14] border border-white/10 flex flex-col justify-between"
                  >
                    <div className="text-[10px] font-mono text-[#c9ccd1]/75 truncate">
                      {item.label}
                    </div>
                    <div className="font-mono text-xs font-medium text-white tabular-nums mt-1">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#c9ccd1]/70">
              <div>LA VOITURE NOIRE (2019) · CINEMATIC ARCHIVE</div>
              <div>Fan concept, not affiliated with Bugatti Automobiles S.A.S.</div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
