import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

export async function deleteAllChannels(client: Client) {
  console.log('Starting channel deletion...');
  
  // Get the guild from the client
  const guild = client.guilds.cache.first();
  if (!guild) {
    throw new Error('No guild found in client');
  }

  // Fetch all channels
  const channels = await guild.channels.fetch();
  
  // Delete each channel
  for (const [id, channel] of channels) {
    if (channel) {
      try {
        console.log(`Deleting channel: ${channel.name}`);
        await channel.delete();
        console.log(`Successfully deleted channel: ${channel.name}`);
      } catch (error) {
        console.error(`Error deleting channel ${channel.name}:`, error);
      }
    }
  }

  console.log('Channel deletion complete!');
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

    // Run the deletion
    await deleteAllChannels(client);

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