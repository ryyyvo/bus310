import { createContext, useContext, useState } from 'react';

const TripContext = createContext(undefined);

export function TripProvider({ children }) {
  const [aiSuggestions, setAISuggestions] = useState({});
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
