import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  recAuthToken: process.env.REC_AUTH_TOKEN,
} as const; 