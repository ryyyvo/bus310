import express from "express";
import {
  createChatSession,
  sendMessage,
  getChatSession,
  getUserChatSessions,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Create new chat session
router.post("/sessions", createChatSession);

// Send message in chat session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat session
router.get("/sessions/:sessionId", getChatSession);

// Get user's chat sessions
router.get("/users/:userId/sessions", getUserChatSessions);

export default router;
