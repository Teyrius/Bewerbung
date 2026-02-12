const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

function initDb() {
  const dbPath = path.join(app.getPath("userData"), "bewerbungen.db");
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      application_date TEXT NOT NULL,
      cover_letter TEXT,
      company_response TEXT,
      response_status TEXT NOT NULL DEFAULT 'offen',
      reminder_at TEXT,
      sent_via TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function nowIso() {
  return new Date().toISOString();
}

function registerIpc() {
  ipcMain.handle("applications:list", () => {
    const stmt = db.prepare(
      "SELECT * FROM applications ORDER BY application_date DESC, id DESC"
    );
    return stmt.all();
  });

  ipcMain.handle("applications:add", (event, payload) => {
    const stmt = db.prepare(`
      INSERT INTO applications (
        company,
        application_date,
        cover_letter,
        company_response,
        response_status,
        reminder_at,
        sent_via,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const timestamp = nowIso();
    const result = stmt.run(
      payload.company,
      payload.application_date,
      payload.cover_letter || "",
      payload.company_response || "",
      payload.response_status || "offen",
      payload.reminder_at || null,
      payload.sent_via,
      timestamp,
      timestamp
    );

    return { id: result.lastInsertRowid };
  });

  ipcMain.handle("applications:update", (event, payload) => {
    const stmt = db.prepare(`
      UPDATE applications
      SET company = ?,
          application_date = ?,
          cover_letter = ?,
          company_response = ?,
          response_status = ?,
          reminder_at = ?,
          sent_via = ?,
          updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      payload.company,
      payload.application_date,
      payload.cover_letter || "",
      payload.company_response || "",
      payload.response_status || "offen",
      payload.reminder_at || null,
      payload.sent_via,
      nowIso(),
      payload.id
    );

    return { changes: result.changes };
  });

  ipcMain.handle("applications:delete", (event, id) => {
    const stmt = db.prepare("DELETE FROM applications WHERE id = ?");
    const result = stmt.run(id);
    return { changes: result.changes };
  });
}

app.whenReady().then(() => {
  initDb();
  registerIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
