import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogin, useRegister, useGetProfile } from '../hooks';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { login: loginHook, loading: loginLoading, error: loginError } = useLogin();
  const { register: registerHook, loading: registerLoading, error: registerError } = useRegister();
  const { getProfile, loading: profileLoading } = useGetProfile();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify token by fetching profile
          const profileData = await getProfile();
          if (profileData) {
            setUser(profileData.user);
          }
        } catch (err) {
          console.error('Failed to restore auth state:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Listen for logout events from api-helper (401 responses)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (data: LoginRequest): Promise<boolean> => {
    setError(null);
    const response = await loginHook(data);

    if (response) {
      setUser(response.user);
      return true;
    }

    setError(loginError);
    return false;
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    setError(null);
    const response = await registerHook(data);

    if (response) {
      setUser(response.user);
      return true;
    }

    setError(registerError);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const refreshProfile = async () => {
    const profileData = await getProfile();
    if (profileData) {
      setUser(profileData.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading: loading || loginLoading || registerLoading || profileLoading,
        error: error || loginError || registerError,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
