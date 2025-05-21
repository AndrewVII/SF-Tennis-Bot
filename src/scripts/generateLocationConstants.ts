import { getAllLocationsData } from '../services/recService';
import * as fs from 'fs';
import * as path from 'path';

async function generateLocationConstants() {
  try {
    // Use Moscone as the initial location since we know it has all the SF locations
    const initialLocationId = 'fb0d16b1-5f9f-465f-8ebf-fccf5d400c47';
    const locations = await getAllLocationsData(initialLocationId);

    // Create the location data array
    const locationData = locations.map(loc => ({
      locationId: loc.location.id,
      name: loc.location.name
    }));

    // Create the TypeScript file content
    const fileContent = `// This file is auto-generated. Do not edit manually.
// Generated on: ${new Date().toISOString()}

export interface Location {
  locationId: string;
  name: string;
}

export const LOCATIONS: Location[] = ${JSON.stringify(locationData, null, 2)};
`;

    // Ensure the constants directory exists
    const constantsDir = path.join(__dirname, '../src/constants');
    if (!fs.existsSync(constantsDir)) {
      fs.mkdirSync(constantsDir, { recursive: true });
    }

    // Write the file
    const filePath = path.join(constantsDir, 'locations.ts');
    fs.writeFileSync(filePath, fileContent);

    console.log(`Successfully generated location constants at ${filePath}`);
  } catch (error) {
    console.error('Error generating location constants:', error);
    process.exit(1);
  }
}

// Run the script
generateLocationConstants(); 