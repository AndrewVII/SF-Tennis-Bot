import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from './db/prisma';
import { connectToRedis, disconnectFromRedis } from './db/redis';
import { Bot } from './discord/bot';
import './crons';  // Import the crons file to start the cron jobs
import './queues/messageQueue';  // Import to start the message queue worker

dotenv.config();

async function main() {
    try {
        // Connect to PostgreSQL
        await connectToDatabase();
        
        // Connect to Redis
        await connectToRedis();
        
        // Start Discord bot
        await Bot.initialize();
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('Shutting down...');
            await Bot.client.destroy();
            await disconnectFromDatabase();
            await disconnectFromRedis();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Error in main:', error);
        await disconnectFromDatabase();
        await disconnectFromRedis();
        process.exit(1);
    }
}

main().catch(console.error); 