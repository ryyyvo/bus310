import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { SiteBooking } from './components/SiteBooking';
import { MealPlanning } from './components/MealPlanning';
import { GroupCoordination } from './components/GroupCoordination';
import { ActivityPlanning } from './components/ActivityPlanning';
import { TripPlanner } from './components/TripPlanner';
import { MyAccount } from './components/MyAccount';
import { LandingPage } from './components/LandingPage';
import { TripProvider } from './contexts/TripContext';
import { MapPin, Users, Utensils, Sparkles, UserCircle, Mountain, LogOut } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import osoLogo from './assets/oso-logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (email, password) => {
    setUser({ email, name: email.split('@')[0] });
    setIsAuthenticated(true);
  };

  const handleSignUp = (email, password, name) => {
    setUser({ email, name });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('planner');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} />
      </>
    );
  }

  return (
    <TripProvider>
      <div className="min-h-screen bg-background">
        <Toaster />

        {/* Header */}
        <header className="border-b" style={{ backgroundColor: '#fcf6e9' }}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between bg-[#fcf6e9]">
              <div className="flex-1"></div>
              <img src={osoLogo} alt="oso Logo" className="h-32" />
              <div className="flex-1 flex justify-end items-start gap-3">
                <span className="text-sm hidden sm:inline mx-[0px] my-[8px] p-[0px]" style={{ color: '#3d5a3d' }}>
                  {user?.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                  style={{ borderColor: '#3d5a3d', color: '#3d5a3d' }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
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
                <Mountain className="h-4 w-4" />
                <span className="hidden sm:inline">Activities</span>
                <span className="sm:hidden">Activities</span>
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Group</span>
                <span className="sm:hidden">Group</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">My Account</span>
                <span className="sm:hidden">Account</span>
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

            <TabsContent value="activities">
              <ActivityPlanning />
            </TabsContent>

            <TabsContent value="group">
              <GroupCoordination />
            </TabsContent>

            <TabsContent value="account">
              <MyAccount />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Plan your perfect camping adventure with OSO!</p>
          </div>
        </footer>
      </div>
    </TripProvider>
  );
}
