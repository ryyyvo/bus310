import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, X, Mountain, Compass, Clock, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AIHelper } from './AIHelper';
import { useTripContext } from '../contexts/TripContext';

export function ActivityPlanning() {
  const { aiSuggestions } = useTripContext();
  const [activities, setActivities] = useState([
    {
      id: '1',
      name: 'Eagle Peak Trail',
      type: 'hike',
      day: 'Day 1',
      duration: '4 hours',
      difficulty: 'moderate',
      distance: '6.5 miles',
      elevation: '1,200 ft',
      description: 'Beautiful mountain views with wildflowers in spring',
    },
    {
      id: '2',
      name: 'Lake Swimming',
      type: 'activity',
      day: 'Day 2',
      duration: '2 hours',
      description: 'Afternoon swim and relaxation at the lake',
    },
    {
      id: '3',
      name: 'Waterfall Loop',
      type: 'hike',
      day: 'Day 2',
      duration: '3 hours',
      difficulty: 'easy',
      distance: '4 miles',
      elevation: '600 ft',
      description: 'Easy trail with scenic waterfall viewpoint',
    },
  ]);

  const [newActivity, setNewActivity] = useState({
    name: '',
    type: 'hike',
    day: 'Day 1',
    duration: '',
    difficulty: 'moderate',
    distance: '',
    elevation: '',
    description: '',
  });

  const addActivity = () => {
    if (!newActivity.name) return;

    const activity = {
      id: Date.now().toString(),
      name: newActivity.name,
      type: newActivity.type,
      day: newActivity.day,
      duration: newActivity.duration,
      ...(newActivity.type === 'hike' && {
        difficulty: newActivity.difficulty,
        distance: newActivity.distance,
        elevation: newActivity.elevation,
      }),
      description: newActivity.description,
    };

    setActivities([...activities, activity]);
    setNewActivity({
      name: '',
      type: 'hike',
      day: 'Day 1',
      duration: '',
      difficulty: 'moderate',
      distance: '',
      elevation: '',
      description: '',
    });
  };

  const removeActivity = (id) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const groupActivitiesByDay = () => {
    const grouped = {};
    activities.forEach((activity) => {
      if (!grouped[activity.day]) {
        grouped[activity.day] = [];
      }
      grouped[activity.day].push(activity);
    });
    return grouped;
  };

  const activitiesByDay = groupActivitiesByDay();
  const hikes = activities.filter((a) => a.type === 'hike');

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Activities & Hikes</h2>
        <p className="text-muted-foreground">Plan your outdoor adventures and hiking routes</p>
      </div>

      {/* AI Suggestions */}
      <AIHelper
        title="AI Activity Recommendations"
        suggestions={aiSuggestions.activities || []}
      />

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">
            <Compass className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="hikes">
            <Mountain className="h-4 w-4 mr-2" />
            Hikes
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {Object.keys(activitiesByDay).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No activities scheduled yet. Start planning your adventure!
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(activitiesByDay).map(([day, dayActivities]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                  <CardDescription>{dayActivities.length} activities planned</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dayActivities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {activity.type === 'hike' ? (
                              <Mountain className="h-5 w-5 text-primary" />
                            ) : (
                              <Compass className="h-5 w-5 text-primary" />
                            )}
                            <h4 className="font-semibold">{activity.name}</h4>
                            <Badge variant="outline">{activity.type}</Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>

                          <div className="flex flex-wrap gap-4 text-sm">
                            {activity.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {activity.duration}
                              </div>
                            )}
                            {activity.distance && (
                              <div className="flex items-center gap-1">
                                <Compass className="h-4 w-4" />
                                {activity.distance}
                              </div>
                            )}
                            {activity.elevation && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                {activity.elevation}
                              </div>
                            )}
                            {activity.difficulty && (
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${getDifficultyColor(activity.difficulty)}`} />
                                <span className="capitalize">{activity.difficulty}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActivity(activity.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="hikes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiking Trails</CardTitle>
              <CardDescription>All planned hikes for your trip</CardDescription>
            </CardHeader>
            <CardContent>
              {hikes.length === 0 ? (
                <div className="p-12 text-center">
                  <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hikes planned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hikes.map((hike) => (
                    <div key={hike.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{hike.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {hike.day}
                          </Badge>
                        </div>
                        {hike.difficulty && (
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${getDifficultyColor(hike.difficulty)}`} />
                            <span className="text-sm capitalize">{hike.difficulty}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{hike.description}</p>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {hike.distance && (
                          <div>
                            <p className="text-muted-foreground">Distance</p>
                            <p className="font-medium">{hike.distance}</p>
                          </div>
                        )}
                        {hike.elevation && (
                          <div>
                            <p className="text-muted-foreground">Elevation Gain</p>
                            <p className="font-medium">{hike.elevation}</p>
                          </div>
                        )}
                        {hike.duration && (
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{hike.duration}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Activity or Hike</CardTitle>
              <CardDescription>Plan your outdoor activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-name">Activity Name</Label>
                  <Input
                    id="activity-name"
                    placeholder="e.g., Summit Trail"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-type">Type</Label>
                  <select
                    id="activity-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newActivity.type}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, type: e.target.value })
                    }
                  >
                    <option value="hike">Hike</option>
                    <option value="activity">Activity</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-day">Day</Label>
                  <Input
                    id="activity-day"
                    placeholder="e.g., Day 1"
                    value={newActivity.day}
                    onChange={(e) => setNewActivity({ ...newActivity, day: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-duration">Duration</Label>
                  <Input
                    id="activity-duration"
                    placeholder="e.g., 3 hours"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                  />
                </div>
              </div>

              {newActivity.type === 'hike' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newActivity.difficulty}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          difficulty: e.target.value,
                        })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance</Label>
                    <Input
                      id="distance"
                      placeholder="e.g., 5 miles"
                      value={newActivity.distance}
                      onChange={(e) => setNewActivity({ ...newActivity, distance: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="elevation">Elevation Gain</Label>
                    <Input
                      id="elevation"
                      placeholder="e.g., 1000 ft"
                      value={newActivity.elevation}
                      onChange={(e) => setNewActivity({ ...newActivity, elevation: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="activity-description">Description</Label>
                <Textarea
                  id="activity-description"
                  placeholder="Add details about this activity"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={3}
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
