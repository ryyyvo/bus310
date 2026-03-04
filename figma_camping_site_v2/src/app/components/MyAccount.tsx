import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { User, MapPin, Calendar, Users, Tent, Edit, Mail, Phone } from 'lucide-react';

interface Trip {
  id: string;
  destination: string;
  dates: string;
  duration: string;
  companions: number;
  status: 'completed' | 'upcoming';
}

interface Friend {
  id: string;
  name: string;
  initials: string;
  tripsCount: number;
  lastTrip: string;
  lastTripDate: string;
}

const mockTrips: Trip[] = [
  {
    id: '1',
    destination: 'Yosemite National Park, CA',
    dates: 'June 15-18, 2025',
    duration: '3 nights',
    companions: 4,
    status: 'upcoming',
  },
  {
    id: '2',
    destination: 'Grand Canyon, AZ',
    dates: 'March 10-14, 2025',
    duration: '4 nights',
    companions: 6,
    status: 'completed',
  },
  {
    id: '3',
    destination: 'Glacier National Park, MT',
    dates: 'September 5-9, 2024',
    duration: '4 nights',
    companions: 3,
    status: 'completed',
  },
  {
    id: '4',
    destination: 'Joshua Tree National Park, CA',
    dates: 'January 20-22, 2024',
    duration: '2 nights',
    companions: 2,
    status: 'completed',
  },
];

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
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">John Doe</h3>
                <p className="text-sm text-muted-foreground">Member since January 2024</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>john.doe@email.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tent className="h-4 w-4 text-muted-foreground" />
                  <span>{mockTrips.filter(t => t.status === 'completed').length} trips completed</span>
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
            Trip History
          </CardTitle>
          <CardDescription>Your past and upcoming camping adventures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTrips.map((trip, index) => (
              <div key={trip.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{trip.destination}</h4>
                      <Badge variant={trip.status === 'upcoming' ? 'default' : 'secondary'}>
                        {trip.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {trip.dates}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tent className="h-3 w-3" />
                        {trip.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {trip.companions} people
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{mockTrips.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Trips</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {mockTrips.reduce((acc, trip) => acc + parseInt(trip.duration), 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Nights Camped</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{mockFriends.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Camping Friends</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">6</p>
              <p className="text-sm text-muted-foreground mt-1">States Visited</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
