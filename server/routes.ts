import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Future API endpoints for storing capture metadata can be added here
  // For now, the app works completely client-side with Telegram API

  const httpServer = createServer(app);

  return httpServer;
}
