import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { SiteBooking } from './components/SiteBooking';
import { MealPlanning } from './components/MealPlanning';
import { GroupCoordination } from './components/GroupCoordination';
import { ActivityPlanning } from './components/ActivityPlanning';
import { TripPlanner } from './components/TripPlanner';
import { TripProvider } from './contexts/TripContext';
import { Tent, MapPin, Users, Utensils, Sparkles } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <TripProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
        
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <Tent className="h-8 w-8 text-primary" />
              <h1 className="text-3xl">PathFinder</h1>
            </div>
            <p className="text-muted-foreground">Your complete camping trip planning companion</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Planner</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="booking" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Site Booking</span>
                <span className="sm:hidden">Sites</span>
              </TabsTrigger>
              <TabsTrigger value="meals" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">Meal Planning</span>
                <span className="sm:hidden">Meals</span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Tent className="h-4 w-4" />
                <span className="hidden sm:inline">Activities</span>
                <span className="sm:hidden">Activities</span>
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Group</span>
                <span className="sm:hidden">Group</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planner">
              <TripPlanner />
            </TabsContent>

            <TabsContent value="booking">
              <SiteBooking />
            </TabsContent>

            <TabsContent value="meals">
              <MealPlanning />
            </TabsContent>

            <TabsContent value="group">
              <GroupCoordination />
            </TabsContent>

            <TabsContent value="activities">
              <ActivityPlanning />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Plan your perfect camping adventure with CampPlanner</p>
          </div>
        </footer>
      </div>
    </TripProvider>
  );
}