import express from "express";
import {
  createChatSession,
  sendMessage,
  getChatSession,
  getUserChatSessions,
} from "../controllers/chat.controller.js";
import { authenticate } from "../config/auth.middleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Create new chat session
router.post("/sessions", createChatSession);

// Send message in chat session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat session
router.get("/sessions/:sessionId", getChatSession);

// Get user's chat sessions
router.get("/sessions", getUserChatSessions);

export default router;
