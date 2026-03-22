import express from "express";
import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { RoutersHandler } from "./routes.js";

dotenv.config();

export function createApp() {
  const app = express();
  
  app.use(express.json());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
    });
    next();
  })

  app.use("/api/v1", RoutersHandler());

  return app;
}