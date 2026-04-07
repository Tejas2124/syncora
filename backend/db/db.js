/**
 * Database initialization and management
 * Uses sqlite3 package for SQLite database
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");

// Database file location
const DB_PATH = path.join(__dirname, "moodread.db");

// Global database instance
let db = null;

/**
 * Initialize database: create connection, run schema, seed data
 */
async function initializeDb() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        reject(new Error(`Failed to open database: ${err.message}`));
      } else {
        console.log(`[DB] Connected to database: ${DB_PATH}`);

        db.run("PRAGMA foreign_keys = ON");
        
        try {
          // Read and execute schema
          const schemaPath = path.join(__dirname, "schema.sql");
          const schema = fs.readFileSync(schemaPath, "utf8");
          
          db.exec(schema, async (err) => {
            if (err) {
              reject(new Error(`Failed to initialize schema: ${err.message}`));
            } else {
              console.log("db schema=initialized");
              
              // Seed songs on initialization
              try {
                await seedSongs();
                resolve(db);
              } catch (seedErr) {
                reject(seedErr);
              }
            }
          });
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

/**
 * Seed 50 pre-analyzed songs into the database
 */
async function seedSongs() {
  const songData = require("./seed-songs.js");
  
  // Check if songs already seeded
  const existingCount = await get("SELECT COUNT(*) as count FROM songs");
  
  if (existingCount.count > 0) {
    console.log(`db songsSeed=skipped existingCount=${existingCount.count}`);
    return;
  }
  
  // Insert all songs
  for (const song of songData) {
    await run(
      "INSERT INTO songs (id, title, artist, emotion, filePath, duration, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        uuid(),
        song.title,
        song.artist,
        song.emotion,
        song.filePath || "",
        song.duration || null,
        new Date().toISOString(),
      ]
    );
  }
  
  console.log(`db songsSeed=completed insertedCount=${songData.length}`);
}

/**
 * Get database instance
 */
function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDb() first.");
  }
  return db;
}

/**
 * Run a query with parameters (for INSERT, UPDATE, DELETE)
 * Returns a Promise that resolves after execution
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Get a single row as an object
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Get all rows as an array
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Close database connection
 */
function closeDb() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initializeDb,
  getDb,
  run,
  get,
  all,
  closeDb,
};
