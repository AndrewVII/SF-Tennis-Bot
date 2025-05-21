import { syncTimeslots } from "../services/recService";

const main = async () => {
  const sortedSchedule = await syncTimeslots('fb0d16b1-5f9f-465f-8ebf-fccf5d400c47');
  console.log(sortedSchedule);
};

main();
