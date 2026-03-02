import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, Mail, UserPlus, Users, Package, Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTripContext } from '../contexts/TripContext';
import { useAddCollaborator, useUpdateGearList } from '../hooks';
import { toast } from 'sonner';
import type { GearItem } from '../types';

export function GroupCoordination() {
  const { currentTrip, setCurrentTrip, userId } = useTripContext();
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [gearList, setGearList] = useState<GearItem[]>(currentTrip?.gearList || []);
  const [hasGearChanges, setHasGearChanges] = useState(false);

  const [newGear, setNewGear] = useState({
    item: '',
    quantity: 1,
    category: 'camping',
    assignedTo: '',
  });

  const { addCollaborator, loading: addingCollaborator } = useAddCollaborator();
  const { updateGearList, loading: savingGear } = useUpdateGearList();

  // Update local state when trip changes
  useEffect(() => {
    if (currentTrip?.gearList) {
      setGearList(currentTrip.gearList);
      setHasGearChanges(false);
    }
  }, [currentTrip]);

  const handleAddCollaborator = async () => {
    if (!currentTrip) {
      toast.error('No trip selected. Please create a trip first.');
      return;
    }

    if (!collaboratorEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // In a real app, this would be a user ID from the backend
    // For now, we'll use the email as the ID
    const updatedTrip = await addCollaborator(currentTrip._id, collaboratorEmail);

    if (updatedTrip) {
      setCurrentTrip(updatedTrip);
      setCollaboratorEmail('');
      toast.success('Collaborator added successfully');
    } else {
      toast.error('Failed to add collaborator');
    }
  };

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
    setHasGearChanges(true);
    setNewGear({
      item: '',
      quantity: 1,
      category: 'camping',
      assignedTo: '',
    });
  };

  const removeGearItem = (index: number) => {
    setGearList(gearList.filter((_, i) => i !== index));
    setHasGearChanges(true);
  };

  const togglePurchased = (index: number) => {
    const updated = [...gearList];
    updated[index] = { ...updated[index], purchased: !updated[index].purchased };
    setGearList(updated);
    setHasGearChanges(true);
  };

  const handleSaveGear = async () => {
    if (!currentTrip) {
      toast.error('No trip selected. Please create a trip first.');
      return;
    }

    const updatedTrip = await updateGearList(currentTrip._id, gearList);

    if (updatedTrip) {
      setCurrentTrip(updatedTrip);
      setHasGearChanges(false);
      toast.success('Gear list saved successfully');
    } else {
      toast.error('Failed to save gear list');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const groupGearByCategory = () => {
    const grouped: { [key: string]: GearItem[] } = {};
    gearList.forEach((item) => {
      const category = item.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const gearByCategory = groupGearByCategory();

  if (!currentTrip) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Group Coordination</h2>
          <p className="text-muted-foreground">Manage your camping group and gear assignments</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No trip selected. Please create a trip from the Site Booking tab first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = currentTrip.owner === userId;
  const collaborators = currentTrip.collaborators || [];
  const allMembers = [currentTrip.owner, ...collaborators];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Group Coordination</h2>
        <p className="text-muted-foreground">
          Managing group for: <strong>{currentTrip.name}</strong>
        </p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            <UserPlus className="h-4 w-4 mr-2" />
            Members ({allMembers.length})
          </TabsTrigger>
          <TabsTrigger value="gear">
            <Package className="h-4 w-4 mr-2" />
            Gear ({gearList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Invite Collaborator</CardTitle>
                <CardDescription>Add people to help plan this trip</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="collaborator-email">Email or User ID</Label>
                    <Input
                      id="collaborator-email"
                      type="text"
                      placeholder="user@example.com or user-id"
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCollaborator} disabled={addingCollaborator}>
                      {addingCollaborator ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Trip Members</CardTitle>
              <CardDescription>
                {allMembers.length} {allMembers.length === 1 ? 'person' : 'people'} on this trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Owner */}
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <Avatar>
                  <AvatarFallback>{getInitials(currentTrip.owner)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{currentTrip.owner}</h4>
                    <Badge variant="default">Owner</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Trip organizer</p>
                </div>
              </div>

              {/* Collaborators */}
              {collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>{getInitials(collaborator)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{collaborator}</h4>
                      <Badge variant="outline">Collaborator</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Can edit trip details</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gear" className="space-y-4">
          {hasGearChanges && (
            <div className="flex justify-end">
              <Button onClick={handleSaveGear} disabled={savingGear}>
                {savingGear ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add Gear Item</CardTitle>
              <CardDescription>Keep track of camping equipment and supplies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gear-item">Item</Label>
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
                    onChange={(e) =>
                      setNewGear({ ...newGear, quantity: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newGear.category}
                    onChange={(e) => setNewGear({ ...newGear, category: e.target.value })}
                  >
                    <option value="camping">Camping</option>
                    <option value="cooking">Cooking</option>
                    <option value="hiking">Hiking</option>
                    <option value="clothing">Clothing</option>
                    <option value="safety">Safety</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned">Assigned To (optional)</Label>
                  <Input
                    id="assigned"
                    placeholder="Who will bring this?"
                    value={newGear.assignedTo}
                    onChange={(e) => setNewGear({ ...newGear, assignedTo: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={addGearItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Gear
              </Button>
            </CardContent>
          </Card>

          {/* Gear List by Category */}
          {Object.keys(gearByCategory).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No gear added yet. Start building your packing list!</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(gearByCategory).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category}</CardTitle>
                  <CardDescription>{items.length} items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.item}</span>
                          {item.quantity && item.quantity > 1 && (
                            <Badge variant="outline">x{item.quantity}</Badge>
                          )}
                          {item.purchased && <Badge variant="outline">✓ Purchased</Badge>}
                        </div>
                        {item.assignedTo && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Assigned to: {item.assignedTo}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePurchased(gearList.indexOf(item))}
                        >
                          {item.purchased ? 'Unpurchase' : 'Mark Purchased'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGearItem(gearList.indexOf(item))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
