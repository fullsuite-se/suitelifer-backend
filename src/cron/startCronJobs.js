import { CronJob } from "cron";
import generateSitemap from "../scripts/generateSitemap.js";

const startCronJobs = () => {
  new CronJob(
    "0 7 * * 5",
    async function () {
      await generateSitemap();
    },
    null,
    true,
    "America/Los_Angeles"
  );
};

export default startCronJobs;
