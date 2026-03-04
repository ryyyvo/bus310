import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Send, Bot, Sparkles, ArrowRight } from 'lucide-react';
import { useTripContext } from '../contexts/TripContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  nextStep?: string;
}

const examplePrompts = [
  "I want to plan a 3-day camping trip for 4 people",
  "Suggest hiking trails for beginners in the mountains",
  "What meals are easy to cook while camping?",
  "Help me plan activities for a family camping trip",
];

function getAIResponse(userMessage: string, setAISuggestions: any, setTripDetails: any): { content: string; suggestions: string[]; nextStep: string } {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('3') && msg.includes('day') || msg.includes('trip') && msg.includes('people')) {
    setTripDetails({ duration: 3, groupSize: 4, experience: 'beginner' });
    setAISuggestions({
      sites: [
        'Pine Valley Campground - Family-friendly with lake access',
        'Mountain View Camp - Scenic trails, moderate difficulty',
        'Riverside Retreat - Quiet, shaded sites near river'
      ],
      meals: [
        'Day 1: Campfire hot dogs, s\'mores for dessert',
        'Day 2: Grilled chicken with foil-wrapped vegetables',
        'Day 3: Breakfast burritos, then pack-up snacks'
      ],
      activities: [
        'Easy 2-mile nature trail on Day 1',
        'Lake kayaking or swimming on Day 2',
        'Morning bird watching before departure'
      ],
      group: [
        'Designate a camp chef for each meal',
        'Assign tent setup responsibilities',
        'Create a shared packing checklist'
      ]
    });
    
    return {
      content: "Great! Here are three options for your 3-day camping trip with 4 people:",
      suggestions: [
        "**Option 1: Lake & Leisure** - Pine Valley Campground with swimming, easy trails, and relaxed campfire evenings. Perfect for families or first-time campers.",
        "**Option 2: Mountain Adventure** - Mountain View Camp with moderate hiking, scenic viewpoints, and wildlife watching. Great for those seeking a bit more challenge.",
        "**Option 3: Riverside Relaxation** - Riverside Retreat with fishing, quiet nature walks, and peaceful surroundings. Ideal for a low-key getaway."
      ],
      nextStep: "Let's start by selecting a campsite! Click the 'Site Booking' tab to see available options that match these recommendations."
    };
  } else if (msg.includes('meal') || msg.includes('food') || msg.includes('cook')) {
    setAISuggestions({
      meals: [
        'Foil packet dinners (chicken, potatoes, vegetables)',
        'One-pot pasta with vegetables and sausage',
        'Campfire breakfast burritos with eggs and cheese'
      ]
    });
    
    return {
      content: "Here are three easy camping meal ideas:",
      suggestions: [
        "**Idea 1: Foil Packet Meals** - Wrap chicken, potatoes, and vegetables in foil and cook over the fire. Easy cleanup, customizable per person, and delicious smoky flavor.",
        "**Idea 2: One-Pot Wonders** - Make pasta, chili, or stew in a single pot. Minimal dishes, hearty portions, and perfect for cooler evenings.",
        "**Idea 3: Make-Ahead Prep** - Prepare breakfast burritos or marinated meats at home, freeze them, and they'll thaw during your trip while keeping other food cold."
      ],
      nextStep: "Ready to plan your meals? Head to the 'Meal Planning' tab to organize your menu and generate a shopping list!"
    };
  } else if (msg.includes('hike') || msg.includes('hik') || msg.includes('trail')) {
    setAISuggestions({
      activities: [
        'Meadow Loop Trail - 2 miles, easy, wildflowers in season',
        'Pine Ridge Trail - 4 miles, moderate, summit views',
        'Cascade Falls - 3 miles, moderate, waterfall destination'
      ]
    });
    
    return {
      content: "Here are three beginner-friendly hiking options:",
      suggestions: [
        "**Option 1: Meadow Loop Trail** - 2 miles, flat terrain, perfect for families. Features wildflower meadows and possible deer sightings. Allow 1-2 hours.",
        "**Option 2: Pine Ridge Trail** - 4 miles with gradual elevation gain. Summit offers panoramic views. Intermediate difficulty, allow 2-3 hours.",
        "**Option 3: Cascade Falls Trail** - 3 miles to a beautiful waterfall. Some rocky sections but manageable for most fitness levels. Allow 2 hours plus time at falls."
      ],
      nextStep: "Check out the 'Activities' tab to schedule these hikes and add other outdoor activities to your itinerary!"
    };
  } else if (msg.includes('family') || msg.includes('activity') || msg.includes('activities')) {
    setAISuggestions({
      activities: [
        'Nature scavenger hunt with printable checklist',
        'Campfire storytelling and stargazing',
        'Outdoor games: frisbee, cards, nature crafts'
      ],
      group: [
        'Rotate cooking duties among adults',
        'Kids can help with firewood collection',
        'Assign tent buddy pairs for safety'
      ]
    });
    
    return {
      content: "Here are three family-friendly camping activity plans:",
      suggestions: [
        "**Plan 1: Adventure Seekers** - Nature scavenger hunt, easy hike with exploration breaks, fishing or creek exploration, evening campfire games.",
        "**Plan 2: Relaxed & Creative** - Nature photography, outdoor art with found materials, bird watching, stargazing with constellation guide, storytelling circle.",
        "**Plan 3: Active & Educational** - Morning nature walk with plant/animal identification, swimming or kayaking, outdoor skills workshop (fire safety, knot tying), night hike with flashlights."
      ],
      nextStep: "Visit the 'Group' tab to assign responsibilities and make sure everyone has a role in making the trip memorable!"
    };
  } else if (msg.includes('site') || msg.includes('campsite') || msg.includes('where')) {
    setAISuggestions({
      sites: [
        'National Forest Campground - Primitive, scenic, free',
        'State Park - Amenities, reservable, moderate fee',
        'Private Campground - Full hookups, showers, higher fee'
      ]
    });
    
    return {
      content: "Here are three types of campsites to consider:",
      suggestions: [
        "**Option 1: National Forest Campground** - Most affordable (often free), beautiful natural settings, primitive facilities. Best for experienced campers comfortable without amenities.",
        "**Option 2: State Park Campground** - Moderate fees ($20-40/night), reservable sites, vault toilets, potable water. Great balance of nature and convenience.",
        "**Option 3: Private Campground** - Higher fees but includes showers, hookups, camp stores. Ideal for families or those wanting more comfort and services."
      ],
      nextStep: "Head to the 'Site Booking' tab to browse available campsites and make your reservation!"
    };
  } else if (msg.includes('group') || msg.includes('coordinate') || msg.includes('organize')) {
    setAISuggestions({
      group: [
        'Create shared gear list to avoid duplicates',
        'Assign meal prep and cleanup rotations',
        'Designate emergency contact person'
      ]
    });
    
    return {
      content: "Here are three strategies for group coordination:",
      suggestions: [
        "**Strategy 1: Divide & Conquer** - Assign each person/family a meal to plan and cook. Share a gear list so you don't bring duplicate items. One person handles reservations.",
        "**Strategy 2: Shared Responsibilities** - Rotate daily tasks (cooking, cleaning, firewood). Everyone brings their own tent/sleeping gear. Pool shared items like stoves and coolers.",
        "**Strategy 3: Captain System** - Designate captains for meals, activities, gear, and safety. Each captain coordinates their area and reports to the group. Ensures nothing is overlooked."
      ],
      nextStep: "Use the 'Group' tab to add members, assign responsibilities, and keep everyone on the same page!"
    };
  }
  
  return {
    content: "I'd be happy to help you plan your camping trip! Here are three ways I can assist:",
    suggestions: [
      "**Trip Planning** - Tell me about your group size, trip duration, and experience level. I'll suggest campsites, activities, and meals tailored to your needs.",
      "**Site Selection** - Share your preferences (lakeside, mountain, forest) and I'll recommend three campground options with details about amenities and nearby activities.",
      "**Activity Ideas** - Whether you want hiking, water sports, or relaxation, I'll provide three complete activity plans for your camping adventure."
    ],
    nextStep: "Let's start by telling me about your trip! How many people are going and for how many days?"
  };
}

