# VERTEX_ — Telemetry & Execution Command Center

> A zero-gamification, high-density telemetry dashboard for solo engineers.

**VERTEX_** is not a habit tracker. It is a scientific execution environment designed to bridge the gap between macro-level OKRs and micro-level architectural builds. It treats personal productivity as engineering telemetry — focusing purely on **velocity**, **asset compounding**, and **capability mapping**.

No streaks. No fire emojis. Pure signal.

---

## ⚙️ Core Modules

VERTEX_ is divided into four strictly defined operational layers:

### 1. `COMMAND_CENTER` — Macro Strategy
Tracks long-term operational goals (OKRs) over months or years.

- **Inputs:** Financial targets, academic milestones, major project completions.
- **Outputs:** Brutalist progress bars and binary Key Result tracking.

### 2. `ACTIVE_SPRINT` — Execution Layer
The daily and weekly assembly line. Agile methodology stripped to its rawest form.

- **Inputs:** `BUILD` and `STUDY` tasks pulled from the backlog.
- **Outputs:** Velocity scoring and strict status tracking — `TODO`, `IN_PROGRESS`, `DONE`.

### 3. `SYSTEM_REGISTRY` — Architecture Warehouse
A searchable database of reusable code architectures, designed for rapid deployment during solo hackathons and client builds.

- **Payloads:** Code snippets, integration times, reliability scores.
- **Friction Logging:** Explicitly documents bugs encountered and solved to prevent repeating mistakes.

### 4. `CAPABILITY_VECTORS` — Capability Map
An interactive, node-based dependency graph powered by `reactflow`. Maps how past hardware and software builds connect to future goals.

- **Architecture Decision Records (ADRs):** Logs the `MENTAL_MODEL` (Scenario → Thought Process → Execution) behind complex engineering decisions.
- **Forward Vectors:** Defines exactly how a completed component can be weaponized for future projects.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 6 |
| **Language** | TypeScript 5.8 |
| **Styling** | Tailwind CSS v4 (Strict High-Contrast Dark Mode) |
| **Icons** | Lucide React |
| **Graph / Topology** | React Flow |
| **Canvas** | Konva / React Konva |
| **Animations** | Motion |
| **AI Integration** | Google GenAI SDK (`@google/genai`) |
| **Database** | `better-sqlite3` (local, zero-latency) |
| **Backend** | Express.js |
| **Server Runtime** | TSX (TypeScript execution via `server.ts`) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SUPERREALCODER/yuga-the-game-.git
cd yuga-the-game-

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and set your GEMINI_API_KEY
```

### Running Locally

```bash
# Start the dev server (Vite frontend + Express backend via tsx)
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Other Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the full stack dev server |
| `npm run build` | Build the production frontend bundle |
| `npm run preview` | Preview the production build |
| `npm run lint` | TypeScript type-check (no emit) |
| `npm run clean` | Remove the `dist/` directory |

---

## 📁 Project Structure

```
vertex/
├── src/
│   ├── App.tsx                  # Root layout, routing between modules
│   ├── main.tsx                 # React DOM entry point
│   ├── index.css                # Global styles & Tailwind config
│   └── components/
│       └── VectorGraph.tsx      # React Flow capability topology map
├── server.ts                    # Express backend + SQLite integration
├── index.html                   # Vite HTML entry
├── vite.config.ts               # Vite + Tailwind plugin config
├── tsconfig.json                # TypeScript compiler config
├── .env.example                 # Environment variable template
└── package.json
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## 🧠 Design Philosophy

VERTEX_ is built on a single axiom:

> **You cannot optimize what you cannot observe.**

Every module is designed around raw data visibility with zero cognitive overhead:

- **Brutalist UI** — no gradients to hide information, no animations to distract.
- **Monospace-first** — all telemetry data renders in monospace for scanability.
- **Binary states** — tasks are either moving or they aren't.
- **Friction Logging** — every bug that slows you down gets logged and indexed so it never slows you down again.

---

## 🗺️ Roadmap

- [ ] Persistent SQLite data layer (CRUD for OKRs, sprints, registry)
- [ ] Full VECTOR_GRAPH ADR editor (inline node editing via React Flow)
- [ ] Sprint velocity analytics over time (rolling average, trend lines)
- [ ] SYSTEM_REGISTRY full-text search with tag filtering
- [ ] Export pipeline — sprint reports to Markdown / PDF
- [ ] Mobile-responsive layout for on-the-go telemetry reads

---

## 📄 License

Apache 2.0 — see `LICENSE` for details.

---

<div align="center">
  <sub>Built for engineers who treat their own execution as a system to be debugged.</sub>
</div>
