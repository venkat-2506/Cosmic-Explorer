# Cosmic Explorer

Cosmic explorer is an educational and gamified space mission simulator built for the 3i ATLAS initiative.
Players can explore the solar system in 3D, pilot next-generation chaser vehicles, and attempt intercept missions with rogue satellites or interstellar objects — while learning real orbital mechanics concepts.


## Acknowledgements

NASA Open Data Portal
 & JPL Horizons
 for space mission datasets.

Three.js
 / Meshy
 for 3D rendering.

Google studio AI
 for building the AI assistant.
## API Reference

/api/missions-	Fetch mission dataset

/api/chat	  -  AI chatbot responses (with mission context)

/api/intercept-	Simulate an intercept calculation

## Appendix

Interstellar Objects travel much faster than typical asteroids. In this project, 3i/Atlas is modeled at ~50 km/s.

AU Conversion: 1 AU ≈ 149.6 million km. Example: 3.2 AU ≈ 479 million km.

## Team Members

Dhanurdhar D - Team lead - Data analyst

Manoj Sanagapalli - Frontend

Venkat Miriyam - Backend

Syed Javid - Backend



## Deployment


Try the live deployed webapp here: https://cosmic-explorer-lake.vercel.app/


## Documentation

**🖥️ Frontend**

React + Vite → Provides a fast and modular development setup for the UI.


**UI Features:**

Interactive 3D solar system visualization.

Hover effects on planets (name + info popups).

Animated satellites orbiting randomly.

Intercept simulation button with trajectory visualization.

**🌌 3D Visualization**

Three.js → Core 3D engine for rendering planets, satellites, and spacecraft.

Meshy → Tools to design and import 3D models.

**Key Features:**

Planets rendered in correct orbits.

Intercept arcs calculated and displayed dynamically.

Future propulsion unlocks (solar sails, fusion engines) for gamification.

**🤖 AI Assistant**

Google studio AI → No-code AI orchestration tool integrated into the project.

Datasets Used: NASA mission archives (Voyager, Cassini, Artemis, etc.).

**Features:**

Answers player queries about real missions.

Explains intercept feasibility based on mission physics.

Acts as a Mission Control chatbot guiding the player.

**💾 Data Persistence**

IndexedDB (Dexie.js) → Stores user-specific mission history & chat logs.

Why IndexedDB?

No authentication needed.

Data persists after closing browser.

Each device keeps its own mission progress.

**🛰️ Backend**

Node.js + FastAPI → Provides APIs to support mission data and AI integration.

**Endpoints:**

/api/missions → Serves mission datasets (JSON, CSV, NASA archives).

/api/chat → Handles AI responses (Flowise / OpenAI / LLM integration).

/api/intercept → Runs simplified physics calculations (distance, velocity, ΔV).

**Responsibilities:**

Pre-process and serve NASA datasets for frontend use.

Store mission results if needed (optional — but mainly local persistence is handled by IndexedDB).

Provide a central hub for AI assistant queries.

Hosting: Can be deployed on Vercel, Netlify Functions, or Railway (free backend hosting).

**🚀 Simulation Engine**

Physics Logic (simplified educational model):

Distance calculated from AU → km.

Relative velocity (~35 km/s for interstellar targets).

Lambert transfer approximations for intercept feasibility.

**Modes:**

Current Tech: Limited by present propulsion speeds (~16 km/s).

Future Tech: Allows experimenting with fictional advanced engines.

**Results:**

Displays intercept points, feasibility status, time-of-flight, and ΔV requirements.