export function TripPlanner() {
  const { setAISuggestions, setTripDetails } = useTripContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI camping assistant. I'll help you plan your perfect trip and guide you through each step:",
      suggestions: [
        "**Step 1: AI Planning** - We'll discuss your trip and I'll provide 3 tailored suggestions",
        "**Step 2: Site Booking** - Browse campsites based on my recommendations",
        "**Step 3: Meal Planning** - Organize your menu with suggested recipes",
        "**Step 4: Activities** - Schedule hikes and outdoor activities",
        "**Step 5: Group Coordination** - Assign responsibilities to your team"
      ],
      nextStep: "What kind of camping trip are you planning?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getAIResponse(input, setAISuggestions, setTripDetails);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        suggestions: response.suggestions,
        nextStep: response.nextStep,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Trip Planner
          </CardTitle>
          <CardDescription>
            Let our AI assistant help you plan the perfect camping adventure with personalized suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="border rounded-lg bg-muted/30 p-4 h-[500px] overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    {message.suggestions && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="pl-3 border-l-2 border-primary/30 py-1">
                            <p className="text-sm whitespace-pre-line">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.nextStep && (
                      <div className="mt-3 pt-3 border-t border-primary/20 flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                        <p className="text-sm font-medium">{message.nextStep}</p>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary-foreground font-medium">U</span>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="rounded-lg px-4 py-3 bg-card border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-left"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about planning your trip..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
