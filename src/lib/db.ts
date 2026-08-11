import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let MONGODB_URI = process.env.MONGODB_URI;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mongoServer?: MongoMemoryServer | null;
}

const globalWithCache = global as typeof globalThis & { _mongooseCache?: Cached };

let cached: Cached = globalWithCache._mongooseCache ?? { conn: null, promise: null, mongoServer: null };

if (!globalWithCache._mongooseCache) {
  globalWithCache._mongooseCache = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = (async () => {
      let uri = MONGODB_URI;
      
      if (!uri || uri === 'mongodb://localhost:27017/guidepro') {
        if (process.env.NODE_ENV === 'development') {
           if (!cached.mongoServer) {
              cached.mongoServer = await MongoMemoryServer.create();
           }
           uri = cached.mongoServer.getUri();
           console.log(`[Dev] Started MongoMemoryServer at ${uri}`);
        } else if (!uri) {
           throw new Error("MONGODB_URI must be set in production");
        }
      }
      
      try {
        const m = await mongoose.connect(uri, opts);
        console.log('MongoDB connected successfully');
        return m;
      } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { connectToDatabase };
export default mongoose;
