import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema, STATUSES, INTEREST_LEVELS } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/prospects", async (_req, res) => {
    const prospects = await storage.getAllProspects();
    res.json(prospects);
  });

  app.post("/api/prospects", async (req, res) => {
    const parsed = insertProspectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }
    const prospect = await storage.createProspect(parsed.data);
    res.status(201).json(prospect);
  });

  app.patch("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const existing = await storage.getProspect(id);
    if (!existing) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    const body = req.body;
    const updates: Record<string, unknown> = {};

    if (body.companyName !== undefined) updates.companyName = body.companyName;
    if (body.roleTitle !== undefined) updates.roleTitle = body.roleTitle;
    if (body.jobUrl !== undefined) updates.jobUrl = body.jobUrl;
    if (body.salary !== undefined) updates.salary = body.salary;
    if (body.city !== undefined) updates.city = body.city;
    if (body.state !== undefined) updates.state = body.state;
    if (body.country !== undefined) updates.country = body.country;
    if (body.notes !== undefined) updates.notes = body.notes;

    if (updates.country !== undefined || updates.state !== undefined || updates.city !== undefined) {
      const { COUNTRIES, getStatesForCountry } = await import("@shared/locations");
      const finalCountry = (updates.country ?? existing.country) as string | null;
      const finalCity = (updates.city ?? existing.city) as string | null;
      const finalState = (updates.state ?? existing.state) as string | null;

      if (!finalCity || finalCity.trim() === "") {
        return res.status(400).json({ message: "City is required" });
      }
      if (!finalCountry || finalCountry.trim() === "") {
        return res.status(400).json({ message: "Country is required" });
      }
      if (!COUNTRIES.includes(finalCountry)) {
        return res.status(400).json({ message: "Invalid country" });
      }
      if (finalState && finalState.trim() !== "") {
        const states = getStatesForCountry(finalCountry);
        if (states.length > 0 && !states.includes(finalState)) {
          return res.status(400).json({ message: "Invalid state for selected country" });
        }
      }
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(", ")}` });
      }
      updates.status = body.status;
    }

    if (body.interestLevel !== undefined || body.interest_level !== undefined) {
      const level = body.interestLevel ?? body.interest_level;
      if (!INTEREST_LEVELS.includes(level)) {
        return res.status(400).json({ message: `Interest level must be one of: ${INTEREST_LEVELS.join(", ")}` });
      }
      updates.interestLevel = level;
    }

    const updated = await storage.updateProspect(id, updates);
    res.json(updated);
  });

  app.delete("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const deleted = await storage.deleteProspect(id);
    if (!deleted) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    res.status(204).send();
  });

  return httpServer;
}
