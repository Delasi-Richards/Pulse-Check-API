import { Router } from "express";
import { createMonitor, pauseMonitor, pingMonitor } from "./controllers.js";

export function RoutersHandler() {
  const router = Router();

  router.post("/monitors", createMonitor);
  router.post("/monitors/:id/heartbeat", pingMonitor);
  router.post("/monitors/:id/pause", pauseMonitor);

  // router.get("/monitors");
  // router.get("/monitors/:id");
  
  // router.put("/monitors/:id");
  // router.delete("/monitors/:id");

  return router;
}