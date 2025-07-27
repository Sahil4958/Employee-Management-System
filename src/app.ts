import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route";
// import managerRouter from "./routes/manager.route";
import teamRouter from "./routes/team.route";
import skillRouter from "./routes/skill.router";
import holidayRouter from "./routes/holiday.route";
import designationRouter from "./routes/designation.route";
import departmentRouter from "./routes/department.route";
import leaveRouter from "./routes/leave.routes";
import salaryRoute from "./routes/salary.route";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", userRouter);
// app.use("/api", managerRouter
app.use("/api", teamRouter);
app.use("/api", skillRouter);
app.use("/api", holidayRouter);
app.use("/api", designationRouter);
app.use("/api", departmentRouter);
app.use('/api', leaveRouter);
app.use('/api',salaryRoute)

export default app;
