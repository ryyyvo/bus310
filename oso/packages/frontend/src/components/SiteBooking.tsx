import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { MapPin, ExternalLink, Search, Loader2, MessageSquare, Sparkles, Plus, Calendar, X } from 'lucide-react';
import { useTripContext } from '../contexts/TripContext';
import { useSearchParks, useGetParkDetails, useGetCampgrounds, useCreateTrip } from '../hooks';
import { toast } from 'sonner';
import type { Park, Campground } from '../types';

export function SiteBooking() {
  const { discoveredParks, currentSessionId, setCurrentTrip, currentTrip } = useTripContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState('CA');
  const [parks, setParks] = useState<Park[]>(discoveredParks);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [selectedCampground, setSelectedCampground] = useState<Campground | null>(null);
  const [tripFormData, setTripFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const { searchParks, loading: searchingParks } = useSearchParks();
  const { getCampgrounds, loading: loadingCampgrounds } = useGetCampgrounds();
  const { createTrip, loading: creatingTrip } = useCreateTrip();

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
        toast.info('No campgrounds available in database for this park. You can still create a trip!', {
          duration: 4000,
        });
      }
    } else {
      toast.error('Failed to load campgrounds');
    }
  };

  const handleOpenTripDialog = (campground: Campground) => {
    setSelectedCampground(campground);
    setTripFormData({
      name: `${selectedPark?.fullName || campground.name} Trip`,
      startDate: '',
      endDate: '',
      description: '',
    });
    setShowTripDialog(true);
  };

  const handleCreateTrip = async () => {
    if (!tripFormData.name || !tripFormData.startDate || !tripFormData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(tripFormData.startDate);
    const endDate = new Date(tripFormData.endDate);

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    const trip = await createTrip({
      name: tripFormData.name,
      description: tripFormData.description,
      startDate: tripFormData.startDate,
      endDate: tripFormData.endDate,
      owner: '', // Will be set from auth token in backend
      campsite: selectedCampground && selectedPark ? {
        name: selectedCampground.name,
        parkName: selectedPark.fullName,
        location: {
          state: selectedPark.states,
          coordinates: selectedPark.latitude && selectedPark.longitude ? {
            lat: parseFloat(selectedPark.latitude),
            lng: parseFloat(selectedPark.longitude),
          } : undefined,
        },
        reservationUrl: selectedCampground.reservationUrl,
        npsId: selectedPark.id,
        campsiteId: selectedCampground.id,
      } : undefined,
      chatSessionId: currentSessionId || undefined,
      status: 'planning',
    });

    if (trip) {
      setCurrentTrip(trip);
      setShowTripDialog(false);
      toast.success('Trip created successfully! You can now plan meals and gear.');
    } else {
      toast.error('Failed to create trip');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Trip Indicator */}
      {currentTrip && (
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Active Trip: {currentTrip.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">{currentTrip.status}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Creation Dialog */}
      {showTripDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Create New Trip
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTripDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Create a trip for {selectedCampground?.name} at {selectedPark?.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trip-name">Trip Name *</Label>
                <Input
                  id="trip-name"
                  value={tripFormData.name}
                  onChange={(e) => setTripFormData({ ...tripFormData, name: e.target.value })}
                  placeholder="e.g., Summer Camping Trip 2024"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={tripFormData.startDate}
                    onChange={(e) => setTripFormData({ ...tripFormData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={tripFormData.endDate}
                    onChange={(e) => setTripFormData({ ...tripFormData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trip-description">Description (optional)</Label>
                <Input
                  id="trip-description"
                  value={tripFormData.description}
                  onChange={(e) => setTripFormData({ ...tripFormData, description: e.target.value })}
                  placeholder="Add any notes about this trip..."
                />
              </div>

              {selectedCampground && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium mb-2">Campground Details:</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {selectedCampground.name}</p>
                      <p><strong>Park:</strong> {selectedPark?.fullName}</p>
                      {selectedCampground.reservationUrl && (
                        <p>
                          <strong>Reservation:</strong>{' '}
                          <a
                            href={selectedCampground.reservationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Book Here
                          </a>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateTrip}
                  disabled={creatingTrip}
                  className="flex-1"
                >
                  {creatingTrip ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Trip
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTripDialog(false)}
                  disabled={creatingTrip}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header with AI Recommendations Badge */}
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-2xl font-semibold">Find Your Perfect Campsite</h2>
          {discoveredParks.length > 0 && currentSessionId && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI Recommended
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {discoveredParks.length > 0
            ? `Showing ${discoveredParks.length} ${discoveredParks.length === 1 ? 'park' : 'parks'} recommended from your current AI planning session`
            : 'Search for national parks and campsites, or get AI recommendations from the Trip Planner'}
        </p>
      </div>

      {/* AI Recommendations Alert */}
      {discoveredParks.length > 0 && currentSessionId && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">
                  Parks from your AI planning session
                </p>
                <p className="text-sm text-muted-foreground">
                  These parks were recommended based on your conversation with the AI assistant.
                  Continue chatting in the AI Planner tab to refine your recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {discoveredParks.length > 0 && parks === discoveredParks ? (
              <>
                <Sparkles className="h-5 w-5 text-primary" />
                AI Recommended Parks
              </>
            ) : (
              'Search Results'
            )}
            <span className="text-muted-foreground font-normal">({parks.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parks.map((park) => {
              const isAIRecommended = discoveredParks.some(dp => dp.id === park.id);
              return (
                <Card
                  key={park.id}
                  className={`${selectedPark?.id === park.id ? 'ring-2 ring-primary' : ''} ${
                    isAIRecommended ? 'border-primary/30' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg flex-1">{park.fullName}</CardTitle>
                        {isAIRecommended && (
                          <Badge variant="secondary" className="gap-1 flex-shrink-0">
                            <Sparkles className="h-3 w-3" />
                            AI Pick
                          </Badge>
                        )}
                      </div>
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
              );
            })}
          </div>
        </div>
      )}

      {/* Campgrounds for Selected Park */}
      {selectedPark && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {campgrounds.length > 0
              ? `Campgrounds at ${selectedPark.fullName} (${campgrounds.length})`
              : `${selectedPark.fullName}`}
          </h3>

          {/* No Campgrounds - Show Park Info with Create Trip Option */}
          {campgrounds.length === 0 && !loadingCampgrounds && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">No Campgrounds in Database</h4>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Campground data isn't available for this park in the NPS system. However, you can
                      still create a trip for this park and plan your adventure!
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <Button
                      onClick={() => handleOpenTripDialog({
                        id: selectedPark.id,
                        name: selectedPark.fullName,
                        parkCode: selectedPark.parkCode,
                        description: selectedPark.description,
                      } as any)}
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Trip for {selectedPark.name || selectedPark.fullName}
                    </Button>
                    {selectedPark.url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedPark.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Park Website for Camping Info
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campgrounds List */}
          {campgrounds.length > 0 && (
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

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleOpenTripDialog(campground)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Trip
                    </Button>
                    <div className="flex gap-2">
                      {campground.reservationUrl && (
                        <Button
                          variant="outline"
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
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {parks.length === 0 && !searchingParks && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">No Parks Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get personalized park recommendations by chatting with the AI assistant in the
                <span className="font-semibold"> AI Planner</span> tab, or search for parks above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
