import { ZodError, z } from "zod";
import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import { monitorSchema, type Monitor } from "./types.js";

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

export async function pingMonitor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const device_id = z.string("incorrect format for 'username'")
      .startsWith("device-", "'username' must be in format: 'device-xxx'")
      .length(10, "'username' must be in format: 'device-xxx'").parse(id)

    const monitor: Monitor | null = await prisma.monitor.findUnique({
      where: { device_id: device_id }
    });

    if (monitor == null) {
      console.log(`No monitor exists for ${device_id}`);
      return res.status(400).json({"error": `No monitor exists for ${device_id}`});
    } else if (monitor.status != "ACTIVE") {
      console.log(`Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`);
      return res.status(400).json({"error": `Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`});
    }
    
    const updatedMonitor: Monitor | null = await prisma.monitor.update({
      where: { device_id: device_id },
      data: { deadline: new Date(Date.now() + monitor.timeout * 1000) }
    });

    if (updatedMonitor == null) throw new Error("Failed to successfully ping monitor");

    res.status(201).json({"message": `Monitor for ${updatedMonitor.device_id} pinged successfully`});

  } catch (err: unknown) {
    err instanceof Error? console.log(err.message) : console.log(err);
    if (err instanceof ZodError) {
      return res.status(400).json({"errors": err.issues});
    } else {
      res.status(500).json({"message": "Failed to successfully ping monitor"});
    }
  }
}