import express from "express";
import fs from "fs";
import { moduleTurn, assembleStack } from "../services/openaiService.js";

const router = express.Router();

// Load the platform menu once at startup.
const menu = JSON.parse(fs.readFileSync("./data/platformMenu.json", "utf-8"));

// Conversational: body = { module, history, context }
router.post("/recommend-module", async (req, res) => {
  try {
    const { module, history, context } = req.body;
    const result = await moduleTurn(module, history || [], context || {}, menu);
    res.json(result);
  } catch (err) {
    console.error("recommend-module failed:", err);
    res.status(500).json({ error: "Failed to continue the conversation" });
  }
});

// body = { picks, context }
router.post("/assemble-stack", async (req, res) => {
  try {
    const { picks, context } = req.body;
    const result = await assembleStack(picks || [], context || {});
    res.json(result);
  } catch (err) {
    console.error("assemble-stack failed:", err);
    res.status(500).json({ error: "Failed to assemble the blueprint" });
  }
});

export default router;