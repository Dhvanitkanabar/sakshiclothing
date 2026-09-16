import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username?: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedAuth = localStorage.getItem('adminAuth');
        if (storedAuth === 'true') {
          const response = await axios.get(`${API_URL}/auth/me`, {
            withCredentials: true,
          });
          if (response.data.success && response.data.data.user) {
            const userData = response.data.data.user;
            setUser({
              _id: userData._id,
              name: userData.fullName,
              email: userData.email,
              role: userData.role
            });
          } else {
            localStorage.removeItem('adminAuth');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error);
        localStorage.removeItem('adminAuth');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (username?: string, password?: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin-login`, {
        email: username,
        password: password
      }, {
        withCredentials: true,
      });

      if (response.data.success && response.data.data.user) {
        const userData = response.data.data.user;
        setUser({
          _id: userData._id,
          name: userData.fullName,
          email: userData.email,
          role: userData.role
        });
        localStorage.setItem('adminAuth', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('adminAuth');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout 
    }}>
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
