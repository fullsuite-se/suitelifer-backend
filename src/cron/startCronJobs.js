import { CronJob } from "cron";
const startCronJobs = () => {
  new CronJob(
    "* * * * * *",
    function () {
      console.log("You will see this message every second");
    },
    null,
    true,
    "America/Los_Angeles"
  );
};

export default startCronJobs;
