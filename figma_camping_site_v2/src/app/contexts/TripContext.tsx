import { createContext, useContext, useState, ReactNode } from 'react';

interface AISuggestion {
  sites?: string[];
  meals?: string[];
  activities?: string[];
  group?: string[];
}

interface TripContextType {
  aiSuggestions: AISuggestion;
  setAISuggestions: (suggestions: AISuggestion) => void;
  tripDetails: {
    duration?: number;
    groupSize?: number;
    experience?: string;
  };
  setTripDetails: (details: any) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion>({});
  const [tripDetails, setTripDetails] = useState({});

  return (
    <TripContext.Provider value={{ aiSuggestions, setAISuggestions, tripDetails, setTripDetails }}>
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
