import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  Trip,
  ChatMessage,
  ChatPreferences,
  Park,
  GetChatSessionResponse
} from '../types';

interface TripContextType {
  // User
  userId: string;

  // Current chat session
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  chatPreferences: ChatPreferences | null;
  setChatPreferences: (prefs: ChatPreferences | null) => void;

  // Current trip
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;

  // Discovered parks from AI chat
  discoveredParks: Park[];
  setDiscoveredParks: (parks: Park[]) => void;

  // Loading states
  isLoadingChat: boolean;
  setIsLoadingChat: (loading: boolean) => void;
  isLoadingTrip: boolean;
  setIsLoadingTrip: (loading: boolean) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  // Get default user ID from environment (for development)
  const [userId] = useState<string>(
    import.meta.env.VITE_DEFAULT_USER_ID || 'dev-user-123'
  );

  // Chat session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatPreferences, setChatPreferences] = useState<ChatPreferences | null>(null);

  // Trip state
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  // Parks discovered from AI chat
  const [discoveredParks, setDiscoveredParks] = useState<Park[]>([]);

  // Loading states
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('currentSessionId');
    if (savedSessionId) {
      setCurrentSessionId(savedSessionId);
    }
  }, []);

  // Save session ID to localStorage when it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
    } else {
      localStorage.removeItem('currentSessionId');
    }
  }, [currentSessionId]);

  const value: TripContextType = {
    userId,
    currentSessionId,
    setCurrentSessionId,
    chatMessages,
    setChatMessages,
    chatPreferences,
    setChatPreferences,
    currentTrip,
    setCurrentTrip,
    discoveredParks,
    setDiscoveredParks,
    isLoadingChat,
    setIsLoadingChat,
    isLoadingTrip,
    setIsLoadingTrip,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
}
