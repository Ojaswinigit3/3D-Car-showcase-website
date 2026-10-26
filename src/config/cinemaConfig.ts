/**
 * Master Configuration for Bugatti La Voiture Noire Cinematic Website
 * -------------------------------------------------------------------
 * - Chapters 01, 02, 03, 07, 08, 09 use the Photo Cinema Stage with film-camera
 *   dolly-ins, macro punch-ins (grille, headlight, front wheel/blue caliper,
 *   rear haunch), light sweeps, rain/dust particles, and parallax.
 * - Chapters 04, 05, 06 cross-fade smoothly into the 3D Electric-Blue
 *   Blueprint/Hologram Stage for the exploded view, cockpit/W16 interior,
 *   and reassembly sequence.
 */

export interface CameraKeyframe {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  roll?: number;
}

/**
 * 2D Film Camera Keyframe for the Full-Screen Hero Photo Stage
 * focusX / focusY are normalized percentages [0..100] on the 16:9 photo.
 */
export interface PhotoCameraKeyframe {
  scale: number;
  focusX: number; // 50 = center, 18.5 = horseshoe grille, 42.5 = headlight, 51.5 = front wheel/caliper, 80 = rear haunch
  focusY: number; // 50 = center, 56 = grille, 43 = headlight, 59 = front wheel, 46 = rear haunch
  roll?: number;  // degrees
  lightSweep?: number; // 0..1 position of soft light sweep across the car
}

export interface ChapterConfig {
  index: number;
  code: string;
  id: string;
  navLabel: string;
  title: string;
  kicker: string;
  subtitle: string;
  description: string;
  /** Scroll range normalized [0..1] across total 1000vh page */
  scrollRange: [number, number];
  /** 3D camera keyframe (used in Hologram Chapters 04–06) */
  camera: CameraKeyframe;
  /** Photo camera keyframe (used in Photo Chapters 01, 02, 03, 07, 08, 09) */
  photoCamera: PhotoCameraKeyframe;
  photoCameraEnd?: PhotoCameraKeyframe;
  environmentPreset:
    | 'studio'
    | 'legend'
    | 'exterior'
    | 'exploded'
    | 'interior'
    | 'reassembly'
    | 'windtunnel'
    | 'paris'
    | 'alpine'
    | 'saltflat'
    | 'coastal'
    | 'finale';
}

export interface PartExplosionConfig {
  id: PartGroupName;
  label: string;
  code: string;
  detail: string;
  /** Translation offset [x, y, z] in meters when fully exploded */
  offset: [number, number, number];
  /** Euler rotation offset [rx, ry, rz] in radians when fully exploded */
  rotation: [number, number, number];
  /** Delay factor [0..0.4] within explosion progress for staggered mechanical separation */
  stagger: number;
  /** Local 3D anchor point on the part for SVG leader line attachment */
  leaderAnchor: [number, number, number];
  /** 2D HUD label offset direction from projected anchor */
  labelSide: 'left' | 'right' | 'top' | 'bottom';
}

export type PartGroupName =
  | 'bodyShell'
  | 'hood'
  | 'roof'
  | 'doorLeft'
  | 'doorRight'
  | 'frontBumper'
  | 'rearDiffuser'
  | 'wheelFL'
  | 'wheelFR'
  | 'wheelRL'
  | 'wheelRR'
  | 'headlights'
  | 'taillight'
  | 'engineBlock'
  | 'monocoque'
  | 'interior'
  | 'suspension';

export interface FilmShotConfig {
  id: string;
  title: string;
  caption: string;
  startTime: number; // seconds (out of 25s total)
  endTime: number;
  fromPhotoCam: PhotoCameraKeyframe;
  toPhotoCam: PhotoCameraKeyframe;
  redLineProgress?: number;
  rainIntensity?: number;
  shakeIntensity?: number;
  brightness?: number;
}

export interface ExteriorHotspot {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  specValue: string;
  /** Exact percentage coordinates [x%, y%] on the reference car photo */
  photoPosition: [number, number];
  /** Punch-in camera framing when this hotspot is clicked */
  photoCamera: PhotoCameraKeyframe;
}

