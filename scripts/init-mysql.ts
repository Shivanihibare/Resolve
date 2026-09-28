// scripts/init-mysql.ts
// One-time idempotent MySQL schema + seed initializer for Railway.
// Usage: pnpm run init-db  (via Railway "Run Command" UI)
// Does NOT run automatically on server start.

import { createConnection } from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (Railway provides them). Also fallback to local .env if present.
config();

async function main() {
  const {
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
  } = process.env;

  if (!MYSQL_HOST || !MYSQL_PORT || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
    console.error('❌ Missing required MySQL environment variables:');
    console.error('   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
    process.exit(1);
  }

  console.log(`Connecting to MySQL at ${MYSQL_HOST}:${MYSQL_PORT} (database: ${MYSQL_DATABASE})...`);

  const connection = await createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    multipleStatements: true,
  });

  try {
    // ----- Schema -----
    const schemaPath = resolve(__dirname, '..', 'database', 'schema.sql');
    let schemaSql = await readFile(schemaPath, { encoding: 'utf8' });

    // Remove DROP DATABASE / CREATE DATABASE / USE statements.
    // Railway already provides a database; these would fail or destroy it.
    schemaSql = schemaSql
      .split('\n')
      .filter(
        (ln) =>
          !/^\s*DROP\s+DATABASE/i.test(ln) &&
          !/^\s*CREATE\s+DATABASE/i.test(ln) &&
          !/^\s*USE\s+/i.test(ln)
      )
      .join('\n');

    // Make tables idempotent: CREATE TABLE -> CREATE TABLE IF NOT EXISTS
    schemaSql = schemaSql.replace(/CREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS)/gi, 'CREATE TABLE IF NOT EXISTS ');

    console.log('Running schema statements (CREATE TABLE IF NOT EXISTS)...');
    await connection.query(schemaSql);
    console.log('✅ Schema applied (idempotent).');

    // ----- Seed -----
    const seedPath = resolve(__dirname, '..', 'database', 'seed.sql');
    let seedSql = await readFile(seedPath, { encoding: 'utf8' });

    // Remove USE statements from seed.sql too.
    seedSql = seedSql
      .split('\n')
      .filter((ln) => !/^\s*USE\s+/i.test(ln))
      .join('\n');

    // seed.sql already uses ON DUPLICATE KEY UPDATE for idempotence.
    // Additionally guard plain INSERT INTO (if any) with INSERT IGNORE INTO.
    seedSql = seedSql.replace(/INSERT\s+INTO(?!\s+IGNORE)/gi, 'INSERT IGNORE INTO');

    console.log('Running seed statements (idempotent via ON DUPLICATE KEY / INSERT IGNORE)...');
    await connection.query(seedSql);
    console.log('✅ Seed data applied.');

    // ----- Verification -----
    console.log('\n--- Verification ---');
    const [tables] = await connection.query('SHOW TABLES') as any[];
    console.log('Tables found:', tables.map((t: any) => Object.values(t)[0]));

    const [users] = await connection.query('SELECT user_id, username, email, role FROM users ORDER BY user_id') as any[];
    console.log('Seeded users:');
    for (const u of users) {
      console.log(`  [${u.user_id}] ${u.username} (${u.email}) - ${u.role}`);
    }

    const [depts] = await connection.query('SELECT department_id, department_name FROM departments ORDER BY department_id') as any[];
    console.log('Departments:', depts.map((d: any) => d.department_name).join(', '));

    console.log('\n✅ Database initialization complete.');
  } catch (err) {
    console.error('❌ Error during DB initialization:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
