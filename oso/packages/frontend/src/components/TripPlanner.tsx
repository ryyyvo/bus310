import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Send, Bot, Sparkles, ArrowRight } from 'lucide-react';
import { useTripContext } from '../contexts/TripContext';
import { useCreateChatSession, useSendMessage, useGetChatSession } from '../hooks';
import { toast } from 'sonner';
import type { ChatMessage } from '../types';

const examplePrompts = [
  "I want to plan a 3-day camping trip for 4 people in California",
  "Suggest camping spots with hiking trails for beginners",
  "What are good campsites near lakes in California?",
  "Help me plan a family camping trip with activities",
];

export function TripPlanner() {
  const {
    userId,
    currentSessionId,
    setCurrentSessionId,
    chatMessages,
    setChatMessages,
    setChatPreferences,
    setDiscoveredParks,
    isLoadingChat,
    setIsLoadingChat,
  } = useTripContext();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { createChatSession } = useCreateChatSession();
  const { sendMessage } = useSendMessage();
  const { getChatSession } = useGetChatSession();

  // Initialize chat session on mount
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentSessionId) {
        // Create new session
        setIsLoadingChat(true);
        const response = await createChatSession(userId);
        setIsLoadingChat(false);

        if (response) {
          setCurrentSessionId(response.sessionId);
          setChatMessages(response.messages);
        } else {
          toast.error('Failed to create chat session');
        }
      } else {
        // Load existing session
        setIsLoadingChat(true);
        const session = await getChatSession(currentSessionId);
        setIsLoadingChat(false);

        if (session) {
          setChatMessages(session.messages);
          if (session.preferences) {
            setChatPreferences(session.preferences);
          }
        }
      }
    };

    initializeSession();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || !currentSessionId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Optimistically add user message
    setChatMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoadingChat(true);

    try {
      const response = await sendMessage(currentSessionId, input);
      setIsLoadingChat(false);

      if (response) {
        // Add AI response
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          metadata: {
            campsites: response.campsites,
          },
        };

        setChatMessages((prev) => [...prev, aiMessage]);

        // Update preferences if provided
        if (response.preferences) {
          setChatPreferences(response.preferences);
        }

        // Update discovered parks if provided
        if (response.campsites && response.campsites.length > 0) {
          setDiscoveredParks(response.campsites);
        }
      } else {
        toast.error('Failed to send message');
        // Remove optimistic message on error
        setChatMessages((prev) => prev.slice(0, -1));
      }
    } catch (error) {
      setIsLoadingChat(false);
      toast.error('Failed to send message');
      // Remove optimistic message on error
      setChatMessages((prev) => prev.slice(0, -1));
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleNewSession = async () => {
    setIsLoadingChat(true);
    const response = await createChatSession(userId);
    setIsLoadingChat(false);

    if (response) {
      setCurrentSessionId(response.sessionId);
      setChatMessages(response.messages);
      setChatPreferences(null);
      setDiscoveredParks([]);
      toast.success('Started new planning session');
    } else {
      toast.error('Failed to create new session');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Trip Planner
              </CardTitle>
              <CardDescription>
                Let our AI assistant help you plan the perfect camping adventure with personalized suggestions
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleNewSession} disabled={isLoadingChat}>
              New Session
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="border rounded-lg bg-muted/30 p-4 h-[500px] overflow-y-auto space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
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
                    {message.metadata?.campsites && message.metadata.campsites.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <p className="text-sm font-medium mb-2">Found {message.metadata.campsites.length} parks:</p>
                        <div className="space-y-1">
                          {message.metadata.campsites.map((park: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              • {park.fullName || park.name}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                          <p className="text-sm font-medium">
                            Check out the 'Site Booking' tab to explore these parks and make reservations!
                          </p>
                        </div>
                      </div>
                    )}
                    {message.timestamp && (
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary-foreground font-medium">U</span>
                  </div>
                )}
              </div>
            ))}
            {isLoadingChat && (
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
                  disabled={isLoadingChat}
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
              onKeyPress={(e) => e.key === 'Enter' && !isLoadingChat && handleSend()}
              className="flex-1"
              disabled={isLoadingChat}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoadingChat}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
