import { Queue, Worker } from 'bullmq';
import { redisClient } from '../db/redis';
import { Bot } from '../discord/bot';
import { TextChannel } from 'discord.js';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

// Queue for deleting Discord messages
export const deleteMessageQueue = new Queue('deleteDiscordMessage', {
  connection: {
    url: process.env.REDIS_URL
  }
});

// Worker to handle message deletion
const worker = new Worker('deleteDiscordMessage', async (job) => {
  const { messageId, channelId } = job.data;

  console.log(`Deleting message ${messageId} in channel ${channelId}`);
  
  try {
    if (!Bot.guild) {
      console.log('Bot guild not found');
      return;
    }

    const channel = await Bot.guild.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      console.log(`Channel ${channelId} not found or is not a text channel`);
      return;
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      console.log(`Message ${messageId} not found in channel ${channelId}`);
      return;
    }

    await message.delete();
    console.log(`Message ${messageId} in channel ${channelId} deleted`);
  } catch (error) {
    console.error('Error deleting message:', error);
  }
}, {
  connection: {
    url: process.env.REDIS_URL
  }
});

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
}); 