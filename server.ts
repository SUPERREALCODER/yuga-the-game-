import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("yuga.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    streak INTEGER DEFAULT 0,
    last_completed TEXT
  );

  CREATE TABLE IF NOT EXISTS civ_state (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id TEXT,
    date TEXT,
    UNIQUE(habit_id, date)
  );
`);

// Seed initial habits if empty
const habitCount = db.prepare("SELECT COUNT(*) as count FROM habits").get() as { count: number };
if (habitCount.count === 0) {
  const insert = db.prepare("INSERT INTO habits (id, name, category) VALUES (?, ?, ?)");
  insert.run("cognitive", "Cognitive Infrastructure (AI/GATE)", "cognitive");
  insert.run("kinematic", "Kinematic Age (Robotics/ROS2)", "kinematic");
  insert.run("trade", "Trade & Enterprise (Business)", "trade");
  insert.run("vitality", "Vitality Metric (Calisthenics)", "vitality");
  insert.run("culture", "Culture of Deep Work", "culture");
}

// Seed initial civ state
const stateCount = db.prepare("SELECT COUNT(*) as count FROM civ_state").get() as { count: number };
if (stateCount.count === 0) {
  const insert = db.prepare("INSERT INTO civ_state (key, value) VALUES (?, ?)");
  insert.run("era", "Ancient");
  insert.run("gold", "0");
  insert.run("culture_points", "0");
  insert.run("research_points", "0");
  insert.run("production_points", "0");
  insert.run("population", "100");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/state", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const habits = db.prepare("SELECT * FROM habits").all() as any[];
    
    // Check for streak decay (if last_completed was not today or yesterday)
    habits.forEach(habit => {
      if (habit.last_completed) {
        const last = new Date(habit.last_completed);
        const now = new Date(today);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays > 1) {
          db.prepare("UPDATE habits SET streak = 0 WHERE id = ?").run(habit.id);
          habit.streak = 0;
        }
      }
    });

    // Check for Era advancement
    const stats = db.prepare("SELECT * FROM civ_state").all() as { key: string, value: string }[];
    const stateObj = stats.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    if (parseInt(stateObj.research_points) > 100 && stateObj.era === 'Ancient') {
      db.prepare("UPDATE civ_state SET value = 'Information' WHERE key = 'era'").run();
      stateObj.era = 'Information';
    }

    // Check for Wonders (30 day streak on any habit)
    const hasWonder = habits.some(h => h.streak >= 30);
    stateObj.has_wonder = hasWonder ? "true" : "false";

    res.json({ habits, state: stateObj });
  });

  app.post("/api/log", (req, res) => {
    const { habitId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    try {
      db.prepare("INSERT INTO logs (habit_id, date) VALUES (?, ?)").run(habitId, today);
      
      // Update streak
      const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get() as any;
      let newStreak = habit.streak + 1;
      
      db.prepare("UPDATE habits SET streak = ?, last_completed = ? WHERE id = ?")
        .run(newStreak, today, habitId);

      // Update Civ Stats based on habit
      if (habitId === 'trade') {
        db.prepare("UPDATE civ_state SET value = CAST(value AS INTEGER) + 5000 WHERE key = 'gold'").run();
      } else if (habitId === 'cognitive') {
        db.prepare("UPDATE civ_state SET value = CAST(value AS INTEGER) + 10 WHERE key = 'research_points'").run();
      } else if (habitId === 'culture') {
        db.prepare("UPDATE civ_state SET value = CAST(value AS INTEGER) + 15 WHERE key = 'culture_points'").run();
      } else if (habitId === 'kinematic') {
        db.prepare("UPDATE civ_state SET value = CAST(value AS INTEGER) + 20 WHERE key = 'production_points'").run();
      }

      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Already logged today" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
