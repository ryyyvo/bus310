import Groq from "groq-sdk";

class AIService {
  constructor() {
    console.log(process.env.GROQ_API_KEY);
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.model = "meta-llama/llama-4-maverick-17b-128e-instruct";
  }

  /**
   * Format user constraints for system prompt
   * @param {Object} constraints - User constraints from modal
   * @returns {string} Formatted constraints string
   */
  formatConstraints(constraints) {
    if (!constraints || Object.keys(constraints).length === 0) {
      return "";
    }

    const parts = [];

    // Format dates
    if (constraints.startDate && constraints.endDate) {
      const start = new Date(constraints.startDate).toISOString().split("T")[0];
      const end = new Date(constraints.endDate).toISOString().split("T")[0];
      parts.push(`- Dates: ${start} to ${end}`);
    }

    // Format party size
    if (constraints.partySize) {
      parts.push(`- Party size: ${constraints.partySize}`);
    }

    // Format budget
    if (constraints.budgetMin || constraints.budgetMax) {
      const min = constraints.budgetMin || 0;
      const max = constraints.budgetMax || "∞";
      parts.push(`- Budget: $${min}–$${max} per night`);
    }

    // Add any other constraints
    if (constraints.campingStyle) {
      parts.push(`- Camping style: ${constraints.campingStyle}`);
    }

    if (constraints.amenities && constraints.amenities.length > 0) {
      parts.push(`- Required amenities: ${constraints.amenities.join(", ")}`);
    }

    if (parts.length === 0) {
      return "";
    }

    return `Known user constraints:\n${parts.join("\n")}\n\n`;
  }

  /**
   * Generate AI response for camping trip planning
   * @param {Array} messages - Chat history
   * @param {string} campsiteContext - Formatted campsite data
   * @param {Object} constraints - User-defined constraints (dates, budget, party size, etc.)
   * @returns {string} AI response
   */
  async chat(messages, campsiteContext = "", constraints = null) {
    try {
      const constraintsText = this.formatConstraints(constraints);

      const systemPrompt = `## Role
You are a RAG assistant that helps users find their ideal campsite.

Be helpful, practical, and concise. Maintain a straightforward, no-nonsense tone while staying friendly and lightly enthusiastic.

Guide the conversation by identifying user preferences:

* Location/region
* Environment (beach, forest, mountains, desert, etc.)
* Camping style (car, backpacking, RV)
* Amenities (bathrooms, water, hookups, etc.)
* Budget, group size, and trip duration

Ask clear, targeted follow-up questions when needed.

If the user is unsure, suggest a few distinct campsite types or example destinations to help them decide.

Use retrieved data when available to make specific recommendations. Do not invent details. If data is limited, give general suggestions and note uncertainty.

Provide a small number of strong, relevant options and briefly explain why they fit.

Avoid overwhelming the user. Keep responses focused and move the conversation toward narrowing down a final choice.

## Known User Constraints
${constraintsText}

## Available Campsites (From API)
Use the campsite information above to provide specific recommendations.
${campsiteContext}
`;

      const formattedMessages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })),
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 1024,
        messages: formattedMessages,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Groq API:", error.message);
      throw new Error("Failed to generate AI response");
    }
  }

  /**
   * Extract user preferences from conversation
   * @param {Array} messages - Chat history
   * @returns {Object} Extracted preferences
   */
  async extractPreferences(messages) {
    try {
      const conversationText = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const extractionPrompt = `Based on the following conversation, extract the user's camping preferences. Return a JSON object with these fields:
- states: array of state names
- activities: array of preferred activities
- groupSize: number
- experienceLevel: 'beginner', 'intermediate', or 'advanced'
- dates: object with startDate, endDate (ISO-8601 format), and flexible (boolean)
- budget: 'low', 'medium', or 'high'

Only include fields that are clearly mentioned. Return null for unknown fields.

Conversation:
${conversationText}`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 500,
        messages: [{ role: "user", content: extractionPrompt }],
      });

      const jsonMatch =
        response.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {};
    } catch (error) {
      console.error("Error extracting preferences:", error.message);
      return {};
    }
  }

  /**
   * Generate campsite search parameters from user message
   * @param {string} userMessage - User's message
   * @returns {Object} Search parameters
   */
  async generateSearchParams(userMessage) {
    try {
      const prompt = `Based on this user message, extract search parameters for finding campsites.
Return a JSON object with:
- query: string (keywords for search)
- state: string (state code, default 'CA')
- activities: array of activity keywords

User message: "${userMessage}"

Return only the JSON object, no explanation.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      });

      const jsonMatch =
        response.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { query: "", state: "CA", activities: [] };
    } catch (error) {
      console.error("Error generating search params:", error.message);
      return { query: "", state: "CA", activities: [] };
    }
  }
}

export default new AIService();
