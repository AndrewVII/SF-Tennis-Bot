import { getRecLocation, RecLocationResponse, getRecSchedule, RecScheduleResponse } from '../api/rec';
import { LOCATIONS } from '../constants/locations';
import { getTimeslotsByLocation, markTimeslotAsUnavailable, createNewTimeslot } from '../services/timeslotService';
import { ITimeslot } from '../db/models/timeslot';

/**
 * Extracts all location IDs from the banner pages data in a location response
 * @param locationData The location data response from the Rec API
 * @returns Array of location IDs found in the banner pages
 */
export function getAllLocations(locationData: RecLocationResponse): string[] {
  const location = locationData.location;
  
  if (location?.organization?.config?.banners?.pages) {
    const bannerPages = location.organization.config.banners.pages;
    return Object.keys(bannerPages)
      .filter(path => path.startsWith('/locations/'))
      .map(path => path.split('/').pop() || '');
  }
  
  return [];
}

/**
 * Fetches data for all locations in the Rec system
 * @param initialLocationId The ID of the initial location to fetch (used to get the list of all locations)
 * @returns Promise resolving to an array of location data for all locations
 */
export async function getAllLocationsData(initialLocationId: string): Promise<RecLocationResponse[]> {
  // First get the initial location data to extract all location IDs
  const initialLocationData = await getRecLocation(initialLocationId);
  const allLocationIds = getAllLocations(initialLocationData);
  
  // Then fetch data for each location
  const allLocationsData = await Promise.all(
    allLocationIds.map(locationId => getRecLocation(locationId))
  );
  
  return allLocationsData;
}

interface Court {
  id: string;
  createdAt: string;
  isInstantBookable: boolean;
  availableSlots: string[];
  sports: Array<{
    id: string;
    sportId: string;
  }>;
  config?: {
    bookingPolicies?: Array<{
      type: string;
      slots: Array<{
        dayOfWeek: number;
        startTimeLocal: string;
        endTimeLocal: string;
      }>;
    }>;
  };
}

interface AvailableTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface GetAvailableTimeslotsParams {
  locationId: string;
}

/**
 * Gets all available tennis court timeslots for a given location
 * @param params Object containing locationId
 * @returns Promise resolving to an array of available timeslots
 */
export async function getAvailableTimeslots(
  params: GetAvailableTimeslotsParams
): Promise<AvailableTimeSlot[]> {
  const { locationId } = params;
  const availableSlots: AvailableTimeSlot[] = [];

  const locationData = await getRecLocation(locationId);
  const courts = locationData.location.courts as Court[];

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getDayOfWeek = (dateStr: string): number => {
    const date = new Date(dateStr);
    return date.getDay() + 1;
  };

  const slotsCoverPolicySlot = (
    availableSlots: string[],
    policyStartTime: string,
    policyEndTime: string,
    targetDate: string
  ): boolean => {
    const policyStartMinutes = timeToMinutes(policyStartTime);
    const policyEndMinutes = timeToMinutes(policyEndTime);

    const dateSlots = availableSlots.filter(slot => slot.startsWith(targetDate));
    if (dateSlots.length === 0) return false;

    dateSlots.sort();

    for (let i = 0; i < dateSlots.length; i++) {
      const currentSlot = dateSlots[i];
      const currentTime = currentSlot.split(' ')[1];
      const currentMinutes = timeToMinutes(currentTime);

      if (currentMinutes === policyStartMinutes) {
        let consecutiveSlots = 1;
        let currentEndMinutes = currentMinutes + 30;

        while (currentEndMinutes < policyEndMinutes) {
          const nextSlotIndex = dateSlots.findIndex(
            slot => timeToMinutes(slot.split(' ')[1]) === currentEndMinutes
          );
          if (nextSlotIndex === -1) break;
          consecutiveSlots++;
          currentEndMinutes += 30;
        }

        if (currentEndMinutes >= policyEndMinutes) {
          return true;
        }
      }
    }

    return false;
  };

  for (const court of courts) {
    const isPickleballCourt = court.sports?.some(sport => sport.sportId === "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    if (court.isInstantBookable && court.availableSlots && !isPickleballCourt) {
      const fixedSlotsPolicy = court.config?.bookingPolicies?.find(
        policy => policy.type === 'fixed-slots'
      );

      if (fixedSlotsPolicy) {
        for (const policySlot of fixedSlotsPolicy.slots) {
          const uniqueDates = [...new Set(court.availableSlots.map(slot => slot.split(' ')[0]))];
          
          for (const dateStr of uniqueDates) {
            const dayOfWeek = getDayOfWeek(dateStr);

            if (dayOfWeek === policySlot.dayOfWeek) {
              if (slotsCoverPolicySlot(
                court.availableSlots,
                policySlot.startTimeLocal,
                policySlot.endTimeLocal,
                dateStr
              )) {
                availableSlots.push({
                  day: dateStr,
                  startTime: policySlot.startTimeLocal,
                  endTime: policySlot.endTimeLocal
                });
              }
            }
          }
        }
      }
    }
  }

  // Deduplicate timeslots based on day, startTime, and endTime
  const uniqueSlots = availableSlots.filter((slot, index, self) =>
    index === self.findIndex((s) => 
      s.day === slot.day && 
      s.startTime === slot.startTime && 
      s.endTime === slot.endTime
    )
  );

  return uniqueSlots;
}

/**
 * Synchronizes timeslots between Rec API and database for a given location
 * @param locationId The ID of the location to sync timeslots for
 * @returns Promise resolving when sync is complete
 */
export async function syncTimeslots(locationId: string): Promise<void> {
  const availableTimeslots = await getAvailableTimeslots({ locationId });
  
  const location = LOCATIONS.find(loc => loc.locationId === locationId);
  if (!location) {
    throw new Error(`Location with ID ${locationId} not found`);
  }
  
  const existingTimeslots = await getTimeslotsByLocation(locationId);
  const existingTimeslotMap = new Map(
    existingTimeslots.map((timeslot: ITimeslot) => [
      `${timeslot.date}-${timeslot.startTime}-${timeslot.endTime}`,
      timeslot
    ])
  );
  const availableTimeslotMap = new Map(
    availableTimeslots.map(timeslot => [
      `${timeslot.day}-${timeslot.startTime}-${timeslot.endTime}`,
      timeslot
    ])
  );
  
  for (const [key, timeslot] of existingTimeslotMap) {
    if (!availableTimeslotMap.has(key)) {
      await markTimeslotAsUnavailable(timeslot._id.toString());
    }
  }
  
  for (const [key, timeslot] of availableTimeslotMap) {
    if (!existingTimeslotMap.has(key)) {
      await createNewTimeslot({
        startTime: timeslot.startTime,
        endTime: timeslot.endTime,
        date: timeslot.day,
        locationId,
        locationName: location.name
      });
    }
  }
}

/**
 * Synchronizes timeslots for all locations defined in the LOCATIONS constant
 * @returns Promise resolving when all location syncs are complete
 */
export async function syncAllTimeslots(): Promise<void> {
  const syncPromises = LOCATIONS.map(location => syncTimeslots(location.locationId));
  await Promise.all(syncPromises);
} 