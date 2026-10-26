import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ASSET_PATHS, PartGroupName } from '../config/cinemaConfig';
import { ProceduralTextureSet } from './proceduralTextures';

export interface CarRig {
  root: THREE.Group;
  parts: Record<PartGroupName, THREE.Group>;
  restPositions: Record<PartGroupName, THREE.Vector3>;
  restRotations: Record<PartGroupName, THREE.Euler>;
  wheelsSpinGroups: THREE.Group[];
  pistons: THREE.Mesh[];
  crankshaft: THREE.Group;
  turbos: THREE.Mesh[];
  steeringWheel: THREE.Group;
  atlanticGhost: THREE.Group;
  xrayOverlayGroup: THREE.Group;
  materials: {
    bodyClearcoat: THREE.MeshStandardMaterial;
    caliperMat: THREE.MeshStandardMaterial;
    turboGlowMat: THREE.MeshStandardMaterial;
    atlanticGhostMat: THREE.MeshStandardMaterial;
    xrayWireMat: THREE.LineBasicMaterial;
    headlightEmissiveMat: THREE.MeshStandardMaterial;
    taillightEmissiveMat: THREE.MeshStandardMaterial;
    glintSweepMat: THREE.MeshStandardMaterial;
  };
  setCaliperColor: (color: 'blue' | 'red') => void;
  setBodyFinish: (finish: 'carbon' | 'obsidian' | 'argent') => void;
  setXrayFactor: (factor: number) => void;
  dispose: () => void;
}

/**
 * Builds the 17-part Bugatti La Voiture Noire CAD Blueprint / Hologram Rig
 * used exclusively for Chapters 04–06 (Exploded View, Cockpit/W16 Inner View,
 * and Reassembly). Every part is rendered with a dark translucent core and
 * crisp electric-blue (`#00b7ff`) CAD edge geometry with soft, non-overexposed lighting.
 */
