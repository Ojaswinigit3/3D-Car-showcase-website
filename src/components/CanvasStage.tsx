import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CHAPTERS,
  PART_EXPLOSIONS,
} from '../config/cinemaConfig';
import { buildLaVoitureNoire, CarRig } from '../three/buildLaVoitureNoire';
import { createProceduralTextures } from '../three/proceduralTextures';
import { soundEngine } from '../utils/soundEngine';

export interface ProjectedPoint2D {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface TimelineSharedState {
  scrollProgress: number;
  scrollVelocity: number;
  activeChapter: number;
  isFilmPlaying: boolean;
  filmTime: number;
  focusedHotspotId: string | null;
  manualExplosion: number | null;
  xrayOverride: boolean;
  freeOrbitEnabled: boolean;
  caliperColor: 'blue' | 'red';
  bodyFinish: 'carbon' | 'obsidian' | 'argent';
  interiorFocus: 'auto' | 'cockpit' | 'w16';
}

interface CanvasStageProps {
  sharedStateRef: React.MutableRefObject<TimelineSharedState>;
  onUpdateProjections?: (
    leaders: Record<string, ProjectedPoint2D>,
    telemetry: {
      speedKmh: number;
      rpm: number;
      hp: number;
      torqueNm: number;
      boostBar: number;
      heritageYear: number;
      activeJourneyIndex: number;
      hologramOpacity: number;
    }
  ) => void;
}

const _camPosTarget = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _projVec = new THREE.Vector3();

/**
 * 3D Blueprint / Hologram Stage for Chapters 04–06 (Exploded View,
 * Cockpit & W16 Inner View, and Reassembly).
 * Styled with dark obsidian-navy background, thin electric-blue wireframe edges,
 * labeled parts, and soft non-overexposed lighting.
 * Cross-fades smoothly with the PhotoCinemaStage.
 */
export const CanvasStage: React.FC<CanvasStageProps> = ({
  sharedStateRef,
  onUpdateProjections,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const onUpdateProjectionsRef = useRef(onUpdateProjections);
  onUpdateProjectionsRef.current = onUpdateProjections;

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software-WebGL Guard per Three.js Skill §2.1
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const isMobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Soft, controlled exposure so nothing is overexposed
    renderer.toneMappingExposure = 0.92;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Scene, Blueprint Background & Subtle Environment Map
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#040811');
    scene.fog = new THREE.FogExp2('#040811', 0.09);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35; // Soft reflections only, zero harsh glare
    pmremGenerator.dispose();

    // 3. Perspective Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(
      34,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(-3.85, 1.55, 3.55);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.6;
    controls.maxDistance = 8.0;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minPolarAngle = 0.15;
    controls.target.set(0, 0.5, 0);
    controls.enabled = false;

    let userInteractingWithOrbit = false;
    controls.addEventListener('start', () => {
      userInteractingWithOrbit = true;
    });
    controls.addEventListener('end', () => {
      userInteractingWithOrbit = false;
    });

    // 4. Soft Blueprint Lighting Rig (No Blown-Out Highlights)
    const hemiLight = new THREE.HemisphereLight('#7dd3fc', '#050914', 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#bae6fd', 0.95);
    keyLight.position.set(4.0, 5.5, 4.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#00b7ff', 0.85);
    rimLight.position.set(-4.0, 3.0, -4.0);
    scene.add(rimLight);

    // 5. CAD Blueprint Grid Floor
    const gridHelper = new THREE.GridHelper(18, 36, '#00b7ff', '#0c233d');
    gridHelper.position.y = 0.01;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.28;
    scene.add(gridHelper);

    // 6. Build the 17-Part Electric-Blue Blueprint / Hologram Car Rig
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);
    const carRig: CarRig = buildLaVoitureNoire(textures, isSoftwareGl);
    scene.add(carRig.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. Mouse Parallax
    const mouseTarget = { x: 0, y: 0 };
    const mouseSmoothed = { x: 0, y: 0 };
    const handlePointerMove = (e: PointerEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop + Software-WebGL Pacing (`afterDraw`)
    let frameId = 0;
    let isDisposed = false;
    const clock = new THREE.Clock();

    let currentCamPos = new THREE.Vector3(-3.85, 1.55, 3.55);
    let currentCamTarget = new THREE.Vector3(0, 0.5, 0);
    let currentFov = 34;
    let currentExplosion = 0;
    let currentHologramOpacity = 0;
    let engineCrankAngle = 0;
    let prevLockInTriggered = false;
    let lastCaliperColor: 'blue' | 'red' = 'blue';
    let lastBodyFinish: 'carbon' | 'obsidian' | 'argent' = 'carbon';

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const state = sharedStateRef.current;

      if (state.caliperColor !== lastCaliperColor) {
        lastCaliperColor = state.caliperColor;
        carRig.setCaliperColor(state.caliperColor);
      }
      if (state.bodyFinish !== lastBodyFinish) {
        lastBodyFinish = state.bodyFinish;
        carRig.setBodyFinish(state.bodyFinish);
      }

      mouseSmoothed.x = THREE.MathUtils.damp(mouseSmoothed.x, mouseTarget.x, 4, dt);
      mouseSmoothed.y = THREE.MathUtils.damp(mouseSmoothed.y, mouseTarget.y, 4, dt);

      const p = THREE.MathUtils.clamp(state.scrollProgress, 0, 1);

      // Determine active chapter and local progress
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
      const localT = THREE.MathUtils.clamp((p - rStart) / Math.max(0.001, rEnd - rStart), 0, 1);

      // -----------------------------------------------------------------------
      // A. COMPUTE HOLOGRAM CROSS-FADE OPACITY & EXPLOSION STATE
      //    Hologram is ONLY active in Chapters 04, 05, 06 (or when user manually
      //    drags the Explode slider > 0 or toggles X-Ray Blueprint in the dock).
      // -----------------------------------------------------------------------
      let targetHologramOpacity = 0.0;
      let targetExplosion = 0.0;
      let targetFov = 34;
      let targetSpeedKmh = 0;
      let targetRpm = 900;
      let targetHp = 120;
      let targetTorque = 320;
      let targetBoost = 0.1;
      let targetTurboGlow = 0.35;
      let heritageYear = 2019;
      let activeJourneyIndex = 0;

      _camPosTarget.set(-3.45, 0.98, 3.25);
      _camLookTarget.set(0.0, 0.46, 0.0);

      if (!state.isFilmPlaying) {
        if (currChap.index === 2) {
          heritageYear = Math.round(THREE.MathUtils.lerp(1936, 2019, localT));
        } else if (currChap.index === 4) {
          // CHAPTER 04: Cross-fade from Photo into Hologram as explosion starts
          targetHologramOpacity = THREE.MathUtils.smoothstep(localT, 0.0, 0.18);
          targetExplosion = THREE.MathUtils.smoothstep(localT, 0.08, 0.88);
          _camPosTarget.set(
            THREE.MathUtils.lerp(-3.45, -3.85, localT),
            THREE.MathUtils.lerp(0.98, 1.55, localT),
            THREE.MathUtils.lerp(3.25, 3.55, localT)
          );
          _camLookTarget.set(0, 0.52, 0);
          targetFov = 34;
        } else if (currChap.index === 5) {
          // CHAPTER 05: Full Hologram Inner View (Cockpit & Quad-Turbo W16 Bay)
          targetHologramOpacity = 1.0;
          targetExplosion = 0.88;

          const subMode =
            state.interiorFocus === 'cockpit'
              ? 0.15
              : state.interiorFocus === 'w16'
              ? 0.85
              : localT;

          if (subMode < 0.5) {
            const cAlpha = subMode * 2;
            _camPosTarget.set(
              THREE.MathUtils.lerp(-0.32, 0.18, cAlpha),
              THREE.MathUtils.lerp(0.74, 0.72, cAlpha),
              THREE.MathUtils.lerp(-0.18, -0.12, cAlpha)
            );
            _camLookTarget.set(
              THREE.MathUtils.lerp(-0.28, 0.0, cAlpha),
              0.56,
              0.52
            );
            targetFov = 42;
          } else {
            const eAlpha = (subMode - 0.5) * 2;
            _camPosTarget.set(
              THREE.MathUtils.lerp(0.95, -0.85, eAlpha),
              THREE.MathUtils.lerp(1.12, 0.98, eAlpha),
              THREE.MathUtils.lerp(-0.45, -1.05, eAlpha)
            );
            _camLookTarget.set(0, 0.56, -0.78);
            targetFov = 35;
          }

          targetRpm = Math.round(2400 + Math.abs(state.scrollVelocity) * 2200 + localT * 3200);
          targetTurboGlow = THREE.MathUtils.clamp(
            0.5 + Math.abs(state.scrollVelocity) * 0.5 + localT * 0.6,
            0.35,
            1.2
          );
        } else if (currChap.index === 6) {
          // CHAPTER 06: Reassembly in reverse order, then cross-fade back to the Hero Photo!
          targetExplosion = 1.0 - THREE.MathUtils.smoothstep(localT, 0.04, 0.76);
          targetHologramOpacity = 1.0 - THREE.MathUtils.smoothstep(localT, 0.72, 0.96);

          _camPosTarget.set(-3.45, 0.98, 3.25);
          _camLookTarget.set(0.0, 0.46, 0.0);
          targetFov = 32;

          if (localT > 0.76 && localT < 0.92) {
            if (!prevLockInTriggered) {
              prevLockInTriggered = true;
              soundEngine.playLockIn();
            }
          } else {
            prevLockInTriggered = false;
          }
        } else if (currChap.index === 7) {
          // CHAPTER 07: Performance Telemetry
          const perfCurve = THREE.MathUtils.smoothstep(localT, 0.0, 0.85);
          targetSpeedKmh = Math.round(
            THREE.MathUtils.lerp(60, 420, perfCurve) +
              Math.min(20, Math.abs(state.scrollVelocity) * 8)
          );
          targetRpm = Math.round(THREE.MathUtils.lerp(2200, 6700, perfCurve));
          targetHp = Math.round(THREE.MathUtils.lerp(420, 1500, perfCurve));
          targetTorque = Math.round(THREE.MathUtils.lerp(650, 1600, perfCurve));
          targetBoost = Number(THREE.MathUtils.lerp(0.4, 2.5, perfCurve).toFixed(2));
        } else if (currChap.index === 8) {
          activeJourneyIndex = Math.min(3, Math.floor(localT * 4));
          targetSpeedKmh = 210;
          targetRpm = 3800;
        }
      }

      // Manual overrides from the bottom Control Dock
      if (state.manualExplosion !== null && state.manualExplosion > 0.01) {
        targetExplosion = state.manualExplosion;
        targetHologramOpacity = 1.0;
      }
      if (state.xrayOverride) {
        targetHologramOpacity = 1.0;
      }

      currentHologramOpacity = THREE.MathUtils.damp(
        currentHologramOpacity,
        targetHologramOpacity,
        6.0,
        dt
      );
      currentExplosion = THREE.MathUtils.damp(currentExplosion, targetExplosion, 5.0, dt);

      // Update Exploded View Part Positions
      for (let i = 0; i < PART_EXPLOSIONS.length; i++) {
        const cfg = PART_EXPLOSIONS[i];
        const partGrp = carRig.parts[cfg.id];
        if (!partGrp) continue;

        const staggeredProgress = THREE.MathUtils.clamp(
          (currentExplosion - cfg.stagger) / Math.max(0.01, 1 - cfg.stagger),
          0,
          1
        );
        const eased = THREE.MathUtils.smoothstep(staggeredProgress, 0, 1);

        partGrp.position.set(
          cfg.offset[0] * eased,
          cfg.offset[1] * eased,
          cfg.offset[2] * eased
        );
        partGrp.rotation.set(
          cfg.rotation[0] * eased,
          cfg.rotation[1] * eased,
          cfg.rotation[2] * eased
        );
      }

      carRig.setXrayFactor(state.xrayOverride ? 0.95 : 0.65);

      // Camera & OrbitControls Update
      const shouldUseOrbitControls =
        !state.isFilmPlaying && state.freeOrbitEnabled && currentHologramOpacity > 0.2;
      controls.enabled = shouldUseOrbitControls;

      if (shouldUseOrbitControls && userInteractingWithOrbit) {
        controls.update();
        currentCamPos.copy(camera.position);
        currentCamTarget.copy(controls.target);
      } else {
        const parallaxX = mouseSmoothed.x * 0.14;
        const parallaxY = -mouseSmoothed.y * 0.08;

        currentCamPos.x = THREE.MathUtils.damp(
          currentCamPos.x,
          _camPosTarget.x + parallaxX,
          4.5,
          dt
        );
        currentCamPos.y = THREE.MathUtils.damp(
          currentCamPos.y,
          Math.max(0.2, _camPosTarget.y + parallaxY),
          4.5,
          dt
        );
        currentCamPos.z = THREE.MathUtils.damp(currentCamPos.z, _camPosTarget.z, 4.5, dt);

        currentCamTarget.x = THREE.MathUtils.damp(
          currentCamTarget.x,
          _camLookTarget.x,
          5.5,
          dt
        );
        currentCamTarget.y = THREE.MathUtils.damp(
          currentCamTarget.y,
          _camLookTarget.y,
          5.5,
          dt
        );
        currentCamTarget.z = THREE.MathUtils.damp(
          currentCamTarget.z,
          _camLookTarget.z,
          5.5,
          dt
        );

        camera.position.copy(currentCamPos);
        controls.target.copy(currentCamTarget);
        camera.lookAt(currentCamTarget);
      }

      currentFov = THREE.MathUtils.damp(currentFov, targetFov, 4.5, dt);
      if (Math.abs(camera.fov - currentFov) > 0.02) {
        camera.fov = currentFov;
        camera.updateProjectionMatrix();
      }

      // W16 Pistons, Crankshaft & Turbos Animation
      const engineFreq = (targetRpm / 60) * 0.45 + Math.abs(state.scrollVelocity) * 8.0;
      engineCrankAngle += engineFreq * dt;
      carRig.crankshaft.rotation.z = engineCrankAngle;
      for (let i = 0; i < carRig.pistons.length; i++) {
        const piston = carRig.pistons[i];
        const { baseX, baseY, angle, phase } = piston.userData;
        const stroke = Math.sin(engineCrankAngle * 2.0 + phase) * 0.035;
        piston.position.x = baseX - Math.sin(angle) * stroke;
        piston.position.y = baseY + Math.cos(angle) * stroke;
      }
      for (let i = 0; i < carRig.turbos.length; i++) {
        carRig.turbos[i].rotation.x += engineFreq * 2.2 * dt;
      }
      carRig.materials.turboGlowMat.emissiveIntensity = THREE.MathUtils.damp(
        carRig.materials.turboGlowMat.emissiveIntensity,
        targetTurboGlow,
        5.0,
        dt
      );

      soundEngine.updateTelemetry(state.scrollVelocity, targetSpeedKmh / 420);

      // Project 3D Part Anchors for Chapter 04 SVG Leader Lines
      if (onUpdateProjectionsRef.current) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const leaders: Record<string, ProjectedPoint2D> = {};

        if (currentHologramOpacity > 0.25 && currentExplosion > 0.08) {
          for (let i = 0; i < PART_EXPLOSIONS.length; i++) {
            const cfg = PART_EXPLOSIONS[i];
            const partGrp = carRig.parts[cfg.id];
            _projVec.set(
              cfg.leaderAnchor[0] + partGrp.position.x,
              cfg.leaderAnchor[1] + partGrp.position.y,
              cfg.leaderAnchor[2] + partGrp.position.z
            );
            _projVec.project(camera);
            leaders[cfg.id] = {
              id: cfg.id,
              x: (_projVec.x * 0.5 + 0.5) * w,
              y: (-_projVec.y * 0.5 + 0.5) * h,
              visible: _projVec.z < 1.0 && _projVec.z > -1.0,
            };
          }
        }

        onUpdateProjectionsRef.current(leaders, {
          speedKmh: targetSpeedKmh,
          rpm: targetRpm,
          hp: targetHp,
          torqueNm: targetTorque,
          boostBar: targetBoost,
          heritageYear,
          activeJourneyIndex,
          hologramOpacity: currentHologramOpacity,
        });
      }

      // Render 3D scene only when hologram is visible (> 0.01) to save GPU
      if (currentHologramOpacity > 0.01) {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      carRig.dispose();
      textures.dispose();
      renderer.dispose();
    };
  }, [sharedStateRef]);

  return (
    <div
      ref={canvasMountRef}
      className="fixed inset-0 z-[1] w-full h-full pointer-events-auto"
      aria-label="3D Blueprint Hologram Stage"
    />
  );
};
