/**
 * VERTEX_ — Local Telemetry API
 * Stack: Express.js + better-sqlite3
 * DB:    vertex_telemetry.db
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
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS registry (
    id                TEXT PRIMARY KEY,
    title             TEXT NOT NULL,
    tags              TEXT NOT NULL DEFAULT '[]',
    the_build         TEXT,
    friction_log      TEXT,
    mental_model      TEXT DEFAULT '{}',
    forward_vectors   TEXT,
    integration_time_mins INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sprint_tasks (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    type       TEXT NOT NULL CHECK(type IN ('BUILD', 'STUDY')),
    status     TEXT NOT NULL DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS graph_nodes (
    id    TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    pos_x REAL DEFAULT 0,
    pos_y REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS graph_edges (
    id        TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL
  );
`);

console.log("[SYS] DB Mounted →", DB_PATH);
console.log("[SYS] Schema Verified. All tables nominal.");

// ---------------------------------------------------------------------------
// [SYS] EXPRESS INIT
// ---------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const uid = (prefix = "vtx") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// SPRINT TASKS
// ---------------------------------------------------------------------------

app.get("/api/sprint/tasks", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM sprint_tasks ORDER BY created_at DESC").all();
    console.log(`[API] GET /api/sprint/tasks - OK (${rows.length} tasks)`);
    res.json(rows);
  } catch (err) {
    console.error("[ERR] GET /api/sprint/tasks -", err.message);
    res.status(500).json({ error: "SPRINT_READ_FAILURE", detail: err.message });
  }
});

app.post("/api/sprint/tasks", (req, res) => {
  try {
    const { title, type, status = "TODO" } = req.body;
    if (!title || !type) {
      return res.status(400).json({ error: "MISSING_FIELDS", detail: "title and type are required" });
    }
    const id = uid("task");
    db.prepare("INSERT INTO sprint_tasks (id, title, type, status) VALUES (?, ?, ?, ?)")
      .run(id, title, type, status);
    console.log(`[API] POST /api/sprint/tasks - OK (id: ${id})`);
    res.status(201).json({ id, message: "TASK_QUEUED" });
  } catch (err) {
    console.error("[ERR] POST /api/sprint/tasks -", err.message);
    res.status(500).json({ error: "SPRINT_WRITE_FAILURE", detail: err.message });
  }
});

app.put("/api/sprint/tasks/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const VALID = ["TODO", "IN_PROGRESS", "DONE"];
    if (!status || !VALID.includes(status)) {
      return res.status(400).json({ error: "INVALID_STATUS", detail: `Must be one of: ${VALID.join(", ")}` });
    }
    const result = db.prepare("UPDATE sprint_tasks SET status = ? WHERE id = ?").run(status, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "TASK_NOT_FOUND" });
    }
    console.log(`[API] PUT /api/sprint/tasks/${id}/status - OK → ${status}`);
    res.json({ id, status, message: "STATUS_UPDATED" });
  } catch (err) {
    console.error("[ERR] PUT /api/sprint/tasks/:id/status -", err.message);
    res.status(500).json({ error: "STATUS_UPDATE_FAILURE", detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// REGISTRY (Vector Transaction)
// ---------------------------------------------------------------------------

app.get("/api/registry", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM registry ORDER BY rowid DESC").all();
    const parsed = rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags || "[]"),
      mental_model: JSON.parse(row.mental_model || "{}"),
    }));
    console.log(`[API] GET /api/registry - OK (${parsed.length} components)`);
    res.json(parsed);
  } catch (err) {
    console.error("[ERR] GET /api/registry -", err.message);
    res.status(500).json({ error: "REGISTRY_READ_FAILURE", detail: err.message });
  }
});

/**
 * POST /api/registry
 *
 * Vector Transaction: atomically —
 *   1. Inserts asset into `registry`
 *   2. Inserts a node into `graph_nodes` (using asset id + title)
 *   3. IF `vector_origin_id` is provided, inserts an edge from origin → new asset
 */
const vectorTransaction = db.transaction((payload) => {
  const {
    id,
    title,
    tags,
    the_build,
    friction_log,
    mental_model,
    forward_vectors,
    integration_time_mins,
    vector_origin_id,
  } = payload;

  // 1. Insert registry asset
  db.prepare(`
    INSERT INTO registry (id, title, tags, the_build, friction_log, mental_model, forward_vectors, integration_time_mins)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title,
    JSON.stringify(tags || []),
    the_build || "",
    friction_log || "",
    JSON.stringify(mental_model || {}),
    forward_vectors || "",
    integration_time_mins || 0
  );

  // 2. Insert graph node
  db.prepare("INSERT INTO graph_nodes (id, label, pos_x, pos_y) VALUES (?, ?, ?, ?)")
    .run(id, title, 100, 100);

  // 3. Insert graph edge if a vector origin is declared
  if (vector_origin_id) {
    const edgeId = uid("edge");
    db.prepare("INSERT INTO graph_edges (id, source_id, target_id) VALUES (?, ?, ?)")
      .run(edgeId, vector_origin_id, id);
    console.log(`[SYS] VECTOR_EDGE linked: ${vector_origin_id} → ${id}`);
  }
});

app.post("/api/registry", (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "MISSING_FIELD", detail: "title is required" });
    }
    const id = uid("reg");
    vectorTransaction({ ...req.body, id });
    console.log(`[API] POST /api/registry - OK (id: ${id})`);
    res.status(201).json({ id, message: "COMPONENT_LOGGED" });
  } catch (err) {
    console.error("[ERR] POST /api/registry -", err.message);
    res.status(500).json({ error: "REGISTRY_WRITE_FAILURE", detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// GRAPH
// ---------------------------------------------------------------------------

app.get("/api/graph", (_req, res) => {
  try {
    const rawNodes = db.prepare("SELECT * FROM graph_nodes").all();
    const rawEdges = db.prepare("SELECT * FROM graph_edges").all();

    const nodes = rawNodes.map((n) => ({
      id: n.id,
      position: { x: n.pos_x, y: n.pos_y },
      data: { label: n.label },
    }));

    const edges = rawEdges.map((e) => ({
      id: e.id,
      source: e.source_id,
      target: e.target_id,
    }));

    console.log(`[API] GET /api/graph - OK (${nodes.length} nodes, ${edges.length} edges)`);
    res.json({ nodes, edges });
  } catch (err) {
    console.error("[ERR] GET /api/graph -", err.message);
    res.status(500).json({ error: "GRAPH_READ_FAILURE", detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// HEALTH + CATCH-ALL
// ---------------------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({
    status: "SYSTEM_STABLE",
    db: DB_PATH,
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "ROUTE_NOT_FOUND", detail: "No signal on this endpoint." });
});

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
  console.log(`│  Listening → http://localhost:${PORT}           │`);
  console.log("└─────────────────────────────────────────────┘");
});
