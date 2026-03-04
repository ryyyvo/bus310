import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import osoLogo from '../assets/oso-logo.png';

export function LandingPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;
    if (isSignUp) {
      success = await register({ email, password, name });
      if (success) {
        toast.success('Account created successfully!');
      }
    } else {
      success = await login({ email, password });
      if (success) {
        toast.success('Welcome back!');
      }
    }

    if (!success && error) {
      toast.error(error.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#fcf6e9' }}>
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center mb-12">
            <img src={osoLogo} alt="oso Logo" className="h-32 mb-6" />
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#3d5a3d' }}>
              Plan Your Perfect Camping Adventure
            </h1>
            <p className="text-xl max-w-2xl" style={{ color: '#5c7a5c' }}>
              Everything you need for an unforgettable outdoor experience.
            </p>
          </div>

          {/* Auth Card */}
          <div className="flex justify-center mb-12">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
                <CardDescription>
                  {isSignUp
                    ? 'Sign up to start planning your camping adventures'
                    : 'Log in to continue your camping journey'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    style={{ backgroundColor: '#3d5a3d' }}
                    disabled={loading}
                  >
                    {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="font-semibold hover:underline"
                        style={{ color: '#3d5a3d' }}
                      >
                        Log in
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="font-semibold hover:underline"
                        style={{ color: '#3d5a3d' }}
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
