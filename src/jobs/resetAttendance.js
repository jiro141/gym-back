// src/jobs/resetAttendance.js
const cron = require("node-cron");
const Client = require("../models/client");

// Schedule the task to run at midnight every day (00:00)
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Resetting attendance for all clients...");
    await Client.update({ attendance: false }, { where: {} }); // Reset all attendance to false
    console.log("Attendance reset completed.");
  } catch (error) {
    console.error("Error resetting attendance:", error);
  }
});
