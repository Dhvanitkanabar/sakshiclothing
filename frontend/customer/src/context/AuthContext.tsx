import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { User } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  loading: boolean;
  getClerkToken: () => Promise<string | null>;
  login: (email?: string, password?: string) => Promise<boolean>;
  signup: (name?: string, email?: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut, getToken } = useClerkAuth();
  const clerk = useClerk();
  
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      setUser(null);
      return;
    }

    // ✅ IMMEDIATELY build user from Clerk data — no backend wait, zero delay
    const clerkDerivedUser: User = {
      _id: clerkUser.id,
      clerkUserId: clerkUser.id,
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      avatar: clerkUser.imageUrl ? { url: clerkUser.imageUrl } : undefined,
      role: 'user',
      isActive: true,
      isBlocked: false,
    };
    setUser(clerkDerivedUser);

    // 🔄 Sync with backend to check block status and extra details
    const syncWithBackend = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const dbUser = data.data?.user;
          if (dbUser?.isBlocked || dbUser?.isActive === false) {
            toast.error(dbUser?.isBlocked ? 'Your account has been blocked by administrator.' : 'Your account is deactivated.');
            await signOut();
            setUser(null);
            window.location.href = 'https://google.com';
            return;
          }
          // Merge backend data with clerk data
          setUser(prev => prev ? { ...prev, ...dbUser } : dbUser);
        } else if (response.status === 403) {
          toast.error('Access denied. Your account is blocked or inactive.');
          await signOut();
          setUser(null);
          window.location.href = 'https://google.com';
        }
      } catch {
        // Silently fail — Clerk data is set above
      }
    };

    syncWithBackend();
  }, [isLoaded, isSignedIn, clerkUser]);

  const login = async (email?: string): Promise<boolean> => {
    clerk.openSignIn({
      initialValues: email ? { emailAddress: email } : undefined,
    });
    return true;
  };

  const signup = async (_name?: string, email?: string): Promise<boolean> => {
    clerk.openSignUp({
      initialValues: email ? { emailAddress: email } : undefined,
    });
    return true;
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success('Logged out successfully');
    } catch {
      toast.error('Error logging out');
    }
  };

  const getClerkToken = async () => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  };

  // loading = true only while Clerk itself is loading (usually <300ms)
  const loading = !isLoaded;

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!isSignedIn, loading, getClerkToken, login, signup, logout }}>
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
