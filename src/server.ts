import app from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/connection";
import { setupSwagger } from "./utils/swagger";

import { createAdminUser, seedRole } from "./seeder";
import cronJob from "./helpers/cron";

dotenv.config();

const start = async () => {
  await connectDB();
  createAdminUser();
  seedRole();



  cronJob();

  console.log(process.env.PORT);
  app.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
    );
    setupSwagger(app, process.env.PORT);
  });
};

start();
