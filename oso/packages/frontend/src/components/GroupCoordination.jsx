import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, Mail, UserPlus, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AIHelper } from './AIHelper';
import { useTripContext } from '../contexts/TripContext';

export function GroupCoordination() {
  const { aiSuggestions } = useTripContext();
  const [members, setMembers] = useState([
    {
      id: '1',
      name: 'You',
      email: 'you@example.com',
      role: 'organizer',
      status: 'confirmed',
      responsibilities: ['Site booking', 'Route planning'],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'member',
      status: 'confirmed',
      responsibilities: ['Meal planning'],
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'member',
      status: 'pending',
      responsibilities: ['Equipment coordinator'],
    },
  ]);

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Book campsite', assignedTo: 'You', completed: true },
    { id: '2', title: 'Plan meals', assignedTo: 'Sarah Johnson', completed: false },
    { id: '3', title: 'Check equipment', assignedTo: 'Mike Chen', completed: false },
    { id: '4', title: 'Get camping permits', assignedTo: 'You', completed: false },
  ]);

  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [newTask, setNewTask] = useState({ title: '', assignedTo: 'You' });

  const addMember = () => {
    if (!newMember.name || !newMember.email) return;

    const member = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: 'member',
      status: 'pending',
      responsibilities: [],
    };

    setMembers([...members, member]);
    setNewMember({ name: '', email: '' });
  };

  const addTask = () => {
    if (!newTask.title) return;

    const task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignedTo: newTask.assignedTo,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', assignedTo: 'You' });
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Group Coordination</h2>
        <p className="text-muted-foreground">Manage your camping group and assign responsibilities</p>
      </div>

      {/* AI Suggestions */}
      <AIHelper
        title="AI Group Coordination Tips"
        suggestions={aiSuggestions.group || []}
      />

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            <UserPlus className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Check className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invite Member</CardTitle>
              <CardDescription>Add people to your camping trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member-name">Name</Label>
                  <Input
                    id="member-name"
                    placeholder="Enter name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="email@example.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={addMember} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Group Members ({members.length})</CardTitle>
              <CardDescription>
                {members.filter((m) => m.status === 'confirmed').length} confirmed,{' '}
                {members.filter((m) => m.status === 'pending').length} pending
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <Avatar>
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{member.name}</h4>
                      {member.role === 'organizer' && (
                        <Badge variant="default">Organizer</Badge>
                      )}
                      <Badge variant={member.status === 'confirmed' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                    {member.responsibilities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {member.responsibilities.map((resp, idx) => (
                          <Badge key={idx} variant="outline">
                            {resp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Task</CardTitle>
              <CardDescription>Assign tasks to group members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task</Label>
                  <Input
                    id="task-title"
                    placeholder="e.g., Bring firewood"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned-to">Assign To</Label>
                  <select
                    id="assigned-to"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={addTask} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
              <CardDescription>
                {tasks.filter((t) => t.completed).length} of {tasks.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.length === 0 ? (
                <div className="p-12 text-center">
                  <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tasks yet. Add your first task!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <Button
                      variant={task.completed ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTask(task.id)}
                      className="shrink-0"
                    >
                      {task.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <p
                        className={
                          task.completed ? 'line-through text-muted-foreground' : 'font-medium'
                        }
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">Assigned to: {task.assignedTo}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
