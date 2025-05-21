import mongoose from 'mongoose';
import { config } from '../config/config';

const databaseUrl = config.database.url;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export async function connectToDatabase() {
    try {
        await mongoose.connect(databaseUrl as string);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export async function disconnectFromDatabase() {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB successfully');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
} 