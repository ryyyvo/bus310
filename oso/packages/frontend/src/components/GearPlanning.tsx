import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, X, Backpack, Save, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTripContext } from '../contexts/TripContext';
import { useUpdateGearList, useGenerateGearList } from '../hooks';
import { toast } from 'sonner';
import type { GearItem } from '../types';

export function GearPlanning() {
  const { currentTrip, setCurrentTrip } = useTripContext();
  const [gearList, setGearList] = useState<GearItem[]>(currentTrip?.gearList || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiParams, setAiParams] = useState({
    numberOfDays: 3,
    numberOfPeople: 4,
    campingStyle: 'car camping',
    weather: 'mild',
    activities: '',
  });

  const [newGear, setNewGear] = useState({
    item: '',
    quantity: 1,
    category: 'Shelter',
    assignedTo: '',
  });

  const { updateGearList, loading: saving } = useUpdateGearList();
  const { generateGearList, loading: generating } = useGenerateGearList();

  // Update local state when trip changes
  useEffect(() => {
    if (currentTrip) {
      setGearList(currentTrip.gearList || []);
      setHasChanges(false);
    } else {
      setGearList([]);
      setHasChanges(false);
    }
  }, [currentTrip?._id]); // Only re-run when trip ID changes, not on every trip update

  const addGearItem = () => {
    if (!newGear.item) {
      toast.error('Please enter a gear item');
      return;
    }

    const gear: GearItem = {
      item: newGear.item,
      quantity: newGear.quantity,
      category: newGear.category,
      assignedTo: newGear.assignedTo || undefined,
      purchased: false,
    };

    setGearList([...gearList, gear]);
    setHasChanges(true);
    setNewGear({
      item: '',
      quantity: 1,
      category: 'Shelter',
      assignedTo: '',
    });
  };

  const removeGearItem = (index: number) => {
    setGearList(gearList.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const togglePurchased = (index: number) => {
    const updated = [...gearList];
    updated[index] = { ...updated[index], purchased: !updated[index].purchased };
    setGearList(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentTrip) {
      toast.error('No trip selected. Please create a trip first.');
      return;
    }

    const updatedTrip = await updateGearList(currentTrip._id, gearList);

    if (updatedTrip) {
      setCurrentTrip(updatedTrip);
      setHasChanges(false);
      toast.success('Gear list saved successfully');
    } else {
      toast.error('Failed to save gear list');
    }
  };

  const handleGenerateAI = async () => {
    if (!currentTrip) {
      toast.error('No trip selected. Please create a trip first.');
      return;
    }

    const activities = aiParams.activities
      ? aiParams.activities.split(',').map(s => s.trim())
      : [];

    const response = await generateGearList({
      numberOfDays: aiParams.numberOfDays,
      numberOfPeople: aiParams.numberOfPeople,
      campingStyle: aiParams.campingStyle,
      weather: aiParams.weather,
      activities,
    });

    if (response) {
      setGearList(response.gearList);
      setShowAIGenerator(false);
      toast.success(`Generated gear list for ${aiParams.numberOfDays}-day ${aiParams.campingStyle} trip!`);

      // Auto-save to database
      const updatedTrip = await updateGearList(currentTrip._id, response.gearList);
      if (updatedTrip) {
        setCurrentTrip(updatedTrip);
        setHasChanges(false);
        toast.success('Gear list saved to your trip!');
      } else {
        setHasChanges(true);
        toast.error('Generated gear list but failed to save. Click "Save Changes" to retry.');
      }
    } else {
      toast.error('Failed to generate gear list');
    }
  };

  const groupGearByCategory = () => {
    const grouped: { [key: string]: GearItem[] } = {};
    gearList.forEach((gear) => {
      const category = gear.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(gear);
    });
    return grouped;
  };

  const getShoppingList = () => {
    return gearList.filter((item) => !item.purchased);
  };

  const gearByCategory = groupGearByCategory();

  if (!currentTrip) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Gear Planning</h2>
          <p className="text-muted-foreground">Plan your camping gear and create a packing list</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Backpack className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
          <h2 className="text-2xl font-semibold mb-2">Gear Planning</h2>
          <p className="text-muted-foreground">
            Planning gear for: <strong>{currentTrip.name}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            disabled={generating}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generator
          </Button>
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
      </div>

      {/* AI Generator Card */}
      {showAIGenerator && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Gear List Generator
            </CardTitle>
            <CardDescription>
              Provide trip details and let AI generate a complete gear list for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai-days">Number of Days</Label>
                <Input
                  id="ai-days"
                  type="number"
                  min="1"
                  max="14"
                  value={aiParams.numberOfDays}
                  onChange={(e) => setAiParams({ ...aiParams, numberOfDays: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-people">Number of People</Label>
                <Input
                  id="ai-people"
                  type="number"
                  min="1"
                  max="20"
                  value={aiParams.numberOfPeople}
                  onChange={(e) => setAiParams({ ...aiParams, numberOfPeople: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-camping-style">Camping Style</Label>
              <select
                id="ai-camping-style"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={aiParams.campingStyle}
                onChange={(e) => setAiParams({ ...aiParams, campingStyle: e.target.value })}
              >
                <option value="car camping">Car Camping</option>
                <option value="backpacking">Backpacking</option>
                <option value="rv camping">RV Camping</option>
                <option value="glamping">Glamping</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-weather">Weather Conditions</Label>
              <select
                id="ai-weather"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={aiParams.weather}
                onChange={(e) => setAiParams({ ...aiParams, weather: e.target.value })}
              >
                <option value="mild">Mild</option>
                <option value="hot">Hot</option>
                <option value="cold">Cold</option>
                <option value="rainy">Rainy</option>
                <option value="snowy">Snowy</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-activities">Planned Activities (comma-separated)</Label>
              <Input
                id="ai-activities"
                placeholder="e.g., hiking, fishing, swimming"
                value={aiParams.activities}
                onChange={(e) => setAiParams({ ...aiParams, activities: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerateAI} disabled={generating} className="flex-1">
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Gear List
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setShowAIGenerator(false)}>
                Cancel
              </Button>
            </div>
            {gearList.length > 0 && (
              <p className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                ⚠️ Generating a new list will replace your current gear list
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="gear" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gear">
            <Backpack className="h-4 w-4 mr-2" />
            Gear List
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </TabsTrigger>
          <TabsTrigger value="shopping">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            To Pack ({getShoppingList().length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gear" className="space-y-4">
          {Object.keys(gearByCategory).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Backpack className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No gear items yet. Add your first item or use AI generator!</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(gearByCategory).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>{items.length} items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((gear, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{gear.item}</span>
                          {gear.quantity && (
                            <Badge variant="outline">
                              {typeof gear.quantity === 'number' && gear.quantity > 1 ? `x${gear.quantity}` : gear.quantity}
                            </Badge>
                          )}
                          {gear.purchased && (
                            <Badge variant="outline">✓ Packed</Badge>
                          )}
                        </div>
                        {gear.notes && (
                          <p className="text-sm text-muted-foreground">
                            {gear.notes}
                          </p>
                        )}
                        {gear.assignedTo && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {gear.assignedTo}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePurchased(gearList.indexOf(gear))}
                        >
                          {gear.purchased ? 'Unpack' : 'Mark Packed'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGearItem(gearList.indexOf(gear))}
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

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Gear Item</CardTitle>
              <CardDescription>Add essential gear items to your packing list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gear-item">Item Name</Label>
                  <Input
                    id="gear-item"
                    placeholder="e.g., Tent, Sleeping Bag"
                    value={newGear.item}
                    onChange={(e) => setNewGear({ ...newGear, item: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newGear.quantity}
                    onChange={(e) => setNewGear({ ...newGear, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newGear.category}
                  onChange={(e) => setNewGear({ ...newGear, category: e.target.value })}
                >
                  <option value="Shelter">Shelter</option>
                  <option value="Sleep System">Sleep System</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Safety">Safety</option>
                  <option value="Tools">Tools</option>
                  <option value="Hygiene">Hygiene</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gear-assigned-to">Assigned To (optional)</Label>
                <Input
                  id="gear-assigned-to"
                  placeholder="Person responsible for bringing this item"
                  value={newGear.assignedTo}
                  onChange={(e) => setNewGear({ ...newGear, assignedTo: e.target.value })}
                />
              </div>

              <Button onClick={addGearItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Gear Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle>Items to Pack</CardTitle>
              <CardDescription>Items that still need to be packed</CardDescription>
            </CardHeader>
            <CardContent>
              {getShoppingList().length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {gearList.length === 0
                      ? 'Add gear items to create a packing list'
                      : 'All items have been packed!'}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{item.item}</span>
                          {item.quantity && (
                            <Badge variant="outline">
                              {typeof item.quantity === 'number' && item.quantity > 1 ? `x${item.quantity}` : item.quantity}
                            </Badge>
                          )}
                          <Badge className="capitalize">{item.category}</Badge>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                        {item.assignedTo && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {item.assignedTo}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePurchased(gearList.indexOf(item))}
                      >
                        Mark Packed
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