export interface JourneyLocationConfig {
  id: string;
  name: string;
  region: string;
  timeOfDay: string;
  cameraMode: string;
  progressRange: [number, number];
  tintColor: string;
  rimGlowColor: string;
  rainAmount: number;
  photoCamera: PhotoCameraKeyframe;
}

export const ASSET_PATHS = {
  glbModelUrl: '/models/car.glb',
  referencePhotoUrl: '/assets/aistudio/image_83d6442f.png',
  fallbackPhotoUrl: '/assets/aistudio/preview_fc998d84.webp',
};

/**
 * 25-Second Opening Film Trailer Shots (Chapter 01)
 * Uses real-time film camera moves on the hero photograph:
 * slow dolly-in, punch-ins to horseshoe grille, wheel & blue caliper,
 * rear haunch speed-ramp pan, headlight close-up, blackout, and full reveal.
 */
export const FILM_TRAILER_DURATION = 25.0;

export const FILM_SHOTS: FilmShotConfig[] = [
  {
    id: 'shot-01-redline',
    title: 'MOLSHEIM, ALSACE',
    caption: 'A solitary dorsal seam awakens in darkness',
    startTime: 0.0,
    endTime: 3.6,
    fromPhotoCam: { scale: 1.18, focusX: 48, focusY: 42, roll: 0, lightSweep: 0.05 },
    toPhotoCam: { scale: 1.10, focusX: 50, focusY: 45, roll: 0, lightSweep: 0.35 },
    redLineProgress: 1.0,
    rainIntensity: 0.15,
    shakeIntensity: 0.02,
    brightness: 0.45,
  },
  {
    id: 'shot-02-silhouette',
    title: 'THE LOST ATLANTIC',
    caption: 'A soft light sweep reveals the sculpted carbon silhouette',
    startTime: 3.6,
    endTime: 7.5,
    fromPhotoCam: { scale: 1.06, focusX: 46, focusY: 48, roll: -0.3, lightSweep: 0.15 },
    toPhotoCam: { scale: 1.14, focusX: 54, focusY: 48, roll: 0.2, lightSweep: 0.92 },
    rainIntensity: 0.22,
    shakeIntensity: 0.03,
    brightness: 0.88,
  },
  {
    id: 'shot-03-grille',
    title: 'LE MACARON ROUGE',
    caption: 'Macro push-in on the horseshoe grille and red Bugatti badge',
    startTime: 7.5,
    endTime: 11.2,
    fromPhotoCam: { scale: 1.95, focusX: 21, focusY: 56, roll: -0.4, lightSweep: 0.25 },
    toPhotoCam: { scale: 2.45, focusX: 18.5, focusY: 55.5, roll: 0.0, lightSweep: 0.55 },
    rainIntensity: 0.25,
    shakeIntensity: 0.04,
    brightness: 1.0,
  },
  {
    id: 'shot-04-caliper',
    title: 'FRENCH RACING BLUE',
    caption: 'Swirling diamond-cut alloy rim and 8-piston blue brake caliper',
    startTime: 11.2,
    endTime: 14.8,
    fromPhotoCam: { scale: 1.95, focusX: 50, focusY: 59, roll: 0.4, lightSweep: 0.45 },
    toPhotoCam: { scale: 2.38, focusX: 51.8, focusY: 59.5, roll: -0.2, lightSweep: 0.72 },
    rainIntensity: 0.3,
    shakeIntensity: 0.05,
    brightness: 1.0,
  },
  {
    id: 'shot-05-speedramp',
    title: 'SCULPTED REAR HAUNCH',
    caption: 'Fast speed-ramp pan across the C-line intake and rear fender',
    startTime: 14.8,
    endTime: 18.4,
    fromPhotoCam: { scale: 1.85, focusX: 42, focusY: 49, roll: -0.8, lightSweep: 0.3 },
    toPhotoCam: { scale: 2.15, focusX: 81, focusY: 48, roll: 0.6, lightSweep: 0.95 },
    rainIntensity: 0.45,
    shakeIntensity: 0.14,
    brightness: 0.96,
  },
  {
    id: 'shot-06-headlight',
    title: 'CRYSTAL LED MATRIX',
    caption: '25 individually milled light blades mounted high on the fender crest',
    startTime: 18.4,
    endTime: 21.3,
    fromPhotoCam: { scale: 2.15, focusX: 44, focusY: 44, roll: 0.2, lightSweep: 0.4 },
    toPhotoCam: { scale: 2.55, focusX: 42.5, focusY: 43, roll: 0, lightSweep: 0.75 },
    rainIntensity: 0.25,
    shakeIntensity: 0.03,
    brightness: 1.0,
  },
  {
    id: 'shot-07-reveal',
    title: 'LA VOITURE NOIRE',
    caption: 'Piece Unique · Geneva International Motor Show · 2019',
    startTime: 21.3,
    endTime: 25.0,
    fromPhotoCam: { scale: 1.12, focusX: 50, focusY: 50, roll: 0, lightSweep: 0.2 },
    toPhotoCam: { scale: 1.0, focusX: 50, focusY: 50, roll: 0, lightSweep: 0.85 },
    rainIntensity: 0.15,
    shakeIntensity: 0.0,
    brightness: 1.0,
  },
];

