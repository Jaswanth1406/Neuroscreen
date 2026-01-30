const { Pool } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTables() {
  console.log("Creating tables in Neon...");
  console.log("Database URL:", process.env.DATABASE_URL ? "✓ Found" : "✗ Missing");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS therapy_tasks (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Therapy',
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `);
    console.log("✓ therapy_tasks table created");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS screening_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        prediction INTEGER,
        probability FLOAT,
        risk_level TEXT,
        confidence TEXT,
        aq10_total INTEGER,
        social_score INTEGER,
        attention_score INTEGER,
        contributing_factors JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✓ screening_history table created");

    console.log("\n✓ All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createTables();
