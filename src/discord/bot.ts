import { Client, TextChannel, GatewayIntentBits, Guild } from 'discord.js';
import { getLocationChannelId } from '../services/locationService';

const SERVER_ID = '1374988557197901914';

export class Bot {
  public static client: Client;
  public static guild: Guild;
  
  /**
   * Initialize the Discord bot
   */
  public static async initialize(): Promise<void> {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
      ]
    });

    console.log('Logging in to Discord...');
    await this.client.login(process.env.DISCORD_TOKEN);
    console.log('Logged in to Discord');
    const guild = await Bot.client.guilds.fetch(SERVER_ID);
    Bot.guild = guild;
  }
}

// Initialize the bot when this file is imported
Bot.initialize().catch(console.error); 