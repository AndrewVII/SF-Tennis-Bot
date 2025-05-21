import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';

if (!config.database.url) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const prisma = new PrismaClient();

export async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log('Connected to PostgreSQL successfully');
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
}

export async function disconnectFromDatabase() {
    try {
        await prisma.$disconnect();
        console.log('Disconnected from PostgreSQL successfully');
    } catch (error) {
        console.error('Error disconnecting from PostgreSQL:', error);
        throw error;
    }
}

export default prisma; 