/**
 * 9 Continuous Scroll Chapters across 1000vh
 */
export const CHAPTERS: ChapterConfig[] = [
  {
    index: 1,
    code: '01',
    id: 'chapter-home',
    navLabel: '01 · Film',
    title: 'LA VOITURE NOIRE',
    kicker: 'CHAPTER 01 · PIECE UNIQUE (2019)',
    subtitle: 'Haute Couture of Automotive Engineering',
    description:
      'Created as a singular tribute to Jean Bugatti’s lost 1936 Type 57 SC Atlantic. Exposed deep-black carbon fiber woven to mirror aerospace precision, powered by an iconic 8.0-liter 16-cylinder centerpiece.',
    scrollRange: [0.0, 0.11],
    camera: {
      position: [-3.45, 0.98, 3.25],
      target: [0.0, 0.46, 0.0],
      fov: 32,
      roll: 0,
    },
    photoCamera: { scale: 1.0, focusX: 50, focusY: 50, roll: 0, lightSweep: 0.35 },
    photoCameraEnd: { scale: 1.06, focusX: 48, focusY: 50, roll: 0, lightSweep: 0.75 },
    environmentPreset: 'studio',
  },
  {
    index: 2,
    code: '02',
    id: 'chapter-legend',
    navLabel: '02 · Legend',
    title: 'THE GHOST OF 1936',
    kicker: 'CHAPTER 02 · HERITAGE LINEAGE',
    subtitle: 'From Jean Bugatti’s Type 57 SC Atlantic to Modern Myth',
    description:
      'Only four Type 57 SC Atlantics were ever built between 1936 and 1938. The second chassis—Jean Bugatti’s personal black coupe, "La Voiture Noire"—vanished before World War II and was never seen again. Eighty-three years later, its silhouette returns.',
    scrollRange: [0.11, 0.22],
    camera: {
      position: [-3.8, 0.72, 2.75],
      target: [0.0, 0.48, 0.15],
      fov: 30,
      roll: 0,
    },
    photoCamera: { scale: 1.06, focusX: 48, focusY: 50, roll: 0, lightSweep: 0.25 },
    photoCameraEnd: { scale: 1.14, focusX: 46, focusY: 49, roll: -0.2, lightSweep: 0.85 },
    environmentPreset: 'legend',
  },
  {
    index: 3,
    code: '03',
    id: 'chapter-exterior',
    navLabel: '03 · Exterior',
    title: 'SCULPTED OBSIDIAN',
    kicker: 'CHAPTER 03 · EXTERIOR COACHWORK',
    subtitle: 'Every Surface Hand-Shaped as One Monolithic Flow',
    description:
      'Bumpers blend imperceptibly into the body, the windshield wraps like a visor into the side windows, and a polished aluminum dorsal fin runs from the front hood across the roofline to the rear haunch.',
    scrollRange: [0.22, 0.34],
    camera: {
      position: [3.6, 0.85, 2.6],
      target: [0.0, 0.45, 0.0],
      fov: 32,
      roll: 0,
    },
    photoCamera: { scale: 1.25, focusX: 24, focusY: 54, roll: 0, lightSweep: 0.2 },
    photoCameraEnd: { scale: 1.32, focusX: 68, focusY: 52, roll: 0, lightSweep: 0.9 },
    environmentPreset: 'exterior',
  },
  {
    index: 4,
    code: '04',
    id: 'chapter-exploded',
    navLabel: '04 · Deconstruct',
    title: 'ANATOMY OF ONE',
    kicker: 'CHAPTER 04 · HOLOGRAM BLUEPRINT & EXPLODED VIEW',
    subtitle: 'Sixteen Bespoke Assemblies Separated in 3D Blueprint Space',
    description:
      'Cross-fading into the CAD hologram: as the outer shell separates along precision axes, the internal architecture reveals itself in electric-blue wireframe—carbon monocoque, pushrod suspension, and the quad-turbo W16.',
    scrollRange: [0.34, 0.47],
    camera: {
      position: [-3.85, 1.55, 3.55],
      target: [0.0, 0.52, 0.0],
      fov: 34,
      roll: 0,
    },
    photoCamera: { scale: 1.12, focusX: 50, focusY: 50, roll: 0, lightSweep: 0.5 },
    environmentPreset: 'exploded',
  },
  {
    index: 5,
    code: '05',
    id: 'chapter-interior',
    navLabel: '05 · Cockpit & W16',
    title: 'THE MECHANICAL HEART',
    kicker: 'CHAPTER 05 · COCKPIT & QUAD-TURBO W16 HOLOGRAM',
    subtitle: 'Inside the Monocoque & 16-Cylinder Combustion Chamber',
    description:
      'Zoom through the open holographic canopy into the cockpit steering architecture before descending into the mid-mounted 8.0L W16 block. Sixteen pistons, crankshaft, and four turbochargers animate with scroll velocity.',
    scrollRange: [0.47, 0.59],
    camera: {
      position: [0.0, 0.92, -0.35],
      target: [0.0, 0.52, -0.85],
      fov: 42,
      roll: 0,
    },
    photoCamera: { scale: 1.25, focusX: 52, focusY: 44, roll: 0, lightSweep: 0.5 },
    environmentPreset: 'interior',
  },
  {
    index: 6,
    code: '06',
    id: 'chapter-reassembly',
    navLabel: '06 · Convergence',
    title: 'MONOLITHIC LOCK-IN',
    kicker: 'CHAPTER 06 · REVERSE CONVERGENCE',
    subtitle: 'Every Tolerance Returned & Cross-Faded Back to Reality',
    description:
      'Watch all sixteen blueprint assemblies converge back onto the carbon tub in reverse sequence—sealing into the monolithic hypercar and dissolving smoothly back into the studio photograph.',
    scrollRange: [0.59, 0.69],
    camera: {
      position: [-3.45, 0.98, 3.25],
      target: [0.0, 0.48, 0.0],
      fov: 32,
      roll: 0,
    },
    photoCamera: { scale: 1.04, focusX: 50, focusY: 50, roll: 0, lightSweep: 0.5 },
    environmentPreset: 'reassembly',
  },
  {
    index: 7,
    code: '07',
    id: 'chapter-performance',
    navLabel: '07 · Telemetry',
    title: '1,500 HORSEPOWER',
    kicker: 'CHAPTER 07 · AERODYNAMIC & VELOCITY TELEMETRY',
    subtitle: '1,600 Nm of Torque · 0–100 km/h in 2.4 Seconds · 420 km/h',
    description:
      'Scroll accelerates the car: the camera dollies in toward the front wheel and blue caliper as laminar airflow streamlines sweep over the bodywork and telemetry gauges climb to 420 km/h.',
    scrollRange: [0.69, 0.80],
    camera: {
      position: [-2.85, 0.56, 2.65],
      target: [0.1, 0.42, -0.2],
      fov: 46,
      roll: 0,
    },
    photoCamera: { scale: 1.05, focusX: 50, focusY: 52, roll: 0, lightSweep: 0.2 },
    photoCameraEnd: { scale: 1.38, focusX: 46, focusY: 55, roll: -0.6, lightSweep: 0.95 },
    environmentPreset: 'windtunnel',
  },
  {
    index: 8,
    code: '08',
    id: 'chapter-journey',
    navLabel: '08 · Journey',
    title: 'THE GRAND TOUR',
    kicker: 'CHAPTER 08 · FOUR CONTINUOUS HORIZONS',
    subtitle: 'Paris Midnight · Route Napoléon · Bonneville · Côte d’Azur',
    description:
      'A true grand routier built to cross continents effortlessly. As you scroll, atmospheric lighting, rain, and camera framing shift smoothly across four iconic horizons while the car stays continuous.',
    scrollRange: [0.80, 0.91],
    camera: {
      position: [-3.6, 0.78, 1.9],
      target: [0.0, 0.48, 0.0],
      fov: 36,
      roll: 0,
    },
    photoCamera: { scale: 1.08, focusX: 48, focusY: 50, roll: 0, lightSweep: 0.3 },
    photoCameraEnd: { scale: 1.18, focusX: 54, focusY: 50, roll: 0.3, lightSweep: 0.8 },
    environmentPreset: 'paris',
  },
  {
    index: 9,
    code: '09',
    id: 'chapter-finale',
    navLabel: '09 · Bespoke',
    title: 'SOME THINGS ARE NOT MEANT TO BE REPEATED',
    kicker: 'CHAPTER 09 · ATELIER ARCHIVE & SPECIFICATIONS',
    subtitle: 'Full Studio Framing, Bespoke Accents & Technical Dossier',
    description:
      'Returned to the Molsheim darkroom in full studio framing. Inspect the complete engineering specification tabs, preview caliper and finish grading, or replay the opening film.',
    scrollRange: [0.91, 1.0],
    camera: {
      position: [-3.45, 0.98, 3.25],
      target: [0.0, 0.45, 0.0],
      fov: 32,
      roll: 0,
    },
    photoCamera: { scale: 1.0, focusX: 50, focusY: 50, roll: 0, lightSweep: 0.5 },
    environmentPreset: 'finale',
  },
];

