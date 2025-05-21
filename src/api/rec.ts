import { config } from '../config/config';
import axios from 'axios';

export interface RecScheduleResponse {
  dates: {
    [date: string]: Array<{
      courtNumber: string;
      sports: Array<{
        id: string;
        name: string;
      }>;
      schedule: {
        [timeSlot: string]: {
          referenceType: string;
          referenceId?: string;
          referenceLabel?: string;
        };
      };
    }>;
  };
  reservations: {
    [id: string]: {
      id: string;
      users: string[];
      courts: string[];
      paid: boolean;
      reservationType: string;
    };
  };
  users: {
    [id: string]: {
      id: string;
      firstName: string;
      lastName: string;
      skillLevel: string;
    };
  };
  instructors: {
    [id: string]: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  classes: {
    [id: string]: {
      id: string;
      name: string;
      description: string;
    };
  };
  sessions: {
    [id: string]: {
      id: string;
      sectionId: string;
      section: {
        id: string;
        name: string;
      };
    };
  };
  facilityRentals: {
    [id: string]: {
      id: string;
      name: string;
    };
  };
}

interface GetRecScheduleOptions {
  startDate: string;
  locationId: string;
}

export interface RecLocationResponse {
  distance: null;
  location: {
    locationTags: string[];
    id: string;
    createdAt: string;
    accessInfo: string;
    courts: Array<{
      id: string;
      createdAt: string;
    }>;
    defaultReservationWindow: number;
    description: string;
    formattedAddress: string;
    gettingThereInfo: string;
    groupReservationWindow: null;
    hoursOfOperation: string;
    image: null;
    images: Record<string, unknown>;
    instructorReservationReleaseDay: number;
    instructorReservationReleaseTimeLocal: string;
    lat: string;
    lng: string;
    name: string;
    noReservationText: string;
    organization: {
      id: string;
      name: string;
      config: {
        tabs: Record<string, unknown>;
        banners?: {
          pages?: Record<string, string>;
        };
      };
    };
    playGuidelines: string;
    privateLessonReservationWindow: number;
    regions: Array<{
      id: string;
      createdAt: string;
      lat: string;
      lng: string;
      name: string;
      radius: number;
      updatedAt: string;
    }>;
    reservationBuffer: number;
    reservationReleaseTimeLocal: null;
    reservationRequiresVerification: boolean;
    reservationWindowExtendingGroupId: null;
    schedule: null;
    facilityTags: string[];
    timezone: string;
    updatedAt: string;
  };
}

export async function getRecLocation(locationId: string): Promise<RecLocationResponse> {
  const url = `https://api.rec.us/v1/locations/${locationId}?publishedSites=true`;
  try {
    const response = await axios.get<RecLocationResponse>(url);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch Rec location: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
}

export async function getRecSchedule({ startDate, locationId }: GetRecScheduleOptions): Promise<RecScheduleResponse> {
  const url = `https://api.rec.us/v1/locations/${locationId}/schedule?startDate=${startDate}`;

  try {
    const response = await axios.get<RecScheduleResponse>(url);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch Rec schedule: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
}
