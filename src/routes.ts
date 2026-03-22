import { Router } from "express";
import { createMonitor } from "./controllers.js";

export function RoutersHandler() {
  const router = Router();

  router.post("/monitors", createMonitor);
  // router.post("/monitors/:id/hearbeat");
  // router.post("/monitors/:id/pause");

  // router.get("/monitors");
  // router.get("/monitors/:id");
  
  // router.put("/monitors/:id");
  // router.delete("/monitors/:id");

  return router;
}