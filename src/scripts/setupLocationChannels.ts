import { Client, ChannelType, Guild, GatewayIntentBits } from 'discord.js';
import { LOCATIONS } from '../constants/locations';
import prisma from '../db/prisma';
import dotenv from 'dotenv';

const CATEGORY_ID = '1375019933939007529';

export async function setupLocationChannels(client: Client) {
  console.log('Starting location channel setup...');
  
  // Get the guild from the client
  const guild = client.guilds.cache.first();
  if (!guild) {
    throw new Error('No guild found in client');
  }
  
  for (const location of LOCATIONS) {
    // Check if location exists in database
    const existingLocation = await prisma.location.findUnique({
      where: { id: location.locationId }
    });

    if (!existingLocation) {
      console.log(`Setting up channel for ${location.name}...`);
      
      try {
        // Create Discord channel
        const channel = await guild.channels.create({
          name: location.name.toLowerCase().replace(/\s+/g, '-'),
          type: ChannelType.GuildText,
          parent: CATEGORY_ID,
        });

        // Create database entry
        await prisma.location.create({
          data: {
            id: location.locationId,
            name: location.name,
            channelId: channel.id
          }
        });

        console.log(`Successfully created channel and database entry for ${location.name}`);
      } catch (error) {
        console.error(`Error setting up ${location.name}:`, error);
      }
    } else {
      console.log(`Location ${location.name} already exists in database`);
    }
  }

  console.log('Location channel setup complete!');
}

async function main() {
  // Load environment variables
  dotenv.config();

  // Create Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages
    ]
  });

  try {
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    console.log('Successfully logged in to Discord');

    // Run the setup
    await setupLocationChannels(client);

    // Disconnect after completion
    await client.destroy();
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the script
main(); 