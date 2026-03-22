import { Router } from "express";
import { createMonitor, deleteMonitor, getMonitor, getMonitors, pauseMonitor, pingMonitor, resetMonitor, updateMonitor } from "./controllers.js";

export function RoutersHandler() {
  const router = Router();

  router.post("/monitors", createMonitor);
  router.post("/monitors/:id/heartbeat", pingMonitor);
  router.post("/monitors/:id/pause", pauseMonitor);

  router.get("/monitors", getMonitors);
  router.get("/monitors/:id", getMonitor);
  
  router.post("/monitors/:id/reset", resetMonitor);
  router.put("/monitors", updateMonitor);
  router.delete("/monitors/:id", deleteMonitor);

  return router;
}