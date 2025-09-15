import { Orbit, Zap, Target, Star } from 'lucide-react';

export const educationalContent = [
  {
    id: 'orbital-mechanics',
    title: 'Orbital Mechanics Basics',
    icon: Orbit,
    description: 'Learn the fundamental principles of spacecraft navigation',
    lessons: [
      {
        title: 'What is Delta-V (ΔV)?',
        content: 'Delta-V represents the change in velocity needed for a spacecraft to perform orbital maneuvers. It\'s measured in km/s and determines how much fuel your mission requires. Lower ΔV requirements mean more efficient missions.',
        visual: '🚀 → 🛸 (velocity change)',
        example: 'A typical Earth-to-Mars transfer requires about 6-9 km/s of ΔV, while intercepting an interstellar object like 3I/ATLAS can require 15-30 km/s depending on timing.'
      },
      {
        title: 'Hyperbolic Trajectories',
        content: 'Interstellar objects follow hyperbolic paths through our solar system. Unlike planets that orbit in ellipses, these visitors have enough velocity to escape the Sun\'s gravity permanently.',
        visual: '📈 Hyperbola vs ⭕ Ellipse',
        example: '3I/ATLAS is traveling at over 35 km/s - much faster than any human-made spacecraft. This makes interception extremely challenging!'
      },
      {
        title: 'Launch Windows',
        content: 'The relative positions of Earth and the target determine launch windows. Optimal windows occur when the required ΔV is minimized, reducing fuel needs and mission complexity.',
        visual: '🌍 ← → 🎯 (alignment)',
        example: 'Launching when Earth and the target are properly aligned can reduce ΔV requirements by 50% or more compared to suboptimal timing.'
      }
    ]
  },
  {
    id: 'propulsion-systems',
    title: 'Spacecraft Propulsion',
    icon: Zap,
    description: 'Explore different rocket engines and their capabilities',
    lessons: [
      {
        title: 'Chemical Rockets',
        content: 'Traditional rocket engines that burn fuel and oxidizer. They provide high thrust but limited total ΔV capability. Best for quick maneuvers and escaping Earth\'s gravity.',
        visual: '🚀 High thrust, limited range',
        example: 'NASA\'s Space Launch System (SLS) uses chemical propulsion and can provide about 15 km/s total ΔV - insufficient for most interstellar intercepts.'
      },
      {
        title: 'Ion Drives',
        content: 'Electric propulsion systems that accelerate ions to very high speeds. They provide low thrust but exceptional fuel efficiency, making them ideal for long-duration missions.',
        visual: '⚡ Low thrust, high efficiency',
        example: 'NASA\'s Dawn mission used ion propulsion to visit two asteroids. Ion drives can achieve 25+ km/s ΔV, making interstellar missions possible.'
      },
      {
        title: 'Nuclear Thermal Propulsion',
        content: 'Rockets that use nuclear reactors to heat propellant. They offer a balance between chemical and ion propulsion - higher thrust than ion drives and higher efficiency than chemical rockets.',
        visual: '☢️ Balanced performance',
        example: 'Nuclear thermal rockets could reduce Mars travel time from 9 months to 3-4 months and enable ambitious interstellar missions.'
      },
      {
        title: 'Solar Sails',
        content: 'Propellantless propulsion using radiation pressure from sunlight. They provide continuous but very low acceleration, suitable for long-term missions with unlimited "fuel."',
        visual: '🌟 Unlimited fuel, slow acceleration',
        example: 'Japan\'s IKAROS and NASA\'s LightSail demonstrate solar sail technology. They could eventually enable interstellar missions without carrying fuel.'
      }
    ]
  },
  {
    id: 'mission-planning',
    title: 'Mission Planning & Strategy',
    icon: Target,
    description: 'Learn how space agencies plan complex interplanetary missions',
    lessons: [
      {
        title: 'Trajectory Optimization',
        content: 'Mission planners use Lambert\'s problem and optimization algorithms to find the best paths between celestial bodies. The goal is minimizing ΔV while meeting time constraints.',
        visual: '📊 Optimization algorithms',
        example: 'The Parker Solar Probe uses seven Venus flybys to gradually approach the Sun, reducing ΔV requirements from impossible to achievable.'
      },
      {
        title: 'Gravity Assists',
        content: 'Spacecraft can "steal" momentum from planets to change trajectory without using fuel. This technique enables missions that would otherwise be impossible.',
        visual: '🌍 → 🛸 → 🚀 (momentum transfer)',
        example: 'Voyager 1 and 2 used a rare planetary alignment to visit multiple outer planets, gaining speed at each encounter.'
      },
      {
        title: 'Risk Assessment',
        content: 'Real missions must consider equipment failure, communication delays, and backup plans. Interstellar missions have no possibility of rescue or resupply.',
        visual: '⚠️ Risk mitigation',
        example: 'New Horizons had to function perfectly for 9 years to reach Pluto. One failure would have ended the mission - there\'s no second chance.'
      }
    ]
  },
  {
    id: 'real-missions',
    title: 'Real Space Missions',
    icon: Star,
    description: 'Study actual spacecraft that have attempted similar missions',
    lessons: [
      {
        title: 'Voyager 1 & 2',
        content: 'Launched in 1977, both Voyagers are now in interstellar space. They demonstrate that reaching beyond our solar system is possible with careful planning and gravity assists.',
        visual: '🛸 First interstellar travelers',
        example: 'Voyager 1 is now 14 billion miles from Earth, traveling at 17 km/s. Radio signals take over 20 hours to reach Earth!'
      },
      {
        title: 'New Horizons',
        content: 'After its Pluto flyby, New Horizons is on a trajectory toward interstellar space. It shows how modern spacecraft can be designed for extended missions.',
        visual: '🛸 → ⭐ Modern interstellar probe',
        example: 'New Horizons is the fastest spacecraft ever launched, reaching 16.26 km/s after Jupiter gravity assist. It will reach interstellar space around 2040.'
      },
      {
        title: 'Parker Solar Probe',
        content: 'This mission demonstrates extreme precision in trajectory planning, using Venus flybys to gradually approach the Sun closer than any previous spacecraft.',
        visual: '🛸 → ☀️ Precision navigation',
        example: 'Parker will eventually reach 200 km/s - fast enough to fly from New York to Tokyo in under one minute!'
      },
      {
        title: 'Breakthrough Starshot',
        content: 'A proposed mission to send tiny spacecraft to Alpha Centauri using laser propulsion. It represents the cutting edge of interstellar mission concepts.',
        visual: '🔬 Future technology',
        example: 'Starshot aims to reach 20% of light speed (60,000 km/s), making the 4.37 light-year journey in just 20 years instead of thousands.'
      }
    ]
  }
];
