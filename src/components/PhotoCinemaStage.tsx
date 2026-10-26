import React, { useEffect, useRef, useState } from 'react';
import {
  ASSET_PATHS,
  CHAPTERS,
  EXTERIOR_HOTSPOTS,
  FILM_SHOTS,
  FILM_TRAILER_DURATION,
  JOURNEY_LOCATIONS,
} from '../config/cinemaConfig';
import { soundEngine } from '../utils/soundEngine';
import { TimelineSharedState } from './CanvasStage';

interface PhotoCinemaStageProps {
  sharedStateRef: React.MutableRefObject<TimelineSharedState>;
  /** Opacity of the photo stage [0..1]; 1 in photo chapters, 0 when fully in 3D hologram */
  photoOpacity: number;
  focusedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  activeChapter: number;
  caliperColor: 'blue' | 'red';
  bodyFinish: 'carbon' | 'obsidian' | 'argent';
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(x: number, min: number, max: number): number {
  const t = clamp((x - min) / Math.max(0.0001, max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Full-Screen Cinematic Photo Camera Stage for Chapters 01, 02, 03, 07, 08, 09.
 * Uses the attached studio photograph of the Bugatti La Voiture Noire and
 * animates it like a real movie camera: slow dolly-ins, macro punch-ins to
 * the horseshoe grille, headlight, front wheel with blue caliper, and rear haunch,
 * soft light sweeps, parallax, rain/dust particles, and scroll-scrubbed zoom.
 */
export const PhotoCinemaStage: React.FC<PhotoCinemaStageProps> = ({
  sharedStateRef,
  photoOpacity,
  focusedHotspotId,
  onSelectHotspot,
  activeChapter,
  caliperColor,
  bodyFinish,
}) => {
  const cameraRigRef = useRef<HTMLDivElement | null>(null);
  const lightSweepRef = useRef<HTMLDivElement | null>(null);
  const atlanticSvgRef = useRef<HTMLDivElement | null>(null);
  const airflowSvgRef = useRef<HTMLDivElement | null>(null);
  const journeyTintRef = useRef<HTMLDivElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pinScaleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [imgSrc, setImgSrc] = useState(ASSET_PATHS.referencePhotoUrl);

  useEffect(() => {
    let rafId = 0;
    let isDisposed = false;

    // Smoothed camera state
    let curScale = 1.0;
    let curFocusX = 50.0;
    let curFocusY = 50.0;
    let curRoll = 0.0;
    let curSweep = 0.35;
    let curBrightness = 1.0;
    let curAtlanticOpacity = 0.0;
    let curAirflowOpacity = 0.0;

    // Mouse parallax
    const mouseTarget = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Setup 2D Rain & Atmospheric Dust Particles Canvas
    const pCanvas = particleCanvasRef.current;
    const pCtx = pCanvas ? pCanvas.getContext('2d') : null;
    const particles = Array.from({ length: 85 }, () => ({
      x: Math.random(),
      y: Math.random(),
      len: 8 + Math.random() * 18,
      speedY: 0.12 + Math.random() * 0.25,
      speedX: -0.03 - Math.random() * 0.05,
      alpha: 0.12 + Math.random() * 0.28,
      isDust: Math.random() > 0.55,
    }));

    const handleResize = () => {
      if (pCanvas) {
        pCanvas.width = window.innerWidth;
        pCanvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const tick = (now: number) => {
      if (isDisposed) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const state = sharedStateRef.current;
      const p = clamp(state.scrollProgress, 0, 1);

      mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * Math.min(1, dt * 4.5);
      mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * Math.min(1, dt * 4.5);

      let targetScale = 1.0;
      let targetFocusX = 50.0;
      let targetFocusY = 50.0;
      let targetRoll = 0.0;
      let targetSweep = 0.45;
      let targetBrightness = 1.0;
      let targetAtlantic = 0.0;
      let targetAirflow = 0.0;
      let targetRain = 0.15;

      if (state.isFilmPlaying) {
        // 25-SECOND OPENING TRAILER FILM CAMERA SHOTS
        const t = clamp(state.filmTime, 0, FILM_TRAILER_DURATION);
        const shot =
          FILM_SHOTS.find((s) => t >= s.startTime && t <= s.endTime) ||
          FILM_SHOTS[FILM_SHOTS.length - 1];
        const span = Math.max(0.01, shot.endTime - shot.startTime);
        const alpha = smoothstep(t, shot.startTime, shot.endTime);

        targetScale = lerp(shot.fromPhotoCam.scale, shot.toPhotoCam.scale, alpha);
        targetFocusX = lerp(shot.fromPhotoCam.focusX, shot.toPhotoCam.focusX, alpha);
        targetFocusY = lerp(shot.fromPhotoCam.focusY, shot.toPhotoCam.focusY, alpha);
        targetRoll = lerp(shot.fromPhotoCam.roll || 0, shot.toPhotoCam.roll || 0, alpha);
        targetSweep = lerp(
          shot.fromPhotoCam.lightSweep ?? 0.2,
          shot.toPhotoCam.lightSweep ?? 0.8,
          (t - shot.startTime) / span
        );
        targetBrightness = shot.brightness ?? 1.0;
        targetRain = shot.rainIntensity ?? 0.2;

        // Subtle camera shake during speed-ramp shot
        const shake = shot.shakeIntensity || 0;
        if (shake > 0) {
          targetFocusX += Math.sin(now * 0.025) * shake * 4.0;
          targetFocusY += Math.cos(now * 0.031) * shake * 2.5;
        }
      } else {
        // SCROLL-SCRUBBED CHAPTER CAMERA MOVES
        let chapIdx = 0;
        for (let i = 0; i < CHAPTERS.length; i++) {
          if (p >= CHAPTERS[i].scrollRange[0] && p <= CHAPTERS[i].scrollRange[1]) {
            chapIdx = i;
            break;
          } else if (p > CHAPTERS[i].scrollRange[1]) {
            chapIdx = i;
          }
        }
        const currChap = CHAPTERS[chapIdx];
        const [rStart, rEnd] = currChap.scrollRange;
        const localT = clamp((p - rStart) / Math.max(0.001, rEnd - rStart), 0, 1);
        const smoothT = smoothstep(localT, 0, 1);

        const startCam = currChap.photoCamera;
        const endCam = currChap.photoCameraEnd || currChap.photoCamera;

        targetScale = lerp(startCam.scale, endCam.scale, smoothT);
        targetFocusX = lerp(startCam.focusX, endCam.focusX, smoothT);
        targetFocusY = lerp(startCam.focusY, endCam.focusY, smoothT);
        targetRoll = lerp(startCam.roll || 0, endCam.roll || 0, smoothT);
        targetSweep = lerp(startCam.lightSweep ?? 0.25, endCam.lightSweep ?? 0.8, localT);

        // Chapter-Specific Film Choreography on the Photo
        if (currChap.index === 2) {
          // Chapter 02: Ghost silhouette of 1936 Type 57 SC Atlantic dissolves into car
          targetAtlantic = Math.sin(localT * Math.PI) * 0.82;
        } else if (currChap.index === 3) {
          // Chapter 03: Exterior Design (Scroll-controlled punch-ins OR clicked hotspot)
          if (state.focusedHotspotId) {
            const hs = EXTERIOR_HOTSPOTS.find((h) => h.id === state.focusedHotspotId);
            if (hs) {
              targetScale = hs.photoCamera.scale;
              targetFocusX = hs.photoCamera.focusX;
              targetFocusY = hs.photoCamera.focusY;
              targetRoll = hs.photoCamera.roll || 0;
              targetSweep = hs.photoCamera.lightSweep ?? 0.5;
            }
          } else {
            // Automatic scroll-scrubbed camera tour across 4 signature exterior angles:
            // 0.00-0.25: Low Horseshoe Grille & Red Badge
            // 0.25-0.50: Crystal LED Headlight Blade
            // 0.50-0.75: Front Wheel & Blue Caliper
            // 0.75-1.00: C-Line & Sculpted Rear Haunch
            if (localT < 0.25) {
              const st = smoothstep(localT, 0, 0.25);
              targetScale = lerp(1.55, 2.05, st);
              targetFocusX = lerp(22, 18.5, st);
              targetFocusY = lerp(54, 55.5, st);
            } else if (localT < 0.5) {
              const st = smoothstep(localT, 0.25, 0.5);
              targetScale = lerp(2.05, 2.15, st);
              targetFocusX = lerp(18.5, 42.5, st);
              targetFocusY = lerp(55.5, 43.0, st);
            } else if (localT < 0.75) {
              const st = smoothstep(localT, 0.5, 0.75);
              targetScale = lerp(2.15, 2.1, st);
              targetFocusX = lerp(42.5, 51.8, st);
              targetFocusY = lerp(43.0, 59.5, st);
            } else {
              const st = smoothstep(localT, 0.75, 1.0);
              targetScale = lerp(2.1, 1.65, st);
              targetFocusX = lerp(51.8, 78.0, st);
              targetFocusY = lerp(59.5, 47.0, st);
            }
          }
        } else if (currChap.index === 7) {
          // Chapter 07: Performance acceleration dolly + airflow streamlines
          targetAirflow = smoothstep(localT, 0.05, 0.85) * 0.85;
          targetRain = 0.35;
        } else if (currChap.index === 8) {
          // Chapter 08: The Journey (4 continuous atmospheric cuts)
          const locIdx = Math.min(
            JOURNEY_LOCATIONS.length - 1,
            Math.floor(localT * JOURNEY_LOCATIONS.length)
          );
          const loc = JOURNEY_LOCATIONS[locIdx];
          targetScale = loc.photoCamera.scale;
          targetFocusX = loc.photoCamera.focusX;
          targetFocusY = loc.photoCamera.focusY;
          targetRoll = loc.photoCamera.roll || 0;
          targetSweep = loc.photoCamera.lightSweep ?? 0.5;
          targetRain = loc.rainAmount;
          targetAirflow = 0.35;

          if (journeyTintRef.current) {
            journeyTintRef.current.style.background = `radial-gradient(circle at ${targetFocusX}% 45%, ${loc.rimGlowColor}, ${loc.tintColor} 70%, transparent 100%)`;
            journeyTintRef.current.style.opacity = '1';
          }
        }

        if (currChap.index !== 8 && journeyTintRef.current) {
          journeyTintRef.current.style.opacity = '0';
        }
      }

      // Exponential damping for silky-smooth film camera motion
      const dampFactor = Math.min(1, dt * 5.0);
      curScale += (targetScale - curScale) * dampFactor;
      curFocusX += (targetFocusX - curFocusX) * dampFactor;
      curFocusY += (targetFocusY - curFocusY) * dampFactor;
      curRoll += (targetRoll - curRoll) * dampFactor;
      curSweep += (targetSweep - curSweep) * dampFactor;
      curBrightness += (targetBrightness - curBrightness) * dampFactor;
      curAtlanticOpacity += (targetAtlantic - curAtlanticOpacity) * dampFactor;
      curAirflowOpacity += (targetAirflow - curAirflowOpacity) * dampFactor;

      // Apply parallax + camera transform to the photo rig
      if (cameraRigRef.current) {
        const parallaxX = -mouseSmooth.x * 1.4;
        const parallaxY = -mouseSmooth.y * 0.9;
        // Convert focus point (e.g. 18.5%, 55.5%) into centered translation so that
        // the focused coordinate moves smoothly toward the center of the viewport when zoomed in.
        const panStrength = clamp((curScale - 1.0) / 1.35, 0, 1);
        const tx = (50 - curFocusX) * panStrength * 0.82 + parallaxX;
        const ty = (50 - curFocusY) * panStrength * 0.72 + parallaxY;

        cameraRigRef.current.style.transform = `translate3d(${tx.toFixed(3)}%, ${ty.toFixed(
          3
        )}%, 0) scale(${curScale.toFixed(4)}) rotate(${curRoll.toFixed(3)}deg)`;
        cameraRigRef.current.style.filter = `brightness(${curBrightness.toFixed(3)})`;
      }

      // Keep Chapter 03 Hotspot Pins constant screen size regardless of photo zoom
      const invScale = 1 / Math.max(1, curScale);
      Object.values(pinScaleRefs.current).forEach((el) => {
        if (el) {
          el.style.transform = `translate(-50%, -50%) scale(${invScale.toFixed(3)})`;
        }
      });

      // Update Soft Light Sweep Curtain across the car
      if (lightSweepRef.current) {
        const sweepX = (curSweep * 140 - 20).toFixed(2);
        lightSweepRef.current.style.transform = `translate3d(${sweepX}%, 0, 0) skewX(-24deg)`;
      }

      // Update Chapter 02 1936 Type 57 SC Atlantic Ghost Overlay
      if (atlanticSvgRef.current) {
        atlanticSvgRef.current.style.opacity = curAtlanticOpacity.toFixed(3);
      }

      // Update Chapter 07 Wind-Tunnel Airflow Streamlines Overlay
      if (airflowSvgRef.current) {
        airflowSvgRef.current.style.opacity = curAirflowOpacity.toFixed(3);
      }

      // Render Rain & Atmospheric Dust Particles on 2D Canvas
      if (pCtx && pCanvas) {
        const w = pCanvas.width;
        const h = pCanvas.height;
        pCtx.clearRect(0, 0, w, h);

        const velBoost = Math.min(2.5, Math.abs(state.scrollVelocity) * 0.15);
        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];
          if (pt.isDust) {
            pt.x = (pt.x + pt.speedX * 0.08 * dt + 1) % 1;
            pt.y = (pt.y - pt.speedY * 0.06 * dt + 1) % 1;
            pCtx.fillStyle = `rgba(201, 204, 209, ${pt.alpha * 0.45})`;
            pCtx.beginPath();
            pCtx.arc(pt.x * w, pt.y * h, 1.2, 0, Math.PI * 2);
            pCtx.fill();
          } else if (targetRain > 0.05) {
            pt.x = (pt.x + pt.speedX * (1 + velBoost) * dt + 1) % 1;
            pt.y = (pt.y + pt.speedY * (2.2 + targetRain * 3.0 + velBoost) * dt) % 1;
            pCtx.strokeStyle = `rgba(180, 215, 255, ${pt.alpha * targetRain * 0.55})`;
            pCtx.lineWidth = 1;
            pCtx.beginPath();
            pCtx.moveTo(pt.x * w, pt.y * h);
            pCtx.lineTo(pt.x * w - 4, pt.y * h + pt.len);
            pCtx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [sharedStateRef]);

  // Subtle finish & caliper tint filter for Chapter 09 customization on the photo
  const finishFilterStyle =
    bodyFinish === 'argent'
      ? 'contrast(1.06) brightness(1.08)'
      : bodyFinish === 'obsidian'
      ? 'contrast(1.12) brightness(0.92)'
      : 'none';

  return (
    <div
      className="fixed inset-0 z-[2] w-full h-full overflow-hidden bg-[#050505] transition-opacity duration-500 ease-out pointer-events-none"
      style={{
        opacity: photoOpacity,
        visibility: photoOpacity <= 0.01 ? 'hidden' : 'visible',
      }}
      aria-label="Bugatti La Voiture Noire Cinematic Stage"
    >
      {/* Master 2D Film Camera Rig (Scales & Pans smoothly around the High-Res Car Photo) */}
      <div
        ref={cameraRigRef}
        className="relative w-full h-full flex items-center justify-center will-change-transform origin-center"
      >
        {/* Aspect-Locked 16:9 Stage Wrapper so Hotspot Percentages Always Match the Car */}
        <div
          className="relative w-full max-w-[177.78vh] aspect-video flex items-center justify-center select-none"
          style={{ filter: finishFilterStyle }}
        >
          <img
            src={imgSrc}
            alt="Bugatti La Voiture Noire 2019 One-Off Hypercar"
            referrerPolicy="no-referrer"
            onError={() => {
              if (imgSrc !== ASSET_PATHS.fallbackPhotoUrl) {
                setImgSrc(ASSET_PATHS.fallbackPhotoUrl);
              }
            }}
            className="w-full h-full object-contain pointer-events-none select-none"
          />

          {/* Optional Red Caliper Accent Glow Overlay when toggled to Red in Controls */}
          {caliperColor === 'red' && (
            <div
              className="absolute pointer-events-none rounded-full mix-blend-color"
              style={{
                left: '51.5%',
                top: '59.2%',
                width: '4.8%',
                height: '9.5%',
                transform: 'translate(-50%, -50%)',
                background:
                  'radial-gradient(circle, rgba(200,16,46,0.95) 0%, rgba(200,16,46,0.5) 60%, transparent 100%)',
              }}
            />
          )}

          {/* Soft Specular Light Sweep Curtain across the Car Silhouette */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              ref={lightSweepRef}
              className="w-[26%] h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent will-change-transform"
            />
          </div>

          {/* CHAPTER 02: 1936 Type 57 SC Atlantic Ghost Silhouette Overlay */}
          <div
            ref={atlanticSvgRef}
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            <svg
              viewBox="0 0 1600 900"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Classic 1936 Type 57 SC Atlantic Teardrop Silhouette & Riveted Dorsal Fin */}
              <path
                d="M175 565 C190 450, 310 385, 515 375 C640 305, 810 225, 1045 235 C1245 245, 1380 335, 1435 515"
                stroke="#00b7ff"
                strokeWidth="2.5"
                strokeDasharray="10 6"
                strokeOpacity="0.78"
              />
              {/* Riveted Atlantic Dorsal Spine Seam */}
              <path
                d="M245 455 Q780 185 1390 385"
                stroke="#c8102e"
                strokeWidth="2"
                strokeOpacity="0.85"
              />
              {/* Classic Pontoon Front & Rear Fender Curves */}
              <path
                d="M155 585 C240 430, 480 410, 620 595 M960 565 C1085 385, 1320 375, 1445 555"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeOpacity="0.65"
              />
              <text
                x="780"
                y="215"
                fill="#00b7ff"
                fontSize="17"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="3"
              >
                1936 TYPE 57 SC ATLANTIC · DORSAL SEAM LINEAGE
              </text>
            </svg>
          </div>

          {/* CHAPTER 07: Aerodynamic Wind-Tunnel Streamlines Flowing Over the Photo */}
          <div
            ref={airflowSvgRef}
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            <svg
              viewBox="0 0 1600 900"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M90 510 Q380 320 820 225 T1520 310"
                stroke="#00b7ff"
                strokeWidth="1.8"
                strokeDasharray="28 14"
                strokeOpacity="0.65"
              />
              <path
                d="M120 575 Q460 390 920 275 T1540 375"
                stroke="#38bdf8"
                strokeWidth="1.4"
                strokeDasharray="18 12"
                strokeOpacity="0.5"
              />
              <path
                d="M150 635 Q580 520 1060 440 T1550 480"
                stroke="#c8102e"
                strokeWidth="1.6"
                strokeDasharray="24 16"
                strokeOpacity="0.6"
              />
            </svg>
          </div>

          {/* CHAPTER 03: Interactive Exterior Hotspots Anchored Directly on the Car Photo */}
          {activeChapter === 3 &&
            EXTERIOR_HOTSPOTS.map((hs, index) => {
              const isFocused = focusedHotspotId === hs.id;
              return (
                <div
                  key={hs.id}
                  ref={(el) => {
                    pinScaleRefs.current[hs.id] = el;
                  }}
                  style={{
                    left: `${hs.photoPosition[0]}%`,
                    top: `${hs.photoPosition[1]}%`,
                  }}
                  className="absolute z-20 pointer-events-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTick(760);
                      onSelectHotspot(isFocused ? null : hs.id);
                    }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[11px] transition-colors shadow-lg ${
                      isFocused
                        ? 'bg-[#c8102e] border-white text-white'
                        : 'bg-[#05070b]/90 border-[#00b7ff] text-white hover:border-white'
                    }`}
                    aria-label={`Inspect ${hs.title}`}
                  >
                    0{index + 1}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Chapter 08 Atmospheric Journey Lighting & Horizon Grade */}
      <div
        ref={journeyTintRef}
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: 0 }}
      />

      {/* Rain & Atmospheric Dust Motes 2D Canvas */}
      <canvas
        ref={particleCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

      {/* Soft Top & Bottom Edge Scrims so Header & Footer Typography Always Read Clearly Without Touching the Car */}
      <div className="fixed inset-x-0 top-0 h-36 bg-gradient-to-b from-[#050505]/90 via-[#050505]/45 to-transparent pointer-events-none" />
      <div className="fixed inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050505]/90 via-[#050505]/45 to-transparent pointer-events-none" />
    </div>
  );
};
