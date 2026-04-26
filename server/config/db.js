const mongoose = require('mongoose');

// ── Configuration ──
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;           // 5 seconds between retries
const CONNECTION_TIMEOUT_MS = 5000;        // fail fast per attempt

let isConnected = false;

/**
 * Attempt a single MongoDB connection.
 * Returns true on success, false on failure (never throws).
 */
const attemptConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
    });

    isConnected = true;

    console.log('┌──────────────────────────────────────────────┐');
    console.log('│  ✅  MongoDB Connected                       │');
    console.log(`│  Host : ${conn.connection.host.padEnd(36)} │`);
    console.log(`│  DB   : ${conn.connection.name.padEnd(36)} │`);
    console.log('└──────────────────────────────────────────────┘');

    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB connection attempt failed: ${error.message}`);
    return false;
  }
};

/**
 * Non-blocking MongoDB connection with automatic retry.
 *
 * - Starts the connection loop in the background (does NOT block the caller).
 * - Retries up to MAX_RETRIES times with a delay between each attempt.
 * - The Express server keeps running regardless of connection outcome.
 */
const connectDB = () => {
  // Fire-and-forget — caller is never blocked
  (async () => {
    console.log(`\n🔌 MongoDB — attempting to connect (up to ${MAX_RETRIES} retries)...`);
    console.log(`   URI: ${process.env.MONGO_URI}\n`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`   ⏳ Attempt ${attempt}/${MAX_RETRIES}...`);

      const success = await attemptConnection();
      if (success) return; // connected — stop retrying

      if (attempt < MAX_RETRIES) {
        console.log(`   ⏱  Retrying in ${RETRY_INTERVAL_MS / 1000}s...\n`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      }
    }

    // All retries exhausted
    console.warn('┌──────────────────────────────────────────────┐');
    console.warn('│  ❌  MongoDB Connection Failed               │');
    console.warn(`│  All ${MAX_RETRIES} attempts exhausted.                   │`);
    console.warn('│  The server will continue WITHOUT a database │');
    console.warn('│  connection. DB-dependent routes will fail.  │');
    console.warn('│                                              │');
    console.warn('│  Troubleshooting:                            │');
    console.warn('│  • Is MongoDB running?                       │');
    console.warn('│  • Is MONGO_URI correct in .env?             │');
    console.warn('└──────────────────────────────────────────────┘\n');
  })();
};

// ── Mongoose event listeners (global, registered once) ──
mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    console.warn('⚠️  MongoDB disconnected — lost connection');
    isConnected = false;
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

/**
 * Returns the current MongoDB connection status.
 * Useful for health-check endpoints.
 */
const getDBStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});

module.exports = { connectDB, getDBStatus };
