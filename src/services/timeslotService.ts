import prisma from '../db/prisma';
import type { Timeslot } from '@prisma/client';
/**
 * Marks a timeslot as unavailable in the database
 * @param timeslotId The ID of the timeslot to mark as unavailable
 * @returns Promise resolving to the updated timeslot document
 */
export async function markTimeslotAsUnavailable(timeslotId: number): Promise<Timeslot | null> {
  return prisma.timeslot.update({
    where: { id: timeslotId },
    data: { available: false, unavailableAt: new Date() }
  });
}

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
}): Promise<Timeslot> {
  return prisma.timeslot.create({
    data: {
      ...timeslotData,
      available: true,
      availableAt: new Date()
    }
  });
}

/**
 * Gets all timeslots for a specific location
 * @param locationId The ID of the location to get timeslots for
 * @returns Promise resolving to an array of timeslot documents
 */
export async function getTimeslotsByLocation(locationId: string): Promise<Timeslot[]> {
  return prisma.timeslot.findMany({
    where: { locationId }
  });
} 