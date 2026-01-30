import { Pool } from "@neondatabase/serverless"

// Create a singleton pool to reuse connections
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }
  return pool
}
