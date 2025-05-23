import { Bot } from '../discord/bot';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllRoles() {
  try {
    // Wait for bot to initialize
    await Bot.initialize();

    const guild = Bot.guild;
    if (!guild) {
      throw new Error('Guild not found');
    }

    console.log('Fetching all roles...');
    const roles = await guild.roles.fetch();
    
    // Delete roles from Discord
    console.log('Deleting roles from Discord...');
    for (const [id, role] of roles) {
      // Skip @everyone role and bot's own role
      if (role.name === '@everyone' || role.managed) {
        continue;
      }
      
      try {
        await role.delete('Cleaning up roles');
        console.log(`Deleted Discord role: ${role.name}`);
      } catch (error) {
        console.error(`Failed to delete Discord role ${role.name}:`, error);
      }
    }

    // Delete roles from database
    console.log('Deleting roles from database...');
    const deleteResult = await prisma.roles.deleteMany({});
    console.log(`Deleted ${deleteResult.count} roles from database`);

    console.log('All roles deleted successfully!');
  } catch (error) {
    console.error('Error deleting roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteAllRoles(); 