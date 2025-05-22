import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { connectToDatabase, disconnectFromDatabase } from './db/prisma';
import { connectToRedis, disconnectFromRedis } from './db/redis';
import { Bot } from './discord/bot';
import './crons';  // Import the crons file to start the cron jobs
import './queues/messageQueue';  // Import to start the message queue worker

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function main() {
    try {
        // Connect to PostgreSQL
        await connectToDatabase();
        
        // Connect to Redis
        await connectToRedis();
        
        // Start Discord bot
        await Bot.initialize();
        
        // Start Express server
        app.get('/', (req: Request, res: Response) => {
            res.send('SF Tennis Bot is running!');
        });
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
        
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