import { PrismaClient } from '@prisma/client';
import { Bot } from '../discord/bot';
import { sendNewTimeslotMessage } from '../discord/messages';

const prisma = new PrismaClient();

async function testMessage() {
  try {
    // Initialize the bot
    await Bot.initialize();

    // Find an available timeslot
    const timeslot = await prisma.timeslotMessage.findFirst({
      where: {
        id: 1,
      },
      include: {
        location: true
      }
    });

    if (!timeslot) {
      console.log('No available timeslots found');
      return;
    }

    console.log('Found timeslot:', {
      location: timeslot.locationName,
      date: timeslot.date,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime
    });

    // Send the message
    const messageId = await sendNewTimeslotMessage({
      locationId: timeslot.locationId,
      locationName: timeslot.locationName,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      date: timeslot.date
    });

    console.log('Message sent successfully with ID:', messageId);
  } catch (error) {
    console.error('Error testing message:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMessage(); 