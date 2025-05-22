import prisma from '../db/prisma';
import type { Location } from '@prisma/client';

/**
 * Gets a location by its ID
 * @param locationId The ID of the location to find
 * @returns Promise resolving to the location or null if not found
 */
export async function getLocationById(locationId: string): Promise<Location | null> {
  return prisma.location.findUnique({
    where: { id: locationId }
  });
}

/**
 * Gets the Discord channel ID for a specific location
 * @param locationId The ID of the location
 * @returns Promise resolving to the channel ID or null if not found
 */
export async function getLocationChannelId(locationId: string): Promise<string | null> {
  const location = await getLocationById(locationId);
  return location?.channelId || null;
} 