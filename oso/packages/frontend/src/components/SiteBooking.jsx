import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { MapPin, Users, Calendar as CalendarIcon, Tent, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AIHelper } from './AIHelper';
import { useTripContext } from '../contexts/TripContext';

const mockSites = [
  {
    id: '1',
    name: 'Pine Valley Campground',
    location: 'Yosemite National Park, CA',
    capacity: 6,
    amenities: ['Fire Pit', 'Picnic Table', 'Water', 'Restrooms'],
    pricePerNight: 35,
    available: true,
    imageQuery: 'pine forest camping',
  },
  {
    id: '2',
    name: 'Lakeshore Haven',
    location: 'Lake Tahoe, CA',
    capacity: 8,
    amenities: ['Lake Access', 'Fire Pit', 'Picnic Table', 'Showers'],
    pricePerNight: 45,
    available: true,
    imageQuery: 'lake camping tent',
  },
  {
    id: '3',
    name: 'Mountain Peak Site',
    location: 'Rocky Mountain National Park, CO',
    capacity: 4,
    amenities: ['Fire Pit', 'Picnic Table', 'Mountain Views'],
    pricePerNight: 30,
    available: true,
    imageQuery: 'mountain camping',
  },
  {
    id: '4',
    name: 'Desert Oasis Camp',
    location: 'Joshua Tree, CA',
    capacity: 6,
    amenities: ['Fire Pit', 'Restrooms', 'Stargazing Area'],
    pricePerNight: 25,
    available: false,
    imageQuery: 'desert camping',
  },
];

export function SiteBooking() {
  const { aiSuggestions } = useTripContext();
  const [selectedSite, setSelectedSite] = useState(null);
  const [checkIn, setCheckIn] = useState();
  const [checkOut, setCheckOut] = useState();
  const [partySize, setPartySize] = useState(2);

  const handleBooking = (siteId) => {
    setSelectedSite(siteId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Find Your Perfect Campsite</h2>
        <p className="text-muted-foreground">Browse available campsites and book your next adventure</p>
      </div>

      {/* AI Suggestions */}
      <AIHelper
        title="AI Campsite Recommendations"
        suggestions={aiSuggestions.sites || []}
      />

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Campsites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="party-size">Party Size</Label>
              <Input
                id="party-size"
                type="number"
                min="1"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 2)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockSites.map((site) => (
          <Card key={site.id} className={selectedSite === site.id ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="p-0">
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={`https://source.unsplash.com/800x600/?${site.imageQuery}`}
                  alt={site.name}
                  className="w-full h-full object-cover"
                />
                {!site.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Unavailable</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{site.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {site.location}
                    </div>
                  </div>
                  {selectedSite === site.id && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> Selected
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Up to {site.capacity} people
                  </div>
                  <div className="flex items-center">
                    <Tent className="h-4 w-4 mr-1" />
                    ${site.pricePerNight}/night
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {site.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <Button
                  className="w-full"
                  disabled={!site.available}
                  onClick={() => handleBooking(site.id)}
                  variant={selectedSite === site.id ? 'default' : 'outline'}
                >
                  {selectedSite === site.id ? 'Selected' : site.available ? 'Select Site' : 'Unavailable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
