import { Router } from "express";
import { createMonitor, getMonitor, getMonitors, pauseMonitor, pingMonitor } from "./controllers.js";

export function RoutersHandler() {
  const router = Router();

  router.post("/monitors", createMonitor);
  router.post("/monitors/:id/heartbeat", pingMonitor);
  router.post("/monitors/:id/pause", pauseMonitor);

  router.get("/monitors", getMonitors);
  router.get("/monitors/:id", getMonitor);
  
  // router.put("/monitors/:id");
  // router.delete("/monitors/:id");

  return router;
}