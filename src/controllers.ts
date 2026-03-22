import { ZodError } from "zod";
import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import { monitorSchema } from "./types.js";

export async function createMonitor(req: Request, res: Response) {
  try {
    const monitor = monitorSchema.parse(req.body);
  
    await prisma.monitor.create({data: {
      device_id: monitor.device_id,
      timeout: monitor.timeout,
      alert_email: monitor.alert_email,
      deadline: new Date(Date.now() + monitor.timeout * 1000)
    }});

    res.status(201).json({"message": `Monitor created successfully for ${monitor.device_id}`});

  } catch (err: unknown) {
    if(err instanceof ZodError){
      console.log(err);
      return res.status(400).json({"errors": err.issues});
    } else {
      console.log(err);
      res.status(500).json({"message": "Failed to successfully create monitor"});
    }
  }
}