import Timeslot, { ITimeslot } from '../db/models/timeslot';


/**
 * Marks a timeslot as unavailable in the database
 * @param timeslotId The ID of the timeslot to mark as unavailable
 * @returns Promise resolving to the updated timeslot document
 */
export async function markTimeslotAsUnavailable(timeslotId: string): Promise<ITimeslot | null> {
  return Timeslot.findByIdAndUpdate(
    timeslotId,
    { available: false },
    { new: true }
  );
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
}): Promise<ITimeslot> {
  const timeslot = new Timeslot({
    _id: `${timeslotData.locationId}-${timeslotData.date}-${timeslotData.startTime}-${timeslotData.endTime}`,
    ...timeslotData,
    available: true,
    messages: []
  });
  
  return timeslot.save();
}

/**
 * Gets all timeslots for a specific location
 * @param locationId The ID of the location to get timeslots for
 * @returns Promise resolving to an array of timeslot documents
 */
export async function getTimeslotsByLocation(locationId: string): Promise<ITimeslot[]> {
  return Timeslot.find({ locationId });
} 