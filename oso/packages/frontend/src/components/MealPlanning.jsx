import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, X, ChefHat, ShoppingCart, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AIHelper } from './AIHelper';
import { useTripContext } from '../contexts/TripContext';

export function MealPlanning() {
  const { aiSuggestions } = useTripContext();
  const [meals, setMeals] = useState([
    {
      id: '1',
      day: 'Day 1',
      mealType: 'breakfast',
      name: 'Campfire Pancakes',
      ingredients: ['Pancake mix', 'Eggs', 'Milk', 'Butter', 'Maple syrup', 'Fresh berries'],
      notes: 'Pre-mix dry ingredients at home',
    },
    {
      id: '2',
      day: 'Day 1',
      mealType: 'dinner',
      name: 'Grilled Burgers',
      ingredients: ['Ground beef', 'Burger buns', 'Lettuce', 'Tomatoes', 'Cheese', 'Condiments'],
      notes: 'Season patties the night before',
    },
  ]);

  const [newMeal, setNewMeal] = useState({
    day: 'Day 1',
    mealType: 'breakfast',
    name: '',
    ingredients: '',
    notes: '',
  });

  const addMeal = () => {
    if (!newMeal.name) return;

    const meal = {
      id: Date.now().toString(),
      day: newMeal.day,
      mealType: newMeal.mealType,
      name: newMeal.name,
      ingredients: newMeal.ingredients.split(',').map((i) => i.trim()).filter(Boolean),
      notes: newMeal.notes,
    };

    setMeals([...meals, meal]);
    setNewMeal({
      day: 'Day 1',
      mealType: 'breakfast',
      name: '',
      ingredients: '',
      notes: '',
    });
  };

  const removeMeal = (id) => {
    setMeals(meals.filter((m) => m.id !== id));
  };

  const getAllIngredients = () => {
    const ingredientMap = new Map();

    meals.forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const lower = ingredient.toLowerCase();
        ingredientMap.set(lower, (ingredientMap.get(lower) || 0) + 1);
      });
    });

    return Array.from(ingredientMap.entries()).map(([ingredient, count]) => ({
      ingredient,
      count,
    }));
  };

  const groupMealsByDay = () => {
    const grouped = {};
    meals.forEach((meal) => {
      if (!grouped[meal.day]) {
        grouped[meal.day] = [];
      }
      grouped[meal.day].push(meal);
    });
    return grouped;
  };

  const mealsByDay = groupMealsByDay();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Meal Planning</h2>
        <p className="text-muted-foreground">Plan your camping meals and generate a shopping list</p>
      </div>

      {/* AI Suggestions */}
      <AIHelper
        title="AI Meal Suggestions"
        suggestions={aiSuggestions.meals || []}
      />

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
            Shopping List
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
            Object.entries(mealsByDay).map(([day, dayMeals]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                  <CardDescription>{dayMeals.length} meals planned</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dayMeals.map((meal) => (
                    <div key={meal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge>{meal.mealType}</Badge>
                            <h4 className="font-semibold">{meal.name}</h4>
                          </div>
                          {meal.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{meal.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMeal(meal.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Ingredients:</p>
                        <div className="flex flex-wrap gap-2">
                          {meal.ingredients.map((ingredient, idx) => (
                            <Badge key={idx} variant="outline">
                              {ingredient}
                            </Badge>
                          ))}
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
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    placeholder="e.g., Day 1"
                    value={newMeal.day}
                    onChange={(e) => setNewMeal({ ...newMeal, day: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal-type">Meal Type</Label>
                  <select
                    id="meal-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newMeal.mealType}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, mealType: e.target.value })
                    }
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  placeholder="e.g., Campfire Chili"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
                <Textarea
                  id="ingredients"
                  placeholder="e.g., Ground beef, Beans, Tomatoes, Onions"
                  value={newMeal.ingredients}
                  onChange={(e) => setNewMeal({ ...newMeal, ingredients: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Preparation tips or special instructions"
                  value={newMeal.notes}
                  onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                  rows={2}
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
              <CardDescription>All ingredients needed for your trip</CardDescription>
            </CardHeader>
            <CardContent>
              {getAllIngredients().length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Add meals to generate a shopping list</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getAllIngredients().map(({ ingredient, count }, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="capitalize">{ingredient}</span>
                      <Badge variant="secondary">Used in {count} meal(s)</Badge>
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
