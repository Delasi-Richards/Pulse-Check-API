import { Worker, Job } from "bullmq";
import prisma from "../lib/prisma.js";
import { sendEmailJob } from "./queue.js";

if (!process.env.REDIS_URL) {
  throw new Error("Missing Redis config");
}

const connection = {
  url: process.env.REDIS_URL
};

export function startWorkers() {
  const monitorWorker = new Worker(
    "monitor-queue",
    async (job: Job) => {
      if (job.name === "monitor-job") {
        const downDevices = await prisma.monitor.findMany({
          where: { status: "ACTIVE", deadline: { lte: new Date()}}
        })
  
        if (downDevices.length == 0) {
          return;
        }
  
        await prisma.monitor.updateMany({
          where: {device_id: {in: downDevices.map(d => d.device_id)}},
          data: { status: "DOWN" }
        });
  
        for (const device of downDevices) {
          console.log({
            "ALERT": `Device ${device.device_id} is down!`,
            "time": `${device.deadline}`
          });
          await sendEmailJob(device.device_id, device.alert_email)};
      }
    },
    { connection }
  );
  monitorWorker.on("failed", (_, err) => { console.log("Monitoring worker failed:", err.message); });
  
  const emailWorker = new Worker(
    "email-queue",
    async (job: Job) => {
      if (job.name === "email-job") {
        const { deviceId, alertEmail } = job.data;
  
        // Simulating the sending of emails
        console.log(`Sending alert email to ${alertEmail} for ${deviceId}`);
      }
    },
    { connection }
  );
  emailWorker.on("failed", (job, err) => { console.log("Email worker failed: ", err.message);})
}