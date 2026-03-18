/**
 * VERTEX_ — Local Telemetry API
 * Stack: Express.js + better-sqlite3
 * DB:    vertex_telemetry.db (local SQLite)
 *
 * [SYS] Boot sequence: DB init → Schema migration → HTTP server mount
 */

import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// [SYS] BOOTSTRAP
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "vertex_telemetry.db");

// ---------------------------------------------------------------------------
// [SYS] DATABASE INIT
// ---------------------------------------------------------------------------

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

db.exec(`
  -- -------------------------------------------------------------------------
  -- TABLE: registry  (Architecture Warehouse)
  -- -------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS registry (
    id                    TEXT PRIMARY KEY,
    title                 TEXT NOT NULL,
    tags                  TEXT NOT NULL DEFAULT '[]',   -- JSON string array
    the_build             TEXT,
    friction_log          TEXT,
    mental_model          TEXT DEFAULT '{}',            -- JSON string object
    forward_vectors       TEXT,
    integration_time_mins INTEGER DEFAULT 0
  );

  -- -------------------------------------------------------------------------
  -- TABLE: sprint_tasks  (Execution Layer)
  -- -------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS sprint_tasks (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    type       TEXT NOT NULL CHECK(type IN ('BUILD', 'STUDY')),
    status     TEXT NOT NULL DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- -------------------------------------------------------------------------
  -- TABLE: graph_nodes  (Capability Topology)
  -- -------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS graph_nodes (
    id    TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    pos_x REAL DEFAULT 0,
    pos_y REAL DEFAULT 0
  );

  -- -------------------------------------------------------------------------
  -- TABLE: graph_edges  (Dependency Links)
  -- -------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS graph_edges (
    id        TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL
  );
`);

console.log(`[SYS] Database mounted → ${DB_PATH}`);
console.log("[SYS] Schema verified. All tables nominal.");

// ---------------------------------------------------------------------------
// [SYS] EXPRESS INIT
// ---------------------------------------------------------------------------

const app = express();

app.use(cors());
app.use(express.json());

// Request logger middleware — brutalist telemetry style
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// ---------------------------------------------------------------------------
// HELPER: generate a simple prefixed UUID-like ID
// ---------------------------------------------------------------------------
const uid = (prefix = "vtx") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// ROUTES: /api/registry
// ---------------------------------------------------------------------------

/**
 * GET /api/registry
 * Returns all registry components. Parses JSON fields back to objects/arrays.
 */
app.get("/api/registry", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM registry ORDER BY rowid DESC").all();

    const parsed = rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags || "[]"),
      mental_model: JSON.parse(row.mental_model || "{}"),
    }));

    console.log(`[API] GET  /api/registry          → 200 OK (${parsed.length} components)`);
    res.json(parsed);
  } catch (err) {
    console.error("[ERR] GET  /api/registry          →", err.message);
    res.status(500).json({ error: "REGISTRY_READ_FAILURE", detail: err.message });
  }
});

/**
 * POST /api/registry
 * Accepts a new component object. Stringifies JSON fields before insert.
 *
 * Body: { title, tags[], the_build, friction_log, mental_model{}, forward_vectors, integration_time_mins }
 */
