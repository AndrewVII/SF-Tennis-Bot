import { createClient } from 'redis';
import { config } from '../config/config';

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not defined in environment variables');
}

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

export async function connectToRedis() {
    try {
        await redisClient.connect();
        console.log('Connected to Redis successfully');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        throw error;
    }
}

export async function disconnectFromRedis() {
    try {
        await redisClient.disconnect();
        console.log('Disconnected from Redis successfully');
    } catch (error) {
        console.error('Error disconnecting from Redis:', error);
        throw error;
    }
}

export { redisClient }; 