/**
 * 17 Named Part Groups for Hologram Exploded View (Chapter 04) & Reassembly (Chapter 06)
 */
export const PART_EXPLOSIONS: PartExplosionConfig[] = [
  {
    id: 'roof',
    label: 'Dorsal Fin & Glass Canopy',
    code: 'ASM-01',
    detail: 'Polished aluminum spine with visor-profile laminated acoustic glass',
    offset: [0, 1.35, 0.05],
    rotation: [-0.06, 0, 0],
    stagger: 0.0,
    leaderAnchor: [0, 1.02, -0.1],
    labelSide: 'top',
  },
  {
    id: 'hood',
    label: 'Perforated Carbon Front Hood',
    code: 'ASM-02',
    detail: 'Laser-drilled venting channels feeding the front radiator core',
    offset: [0, 0.85, 0.82],
    rotation: [0.18, 0, 0],
    stagger: 0.04,
    leaderAnchor: [0, 0.72, 1.35],
    labelSide: 'top',
  },
  {
    id: 'doorLeft',
    label: 'Port Sculpted Carbon Door',
    code: 'ASM-03L',
    detail: 'Integrated C-line intake duct channeling cooling air to the W16',
    offset: [-1.25, 0.32, 0.15],
    rotation: [0, 0.32, -0.1],
    stagger: 0.06,
    leaderAnchor: [-1.02, 0.62, 0.1],
    labelSide: 'left',
  },
  {
    id: 'doorRight',
    label: 'Starboard Sculpted Carbon Door',
    code: 'ASM-03R',
    detail: 'Autoclave-cured weave aligned to 0.1° across the side flank',
    offset: [1.25, 0.32, 0.15],
    rotation: [0, -0.32, 0.1],
    stagger: 0.06,
    leaderAnchor: [1.02, 0.62, 0.1],
    labelSide: 'right',
  },
  {
    id: 'frontBumper',
    label: 'Horseshoe Grille & Front Splitter',
    code: 'ASM-04',
    detail: '3D-printed titanium mesh with sterling silver & red enamel Macaron',
    offset: [0, -0.05, 1.35],
    rotation: [0.04, 0, 0],
    stagger: 0.08,
    leaderAnchor: [0, 0.42, 2.25],
    labelSide: 'left',
  },
  {
    id: 'rearDiffuser',
    label: 'Rear Diffuser & 6 Titanium Exhausts',
    code: 'ASM-05',
    detail: 'Six acid-washed titanium tailpipes framed in a double-channel venturi',
    offset: [0, 0.05, -1.45],
    rotation: [-0.05, 0, 0],
    stagger: 0.09,
    leaderAnchor: [0, 0.38, -2.22],
    labelSide: 'right',
  },
  {
    id: 'headlights',
    label: 'Micro-Faceted LED Light Blades',
    code: 'ASM-06',
    detail: '25 independent quartz-optics LED elements per front fender',
    offset: [0, 0.52, 1.05],
    rotation: [0.08, 0, 0],
    stagger: 0.11,
    leaderAnchor: [-0.75, 0.65, 1.75],
    labelSide: 'left',
  },
  {
    id: 'taillight',
    label: 'Curvilinear Full-Width LED Ribbon',
    code: 'ASM-07',
    detail: 'Single-piece suspended organic red light blade spanning 1.8m',
    offset: [0, 0.45, -1.25],
    rotation: [0, 0, 0],
    stagger: 0.12,
    leaderAnchor: [0, 0.68, -2.15],
    labelSide: 'right',
  },
  {
    id: 'bodyShell',
    label: 'Hand-Laid Carbon Coachwork Shell',
    code: 'ASM-08',
    detail: 'Seamless rear haunches & perforated engine deck in CAD wireframe',
    offset: [0, 0.72, -0.15],
    rotation: [0, 0, 0],
    stagger: 0.14,
    leaderAnchor: [0.72, 0.85, -0.95],
    labelSide: 'right',
  },
  {
    id: 'wheelFL',
    label: 'Front-Left Alloy & Blue 8-Piston Caliper',
    code: 'ASM-09FL',
    detail: '20-inch bespoke swirling spoke rim & 420mm carbon-ceramic rotor',
    offset: [-1.05, -0.1, 0.42],
    rotation: [0, 0.15, 0],
    stagger: 0.16,
    leaderAnchor: [-0.98, 0.38, 1.38],
    labelSide: 'left',
  },
  {
    id: 'wheelFR',
    label: 'Front-Right Alloy & Caliper Assembly',
    code: 'ASM-09FR',
    detail: 'Michelin Pilot Sport Cup 2 285/30 R20 laser-inspected tire',
    offset: [1.05, -0.1, 0.42],
    rotation: [0, -0.15, 0],
    stagger: 0.16,
    leaderAnchor: [0.98, 0.38, 1.38],
    labelSide: 'right',
  },
  {
    id: 'wheelRL',
    label: 'Rear-Left 21" Wheel & 6-Piston Caliper',
    code: 'ASM-09RL',
    detail: '355/25 R21 rear traction assembly rated for >420 km/h centrifugal load',
    offset: [-1.05, -0.1, -0.42],
    rotation: [0, -0.14, 0],
    stagger: 0.18,
    leaderAnchor: [-1.02, 0.40, -1.36],
    labelSide: 'left',
  },
  {
    id: 'wheelRR',
    label: 'Rear-Right 21" Wheel & Rotor Assembly',
    code: 'ASM-09RR',
    detail: 'Two-tone diamond-turned silver face with gloss black structural pockets',
    offset: [1.05, -0.1, -0.42],
    rotation: [0, 0.14, 0],
    stagger: 0.18,
    leaderAnchor: [1.02, 0.40, -1.36],
    labelSide: 'right',
  },
  {
    id: 'engineBlock',
    label: '8.0L Quad-Turbo W16 Powertrain',
    code: 'ASM-10',
    detail: '1,500 HP · 16 titanium pistons · forged crankshaft · 4 sequential turbos',
    offset: [0, 0.38, -0.22],
    rotation: [0, 0, 0],
    stagger: 0.2,
    leaderAnchor: [0, 0.58, -0.78],
    labelSide: 'top',
  },
  {
    id: 'interior',
    label: 'Havana Cockpit, Seats & Steering Wheel',
    code: 'ASM-11',
    detail: 'Turned aluminum controls, carbon shell seats & billet steering column',
    offset: [0, 0.2, 0.1],
    rotation: [0, 0, 0],
    stagger: 0.22,
    leaderAnchor: [-0.35, 0.58, 0.25],
    labelSide: 'left',
  },
  {
    id: 'suspension',
    label: 'Billet Double-Wishbone Pushrod Chassis',
    code: 'ASM-12',
    detail: 'Active ride-height actuators & aerospace titanium control arms',
    offset: [0, -0.24, 0],
    rotation: [0, 0, 0],
    stagger: 0.24,
    leaderAnchor: [0.65, 0.24, 1.38],
    labelSide: 'bottom',
  },
  {
    id: 'monocoque',
    label: 'T1000 Carbon Fiber Monocoque Tub',
    code: 'ASM-13',
    detail: '50,000 Nm/deg torsional rigidity structural core',
    offset: [0, -0.1, 0],
    rotation: [0, 0, 0],
    stagger: 0.25,
    leaderAnchor: [0, 0.28, 0.15],
    labelSide: 'bottom',
  },
];

