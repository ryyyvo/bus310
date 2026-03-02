import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, X, Mountain, Compass, Clock, TrendingUp, Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTripContext } from '../contexts/TripContext';
import { useUpdateItinerary } from '../hooks';
import { toast } from 'sonner';
import type { ItineraryDay, ActivityItem } from '../types';

export function ActivityPlanning() {
  const { currentTrip, setCurrentTrip } = useTripContext();
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(currentTrip?.itinerary || []);
  const [hasChanges, setHasChanges] = useState(false);

  const [newActivity, setNewActivity] = useState<ActivityItem & { day: number }>({
    name: '',
    description: '',
    time: '',
    location: '',
    notes: '',
    day: 1,
  });

  const { updateItinerary, loading: saving } = useUpdateItinerary();

  // Update local state when trip changes
  useEffect(() => {
    if (currentTrip?.itinerary) {
      setItinerary(currentTrip.itinerary);
      setHasChanges(false);
    }
  }, [currentTrip]);

  const addActivity = () => {
    if (!newActivity.name) {
      toast.error('Please enter an activity name');
      return;
    }

    const activity: ActivityItem = {
      name: newActivity.name,
      description: newActivity.description || undefined,
      time: newActivity.time || undefined,
      location: newActivity.location || undefined,
      notes: newActivity.notes || undefined,
    };

    // Find or create day
    const dayIndex = itinerary.findIndex((d) => d.day === newActivity.day);
    let updatedItinerary: ItineraryDay[];

    if (dayIndex >= 0) {
      // Add to existing day
      updatedItinerary = [...itinerary];
      updatedItinerary[dayIndex] = {
        ...updatedItinerary[dayIndex],
        activities: [...(updatedItinerary[dayIndex].activities || []), activity],
      };
    } else {
      // Create new day
      updatedItinerary = [
        ...itinerary,
        {
          day: newActivity.day,
          activities: [activity],
        },
      ].sort((a, b) => a.day - b.day);
    }

    setItinerary(updatedItinerary);
    setHasChanges(true);
    setNewActivity({
      name: '',
      description: '',
      time: '',
      location: '',
      notes: '',
      day: 1,
    });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[dayIndex].activities = updatedItinerary[dayIndex].activities?.filter(
      (_, i) => i !== activityIndex
    );

    // Remove day if no activities left
    if (!updatedItinerary[dayIndex].activities || updatedItinerary[dayIndex].activities.length === 0) {
      updatedItinerary.splice(dayIndex, 1);
    }

    setItinerary(updatedItinerary);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentTrip) {
      toast.error('No trip selected. Please create a trip first.');
      return;
    }

    const updatedTrip = await updateItinerary(currentTrip._id, itinerary);

    if (updatedTrip) {
      setCurrentTrip(updatedTrip);
      setHasChanges(false);
      toast.success('Itinerary saved successfully');
    } else {
      toast.error('Failed to save itinerary');
    }
  };

  if (!currentTrip) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Activities & Hikes</h2>
          <p className="text-muted-foreground">Plan your outdoor adventures and hiking routes</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No trip selected. Please create a trip from the Site Booking tab first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Activities & Hikes</h2>
          <p className="text-muted-foreground">
            Planning activities for: <strong>{currentTrip.name}</strong>
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">
            <Compass className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {itinerary.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No activities scheduled yet. Start planning your adventure!
                </p>
              </CardContent>
            </Card>
          ) : (
            itinerary.map((day, dayIndex) => (
              <Card key={day.day}>
                <CardHeader>
                  <CardTitle>Day {day.day}</CardTitle>
                  <CardDescription>
                    {day.activities?.length || 0} activities planned
                    {day.date && ` • ${new Date(day.date).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {day.activities && day.activities.length > 0 ? (
                    day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Mountain className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold">{activity.name}</h4>
                              {activity.time && <Badge variant="outline">{activity.time}</Badge>}
                            </div>

                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              {activity.location && (
                                <div className="flex items-center gap-1">
                                  <Compass className="h-4 w-4" />
                                  {activity.location}
                                </div>
                              )}
                            </div>

                            {activity.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                Note: {activity.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(dayIndex, activityIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activities for this day
                    </p>
                  )}
                  {day.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">Day Notes:</p>
                      <p className="text-sm text-muted-foreground">{day.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Activity</CardTitle>
              <CardDescription>Plan your outdoor activities and hikes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-name">Activity Name</Label>
                  <Input
                    id="activity-name"
                    placeholder="e.g., Summit Trail Hike"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    type="number"
                    min="1"
                    value={newActivity.day}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, day: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time (optional)</Label>
                  <Input
                    id="time"
                    placeholder="e.g., 9:00 AM"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Eagle Peak Trailhead"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add details about this activity"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or tips"
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <Button onClick={addActivity} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
