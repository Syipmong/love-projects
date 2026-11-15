import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Raw SQL Migration to initialize schema
 */
export async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL database with raw SQL...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id VARCHAR(64) PRIMARY KEY,
        creator_email VARCHAR(255),
        creator_name VARCHAR(255),
        partner_name VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        question TEXT NOT NULL,
        config_json JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        proposal_id VARCHAR(64) NOT NULL,
        event_type VARCHAR(64) NOT NULL,
        chapter INT,
        data_json JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        proposal_id VARCHAR(64) NOT NULL,
        answer VARCHAR(16) NOT NULL,
        tease_attempts INT DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Index for fast analytics queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_proposal_id ON events(proposal_id);
      CREATE INDEX IF NOT EXISTS idx_responses_proposal_id ON responses(proposal_id);
    `);

    console.log('PostgreSQL raw SQL tables initialized successfully.');
  } finally {
    client.release();
  }
}

