import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isEnabled as socialAuthEnabled, loginWithPopup } from '../services/socialAuth';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider?: 'password' | 'google' | 'github' | 'linkedin';
  subscription: 'free' | 'premium' | 'enterprise';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    autoSave: boolean;
    notifications: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'github' | 'linkedin', profile?: Partial<User>) => Promise<void>;
  socialRegister: (provider: 'google' | 'github' | 'linkedin', profile?: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('ai-humanizer-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
          lastLogin: new Date(userData.lastLogin)
        });
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('ai-humanizer-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        authProvider: 'password',
        subscription: 'free',
        preferences: {
          theme: 'light',
          language: 'en',
          autoSave: true,
          notifications: true
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };

      setUser(newUser);
      localStorage.setItem('ai-humanizer-user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with real registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        authProvider: 'password',
        subscription: 'free',
        preferences: {
          theme: 'light',
          language: 'en',
          autoSave: true,
          notifications: true
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };

      setUser(newUser);
      localStorage.setItem('ai-humanizer-user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

      const socialLogin = async (
    provider: 'google' | 'github' | 'linkedin',
    profile?: Partial<User>
  ): Promise<void> => {
    setIsLoading(true);
    try {
      if (provider === 'linkedin') {
        throw new Error('LinkedIn login is not supported in current setup');
      }
      if (!socialAuthEnabled()) {
        throw new Error('Social login is not configured');
      }

      const p = await loginWithPopup(provider);

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: p.email,
        name: p.name,
        avatar: p.avatar,
        authProvider: provider,
        subscription: 'free',
        preferences: {
          theme: 'light',
          language: 'en',
          autoSave: true,
          notifications: true,
        },
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      setUser(newUser);
      localStorage.setItem('ai-humanizer-user', JSON.stringify(newUser));
    } catch (error) {
      const msg = (error as Error)?.message || 'Social login failed';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const socialRegister = async (
    provider: 'google' | 'github' | 'linkedin',
    profile?: Partial<User>
  ): Promise<void> => {
    // For this simulated flow, registration is identical to social login
    return socialLogin(provider, profile);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai-humanizer-user');
    try { sessionStorage.removeItem('ai_humanizer_session_acknowledged'); } catch {}
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('ai-humanizer-user', JSON.stringify(updatedUser));
    }
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (user) {
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...preferences }
      };
      setUser(updatedUser);
      localStorage.setItem('ai-humanizer-user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    socialLogin,
    socialRegister,
    logout,
    updateUser,
    updatePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