/**
 * Chapter 03 Exterior Design Hotspots mapped to exact coordinates on the attached photo
 */
export const EXTERIOR_HOTSPOTS: ExteriorHotspot[] = [
  {
    id: 'hs-grille',
    title: '3D-Printed Horseshoe Grille & Red Macaron',
    subtitle: 'Front Fascia · 01',
    description:
      'Additive-manufactured lattice cells seamlessly merge into the deep front splitter, crowned by the sterling silver and red enamel Bugatti badge.',
    specValue: '0.45mm Cell Wall',
    photoPosition: [18.5, 55.5],
    photoCamera: { scale: 2.35, focusX: 18.5, focusY: 55.5, roll: 0, lightSweep: 0.35 },
  },
  {
    id: 'hs-headlights',
    title: 'Elevated Crystal LED Matrix',
    subtitle: 'Fender Crown · 02',
    description:
      'Sweeping up along the sculpted front wheel arch crest, each headlamp housing contains 25 individually milled quartz-optics light blades.',
    specValue: '50 Micro-Facets',
    photoPosition: [42.5, 43.0],
    photoCamera: { scale: 2.4, focusX: 42.5, focusY: 43.0, roll: 0, lightSweep: 0.5 },
  },
  {
    id: 'hs-wheels',
    title: 'Swirling Alloy Rim & Blue Caliper',
    subtitle: 'Front Axle · 03',
    description:
      'Bespoke diamond-turned 5-Y-spoke rims frame the French Racing Blue 8-piston monobloc brake calipers and carbon-ceramic rotors.',
    specValue: '20" Front / 21" Rear',
    photoPosition: [51.8, 59.5],
    photoCamera: { scale: 2.3, focusX: 51.8, focusY: 59.5, roll: 0, lightSweep: 0.6 },
  },
  {
    id: 'hs-hood',
    title: 'Perforated Hood & Central Aero Wiper',
    subtitle: 'Front Deck · 04',
    description:
      'Twin laser-perforated hood vents flank the central dorsal spine and single central aerodynamic windshield wiper.',
    specValue: 'Full-Length Spine',
    photoPosition: [36.0, 36.5],
    photoCamera: { scale: 2.15, focusX: 36.0, focusY: 36.5, roll: 0, lightSweep: 0.45 },
  },
  {
    id: 'hs-haunch',
    title: 'C-Line Intake & Sculpted Rear Haunch',
    subtitle: 'Rear Quarter · 05',
    description:
      'The signature matte-silver C-line flows behind the side window into the muscular rear haunch and 21-inch rear wheel assembly.',
    specValue: 'Monolithic Carbon',
    photoPosition: [80.5, 46.5],
    photoCamera: { scale: 2.1, focusX: 80.5, focusY: 46.5, roll: 0, lightSweep: 0.82 },
  },
];

