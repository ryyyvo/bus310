import ChatSession from '../models/ChatSession.model.js';
import aiService from '../services/ai.service.js';
import campsiteService from '../services/campsite.service.js';

/**
 * Create a new chat session
 */
export const createChatSession = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const chatSession = new ChatSession({
      userId,
      sessionName: `Trip Planning - ${new Date().toLocaleDateString()}`,
      messages: [{
        role: 'assistant',
        content: "Hi! I'm here to help you plan an amazing camping trip in California! 🏕️\n\nTo get started, tell me a bit about what you're looking for:\n- How many people are going?\n- What kind of activities do you enjoy? (hiking, swimming, rock climbing, etc.)\n- Do you have specific dates in mind?\n- Are you a beginner or experienced camper?"
      }],
      status: 'active'
    });

    await chatSession.save();

    res.status(201).json({
      sessionId: chatSession._id,
      messages: chatSession.messages
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
};

/**
 * Send a message in a chat session
 */
export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, constraints } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chatSession = await ChatSession.findById(sessionId);
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message
    });

    // Generate search parameters from user message
    const searchParams = await aiService.generateSearchParams(message);

    // Fetch relevant campsite data if query is meaningful
    let campsiteContext = '';
    let campsiteData = [];

    if (searchParams.query || searchParams.activities.length > 0) {
      try {
        const parks = await campsiteService.searchParks({
          state: searchParams.state || 'CA',
          query: searchParams.query,
          limit: 5
        });
        campsiteData = parks;
        campsiteContext = campsiteService.formatForAI(parks);
      } catch (error) {
        console.error('Error fetching campsites:', error);
        // Continue without campsite data
      }
    }

    // Get AI response with campsite context and constraints
    const aiResponse = await aiService.chat(
      chatSession.messages.map(m => ({ role: m.role, content: m.content })),
      campsiteContext,
      constraints
    );

    // Add AI response
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponse,
      metadata: {
        campsites: campsiteData,
        searchQuery: searchParams.query
      }
    });

    // Extract and update preferences
    const preferences = await aiService.extractPreferences(chatSession.messages);
    if (Object.keys(preferences).length > 0) {
      chatSession.preferences = { ...chatSession.preferences, ...preferences };
    }

    await chatSession.save();

    res.json({
      message: aiResponse,
      campsites: campsiteData,
      preferences: chatSession.preferences
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

/**
 * Get chat session by ID
 */
export const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chatSession = await ChatSession.findById(sessionId);
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json(chatSession);
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({ error: 'Failed to fetch chat session' });
  }
};

/**
 * Get all chat sessions for a user
 */
export const getUserChatSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
};