export function buildLaVoitureNoire(
  _textures: ProceduralTextureSet,
  _isSoftwareGl: boolean
): CarRig {
  const root = new THREE.Group();
  root.name = 'LaVoitureNoire_HologramRoot';

  const partNames: PartGroupName[] = [
    'bodyShell',
    'hood',
    'roof',
    'doorLeft',
    'doorRight',
    'frontBumper',
    'rearDiffuser',
    'wheelFL',
    'wheelFR',
    'wheelRL',
    'wheelRR',
    'headlights',
    'taillight',
    'engineBlock',
    'monocoque',
    'interior',
    'suspension',
  ];

  const parts = {} as Record<PartGroupName, THREE.Group>;
  const restPositions = {} as Record<PartGroupName, THREE.Vector3>;
  const restRotations = {} as Record<PartGroupName, THREE.Euler>;

  for (const name of partNames) {
    const grp = new THREE.Group();
    grp.name = name;
    parts[name] = grp;
    restPositions[name] = new THREE.Vector3(0, 0, 0);
    restRotations[name] = new THREE.Euler(0, 0, 0);
    root.add(grp);
  }

  // --- Soft Matte Hologram / Blueprint Material Library (No Overexposure) ---
  const bodyClearcoat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#07111e'),
    emissive: new THREE.Color('#031528'),
    emissiveIntensity: 0.35,
    metalness: 0.25,
    roughness: 0.75,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  });

  const satinCarbonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#081322'),
    emissive: new THREE.Color('#041b33'),
    emissiveIntensity: 0.3,
    metalness: 0.2,
    roughness: 0.8,
    transparent: true,
    opacity: 0.68,
  });

  const brushedSilverMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#132942'),
    emissive: new THREE.Color('#004b76'),
    emissiveIntensity: 0.45,
    metalness: 0.35,
    roughness: 0.65,
    transparent: true,
    opacity: 0.78,
  });

  const darkTitaniumMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0b1929'),
    emissive: new THREE.Color('#062844'),
    emissiveIntensity: 0.35,
    metalness: 0.3,
    roughness: 0.7,
    transparent: true,
    opacity: 0.82,
  });

  const grilleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#05101c'),
    emissive: new THREE.Color('#003b5c'),
    emissiveIntensity: 0.4,
    metalness: 0.2,
    roughness: 0.8,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#071a2e'),
    emissive: new THREE.Color('#00385e'),
    emissiveIntensity: 0.3,
    metalness: 0.1,
    roughness: 0.7,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });

  const caliperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00b7ff'),
    emissive: new THREE.Color('#0077aa'),
    emissiveIntensity: 0.55,
    metalness: 0.3,
    roughness: 0.5,
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#060e18'),
    emissive: new THREE.Color('#031829'),
    emissiveIntensity: 0.25,
    metalness: 0.1,
    roughness: 0.85,
    transparent: true,
    opacity: 0.65,
  });

  const brakeDiscMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0e2238'),
    emissive: new THREE.Color('#004266'),
    emissiveIntensity: 0.35,
    metalness: 0.3,
    roughness: 0.65,
  });

  const havanaLeatherMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0c1e33'),
    emissive: new THREE.Color('#003f66'),
    emissiveIntensity: 0.38,
    metalness: 0.15,
    roughness: 0.75,
    transparent: true,
    opacity: 0.75,
  });

  const headlightEmissiveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00b7ff'),
    emissive: new THREE.Color('#0099dd'),
    emissiveIntensity: 0.75,
    metalness: 0.2,
    roughness: 0.4,
  });

  const taillightEmissiveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c8102e'),
    emissive: new THREE.Color('#a50d26'),
    emissiveIntensity: 0.8,
    metalness: 0.2,
    roughness: 0.4,
  });

  const turboGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#28181c'),
    emissive: new THREE.Color('#c8102e'),
    emissiveIntensity: 0.45,
    metalness: 0.35,
    roughness: 0.55,
  });

  const glintSweepMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00b7ff'),
    emissive: new THREE.Color('#00b7ff'),
    emissiveIntensity: 0.4,
    metalness: 0.3,
    roughness: 0.5,
  });

  const atlanticGhostMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00b7ff'),
    emissive: new THREE.Color('#0066aa'),
    emissiveIntensity: 0.4,
    wireframe: true,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });

  // Primary Electric-Blue CAD Blueprint Edge Line Material
  const xrayWireMat = new THREE.LineBasicMaterial({
    color: new THREE.Color('#00b7ff'),
    transparent: true,
    opacity: 0.78,
  });

  const secondaryWireMat = new THREE.LineBasicMaterial({
    color: new THREE.Color('#38bdf8'),
    transparent: true,
    opacity: 0.42,
  });

  // Helper to attach crisp CAD blueprint edges to every mesh
  const attachBlueprintEdges = (
    mesh: THREE.Mesh,
    thresholdAngle = 14,
    useSecondary = false
  ) => {
    const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
    const line = new THREE.LineSegments(
      edgesGeo,
      useSecondary ? secondaryWireMat : xrayWireMat
    );
    mesh.add(line);
  };

  // ---------------------------------------------------------------------------
  // 1. BODY SHELL (Low Sleek Hypercar Silhouette, Fender Arches & Rear Deck)
  // ---------------------------------------------------------------------------
  const bodyShell = parts.bodyShell;

  // Low, wide hypercar profile matching the photo's proportions
  const fuselageShape = new THREE.Shape();
  fuselageShape.moveTo(-2.18, 0.16);
  fuselageShape.lineTo(2.05, 0.14);
  fuselageShape.quadraticCurveTo(2.26, 0.20, 2.16, 0.42);
  fuselageShape.quadraticCurveTo(1.55, 0.58, 0.88, 0.62);
  fuselageShape.quadraticCurveTo(0.18, 0.66, -0.58, 0.66);
  fuselageShape.quadraticCurveTo(-1.38, 0.72, -1.96, 0.58);
  fuselageShape.quadraticCurveTo(-2.22, 0.46, -2.18, 0.16);

  const fuselageGeo = new THREE.ExtrudeGeometry(fuselageShape, {
    depth: 1.76,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.09,
    bevelThickness: 0.10,
  });
  fuselageGeo.center();
  fuselageGeo.rotateY(Math.PI / 2);
  const fuselageMesh = new THREE.Mesh(fuselageGeo, bodyClearcoat);
  fuselageMesh.position.set(0, 0.42, -0.04);
  attachBlueprintEdges(fuselageMesh, 10);
  bodyShell.add(fuselageMesh);

  // Front & Rear Fender Arches
  const archOffsets: Array<[number, number, number, number, number]> = [
    [-0.88, 0.40, 1.36, 0.44, 0.88],
    [0.88, 0.40, 1.36, 0.44, 0.88],
    [-0.92, 0.45, -1.34, 0.49, 1.02],
    [0.92, 0.45, -1.34, 0.49, 1.02],
  ];
  archOffsets.forEach(([x, y, z, r, len]) => {
    const haunchGeo = new THREE.CylinderGeometry(r * 0.88, r, len, 20);
    haunchGeo.rotateZ(Math.PI / 2);
    haunchGeo.scale(0.58, 0.68, 1.32);
    const haunch = new THREE.Mesh(haunchGeo, bodyClearcoat);
    haunch.position.set(x, y, z);
    attachBlueprintEdges(haunch, 12, true);
    bodyShell.add(haunch);
  });

  // Side Rocker Skirts & Signature Bugatti C-Line Curve
  [-1, 1].forEach((side) => {
    const rockerGeo = new THREE.BoxGeometry(0.07, 0.07, 1.65);
    const rocker = new THREE.Mesh(rockerGeo, brushedSilverMat);
    rocker.position.set(side * 0.96, 0.19, -0.02);
    attachBlueprintEdges(rocker);
    bodyShell.add(rocker);

    const cCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.82, 0.88, 0.35),
      new THREE.Vector3(side * 0.90, 0.82, -0.25),
      new THREE.Vector3(side * 0.96, 0.58, -0.58),
      new THREE.Vector3(side * 0.94, 0.28, -0.22),
    ]);
    const cGeo = new THREE.TubeGeometry(cCurve, 24, 0.02, 8, false);
    const cMesh = new THREE.Mesh(cGeo, brushedSilverMat);
    attachBlueprintEdges(cMesh, 15);
    bodyShell.add(cMesh);
  });

  // Perforated Rear Engine Deck Louvers
  for (let row = 0; row < 6; row++) {
    const louverGeo = new THREE.BoxGeometry(0.66 - row * 0.04, 0.018, 0.05);
    const louver = new THREE.Mesh(louverGeo, satinCarbonMat);
    louver.position.set(0, 0.78 - row * 0.014, -0.78 - row * 0.14);
    louver.rotation.x = -0.12;
    attachBlueprintEdges(louver);
    bodyShell.add(louver);
  }

  // ---------------------------------------------------------------------------
  // 2. HOOD (Front Perforated Hood, Central Spine & Aero Wiper)
  // ---------------------------------------------------------------------------
  const hood = parts.hood;
  const hoodGeo = new THREE.BoxGeometry(1.38, 0.06, 1.10, 8, 1, 8);
  const hoodPos = hoodGeo.attributes.position;
  for (let i = 0; i < hoodPos.count; i++) {
    const z = hoodPos.getZ(i);
    const x = hoodPos.getX(i);
    if (z > 0) {
      hoodPos.setX(i, x * (1 - z * 0.24));
      hoodPos.setY(i, hoodPos.getY(i) - z * 0.13);
    }
  }
  hoodGeo.computeVertexNormals();
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyClearcoat);
  hoodMesh.position.set(0, 0.62, 1.38);
  attachBlueprintEdges(hoodMesh, 8);
  hood.add(hoodMesh);

  [-0.25, 0.25].forEach((x) => {
    const ventGeo = new THREE.PlaneGeometry(0.26, 0.44, 4, 6);
    ventGeo.rotateX(-Math.PI / 2 + 0.15);
    const vent = new THREE.Mesh(ventGeo, grilleMat);
    vent.position.set(x, 0.66, 1.32);
    hood.add(vent);
  });

  const hoodSpineGeo = new THREE.BoxGeometry(0.02, 0.03, 1.12);
  const hoodSpine = new THREE.Mesh(hoodSpineGeo, glintSweepMat);
  hoodSpine.position.set(0, 0.66, 1.38);
  hoodSpine.rotation.x = 0.12;
  attachBlueprintEdges(hoodSpine);
  hood.add(hoodSpine);

  const wiperBladeGeo = new THREE.BoxGeometry(0.028, 0.02, 0.74);
  const wiperBlade = new THREE.Mesh(wiperBladeGeo, brushedSilverMat);
  wiperBlade.position.set(-0.06, 0.78, 0.62);
  wiperBlade.rotation.set(-0.38, -0.2, 0);
  attachBlueprintEdges(wiperBlade);
  hood.add(wiperBlade);

  // ---------------------------------------------------------------------------
  // 3. ROOF (Visor Windshield, Coupe Canopy & Atlantic Dorsal Fin)
  // ---------------------------------------------------------------------------
  const roof = parts.roof;

  const canopyGeo = new THREE.CylinderGeometry(0.56, 0.74, 1.44, 18, 1, false, 0, Math.PI);
  canopyGeo.rotateZ(Math.PI / 2);
  canopyGeo.rotateY(Math.PI / 2);
  canopyGeo.scale(1.02, 0.50, 1.12);
  const canopyMesh = new THREE.Mesh(canopyGeo, glassMat);
  canopyMesh.position.set(0, 0.68, 0.05);
  attachBlueprintEdges(canopyMesh, 10);
  roof.add(canopyMesh);

  const roofPanelGeo = new THREE.BoxGeometry(0.92, 0.04, 1.02);
  const roofPanel = new THREE.Mesh(roofPanelGeo, bodyClearcoat);
  roofPanel.position.set(0, 0.94, -0.12);
  roofPanel.rotation.x = -0.05;
  attachBlueprintEdges(roofPanel);
  roof.add(roofPanel);

  const finGeo = new THREE.BoxGeometry(0.022, 0.09, 1.75);
  const dorsalFin = new THREE.Mesh(finGeo, glintSweepMat);
  dorsalFin.position.set(0, 0.95, -0.45);
  dorsalFin.rotation.x = -0.08;
  attachBlueprintEdges(dorsalFin);
  roof.add(dorsalFin);

  // ---------------------------------------------------------------------------
  // 4 & 5. LEFT AND RIGHT DOORS (Sculpted Flanks + Wing Mirrors)
  // ---------------------------------------------------------------------------
  ([-1, 1] as const).forEach((side) => {
    const doorGroup = side === -1 ? parts.doorLeft : parts.doorRight;

    const doorGeo = new THREE.BoxGeometry(0.12, 0.42, 1.22, 2, 2, 4);
    const doorPanel = new THREE.Mesh(doorGeo, bodyClearcoat);
    doorPanel.position.set(side * 0.94, 0.48, 0.14);
    attachBlueprintEdges(doorPanel);
    doorGroup.add(doorPanel);

    const stalkGeo = new THREE.BoxGeometry(0.16, 0.024, 0.05);
    const stalk = new THREE.Mesh(stalkGeo, brushedSilverMat);
    stalk.position.set(side * 1.0, 0.70, 0.50);
    stalk.rotation.z = side * 0.16;
    attachBlueprintEdges(stalk);
    doorGroup.add(stalk);

    const mirrorCapGeo = new THREE.BoxGeometry(0.18, 0.06, 0.12);
    const mirrorCap = new THREE.Mesh(mirrorCapGeo, brushedSilverMat);
    mirrorCap.position.set(side * 1.10, 0.72, 0.48);
    attachBlueprintEdges(mirrorCap);
    doorGroup.add(mirrorCap);
  });

  // ---------------------------------------------------------------------------
  // 6. FRONT BUMPER & HORSESHOE GRILLE
  // ---------------------------------------------------------------------------
  const frontBumper = parts.frontBumper;

  const splitterGeo = new THREE.BoxGeometry(1.90, 0.04, 0.44, 6, 1, 2);
  const splitter = new THREE.Mesh(splitterGeo, satinCarbonMat);
  splitter.position.set(0, 0.15, 2.06);
  attachBlueprintEdges(splitter);
  frontBumper.add(splitter);

  [-0.55, 0.55].forEach((x) => {
    const intakeGeo = new THREE.BoxGeometry(0.52, 0.24, 0.16, 4, 2, 1);
    const intake = new THREE.Mesh(intakeGeo, grilleMat);
    intake.position.set(x, 0.31, 2.10);
    intake.rotation.y = x > 0 ? -0.15 : 0.15;
    attachBlueprintEdges(intake);
    frontBumper.add(intake);
  });

  const hsFrameGeo = new THREE.TorusGeometry(0.22, 0.024, 10, 24, Math.PI * 1.15);
  hsFrameGeo.rotateZ(-Math.PI * 0.075);
  hsFrameGeo.scale(0.86, 1.32, 1);
  const hsFrame = new THREE.Mesh(hsFrameGeo, brushedSilverMat);
  hsFrame.position.set(0, 0.32, 2.24);
  attachBlueprintEdges(hsFrame, 12);
  frontBumper.add(hsFrame);

  const badgeGeo = new THREE.BoxGeometry(0.12, 0.06, 0.02);
  const badgeMesh = new THREE.Mesh(badgeGeo, taillightEmissiveMat);
  badgeMesh.position.set(0, 0.48, 2.26);
  attachBlueprintEdges(badgeMesh);
  frontBumper.add(badgeMesh);

  // ---------------------------------------------------------------------------
  // 7. REAR DIFFUSER & SIX TITANIUM EXHAUST OUTLETS
  // ---------------------------------------------------------------------------
  const rearDiffuser = parts.rearDiffuser;

  const diffuserBaseGeo = new THREE.BoxGeometry(1.84, 0.24, 0.34, 6, 2, 2);
  const diffuserBase = new THREE.Mesh(diffuserBaseGeo, satinCarbonMat);
  diffuserBase.position.set(0, 0.24, -2.10);
  attachBlueprintEdges(diffuserBase);
  rearDiffuser.add(diffuserBase);

  for (let i = 0; i < 6; i++) {
    const xOffset = (i - 2.5) * 0.115;
    const pipeGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.22, 14, 1, true);
    pipeGeo.rotateX(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, brushedSilverMat);
    pipe.position.set(xOffset, 0.34, -2.22);
    attachBlueprintEdges(pipe, 15);
    rearDiffuser.add(pipe);
  }

  // ---------------------------------------------------------------------------
  // 8. HEADLIGHTS (Elevated Fender-Crest Crystal LED Matrix Blades)
  // ---------------------------------------------------------------------------
  const headlights = parts.headlights;
  ([-1, 1] as const).forEach((side) => {
    const hlGroup = new THREE.Group();
    hlGroup.position.set(side * 0.72, 0.56, 1.70);
    hlGroup.rotation.set(0.24, side * -0.22, side * -0.1);

    const housingGeo = new THREE.BoxGeometry(0.26, 0.06, 0.50);
    const housing = new THREE.Mesh(housingGeo, satinCarbonMat);
    attachBlueprintEdges(housing);
    hlGroup.add(housing);

    for (let b = 0; b < 8; b++) {
      const row = Math.floor(b / 4);
      const col = b % 4;
      const bladeGeo = new THREE.BoxGeometry(0.042, 0.016, 0.08);
      const blade = new THREE.Mesh(bladeGeo, headlightEmissiveMat);
      blade.position.set((col - 1.5) * 0.055, 0.025, (row - 0.5) * 0.16);
      hlGroup.add(blade);
    }
    headlights.add(hlGroup);
  });

  // ---------------------------------------------------------------------------
  // 9. TAILLIGHT STRIP (Curvilinear Full-Width LED Ribbon)
  // ---------------------------------------------------------------------------
  const taillight = parts.taillight;
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.82, 0.58, -2.06),
    new THREE.Vector3(-0.44, 0.64, -2.16),
    new THREE.Vector3(0.0, 0.62, -2.19),
    new THREE.Vector3(0.44, 0.64, -2.16),
    new THREE.Vector3(0.82, 0.58, -2.06),
  ]);
  const tailRibbonGeo = new THREE.TubeGeometry(tailCurve, 32, 0.018, 8, false);
  const tailRibbon = new THREE.Mesh(tailRibbonGeo, taillightEmissiveMat);
  attachBlueprintEdges(tailRibbon, 15);
  taillight.add(tailRibbon);

  // ---------------------------------------------------------------------------
  // 10–13. FOUR WHEELS (Swirling 5-Y-Spoke Alloy Rims, Tyres & Blue Calipers)
  // ---------------------------------------------------------------------------
  const wheelsSpinGroups: THREE.Group[] = [];
  const wheelConfigs: Array<{
    partName: PartGroupName;
    pos: [number, number, number];
    radius: number;
    width: number;
    isLeft: boolean;
  }> = [
    { partName: 'wheelFL', pos: [-0.90, 0.36, 1.36], radius: 0.36, width: 0.26, isLeft: true },
    { partName: 'wheelFR', pos: [0.90, 0.36, 1.36], radius: 0.36, width: 0.26, isLeft: false },
    { partName: 'wheelRL', pos: [-0.93, 0.38, -1.34], radius: 0.38, width: 0.32, isLeft: true },
    { partName: 'wheelRR', pos: [0.93, 0.38, -1.34], radius: 0.38, width: 0.32, isLeft: false },
  ];

  wheelConfigs.forEach(({ partName, pos, radius, width, isLeft }) => {
    const wheelHolder = parts[partName];
    const wheelAssembly = new THREE.Group();
    wheelAssembly.position.set(pos[0], pos[1], pos[2]);
    wheelHolder.add(wheelAssembly);

    const caliperAngle = pos[2] > 0 ? -0.35 : 0.35;
    const caliperGeo = new THREE.BoxGeometry(0.10, 0.22, 0.13);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    const sideSign = isLeft ? -1 : 1;
    caliper.position.set(
      sideSign * 0.04,
      Math.sin(caliperAngle) * (radius * 0.52),
      Math.cos(caliperAngle) * (radius * 0.52)
    );
    caliper.rotation.x = -caliperAngle;
    attachBlueprintEdges(caliper);
    wheelAssembly.add(caliper);

    const spinGroup = new THREE.Group();
    wheelAssembly.add(spinGroup);
    wheelsSpinGroups.push(spinGroup);

    const tyreGeo = new THREE.CylinderGeometry(radius, radius, width, 24, 1, false);
    tyreGeo.rotateZ(Math.PI / 2);
    const tyre = new THREE.Mesh(tyreGeo, tireRubberMat);
    attachBlueprintEdges(tyre, 15, true);
    spinGroup.add(tyre);

    const rimRadius = radius * 0.78;
    const rimBarrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width * 1.01, 20, 1, true);
    rimBarrelGeo.rotateZ(Math.PI / 2);
    const rimBarrel = new THREE.Mesh(rimBarrelGeo, brushedSilverMat);
    attachBlueprintEdges(rimBarrel, 15);
    spinGroup.add(rimBarrel);

    const rotorGeo = new THREE.CylinderGeometry(radius * 0.60, radius * 0.60, 0.03, 20);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, brakeDiscMat);
    rotor.position.x = sideSign * -0.02;
    attachBlueprintEdges(rotor, 15, true);
    spinGroup.add(rotor);

    const faceOffset = sideSign * (width * 0.48);
    for (let s = 0; s < 5; s++) {
      const baseAngle = (s / 5) * Math.PI * 2;
      const spokeAGeo = new THREE.BoxGeometry(0.024, rimRadius * 0.86, 0.032);
      const spokeA = new THREE.Mesh(spokeAGeo, brushedSilverMat);
      spokeA.position.set(
        faceOffset,
        Math.cos(baseAngle) * (rimRadius * 0.45),
        Math.sin(baseAngle) * (rimRadius * 0.45)
      );
      spokeA.rotation.x = baseAngle + 0.34;
      attachBlueprintEdges(spokeA);
      spinGroup.add(spokeA);
    }
  });

  // ---------------------------------------------------------------------------
  // 14. ENGINE BLOCK (8.0L Quad-Turbo W16 with 16 Pistons, Crankshaft & 4 Turbos)
  // ---------------------------------------------------------------------------
  const engineBlock = parts.engineBlock;
  const engineOrigin = new THREE.Group();
  engineOrigin.position.set(0, 0.42, -0.78);
  engineBlock.add(engineOrigin);

  const blockGeo = new THREE.BoxGeometry(0.66, 0.34, 0.80, 3, 2, 4);
  const blockMesh = new THREE.Mesh(blockGeo, darkTitaniumMat);
  attachBlueprintEdges(blockMesh);
  engineOrigin.add(blockMesh);

  [-0.22, 0.22].forEach((x) => {
    const plenumGeo = new THREE.BoxGeometry(0.20, 0.07, 0.74);
    const plenum = new THREE.Mesh(plenumGeo, brushedSilverMat);
    plenum.position.set(x, 0.22, 0);
    plenum.rotation.z = x > 0 ? -0.22 : 0.22;
    attachBlueprintEdges(plenum);
    engineOrigin.add(plenum);
  });

  const crankshaft = new THREE.Group();
  crankshaft.position.set(0, -0.08, 0);
  const crankShaftBarGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.86, 12);
  crankShaftBarGeo.rotateX(Math.PI / 2);
  const crankShaftBar = new THREE.Mesh(crankShaftBarGeo, brushedSilverMat);
  attachBlueprintEdges(crankShaftBar);
  crankshaft.add(crankShaftBar);
  engineOrigin.add(crankshaft);

  const pistons: THREE.Mesh[] = [];
  const pistonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.13, 12);
  for (let i = 0; i < 16; i++) {
    const bank = i % 4;
    const row = Math.floor(i / 4);
    const bankAngles = [-0.42, -0.16, 0.16, 0.42];
    const bankX = [-0.24, -0.09, 0.09, 0.24];
    const zPos = (row - 1.5) * 0.17;

    const piston = new THREE.Mesh(pistonGeo, caliperMat);
    piston.position.set(bankX[bank], 0.12, zPos);
    piston.rotation.z = bankAngles[bank];
    piston.userData = {
      baseX: bankX[bank],
      baseY: 0.12,
      zPos,
      angle: bankAngles[bank],
      phase: (i * Math.PI) / 4,
    };
    attachBlueprintEdges(piston);
    pistons.push(piston);
    engineOrigin.add(piston);
  }

  const turbos: THREE.Mesh[] = [];
  const turboPositions: Array<[number, number, number]> = [
    [-0.38, 0.08, -0.26],
    [0.38, 0.08, -0.26],
    [-0.38, 0.08, 0.24],
    [0.38, 0.08, 0.24],
  ];
  turboPositions.forEach(([tx, ty, tz]) => {
    const snailGeo = new THREE.TorusGeometry(0.082, 0.035, 10, 18);
    const snail = new THREE.Mesh(snailGeo, turboGlowMat);
    snail.position.set(tx, ty, tz);
    snail.rotation.y = Math.PI / 2;
    attachBlueprintEdges(snail, 15);
    engineOrigin.add(snail);

    const impellerGeo = new THREE.CylinderGeometry(0.056, 0.056, 0.036, 10);
    impellerGeo.rotateZ(Math.PI / 2);
    const impeller = new THREE.Mesh(impellerGeo, brushedSilverMat);
    impeller.position.set(tx, ty, tz);
    attachBlueprintEdges(impeller);
    turbos.push(impeller);
    engineOrigin.add(impeller);
  });

  // ---------------------------------------------------------------------------
  // 15. CARBON MONOCOQUE TUB
  // ---------------------------------------------------------------------------
  const monocoque = parts.monocoque;
  const tubFloorGeo = new THREE.BoxGeometry(1.52, 0.05, 2.60, 4, 1, 6);
  const tubFloor = new THREE.Mesh(tubFloorGeo, satinCarbonMat);
  tubFloor.position.set(0, 0.14, 0.05);
  attachBlueprintEdges(tubFloor);
  monocoque.add(tubFloor);

  [-0.70, 0.70].forEach((x) => {
    const sillGeo = new THREE.BoxGeometry(0.12, 0.24, 1.50, 1, 2, 4);
    const sill = new THREE.Mesh(sillGeo, satinCarbonMat);
    sill.position.set(x, 0.26, 0.15);
    attachBlueprintEdges(sill);
    monocoque.add(sill);
  });

  const firewallGeo = new THREE.BoxGeometry(1.38, 0.52, 0.07, 4, 2, 1);
  const firewall = new THREE.Mesh(firewallGeo, satinCarbonMat);
  firewall.position.set(0, 0.42, -0.32);
  attachBlueprintEdges(firewall);
  monocoque.add(firewall);

  // ---------------------------------------------------------------------------
  // 16. INTERIOR (Cockpit Seats, Dashboard, Center Spine & Steering Wheel)
  // ---------------------------------------------------------------------------
  const interior = parts.interior;

  [-0.34, 0.34].forEach((x) => {
    const seatGroup = new THREE.Group();
    seatGroup.position.set(x, 0.24, 0.02);

    const cushionGeo = new THREE.BoxGeometry(0.40, 0.07, 0.44);
    const cushion = new THREE.Mesh(cushionGeo, havanaLeatherMat);
    attachBlueprintEdges(cushion);
    seatGroup.add(cushion);

    const backrestGeo = new THREE.BoxGeometry(0.38, 0.50, 0.08);
    const backrest = new THREE.Mesh(backrestGeo, havanaLeatherMat);
    backrest.position.set(0, 0.24, -0.19);
    backrest.rotation.x = -0.22;
    attachBlueprintEdges(backrest);
    seatGroup.add(backrest);

    interior.add(seatGroup);
  });

  const dashGeo = new THREE.BoxGeometry(1.32, 0.16, 0.34, 4, 1, 2);
  const dash = new THREE.Mesh(dashGeo, satinCarbonMat);
  dash.position.set(0, 0.54, 0.52);
  attachBlueprintEdges(dash);
  interior.add(dash);

  const steeringWheel = new THREE.Group();
  steeringWheel.position.set(-0.34, 0.55, 0.34);
  steeringWheel.rotation.x = -0.35;

  const rimGeo = new THREE.TorusGeometry(0.13, 0.016, 8, 20);
  const rim = new THREE.Mesh(rimGeo, caliperMat);
  attachBlueprintEdges(rim, 15);
  steeringWheel.add(rim);

  const spokeBarGeo = new THREE.BoxGeometry(0.22, 0.022, 0.016);
  const spokeBar = new THREE.Mesh(spokeBarGeo, brushedSilverMat);
  attachBlueprintEdges(spokeBar);
  steeringWheel.add(spokeBar);

  interior.add(steeringWheel);

  // ---------------------------------------------------------------------------
  // 17. SUSPENSION ARMS (Double-Wishbone Pushrod Architecture)
  // ---------------------------------------------------------------------------
  const suspension = parts.suspension;
  const suspCorners: Array<[number, number, number]> = [
    [-0.56, 0.30, 1.36],
    [0.56, 0.30, 1.36],
    [-0.58, 0.32, -1.34],
    [0.58, 0.32, -1.34],
  ];
  suspCorners.forEach(([sx, sy, sz]) => {
    const upperArmGeo = new THREE.BoxGeometry(0.44, 0.024, 0.024);
    const upperArm = new THREE.Mesh(upperArmGeo, brushedSilverMat);
    upperArm.position.set(sx, sy + 0.06, sz);
    attachBlueprintEdges(upperArm);
    suspension.add(upperArm);

    const lowerArmGeo = new THREE.BoxGeometry(0.46, 0.026, 0.026);
    const lowerArm = new THREE.Mesh(lowerArmGeo, brushedSilverMat);
    lowerArm.position.set(sx, sy - 0.06, sz);
    attachBlueprintEdges(lowerArm);
    suspension.add(lowerArm);

    const damperGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.42, 8);
    const damper = new THREE.Mesh(damperGeo, caliperMat);
    damper.position.set(sx * 0.85, sy + 0.04, sz);
    damper.rotation.z = sx > 0 ? 0.65 : -0.65;
    attachBlueprintEdges(damper);
    suspension.add(damper);
  });

  const atlanticGhost = new THREE.Group();
  atlanticGhost.visible = false;
  root.add(atlanticGhost);

  const xrayOverlayGroup = new THREE.Group();

  // Optional external GLB loader hook
  tryLoadExternalGLB(ASSET_PATHS.glbModelUrl, parts);

  const setCaliperColor = (color: 'blue' | 'red') => {
    if (color === 'blue') {
      caliperMat.color.set('#00b7ff');
      caliperMat.emissive.set('#005588');
    } else {
      caliperMat.color.set('#c8102e');
      caliperMat.emissive.set('#660818');
    }
  };

  const setBodyFinish = (finish: 'carbon' | 'obsidian' | 'argent') => {
    if (finish === 'carbon') {
      xrayWireMat.color.set('#00b7ff');
    } else if (finish === 'obsidian') {
      xrayWireMat.color.set('#38bdf8');
    } else if (finish === 'argent') {
      xrayWireMat.color.set('#e2e8f0');
    }
  };

  const setXrayFactor = (factor: number) => {
    const clamped = THREE.MathUtils.clamp(factor, 0.35, 1);
    xrayWireMat.opacity = 0.55 + clamped * 0.4;
    bodyClearcoat.opacity = 0.65 - clamped * 0.28;
  };

  const dispose = () => {
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.LineSegments).isLineSegments) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });
  };

  return {
    root,
    parts,
    restPositions,
    restRotations,
    wheelsSpinGroups,
    pistons,
    crankshaft,
    turbos,
    steeringWheel,
    atlanticGhost,
    xrayOverlayGroup,
    materials: {
      bodyClearcoat,
      caliperMat,
      turboGlowMat,
      atlanticGhostMat,
      xrayWireMat,
      headlightEmissiveMat,
      taillightEmissiveMat,
      glintSweepMat,
    },
    setCaliperColor,
    setBodyFinish,
    setXrayFactor,
    dispose,
  };
}

async function tryLoadExternalGLB(
  url: string,
  parts: Record<PartGroupName, THREE.Group>
): Promise<void> {
  try {
    const win = window as unknown as { __USE_CUSTOM_GLB__?: boolean };
    if (!win.__USE_CUSTOM_GLB__) return;

    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return;

    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      gltf.scene.traverse((child) => {
        const name = child.name as PartGroupName;
        if (parts[name]) {
          parts[name].clear();
          parts[name].add(child.clone());
        }
      });
    });
  } catch {
    // Keep procedural blueprint rig
  }
}