/**
 * Chapter 08 Journey Locations (Continuous Camera & Atmospheric Cuts on the Hero Photo)
 */
export const JOURNEY_LOCATIONS: JourneyLocationConfig[] = [
  {
    id: 'paris-night',
    name: 'PARIS MIDNIGHT',
    region: 'PLACE VENDÔME · 01:40 CET',
    timeOfDay: 'Wet Asphalt & Cobalt Reflections',
    cameraMode: 'LOW DOLLY TRACKING',
    progressRange: [0.0, 0.25],
    tintColor: 'rgba(14, 38, 78, 0.28)',
    rimGlowColor: 'rgba(0, 183, 255, 0.22)',
    rainAmount: 0.85,
    photoCamera: { scale: 1.16, focusX: 36, focusY: 54, roll: -0.35, lightSweep: 0.25 },
  },
  {
    id: 'alpine-golden',
    name: 'ROUTE NAPOLÉON',
    region: 'FRENCH ALPS · 18:15 CET',
    timeOfDay: 'Golden Hour Warm Rim Light',
    cameraMode: 'SWEEPING PROFILE PAN',
    progressRange: [0.25, 0.50],
    tintColor: 'rgba(92, 45, 12, 0.22)',
    rimGlowColor: 'rgba(251, 191, 36, 0.20)',
    rainAmount: 0.05,
    photoCamera: { scale: 1.22, focusX: 58, focusY: 50, roll: 0.35, lightSweep: 0.65 },
  },
  {
    id: 'saltflat-dawn',
    name: 'BONNEVILLE DAWN',
    region: 'UTAH SALT FLATS · 06:05 MST',
    timeOfDay: 'High-Altitude Crystalline Horizon',
    cameraMode: 'WIDE HORIZON DOLLY',
    progressRange: [0.50, 0.75],
    tintColor: 'rgba(12, 52, 76, 0.22)',
    rimGlowColor: 'rgba(125, 211, 252, 0.22)',
    rainAmount: 0.0,
    photoCamera: { scale: 1.06, focusX: 50, focusY: 50, roll: 0, lightSweep: 0.5 },
  },
  {
    id: 'coastal-dusk',
    name: 'CÔTE D’AZUR',
    region: 'GRANDE CORNICHE · 20:50 CET',
    timeOfDay: 'Cobalt Twilight & Crimson Horizon',
    cameraMode: 'CLOSE QUARTER CHASE',
    progressRange: [0.75, 1.0],
    tintColor: 'rgba(58, 14, 38, 0.24)',
    rimGlowColor: 'rgba(200, 16, 46, 0.24)',
    rainAmount: 0.2,
    photoCamera: { scale: 1.28, focusX: 66, focusY: 52, roll: -0.25, lightSweep: 0.85 },
  },
];

