import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

/**
 * Connect to MongoDB with retries and sensible options.
 * Returns true on success, false on failure.
 */
export const connectDB = async () => {
    if (!MONGO_URI) {
        console.error('MONGO_URI is not set in environment. Skipping DB connection.');
        return false;
    }

    const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || '5', 10);
    const baseDelayMs = parseInt(process.env.DB_CONNECT_BASE_DELAY_MS || '1000', 10);

    const opts = {
        // These are recommended defaults in modern mongoose; keeping explicit for clarity
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // How long the driver will try to select a server (in ms)
        serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
    };

    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            attempt++;
            console.log(`Attempting MongoDB connection (attempt ${attempt}/${maxRetries})...`);
            await mongoose.connect(MONGO_URI, opts);
            console.log('MongoDB connected');
            return true;
        } catch (error) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, error && error.message ? error.message : error);
            if (attempt >= maxRetries) {
                console.error('All MongoDB connection attempts failed.');
                // By default do not exit the process here so dev server (nodemon) can keep running and you can fix env/network.
                // If you want the process to exit on DB failure, set FORCE_EXIT_ON_DB_FAIL=true in env.
                if (process.env.FORCE_EXIT_ON_DB_FAIL === 'true') {
                    console.error('Exiting because FORCE_EXIT_ON_DB_FAIL is true.');
                    process.exit(1);
                }
                return false;
            }

            // Exponential backoff before retrying
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.log(`Waiting ${delay}ms before next attempt...`);
            await new Promise((res) => setTimeout(res, delay));
        }
    }

    return false;
};