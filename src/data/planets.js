export const planetsData = [
  {
    name: 'Mercury',
    size: 0.4,
    orbitRadius: 8,
    orbitSpeed: 0.8,
    moons: [],
    hasRings: false,
    textureURL: null,
    color: '#9e9e9e'
  },
  {
    name: 'Venus',
    size: 0.7,
    orbitRadius: 12,
    orbitSpeed: 0.6,
    moons: [],
    hasRings: false,
    textureURL: null,
    color: '#e6d8a2'
  },
  {
    name: 'Earth',
    size: 0.8,
    orbitRadius: 16,
    orbitSpeed: 0.5,
    moons: [
      { name: 'Moon', orbitRadius: 2, orbitSpeed: 2, size: 0.2, color: '#c0c0c0' }
    ],
    hasRings: false,
    textureURL: null,
    color: '#2a6bd4'
  },
  {
    name: 'Mars',
    size: 0.6,
    orbitRadius: 20,
    orbitSpeed: 0.4,
    moons: [
      { name: 'Phobos', orbitRadius: 1.5, orbitSpeed: 3, size: 0.1, color: '#8c8c8c' },
      { name: 'Deimos', orbitRadius: 2.2, orbitSpeed: 1.5, size: 0.08, color: '#a0a0a0' }
    ],
    hasRings: false,
    textureURL: null,
    color: '#b84b2a'
  },
  {
    name: 'Jupiter',
    size: 2.2,
    orbitRadius: 28,
    orbitSpeed: 0.2,
    moons: [
      { name: 'Io', orbitRadius: 3, orbitSpeed: 2.5, size: 0.15, color: '#ffff99' },
      { name: 'Europa', orbitRadius: 4, orbitSpeed: 1.8, size: 0.18, color: '#99ccff' },
      { name: 'Ganymede', orbitRadius: 5, orbitSpeed: 1.2, size: 0.2, color: '#ffcc99' },
      { name: 'Callisto', orbitRadius: 6, orbitSpeed: 0.9, size: 0.17, color: '#cccccc' }
    ],
    hasRings: false,
    textureURL: null,
    color: '#c9a36a'
  },
  {
    name: 'Saturn',
    size: 1.8,
    orbitRadius: 36,
    orbitSpeed: 0.15,
    moons: [
      { name: 'Titan', orbitRadius: 3.5, orbitSpeed: 2, size: 0.12, color: '#ffffcc' },
      { name: 'Enceladus', orbitRadius: 4.5, orbitSpeed: 1.5, size: 0.1, color: '#ccffcc' }
    ],
    hasRings: true,
    textureURL: null,
    ringTextureURL: null,
    color: '#d8c27a'
  },
  {
    name: 'Uranus',
    size: 1.2,
    orbitRadius: 44,
    orbitSpeed: 0.1,
    moons: [
      { name: 'Titania', orbitRadius: 2.5, orbitSpeed: 1.8, size: 0.08, color: '#b3d9ff' }
    ],
    hasRings: false,
    textureURL: null,
    color: '#7fcfd6'
  },
  {
    name: 'Neptune',
    size: 1.1,
    orbitRadius: 52,
    orbitSpeed: 0.08,
    moons: [
      { name: 'Triton', orbitRadius: 2.8, orbitSpeed: 1.6, size: 0.1, color: '#99ccff' }
    ],
    hasRings: false,
    textureURL: null,
    color: '#2f49b7'
  }
];
