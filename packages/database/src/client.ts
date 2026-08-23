import mongoose from "mongoose";

let isConnected = false;

function mongoUri(): string {
  return (
    process.env["MONGODB_URI"] ||
    process.env["MONGO_URL"] ||
    "mongodb://localhost:27017/owly"
  );
}

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = mongoUri();
  const maxAttempts = 10;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      console.log("🗄️  MongoDB connected");
      return mongoose;
    } catch (error) {
      lastError = error;
      isConnected = false;
      console.error(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed:`,
        error
      );
      if (attempt < maxAttempts) {
        const delayMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

export { mongoose };
