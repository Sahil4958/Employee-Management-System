import { generateSalary } from "../controllers/salary.controller";
import nodeCron from "node-cron";

const cronJob = async () => {
    nodeCron.schedule("*/2 * * * *", async () => {
        console.log('Monthly salary function');
        await generateSalary()
        console.log('function executed');

    });
}

export default cronJob;