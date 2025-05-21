import cron from 'node-cron';
import { getAvailableTimeslots, syncAllTimeslots, syncTimeslots } from './services/recService';

// Schedule the cron job to run every 5 seconds
cron.schedule('*/5 * * * * *', async () => {
  try {
    console.log('Syncing all timeslots...');
    await syncAllTimeslots();
    console.log('All timeslots synced successfully');
  } catch (error) {
    console.error('Error syncing timeslots:', error);
  }
});