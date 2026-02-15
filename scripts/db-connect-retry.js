#!/usr/bin/env node

/**
 * Database connection retry script for Neon PostgreSQL
 * Handles auto-suspend on free tier by retrying connections
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // 3 seconds
const INITIAL_DELAY = 2000; // 2 seconds initial wait

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDatabaseConnection(attempt = 1) {
  console.log(`[${attempt}/${MAX_RETRIES}] Testing database connection...`);

  try {
    // Use Prisma to test the connection
    const { stdout, stderr } = await execPromise('npx prisma db execute --stdin <<< "SELECT 1"', {
      timeout: 10000
    });

    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    const errorMessage = error.message || error.stderr || '';

    if (errorMessage.includes('P1001') || errorMessage.includes("Can't reach database")) {
      console.log(`⏳ Database is starting up (attempt ${attempt}/${MAX_RETRIES})...`);

      if (attempt < MAX_RETRIES) {
        console.log(`   Waiting ${RETRY_DELAY/1000}s before retry...`);
        await sleep(RETRY_DELAY);
        return testDatabaseConnection(attempt + 1);
      } else {
        console.error('❌ Max retries reached. Database is not responding.');
        console.error('   This might be a configuration issue. Check your DATABASE_URL.');
        throw new Error('Database connection failed after maximum retries');
      }
    } else {
      // Different error - fail immediately
      console.error('❌ Database connection error:', errorMessage);
      throw error;
    }
  }
}

async function runMigrations() {
  console.log('\n📦 Running database migrations...');

  try {
    const { stdout, stderr } = await execPromise('npx prisma migrate deploy');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('✅ Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database connection with retry logic...\n');

  try {
    // Initial delay to give database time to wake up
    console.log(`⏳ Waiting ${INITIAL_DELAY/1000}s for database to initialize...`);
    await sleep(INITIAL_DELAY);

    // Test connection with retries
    await testDatabaseConnection();

    // Run migrations
    await runMigrations();

    console.log('\n✅ Database is ready! Starting application...\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to prepare database:', error.message);
    process.exit(1);
  }
}

main();
