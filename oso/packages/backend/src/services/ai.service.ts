import Groq from "groq-sdk";
import type {
  UserConstraints,
  ChatMessage,
  ChatPreferences,
  SearchParams,
} from "../types/index.js";

class AIService {
  private client: Groq;
  private model: string;

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.model = "llama-3.1-8b-instant";
  }

  /**
   * Format user constraints for system prompt
   */
  formatConstraints(constraints?: UserConstraints | null): string {
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
   */
  async chat(
    messages: ChatMessage[],
    campsiteContext: string = "",
    constraints: UserConstraints | null = null,
  ): Promise<string> {
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
          role: "system" as const,
          content: systemPrompt,
        },
        ...messages.map((msg) => ({
          role: (msg.role === "assistant" ? "assistant" : "user") as
            | "user"
            | "assistant",
          content: msg.content,
        })),
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 1024,
        messages: formattedMessages,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      const err = error as Error;
      console.error("Error calling Groq API:", err.message);
      throw new Error("Failed to generate AI response");
    }
  }

  /**
   * Extract user preferences from conversation
   */
  async extractPreferences(
    messages: ChatMessage[],
  ): Promise<Partial<ChatPreferences>> {
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

      const content = response.choices[0].message.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return {};
    } catch (error) {
      const err = error as Error;
      console.error("Error extracting preferences:", err.message);
      return {};
    }
  }

  /**
   * Generate campsite search parameters from user message
   */
  async generateSearchParams(userMessage: string): Promise<SearchParams> {
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

      const content = response.choices[0].message.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return { query: "", state: "CA", activities: [] };
    } catch (error) {
      const err = error as Error;
      console.error("Error generating search params:", err.message);
      return { query: "", state: "CA", activities: [] };
    }
  }

  /**
   * Generate meal plan recommendations
   */
  async generateMealPlan(params: {
    numberOfDays: number;
    numberOfPeople: number;
    dietaryRestrictions?: string[];
    preferences?: string[];
  }): Promise<any[]> {
    try {
      const {
        numberOfDays,
        numberOfPeople,
        dietaryRestrictions = [],
        preferences = [],
      } = params;

      const prompt = `Generate a meal plan for a ${numberOfDays}-day camping trip for ${numberOfPeople} people.

${dietaryRestrictions.length > 0 ? `Dietary restrictions: ${dietaryRestrictions.join(", ")}` : ""}
${preferences.length > 0 ? `Preferences: ${preferences.join(", ")}` : ""}

Return a JSON array of meal items with this structure:
[
  {
    "item": "Oatmeal with dried fruit",
    "meal": "breakfast",
    "day": 1,
    "quantity": "4 servings",
    "notes": "Easy to prepare, no refrigeration needed"
  }
]

Include breakfast, lunch, dinner, and snacks for each day. Keep it practical for camping (no refrigeration unless noted). Return ONLY the JSON array, no explanation.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content;
      if (content) {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return [];
    } catch (error) {
      const err = error as Error;
      console.error("Error generating meal plan:", err.message);
      throw new Error("Failed to generate meal plan");
    }
  }

  /**
   * Generate gear list recommendations
   */
  async generateGearList(params: {
    numberOfDays: number;
    numberOfPeople: number;
    campingStyle?: string;
    weather?: string;
    activities?: string[];
  }): Promise<any[]> {
    try {
      const {
        numberOfDays,
        numberOfPeople,
        campingStyle = "car camping",
        weather = "mild",
        activities = [],
      } = params;

      const prompt = `Generate a gear list for a ${numberOfDays}-day ${campingStyle} trip for ${numberOfPeople} people.

Weather conditions: ${weather}
${activities.length > 0 ? `Planned activities: ${activities.join(", ")}` : ""}

Return a JSON array of gear items with this structure:
[
  {
    "item": "Tent",
    "quantity": 1,
    "category": "Shelter",
    "notes": "4-person capacity recommended"
  }
]

Include essential categories: Shelter, Sleep System, Cooking, Clothing, Safety, etc. Return ONLY the JSON array, no explanation.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content;
      if (content) {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return [];
    } catch (error) {
      const err = error as Error;
      console.error("Error generating gear list:", err.message);
      throw new Error("Failed to generate gear list");
    }
  }
}

export default new AIService();