app.post("/api/registry", (req, res) => {
  try {
    const {
      title,
      tags = [],
      the_build = "",
      friction_log = "",
      mental_model = {},
      forward_vectors = "",
      integration_time_mins = 0,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "MISSING_FIELD", detail: "title is required" });
    }

    const id = uid("reg");

    db.prepare(`
      INSERT INTO registry (id, title, tags, the_build, friction_log, mental_model, forward_vectors, integration_time_mins)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      JSON.stringify(tags),
      the_build,
      friction_log,
      JSON.stringify(mental_model),
      forward_vectors,
      integration_time_mins
    );

    console.log(`[API] POST /api/registry          → 201 CREATED (id: ${id})`);
    res.status(201).json({ id, message: "COMPONENT_LOGGED" });
  } catch (err) {
    console.error("[ERR] POST /api/registry          →", err.message);
    res.status(500).json({ error: "REGISTRY_WRITE_FAILURE", detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// ROUTES: /api/sprint/tasks
// ---------------------------------------------------------------------------

/**
 * GET /api/sprint/tasks
 * Returns all sprint tasks ordered by creation time (newest first).
 */
app.get("/api/sprint/tasks", (_req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM sprint_tasks ORDER BY created_at DESC")
      .all();

    console.log(`[API] GET  /api/sprint/tasks       → 200 OK (${rows.length} tasks)`);
    res.json(rows);
  } catch (err) {
    console.error("[ERR] GET  /api/sprint/tasks       →", err.message);
    res.status(500).json({ error: "SPRINT_READ_FAILURE", detail: err.message });
  }
});

/**
 * POST /api/sprint/tasks
 * Creates a new sprint task.
 *
 * Body: { title, type: 'BUILD'|'STUDY', status?: 'TODO'|'IN_PROGRESS'|'DONE' }
 */
app.post("/api/sprint/tasks", (req, res) => {
  try {
    const { title, type, status = "TODO" } = req.body;

    if (!title || !type) {
      return res
        .status(400)
        .json({ error: "MISSING_FIELDS", detail: "title and type are required" });
    }

    const VALID_TYPES = ["BUILD", "STUDY"];
    const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: "INVALID_TYPE", detail: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "INVALID_STATUS", detail: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const id = uid("task");

    db.prepare(`
      INSERT INTO sprint_tasks (id, title, type, status)
      VALUES (?, ?, ?, ?)
    `).run(id, title, type, status);

    console.log(`[API] POST /api/sprint/tasks       → 201 CREATED (id: ${id})`);
    res.status(201).json({ id, message: "TASK_QUEUED" });
  } catch (err) {
    console.error("[ERR] POST /api/sprint/tasks       →", err.message);
    res.status(500).json({ error: "SPRINT_WRITE_FAILURE", detail: err.message });
  }
});

/**
 * PUT /api/sprint/tasks/:id/status
 * Updates the status of a single task.
 *
 * Body: { status: 'TODO'|'IN_PROGRESS'|'DONE' }
 */
app.put("/api/sprint/tasks/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: "INVALID_STATUS",
        detail: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const result = db
      .prepare("UPDATE sprint_tasks SET status = ? WHERE id = ?")
      .run(status, id);

    if (result.changes === 0) {
      console.warn(`[API] PUT  /api/sprint/tasks/:id/status → 404 NOT_FOUND (id: ${id})`);
      return res.status(404).json({ error: "TASK_NOT_FOUND", detail: `No task with id: ${id}` });
    }

    console.log(`[API] PUT  /api/sprint/tasks/${id}/status → 200 OK → ${status}`);
    res.json({ id, status, message: "STATUS_UPDATED" });
  } catch (err) {
    console.error("[ERR] PUT  /api/sprint/tasks/:id/status →", err.message);
    res.status(500).json({ error: "STATUS_UPDATE_FAILURE", detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// ROUTES: /api/graph
// ---------------------------------------------------------------------------

/**
 * GET /api/graph
 * Returns { nodes, edges } shaped for React Flow consumption.
 */
app.get("/api/graph", (_req, res) => {
  try {
    const rawNodes = db.prepare("SELECT * FROM graph_nodes").all();
    const rawEdges = db.prepare("SELECT * FROM graph_edges").all();

    // Shape nodes for React Flow: { id, position: { x, y }, data: { label } }
    const nodes = rawNodes.map((n) => ({
      id: n.id,
      position: { x: n.pos_x, y: n.pos_y },
      data: { label: n.label },
    }));

    // Shape edges for React Flow: { id, source, target }
    const edges = rawEdges.map((e) => ({
      id: e.id,
      source: e.source_id,
      target: e.target_id,
    }));

    console.log(
      `[API] GET  /api/graph              → 200 OK (${nodes.length} nodes, ${edges.length} edges)`
    );
    res.json({ nodes, edges });
  } catch (err) {
    console.error("[ERR] GET  /api/graph              →", err.message);
    res.status(500).json({ error: "GRAPH_READ_FAILURE", detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// [SYS] HEALTH CHECK
// ---------------------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({
    status: "SYSTEM_STABLE",
    db: DB_PATH,
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// [SYS] 404 CATCH-ALL
// ---------------------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({ error: "ROUTE_NOT_FOUND", detail: "No signal on this endpoint." });
});

// ---------------------------------------------------------------------------
// [SYS] GLOBAL ERROR HANDLER
// ---------------------------------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error("[FATAL]", err.stack);
  res.status(500).json({ error: "INTERNAL_FAULT", detail: err.message });
});

// ---------------------------------------------------------------------------
// [SYS] BOOT
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log("┌─────────────────────────────────────────────┐");
  console.log("│  VERTEX_ Telemetry API — SYSTEM ONLINE      │");
  console.log(`│  Listening on → http://localhost:${PORT}        │`);
  console.log(`│  DB           → vertex_telemetry.db         │`);
  console.log("└─────────────────────────────────────────────┘");
});
