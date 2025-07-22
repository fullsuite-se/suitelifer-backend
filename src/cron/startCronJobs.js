import { CronJob } from "cron";
import generateSitemap from "../scripts/generateSitemap.js";
import { startSuitebiteJobs } from "./suitebiteJobs.js";

const startCronJobs = () => {
  // Original Suitelifer jobs
  new CronJob(
    "0 7 * * 5",
    async function () {
      await generateSitemap();
    },
    null,
    true,
    "America/Los_Angeles"
  );

  // Start Suitebite automated jobs
  startSuitebiteJobs();
  
  console.log("All cron jobs have been started successfully");
};

export default startCronJobs;
