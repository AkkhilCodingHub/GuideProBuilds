import mongoose, { Mongoose } from 'mongoose';

// Get MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guidepro';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a separate global variable for caching to avoid type conflicts
const globalWithCache = global as typeof globalThis & { _mongooseCache?: Cached };

let cached: Cached = globalWithCache._mongooseCache ?? { conn: null, promise: null };

if (!globalWithCache._mongooseCache) {
  globalWithCache._mongooseCache = cached;
}

/**
 * Connects to the MongoDB database using the connection string from the environment variables.
 * Uses a cached connection if available to prevent multiple connections in development.
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Export the connection function and mongoose instance
export { connectToDatabase };
export default mongoose;
