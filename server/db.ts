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
export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL database with raw SQL (strict TypeScript)...');

    // 1. Users table for authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Proposals table with user relation and unique slug
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        slug VARCHAR(128) UNIQUE NOT NULL,
        creator_email VARCHAR(255),
        creator_name VARCHAR(255),
        partner_name VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        question TEXT NOT NULL,
        config_json JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // In case proposals was previously created without slug or user_id
    await client.query(`
      ALTER TABLE proposals ADD COLUMN IF NOT EXISTS user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE proposals ADD COLUMN IF NOT EXISTS slug VARCHAR(128);
    `);

    // 3. Events table for telemetry
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

    // 4. Responses table for proposal answers
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

    // 5. Anonymous Messages table (anonymoux)
    await client.query(`
      CREATE TABLE IF NOT EXISTS anonymous_messages (
        id SERIAL PRIMARY KEY,
        recipient_handle VARCHAR(128) NOT NULL,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        prompt_category VARCHAR(64) DEFAULT 'secret_message',
        sender_hint VARCHAR(128),
        device_hint VARCHAR(64),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add handle column to users if not present and enforce case-insensitive unique index
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS handle VARCHAR(64);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle_lower_unique ON users (LOWER(handle));
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_proposals_slug ON proposals(slug);
      CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_proposal_id ON events(proposal_id);
      CREATE INDEX IF NOT EXISTS idx_responses_proposal_id ON responses(proposal_id);
      CREATE INDEX IF NOT EXISTS idx_anon_recipient_handle ON anonymous_messages(recipient_handle);
      CREATE INDEX IF NOT EXISTS idx_anon_user_id ON anonymous_messages(user_id);
    `);

    console.log('PostgreSQL raw SQL schema verified successfully.');
  } finally {
    client.release();
  }
}

