import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, X, ChefHat, ShoppingCart, Utensils, Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTripContext } from '../contexts/TripContext';
import { useUpdateFoodList } from '../hooks';
import { toast } from 'sonner';
import type { FoodItem } from '../types';

export function MealPlanning() {
  const { currentTrip, setCurrentTrip } = useTripContext();
  const [foodList, setFoodList] = useState<FoodItem[]>(currentTrip?.foodList || []);
  const [hasChanges, setHasChanges] = useState(false);

  const [newMeal, setNewMeal] = useState({
    item: '',
    meal: 'breakfast',
    day: 1,
    assignedTo: '',
  });

  const { updateFoodList, loading: saving } = useUpdateFoodList();

  // Update local state when trip changes
  useEffect(() => {
    if (currentTrip?.foodList) {
      setFoodList(currentTrip.foodList);
      setHasChanges(false);
    }
  }, [currentTrip]);

  const addMeal = () => {
    if (!newMeal.item) {
      toast.error('Please enter a meal item');
      return;
    }

    const meal: FoodItem = {
      item: newMeal.item,
      meal: newMeal.meal,
      day: newMeal.day,
      assignedTo: newMeal.assignedTo || undefined,
      purchased: false,
    };

    setFoodList([...foodList, meal]);
    setHasChanges(true);
    setNewMeal({
      item: '',
      meal: 'breakfast',
      day: 1,
      assignedTo: '',
    });
  };

  const removeMeal = (index: number) => {
    setFoodList(foodList.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const togglePurchased = (index: number) => {
    const updated = [...foodList];
    updated[index] = { ...updated[index], purchased: !updated[index].purchased };
    setFoodList(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentTrip) {
      toast.error('No trip selected. Please create a trip first.');
      return;
    }

    const updatedTrip = await updateFoodList(currentTrip._id, foodList);

    if (updatedTrip) {
      setCurrentTrip(updatedTrip);
      setHasChanges(false);
      toast.success('Food list saved successfully');
    } else {
      toast.error('Failed to save food list');
    }
  };

  const groupMealsByDay = () => {
    const grouped: { [key: number]: FoodItem[] } = {};
    foodList.forEach((meal) => {
      const day = meal.day || 1;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(meal);
    });
    return grouped;
  };

  const getShoppingList = () => {
    return foodList.filter((item) => !item.purchased);
  };

  const mealsByDay = groupMealsByDay();

  if (!currentTrip) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Meal Planning</h2>
          <p className="text-muted-foreground">Plan your camping meals and generate a shopping list</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
          <h2 className="text-2xl font-semibold mb-2">Meal Planning</h2>
          <p className="text-muted-foreground">
            Planning meals for: <strong>{currentTrip.name}</strong>
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

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meals">
            <Utensils className="h-4 w-4 mr-2" />
            Meal Plan
          </TabsTrigger>
          <TabsTrigger value="add">
            <ChefHat className="h-4 w-4 mr-2" />
            Add Meal
          </TabsTrigger>
          <TabsTrigger value="shopping">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Shopping List ({getShoppingList().length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          {Object.keys(mealsByDay).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No meals planned yet. Add your first meal!</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(mealsByDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, dayMeals]) => (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle>Day {day}</CardTitle>
                    <CardDescription>{dayMeals.length} meals planned</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dayMeals.map((meal, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="capitalize">{meal.meal}</Badge>
                              <h4 className="font-semibold">{meal.item}</h4>
                              {meal.purchased && (
                                <Badge variant="outline">✓ Purchased</Badge>
                              )}
                            </div>
                            {meal.assignedTo && (
                              <p className="text-sm text-muted-foreground">
                                Assigned to: {meal.assignedTo}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePurchased(foodList.indexOf(meal))}
                            >
                              {meal.purchased ? 'Unpurchase' : 'Mark Purchased'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMeal(foodList.indexOf(meal))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Meal</CardTitle>
              <CardDescription>Plan your camping meals ahead of time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meal-type">Meal Type</Label>
                  <select
                    id="meal-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newMeal.meal}
                    onChange={(e) => setNewMeal({ ...newMeal, meal: e.target.value })}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    type="number"
                    min="1"
                    value={newMeal.day}
                    onChange={(e) => setNewMeal({ ...newMeal, day: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal-item">Meal / Food Item</Label>
                <Input
                  id="meal-item"
                  placeholder="e.g., Campfire Chili, Granola Bars"
                  value={newMeal.item}
                  onChange={(e) => setNewMeal({ ...newMeal, item: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned-to">Assigned To (optional)</Label>
                <Input
                  id="assigned-to"
                  placeholder="Person responsible for this meal"
                  value={newMeal.assignedTo}
                  onChange={(e) => setNewMeal({ ...newMeal, assignedTo: e.target.value })}
                />
              </div>

              <Button onClick={addMeal} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle>Shopping List</CardTitle>
              <CardDescription>Items that still need to be purchased</CardDescription>
            </CardHeader>
            <CardContent>
              {getShoppingList().length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {foodList.length === 0
                      ? 'Add meals to generate a shopping list'
                      : 'All items have been purchased!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getShoppingList().map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{item.item}</span>
                        <div className="text-sm text-muted-foreground">
                          Day {item.day} • {item.meal}
                          {item.assignedTo && ` • Assigned to: ${item.assignedTo}`}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePurchased(foodList.indexOf(item))}
                      >
                        Mark Purchased
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
