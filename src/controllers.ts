import { ZodError, z } from "zod";
import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import { deviceIDSchema, monitorSchema, type Monitor } from "./types.js";

export async function createMonitor(req: Request, res: Response) {
  try {
    const monitor = monitorSchema.parse(req.body);
  
    await prisma.monitor.create({data: {
      device_id: monitor.device_id,
      timeout: monitor.timeout,
      alert_email: monitor.alert_email,
      deadline: new Date(Date.now() + monitor.timeout * 1000)
    }});

    console.log("createMonitor: Successful\n");
    res.status(201).json({"message": `Monitor created successfully for ${monitor.device_id}`});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully create monitor"});
    }
  }
}

export async function pingMonitor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const device_id = deviceIDSchema.parse(id);

    const monitor = await prisma.monitor.findUnique({
      where: { device_id: device_id }
    });

    if (monitor == null) {
      console.log(`No monitor exists for ${device_id}`);
      return res.status(400).json({"error": `No monitor exists for ${device_id}`});
    } else if (monitor.status != "ACTIVE") {
      console.log(`Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`);
      return res.status(400).json({"error": `Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`});
    }
    
    const updatedMonitor = await prisma.monitor.update({
      where: { device_id: device_id },
      data: { deadline: new Date(Date.now() + monitor.timeout * 1000) }
    });

    if (updatedMonitor == null) throw new Error("Failed to successfully ping monitor");

    console.log("pingMonitor: Successful\n");
    res.status(200).json({"message": `Monitor for ${updatedMonitor.device_id} pinged successfully`});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully ping monitor"});
    }
  }
}

export async function pauseMonitor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const device_id = deviceIDSchema.parse(id);

    const monitor = await prisma.monitor.findUnique({
      where: { device_id: device_id }
    });

    if (monitor == null) {
      console.log(`No monitor exists for ${device_id}`);
      return res.status(400).json({"error": `No monitor exists for ${device_id}`});
    } else if (monitor.status == "DOWN") {
      console.log(`Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`);
      return res.status(400).json({"error": `Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`});
    }

    const newStatus = (monitor.status == "ACTIVE"? "PAUSED" : "ACTIVE");
    const updatedMonitor = await prisma.monitor.update({
      where: { device_id: device_id },
      data: { status: newStatus }
    });

    if (updatedMonitor == null) throw new Error("Failed to successfully ping monitor");

    console.log("pauseMonitor: Successful\n");
    res.status(200).json({"message": `Monitor for ${updatedMonitor.device_id} set to ${updatedMonitor.status.toLowerCase()}`});
 
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully update monitor"});
    }
  }
}

export async function getMonitors(req: Request, res: Response) {
  try {
    const monitors = await prisma.monitor.findMany();

    console.log("getMonitors: Successful\n");
    return res.status(200).json({"data": monitors});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(500).json({"error": "Failed to successfully fetch available monitors"});

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully fetch available monitors"});
    }
  }
}

export async function getMonitor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const device_id = deviceIDSchema.parse(id);
    
    const monitor = await prisma.monitor.findUnique({
      where: { device_id: device_id }
    });

    if (monitor == null) {
      console.log(`No monitor exists for ${device_id}`);
      return res.status(400).json({"error": `No monitor exists for ${device_id}`});
    }

    console.log("getMonitor: Successful\n");
    return res.status(200).json({"data": monitor});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully fetch monitor"});
    }
  }
}