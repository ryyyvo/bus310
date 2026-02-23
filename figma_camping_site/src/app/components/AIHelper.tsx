import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles, CheckCircle } from 'lucide-react';

interface AIHelperProps {
  title: string;
  suggestions: string[];
  emptyMessage?: string;
}

export function AIHelper({ title, suggestions, emptyMessage }: AIHelperProps) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="bg-accent/10 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-accent" />
            {title}
          </CardTitle>
          <CardDescription>
            {emptyMessage || "Visit the AI Planner tab to get personalized suggestions for your trip!"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          {title}
        </CardTitle>
        <CardDescription>
          Based on your trip planning conversation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-sm">{suggestion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
