import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { MapPin, ExternalLink, Search, Loader2 } from 'lucide-react';
import { useTripContext } from '../contexts/TripContext';
import { useSearchParks, useGetParkDetails, useGetCampgrounds } from '../hooks';
import { toast } from 'sonner';
import type { Park, Campground } from '../types';

export function SiteBooking() {
  const { discoveredParks } = useTripContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState('CA');
  const [parks, setParks] = useState<Park[]>(discoveredParks);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);

  const { searchParks, loading: searchingParks } = useSearchParks();
  const { getCampgrounds, loading: loadingCampgrounds } = useGetCampgrounds();

  // Update parks when discovered parks change from AI chat
  useEffect(() => {
    if (discoveredParks.length > 0) {
      setParks(discoveredParks);
    }
  }, [discoveredParks]);

  const handleSearch = async () => {
    const response = await searchParks(searchState, searchQuery, 10);

    if (response) {
      setParks(response.parks);
      if (response.parks.length === 0) {
        toast.info('No parks found matching your search');
      }
    } else {
      toast.error('Failed to search parks');
    }
  };

  const handleViewPark = async (park: Park) => {
    setSelectedPark(park);
    setCampgrounds([]);

    const response = await getCampgrounds(park.parkCode);

    if (response) {
      setCampgrounds(response.campgrounds);
      if (response.campgrounds.length === 0) {
        toast.info('No campgrounds found for this park');
      }
    } else {
      toast.error('Failed to load campgrounds');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Find Your Perfect Campsite</h2>
        <p className="text-muted-foreground">
          {discoveredParks.length > 0
            ? 'Showing parks recommended by AI assistant'
            : 'Search for national parks and campsites'}
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Parks</CardTitle>
          <CardDescription>Find national parks and campsites in California</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="e.g. Yosemite, Joshua Tree..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-32 space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="CA"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={searchingParks}>
                {searchingParks ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parks Grid */}
      {parks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {discoveredParks.length > 0 && parks === discoveredParks
              ? 'AI Recommended Parks'
              : 'Search Results'} ({parks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parks.map((park) => (
              <Card
                key={park.id}
                className={selectedPark?.id === park.id ? 'ring-2 ring-primary' : ''}
              >
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{park.fullName}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {park.states}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {park.description}
                  </p>

                  {park.activities && park.activities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {park.activities.slice(0, 5).map((activity) => (
                        <Badge key={activity.id} variant="outline">
                          {activity.name}
                        </Badge>
                      ))}
                      {park.activities.length > 5 && (
                        <Badge variant="outline">+{park.activities.length - 5} more</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={selectedPark?.id === park.id ? 'default' : 'outline'}
                      onClick={() => handleViewPark(park)}
                      disabled={loadingCampgrounds}
                    >
                      {loadingCampgrounds && selectedPark?.id === park.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      View Campgrounds
                    </Button>
                    {park.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(park.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Campgrounds for Selected Park */}
      {selectedPark && campgrounds.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Campgrounds at {selectedPark.fullName} ({campgrounds.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {campgrounds.map((campground) => (
              <Card key={campground.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{campground.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {campground.description?.substring(0, 150)}
                        {campground.description && campground.description.length > 150 ? '...' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {campground.reservationInfo && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">Reservation Info:</p>
                      <p className="text-muted-foreground line-clamp-2">
                        {campground.reservationInfo}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {campground.reservationUrl && (
                      <Button
                        className="flex-1"
                        onClick={() => window.open(campground.reservationUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Make Reservation
                      </Button>
                    )}
                    {campground.directionsUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(campground.directionsUrl, '_blank')}
                      >
                        Directions
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {parks.length === 0 && !searchingParks && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No parks to display. Try searching above or visit the AI Planner tab to get recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
