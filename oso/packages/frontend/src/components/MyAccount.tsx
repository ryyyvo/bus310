import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { User, MapPin, Calendar, Users, Tent, Edit, Mail, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTripContext } from '../contexts/TripContext';
import { useGetUserTrips } from '../hooks';
import { toast } from 'sonner';
import type { Trip } from '../types';

interface Friend {
  id: string;
  name: string;
  initials: string;
  tripsCount: number;
  lastTrip: string;
  lastTripDate: string;
}

const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    initials: 'SJ',
    tripsCount: 12,
    lastTrip: 'Yellowstone National Park',
    lastTripDate: 'August 2025',
  },
  {
    id: '2',
    name: 'Mike Chen',
    initials: 'MC',
    tripsCount: 8,
    lastTrip: 'Zion National Park',
    lastTripDate: 'July 2025',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    initials: 'ER',
    tripsCount: 15,
    lastTrip: 'Sequoia National Park',
    lastTripDate: 'May 2025',
  },
  {
    id: '4',
    name: 'David Kim',
    initials: 'DK',
    tripsCount: 6,
    lastTrip: 'Rocky Mountain National Park',
    lastTripDate: 'September 2025',
  },
];

export function MyAccount() {
  const { user } = useAuth();
  const { currentTrip, setCurrentTrip } = useTripContext();
  const { getUserTrips, loading: loadingTrips } = useGetUserTrips();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const response = await getUserTrips();
      if (response) {
        setTrips(response.trips);
      }
    };

    fetchTrips();
  }, []);

  const handleSelectTrip = (trip: Trip) => {
    setCurrentTrip(trip);
    toast.success(`Switched to trip: ${trip.name}`);
  };

  const calculateNights = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{user?.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tent className="h-4 w-4 text-muted-foreground" />
                  <span>{trips.filter(t => t.status === 'completed').length} trips completed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Trips
          </CardTitle>
          <CardDescription>Your camping trip collection - select one to make it active</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTrips ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tent className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No trips yet. Create your first trip from the Site Booking tab!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip, index) => {
                const isActive = currentTrip?._id === trip._id;
                const nights = calculateNights(trip.startDate, trip.endDate);
                return (
                  <div key={trip._id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className={`flex items-start justify-between gap-4 p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent'
                    }`}>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{trip.name}</h4>
                          {isActive && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                          <Badge variant={trip.status === 'planning' ? 'secondary' : 'outline'}>
                            {trip.status}
                          </Badge>
                        </div>
                        {trip.campsite?.parkName && (
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {trip.campsite.parkName}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tent className="h-3 w-3" />
                            {nights} {nights === 1 ? 'night' : 'nights'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectTrip(trip)}
                        disabled={isActive}
                      >
                        {isActive ? 'Selected' : 'Select Trip'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friends & Their Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends & Their Adventures
          </CardTitle>
          <CardDescription>Connect with fellow camping enthusiasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{friend.initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="font-semibold">{friend.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {friend.tripsCount} trips • Last: {friend.lastTrip}
                    </p>
                    <p className="text-xs text-muted-foreground">{friend.lastTripDate}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add Friends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{trips.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Trips</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {trips.reduce((acc, trip) => acc + calculateNights(trip.startDate, trip.endDate), 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Nights Planned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {trips.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Trips Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
