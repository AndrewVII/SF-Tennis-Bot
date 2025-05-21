import { Client, GatewayIntentBits } from 'discord.js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from './db/connection';
import './crons';  // Import the crons file to start the cron jobs

dotenv.config();

async function main() {
    try {
        // Connect to MongoDB
        await connectToDatabase();
        
        // Your existing bot setup code will go here
        
    } catch (error) {
        console.error('Error in main:', error);
        await disconnectFromDatabase();
        process.exit(1);
    }
}

main().catch(console.error); 