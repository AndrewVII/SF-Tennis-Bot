import { Bot } from '../discord/bot';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTimeRoles() {
  try {
    // Wait for bot to initialize
    await Bot.initialize();

    const guild = Bot.guild;
    if (!guild) {
      throw new Error('Guild not found');
    }

    // Generate time slots from 7 AM to 9 PM in 30-minute intervals
    const timeSlots: string[] = [];
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute of ['00', '30']) {
        // Convert to 12-hour format
        const isPM = hour >= 12;
        const displayHour = hour > 12 ? hour - 12 : hour;
        const time = `${displayHour}:${minute} ${isPM ? 'PM' : 'AM'}`;
        timeSlots.push(time);
      }
    }

    console.log('Creating roles...');
    
    for (const time of timeSlots) {
      const roleName = time;
      
      // Create role in Discord
      const role = await guild.roles.create({
        name: roleName,
        reason: 'Creating time-based roles for tennis scheduling',
      });

      // Save role to database
      await prisma.roles.create({
        data: {
          id: role.id,
          name: roleName,
        },
      });

      console.log(`Created role: ${roleName}`);
    }

    console.log('All roles created successfully!');
  } catch (error) {
    console.error('Error creating roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTimeRoles(); 