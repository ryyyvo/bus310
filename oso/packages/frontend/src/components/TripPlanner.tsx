import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Send, Bot, Sparkles, ArrowRight, History, Clock, MessageSquare } from 'lucide-react';
import { useTripContext } from '../contexts/TripContext';
import { useCreateChatSession, useSendMessage, useGetChatSession, useGetUserChatSessions } from '../hooks';
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
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [showSessionList, setShowSessionList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { createChatSession } = useCreateChatSession();
  const { sendMessage } = useSendMessage();
  const { getChatSession } = useGetChatSession();
  const { getUserChatSessions } = useGetUserChatSessions();

  // Fetch user's sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      if (!userId) return;

      const sessions = await getUserChatSessions();
      if (sessions) {
        setUserSessions(sessions);
      }
    };

    fetchSessions();
  }, [userId]);

  // Initialize chat session on mount
  useEffect(() => {
    const initializeSession = async () => {
      // Wait for userId to be available
      if (!userId) {
        return;
      }

      if (!currentSessionId) {
        // Create new session
        setIsLoadingChat(true);
        const response = await createChatSession();
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

          // Extract and set discovered parks from session messages
          const allCampsites = session.messages
            .filter((msg: any) => msg.metadata?.campsites)
            .flatMap((msg: any) => msg.metadata.campsites);

          // Deduplicate by park ID
          const uniqueCampsites = allCampsites.reduce((acc: any[], park: any) => {
            if (!acc.find((p: any) => p.id === park.id)) {
              acc.push(park);
            }
            return acc;
          }, []);

          setDiscoveredParks(uniqueCampsites);
        }
      }
    };

    initializeSession();
  }, [userId]);

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

  const handleLoadSession = async (sessionId: string) => {
    setIsLoadingChat(true);
    const session = await getChatSession(sessionId);
    setIsLoadingChat(false);

    if (session) {
      setCurrentSessionId(sessionId);
      setChatMessages(session.messages);
      if (session.preferences) {
        setChatPreferences(session.preferences);
      }

      // Extract and set discovered parks from session messages
      const allCampsites = session.messages
        .filter((msg: any) => msg.metadata?.campsites)
        .flatMap((msg: any) => msg.metadata.campsites);

      // Deduplicate by park ID
      const uniqueCampsites = allCampsites.reduce((acc: any[], park: any) => {
        if (!acc.find((p: any) => p.id === park.id)) {
          acc.push(park);
        }
        return acc;
      }, []);

      setDiscoveredParks(uniqueCampsites);
      setShowSessionList(false);
      toast.success('Session loaded');
    } else {
      toast.error('Failed to load session');
    }
  };

  const handleNewSession = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoadingChat(true);
    const response = await createChatSession();
    setIsLoadingChat(false);

    if (response) {
      setCurrentSessionId(response.sessionId);
      setChatMessages(response.messages);
      setChatPreferences(null);
      setDiscoveredParks([]);
      toast.success('Started new planning session');

      // Refresh sessions list
      const sessions = await getUserChatSessions();
      if (sessions) {
        setUserSessions(sessions);
      }
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessionList(!showSessionList)}
                disabled={isLoadingChat}
              >
                <History className="h-4 w-4 mr-2" />
                Past Sessions ({userSessions.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleNewSession} disabled={isLoadingChat}>
                <Sparkles className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Past Sessions List */}
          {showSessionList && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Your Planning Sessions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSessionList(false)}
                >
                  Close
                </Button>
              </div>
              {userSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No previous sessions found. Start a new session to begin planning!
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userSessions.map((session: any) => (
                    <button
                      key={session._id}
                      onClick={() => handleLoadSession(session._id)}
                      disabled={session._id === currentSessionId}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        session._id === currentSessionId
                          ? 'bg-primary/10 border-primary cursor-not-allowed'
                          : 'bg-card hover:bg-accent hover:border-accent-foreground cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            <p className="font-medium text-sm truncate">
                              {session.sessionName || 'Planning Session'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </span>
                            <span>{session.messages?.length || 0} messages</span>
                          </div>
                        </div>
                        {session._id === currentSessionId && (
                          <span className="text-xs font-medium text-primary">Active</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user'
                        ? 'prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
                        : 'prose-slate [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
                    }`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="my-2" {...props} />,
                          li: ({node, ...props}) => <li className="my-1" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-1" {...props} />,
                          code: ({node, inline, ...props}: any) =>
                            inline
                              ? <code className="px-1 py-0.5 rounded bg-muted text-sm font-mono" {...props} />
                              : <code className="block p-2 rounded bg-muted text-sm font-mono overflow-x-auto" {...props} />,
                          pre: ({node, ...props}) => <pre className="my-2 p-0" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic my-2" {...props} />,
                          a: ({node, ...props}) => <a className="underline hover:no-underline" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
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
