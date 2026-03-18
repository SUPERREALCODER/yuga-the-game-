# VERTEX_ // Telemetry & Execution Command Center

> A zero-gamification, high-density telemetry dashboard for solo engineers.

**Vertex** is not a habit tracker. It is a scientific execution environment designed to bridge the gap between macro-level OKRs and micro-level architectural builds. It treats personal productivity as engineering telemetry. Pure signal.

## ⚙️ Core Modules
1. **COMMAND_CENTER:** Tracks long-term operational goals (OKRs) with brutalist progress bars.
2. **ACTIVE_SPRINT:** The daily assembly line. Agile methodology stripped to its rawest form (BUILD/STUDY).
3. **SYSTEM_REGISTRY:** A searchable warehouse of reusable code architectures, complete with Friction Logs.
4. **VECTOR_GRAPH:** An interactive capability map powered by React Flow. Automatically connects past hardware/software builds to new assets via Vector Origins.

## 🛠️ Tech Stack
* **Frontend:** React 19, Tailwind CSS v4, Lucide React, React Flow. (High-Contrast Dark Mode).
* **Backend:** Node.js, Express, `better-sqlite3` for zero-latency local persistent storage.

## 🧬 Data Standard
Assets are logged with complete Architecture Decision Records (ADRs) called Mental Models: `Scenario` -> `Thought Process` -> `Execution`.

## 🚀 Getting Started

**Prerequisites:** Node.js v18+

```bash
git clone https://github.com/SUPERREALCODER/yuga-the-game-.git
cd yuga-the-game-
npm install
cp .env.example .env.local   # Add your GEMINI_API_KEY
```

```bash
node server.js    # API → http://localhost:3001
npm run dev       # Frontend → http://localhost:5173
```

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/registry` | All registry components |
| `POST` | `/api/registry` | Log new asset (triggers Vector Transaction) |
| `GET` | `/api/sprint/tasks` | All sprint tasks |
| `POST` | `/api/sprint/tasks` | Add a task |
| `PUT` | `/api/sprint/tasks/:id/status` | Update task status |
| `GET` | `/api/graph` | `{ nodes, edges }` for React Flow |
| `GET` | `/api/health` | System health check |

### Vector Transaction
`POST /api/registry` is atomic — it simultaneously:
1. Inserts the asset into `registry`
2. Creates a node in `graph_nodes`
3. If `vector_origin_id` is supplied, auto-creates an edge in `graph_edges`

```json
{
  "title": "OttoMail Parser",
  "tags": ["Python", "LLM"],
  "mental_model": {
    "scenario": "Inbox overload",
    "thought_process": "Chain-of-thought triage",
    "execution": "Local LLM classifies and routes"
  },
  "vector_origin_id": "reg_previous_asset_id"
}
```

## 📄 License
Apache 2.0
