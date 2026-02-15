#!/usr/bin/env node

/**
 * Database connection retry script for Neon PostgreSQL
 * Handles auto-suspend on free tier by retrying migrations
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const MAX_RETRIES = 20;
const RETRY_DELAY = 5000; // 5 seconds
const INITIAL_DELAY = 5000; // 5 seconds initial wait

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMigrationsWithRetry(attempt = 1) {
  console.log(`[${attempt}/${MAX_RETRIES}] Running database migrations...`);

  try {
    const { stdout, stderr } = await execPromise('npx prisma migrate deploy', {
      timeout: 20000
    });

    console.log(stdout);
    if (stderr && !stderr.includes('warn')) {
      console.error(stderr);
    }

    console.log('✅ Migrations completed successfully!');
    return true;
  } catch (error) {
    const errorMessage = error.message + (error.stdout || '') + (error.stderr || '');

    // Check for database connection errors
    if (errorMessage.includes('P1001') || errorMessage.includes("Can't reach database")) {
      console.log(`⏳ Database is starting up (attempt ${attempt}/${MAX_RETRIES})...`);

      if (attempt < MAX_RETRIES) {
        console.log(`   Waiting ${RETRY_DELAY/1000}s before retry...`);
        await sleep(RETRY_DELAY);
        return runMigrationsWithRetry(attempt + 1);
      } else {
        console.error('❌ Max retries reached. Database is not responding.');
        console.error('   Please check:');
        console.error('   1. DATABASE_URL environment variable is correct');
        console.error('   2. Neon database is not suspended (free tier auto-suspends)');
        throw new Error('Database connection failed after maximum retries');
      }
    } else {
      // Different error - show it and fail
      console.error('❌ Migration error:', errorMessage);
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Starting database preparation with retry logic...\n');

  try {
    // Initial delay to give database time to wake up
    console.log(`⏳ Waiting ${INITIAL_DELAY/1000}s for database to initialize...\n`);
    await sleep(INITIAL_DELAY);

    // Run migrations with retry logic
    await runMigrationsWithRetry();

    console.log('\n✅ Database is ready! Starting application...\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to prepare database:', error.message);
    process.exit(1);
  }
}

main();
