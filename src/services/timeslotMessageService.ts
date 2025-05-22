import prisma from '../db/prisma';
import type { TimeslotMessage } from '@prisma/client';
import { sendNewTimeslotMessage, updateTimeslotMessageToUnavailable } from '../discord/messages';
import { getLocationChannelId } from './locationService';
import { deleteMessageQueue } from '../queues/messageQueue';

/**
 * Creates a new timeslot in the database
 * @param timeslotData The data for the new timeslot
 * @returns Promise resolving to the created timeslot document
 */
export async function createNewTimeslot(timeslotData: {
  startTime: string;
  endTime: string;
  date: string;
  locationId: string;
  locationName: string;
  secretKey: string;
}): Promise<TimeslotMessage> {
  const messageId = await sendNewTimeslotMessage({
    locationId: timeslotData.locationId,
    startTime: timeslotData.startTime,
    endTime: timeslotData.endTime,
    date: timeslotData.date
  });

  return prisma.timeslotMessage.create({
    data: {
      ...timeslotData,
      available: true,
      availableAt: new Date(),
      messageId
    }
  });
}

/**
 * Gets all timeslots for a specific location
 * @param locationId The ID of the location to get timeslots for
 * @returns Promise resolving to an array of timeslot documents
 */
export async function getTimeslotsByLocation(locationId: string): Promise<TimeslotMessage[]> {
  return prisma.timeslotMessage.findMany({
    where: { locationId }
  });
}

/**
 * Finds a timeslot by its properties
 * @param params The properties to search for
 * @returns Promise resolving to the found timeslot or null
 */
export async function findTimeslotByProperties(params: {
  startTime: string;
  endTime: string;
  date: string;
  locationId: string;
}): Promise<TimeslotMessage | null> {
  return prisma.timeslotMessage.findFirst({
    where: {
      startTime: params.startTime,
      endTime: params.endTime,
      date: params.date,
      locationId: params.locationId,
      deletedAt: null
    }
  });
}

/**
 * Updates a timeslot's secretKey
 * @param timeslotId The ID of the timeslot to update
 * @param secretKey The new secretKey to set
 * @returns Promise resolving to the updated timeslot
 */
export async function updateTimeslotSecretKey(timeslotId: number, secretKey: string): Promise<TimeslotMessage> {
  return prisma.timeslotMessage.update({
    where: { id: timeslotId },
    data: { secretKey }
  });
}

/**
 * Marks timeslots without a secretKey as unavailable
 * @param secretKey The secretKey to check against
 * @param locationId The location ID to filter timeslots
 * @returns Promise resolving to the number of updated timeslots
 */
export async function markTimeslotsWithIncorrectSecretKeyAsUnavailable(secretKey: string, locationId: string): Promise<number> {
  // First find all timeslots that will be marked as unavailable
  const timeslotsToUpdate = await prisma.timeslotMessage.findMany({
    where: {
      secretKey: {
        not: secretKey
      },
      locationId,
      deletedAt: null
    }
  });

  // Update all timeslots in the database
  const result = await prisma.timeslotMessage.updateMany({
    where: {
      secretKey: {
        not: secretKey
      },
      locationId,
      deletedAt: null
    },
    data: {
      available: false,
      unavailableAt: new Date(),
      deletedAt: new Date()
    }
  });

  const unavailableAt = new Date();
  for (const timeslot of timeslotsToUpdate) {
    if (timeslot.messageId && timeslot.availableAt) {
      const channelId = await getLocationChannelId(timeslot.locationId);
      if (channelId) {
        await updateTimeslotMessageToUnavailable(
          timeslot.messageId,
          channelId,
          timeslot.availableAt,
          unavailableAt,
          timeslot.date,
          timeslot.startTime
        );
      }

      await deleteMessageQueue.add('deleteDiscordMessage', {
        messageId: timeslot.messageId,
        channelId: channelId
      }, {
        delay: 1000 * 60 * 10 // 10 minutes
      });
    }
  }

  return result.count;
} 