/**
 * Chapter 09 Technical Specifications Tabs
 */
export const SPEC_TABS = [
  {
    id: 'powertrain',
    label: 'Powertrain',
    items: [
      { label: 'Engine Architecture', value: '8.0-Liter Quad-Turbocharged W16' },
      { label: 'Cylinder Bank Angle', value: '90° Main / 15° Narrow-Angle V8 Banks' },
      { label: 'Maximum Power Output', value: '1,500 PS (1,103 kW) @ 6,700 rpm' },
      { label: 'Maximum Torque', value: '1,600 Nm @ 2,000 – 6,000 rpm' },
      { label: 'Transmission', value: '7-Speed DSG Dual-Clutch · All-Wheel Drive' },
      { label: 'Exhaust System', value: '6-Outlet Acid-Washed Titanium Array' },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    items: [
      { label: '0 – 100 km/h (62 mph)', value: '2.4 Seconds' },
      { label: '0 – 200 km/h (124 mph)', value: '6.1 Seconds' },
      { label: '0 – 300 km/h (186 mph)', value: '13.1 Seconds' },
      { label: 'Top Speed (Limited)', value: '420 km/h (261 mph)' },
      { label: 'Braking (100 – 0 km/h)', value: '31.4 Meters' },
      { label: 'Power-to-Weight Ratio', value: '1.30 kg / PS' },
    ],
  },
  {
    id: 'coachwork',
    label: 'Coachwork & Chassis',
    items: [
      { label: 'Monocoque Structure', value: 'T1000 Aerospace Carbon Fiber' },
      { label: 'Exterior Body Panels', value: 'Hand-Laid Exposed Deep Black Carbon' },
      { label: 'Central Dorsal Fin', value: 'Mirror-Polished Hand-Formed Aluminum' },
      { label: 'Front / Rear Wheels', value: '20" × 10" Front / 21" × 13.5" Rear' },
      { label: 'Brake Rotors', value: '420mm Front / 400mm Rear Carbon-Ceramic' },
      { label: 'Production Allocation', value: '1 of 1 Worldwide (Piece Unique)' },
    ],
  },
];
