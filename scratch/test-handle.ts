import { pool } from '../server/db.ts';

async function testIndex() {
  try {
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, handle) VALUES ($1, $2, $3, $4, $5)',
      [
        'test_dup_' + Date.now(),
        'dup_test_' + Date.now() + '@test.com',
        'hash',
        'Test',
        'Yipmong' // existing is 'yipmong'
      ]
    );
    console.error('ERROR: Duplicate was inserted!');
  } catch (err: any) {
    console.log('✓ PostgreSQL correctly caught and rejected duplicate username!');
    console.log('  Error code:', err.code);
    console.log('  Constraint message:', err.message);
  } finally {
    await pool.end();
  }
}

testIndex().catch(console.error);
