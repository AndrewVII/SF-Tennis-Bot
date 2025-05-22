import cron from 'node-cron';
import { syncAllTimeslots } from './services/recService';
import { redisClient } from './db/redis';

const LOCK_KEY = 'sync_timeslots_lock';
const LOCK_TTL = 600; // 10 minutes in seconds

// Schedule the cron job to run every 15 seconds
cron.schedule('*/15 * * * * *', async () => {
  // Try to acquire the lock atomically
  const acquired = await redisClient.set(LOCK_KEY, '1', {
    EX: LOCK_TTL,
    NX: true // Only set if key doesn't exist
  });

  if (!acquired) {
    console.log('Sync already in progress, skipping...');
    return;
  }

  try {
    await syncAllTimeslots();
    // Only remove the lock if the sync completed successfully
    await redisClient.del(LOCK_KEY);
  } catch (error) {
    console.error('Error in cron job:', error);
    // Don't remove the lock on error - let it expire naturally
    // This prevents multiple failed syncs from running simultaneously
  }
});