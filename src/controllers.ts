import { ZodError, z } from "zod";
import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import { deviceIDSchema, monitorSchema, type Monitor } from "./types.js";

export async function createMonitor(req: Request, res: Response) {
  try {
    const monitor = monitorSchema.parse(req.body);
  
    const existingMonitor = prisma.monitor.findFirst({ where: { device_id: monitor.device_id } });
    if (existingMonitor != null) {
      console.log(`Monitor for ${monitor.device_id} already exists`);
      return res.status(400).json({"error": `Monitor for ${monitor.device_id} already exists`});
    }

    await prisma.monitor.create({data: {
      device_id: monitor.device_id,
      timeout: monitor.timeout,
      alert_email: monitor.alert_email,
      deadline: new Date(Date.now() + monitor.timeout * 60000)
    }});

    // Simulating the sending of an email
    console.log(`Sending an email to ${monitor.alert_email}`);

    console.log("createMonitor: Successful\n");
    res.status(201).json({"message": `Monitor created successfully for ${monitor.device_id}`});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
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
      data: { deadline: new Date(Date.now() + monitor.timeout * 60000) }
    });

    if (updatedMonitor == null) throw new Error("Failed to successfully ping monitor");

    console.log("pingMonitor: Successful\n");
    res.status(200).json({"message": `Monitor for ${updatedMonitor.device_id} pinged successfully`});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
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
      data: { status: newStatus, deadline: new Date(Date.now() + monitor.timeout * 60000) }
    });

    if (updatedMonitor == null) throw new Error("Failed to successfully ping monitor");

    console.log("pauseMonitor: Successful\n");
    res.status(200).json({"message": `Monitor for ${updatedMonitor.device_id} set to ${updatedMonitor.status.toLowerCase()}`});
 
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
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
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
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
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully fetch monitor"});
    }
  }
}

export async function resetMonitor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const device_id = deviceIDSchema.parse(id);

    const monitor = await prisma.monitor.findUnique({
      where: { device_id: device_id }
    });

    if (monitor == null) {
      console.log(`No monitor exists for ${device_id}`);
      return res.status(400).json({"error": `No monitor exists for ${device_id}`});
    } else if (monitor.status != "DOWN") {
      console.log(`Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`);
      return res.status(400).json({"error": `Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`});
    }
    
    const updatedMonitor = await prisma.monitor.update({
      where: { device_id: device_id },
      data: { status: "ACTIVE", deadline: new Date(Date.now() + monitor.timeout * 60000) }
    });

    if (updatedMonitor == null) throw new Error("Failed to successfully reset monitor");

    console.log("resetMonitor: Successful\n");
    res.status(200).json({"message": `Monitor for ${updatedMonitor.device_id} reset successfully`});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully reset monitor"});
    }
  }
}

export async function updateMonitor(req: Request, res: Response) {
  try {
    const newMonitor = monitorSchema.parse(req.body);
  
    const monitor = await prisma.monitor.findUnique({
      where: { device_id: newMonitor.device_id }
    });

    if (monitor == null) {
      console.log(`No monitor exists for ${newMonitor.device_id}`);
      return res.status(400).json({"error": `No monitor exists for ${newMonitor.device_id}`});
    } else if (monitor.status == "DOWN") {
      console.log(`Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`);
      return res.status(400).json({"error": `Monitor for device ${monitor.device_id} is currently ${monitor.status?.toLowerCase()}`});
    }

    const updatedMonitor = await prisma.monitor.update({
      where: { device_id: newMonitor.device_id },
      data: {
        timeout: newMonitor.timeout,
        alert_email: newMonitor.alert_email,
        deadline: new Date(Date.now() + newMonitor.timeout * 60000)
      }
    });

    if (updatedMonitor == null) throw new Error("Failed to successfully ping monitor");

    console.log("updateMonitor: Successful\n");
    res.status(200).json({"message": `Monitor updated successfully for ${monitor.device_id}`});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully update monitor"});
    }
  }
}

export async function deleteMonitor(req: Request, res: Response) {
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

    await prisma.monitor.delete({ where: { device_id: device_id } })

    console.log("deleteMonitor: Successful\n");
    res.status(200).json({"message": `Monitor deleted successfully for ${monitor.device_id}`});

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      console.log(`Validation errors: ${err.issues.map((issue, i) => {return `\n${i + 1}. ${issue.message}`;})}`)
      return res.status(400).json({
        "errors": err.issues.map((issue, _) => {return issue.message;})
      });

    } else {
      err instanceof Error? console.log(err.message) : console.log(err);
      res.status(500).json({"error": "Failed to successfully delete monitor"});
    }
  }
}