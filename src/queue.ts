import { Queue, Worker, Job } from "bullmq";
import type { DeviceID } from "./types.js";
import { startWorkers } from "./worker.js";

if (!process.env.REDIS_URL) {
  throw new Error("Missing Redis config");
}
const connection = { url: process.env.REDIS_URL };

export const monitorQueue = new Queue("monitor-queue", { connection });
export async function monitorDeviceJob() {
  await monitorQueue.add(
    "monitor-job",
    {},
    { repeat: { every: 60000 }, removeOnComplete: true }
  );
};

export const emailQueue = new Queue("email-queue", { connection });
export async function sendEmailJob(deviceId: DeviceID, alertEmail: string) {
  await emailQueue.add(
    "email-job",
    { deviceId: deviceId, alertEmail: alertEmail },
    { removeOnComplete: true },
  );
};

export async function monitoringMQ() {
  console.log("Starting workers");

  startWorkers();
  await monitorDeviceJob();
}