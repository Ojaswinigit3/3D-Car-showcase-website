import * as THREE from 'three';

export interface ProceduralTextureSet {
  carbonRoughnessMap: THREE.CanvasTexture;
  carbonNormalMap: THREE.CanvasTexture;
  grilleMeshMap: THREE.CanvasTexture;
  bugattiBadgeMap: THREE.CanvasTexture;
  floorShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

/**
 * Generates zero-404 procedural high-resolution textures for La Voiture Noire.
 * Color maps use SRGBColorSpace; roughness/normal maps stay in linear NoColorSpace.
 */
export function createProceduralTextures(maxAnisotropy = 4): ProceduralTextureSet {
  // 1. Herringbone / Twill Carbon Fiber Roughness & Micro-Normal Map
  const carbonCanvas = document.createElement('canvas');
  carbonCanvas.width = 256;
  carbonCanvas.height = 256;
  const cCtx = carbonCanvas.getContext('2d')!;
  cCtx.fillStyle = '#222226';
  cCtx.fillRect(0, 0, 256, 256);

  const step = 16;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      const alt = ((x + y) / step) % 2 === 0;
      cCtx.fillStyle = alt ? '#151519' : '#34343b';
      cCtx.fillRect(x, y, step / 2, step);
      cCtx.fillStyle = alt ? '#2e2e35' : '#19191e';
      cCtx.fillRect(x + step / 2, y, step / 2, step);
    }
  }

  const carbonRoughnessMap = new THREE.CanvasTexture(carbonCanvas);
  carbonRoughnessMap.wrapS = THREE.RepeatWrapping;
  carbonRoughnessMap.wrapT = THREE.RepeatWrapping;
  carbonRoughnessMap.repeat.set(28, 28);
  carbonRoughnessMap.anisotropy = maxAnisotropy;

  // Normal-like bump contrast canvas
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = 256;
  normalCanvas.height = 256;
  const nCtx = normalCanvas.getContext('2d')!;
  nCtx.fillStyle = 'rgb(128, 128, 255)';
  nCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      nCtx.fillStyle = 'rgb(142, 136, 255)';
      nCtx.fillRect(x, y, step / 2, step / 2);
      nCtx.fillStyle = 'rgb(114, 120, 255)';
      nCtx.fillRect(x + step / 2, y + step / 2, step / 2, step / 2);
    }
  }
  const carbonNormalMap = new THREE.CanvasTexture(normalCanvas);
  carbonNormalMap.wrapS = THREE.RepeatWrapping;
  carbonNormalMap.wrapT = THREE.RepeatWrapping;
  carbonNormalMap.repeat.set(28, 28);
  carbonNormalMap.anisotropy = maxAnisotropy;

  // 2. 3D-Printed Horseshoe & Intake Diamond Mesh Texture
  const grilleCanvas = document.createElement('canvas');
  grilleCanvas.width = 256;
  grilleCanvas.height = 256;
  const gCtx = grilleCanvas.getContext('2d')!;
  gCtx.fillStyle = '#040405';
  gCtx.fillRect(0, 0, 256, 256);
  gCtx.strokeStyle = '#383b42';
  gCtx.lineWidth = 3;
  const cell = 24;
  for (let i = -256; i < 512; i += cell) {
    gCtx.beginPath();
    gCtx.moveTo(i, 0);
    gCtx.lineTo(i + 256, 256);
    gCtx.stroke();

    gCtx.beginPath();
    gCtx.moveTo(i + 256, 0);
    gCtx.lineTo(i, 256);
    gCtx.stroke();
  }
  const grilleMeshMap = new THREE.CanvasTexture(grilleCanvas);
  grilleMeshMap.colorSpace = THREE.SRGBColorSpace;
  grilleMeshMap.wrapS = THREE.RepeatWrapping;
  grilleMeshMap.wrapT = THREE.RepeatWrapping;
  grilleMeshMap.repeat.set(6, 4);
  grilleMeshMap.anisotropy = maxAnisotropy;

  // 3. Red & Silver Bugatti Oval Badge ("Le Macaron")
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 256;
  badgeCanvas.height = 128;
  const bCtx = badgeCanvas.getContext('2d')!;
  bCtx.clearRect(0, 0, 256, 128);

  // Outer silver pearl border
  bCtx.beginPath();
  bCtx.ellipse(128, 64, 118, 54, 0, 0, Math.PI * 2);
  bCtx.fillStyle = '#e5e7eb';
  bCtx.fill();

  // Inner crimson enamel oval
  bCtx.beginPath();
  bCtx.ellipse(128, 64, 106, 44, 0, 0, Math.PI * 2);
  bCtx.fillStyle = '#c8102e';
  bCtx.fill();

  // Bugatti wordmark
  bCtx.fillStyle = '#ffffff';
  bCtx.font = 'bold 34px "Space Grotesk", sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText('BUGATTI', 128, 67);

  const bugattiBadgeMap = new THREE.CanvasTexture(badgeCanvas);
  bugattiBadgeMap.colorSpace = THREE.SRGBColorSpace;
  bugattiBadgeMap.anisotropy = maxAnisotropy;

  // 4. Radial Contact Shadow & Specular Floor Mask
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fCtx = floorCanvas.getContext('2d')!;
  const grad = fCtx.createRadialGradient(256, 256, 20, 256, 256, 250);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  fCtx.fillStyle = grad;
  fCtx.fillRect(0, 0, 512, 512);

  const floorShadowMap = new THREE.CanvasTexture(floorCanvas);
  floorShadowMap.colorSpace = THREE.SRGBColorSpace;

  return {
    carbonRoughnessMap,
    carbonNormalMap,
    grilleMeshMap,
    bugattiBadgeMap,
    floorShadowMap,
    dispose: () => {
      carbonRoughnessMap.dispose();
      carbonNormalMap.dispose();
      grilleMeshMap.dispose();
      bugattiBadgeMap.dispose();
      floorShadowMap.dispose();
    },
  };
}
