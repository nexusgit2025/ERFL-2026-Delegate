import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  // already connected
  if (cached.conn) return cached.conn;

  // 🔴 HARD FAIL if env missing
  if (!process.env.MONGO_URL) {
    throw new Error("❌ MONGO_URL is not defined in environment variables");
  }

  if (!cached.promise) {
    mongoose.set("bufferTimeoutMS", 30000);

    cached.promise = mongoose
      .connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 30000,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        cached.promise = null; // 🔥 reset on failure
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
