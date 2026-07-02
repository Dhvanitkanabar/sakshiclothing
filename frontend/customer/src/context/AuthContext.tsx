import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check current user session on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'omit', // We should include credentials but the API hasn't been started yet.
        });
        
        // Use 'include' when the backend is running to send the HttpOnly cookies automatically
        const realResponse = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // This is the crucial part for HttpOnly cookies
        });

        if (realResponse.ok) {
          const data = await realResponse.json();
          setUser(data.data.user);
        } else {
          // If unauthorized, the token is invalid or expired
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName: name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Register doesn't log you in directly in this flow, you may want to call login immediately
        // but for now we follow the API's behavior where you login after registering.
        toast.success('Account created successfully 🎉 Please login.');
        return true;
      } else {
        toast.error(data.message || 'Signup failed. Please try again.');
        return false;
      }
    } catch (error) {
      toast.error('Signup failed. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Receive HttpOnly cookies
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.data.user);
        toast.success('Welcome back 👋');
        return true;
      } else {
        toast.error(data.message || 'Invalid credentials ❌');
        return false;
      }
    } catch (error) {
      toast.error('Login failed. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Clear cookies
      });
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
