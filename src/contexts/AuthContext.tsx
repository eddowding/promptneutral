import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { ConfigService } from '../services/config';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  session: SupabaseSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isSupabaseAvailable: boolean;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to our User type
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    // Try to get profile data
    if (supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', supabaseUser.id)
        .single();

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.full_name || supabaseUser.user_metadata?.full_name || 'User',
        createdAt: supabaseUser.created_at || new Date().toISOString()
      };
    }

    // Fallback for when Supabase is not available
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || 'User',
      createdAt: supabaseUser.created_at || new Date().toISOString()
    };
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      // Always check localStorage first, regardless of Supabase configuration
      try {
        const storedUser = localStorage.getItem('promptneutral_user');
        console.log('AuthContext: Checking localStorage for user:', storedUser ? 'Found' : 'Not found');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('AuthContext: Restoring user from localStorage:', userData);
          setUser(userData);
          // Set user ID in config service for API key retrieval
          console.log('AuthContext: Setting ConfigService user ID:', userData.id);
          ConfigService.getInstance().setUserId(userData.id);
          console.log('AuthContext: ConfigService user ID set successfully');
          setIsLoading(false);
          return; // Exit early if we have a stored user
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('promptneutral_user');
      }

      // Only proceed with Supabase if no localStorage user was found
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          const userData = await convertSupabaseUser(session.user);
          setUser(userData);
          setSession(session);
          // Set user ID in config service for API key retrieval
          ConfigService.getInstance().setUserId(userData.id);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            // Don't interfere if we have a localStorage user
            const storedUser = localStorage.getItem('promptneutral_user');
            if (storedUser) {
              console.log('AuthContext: Ignoring Supabase auth change due to localStorage user');
              return;
            }
            
            if (session?.user) {
              const userData = await convertSupabaseUser(session.user);
              setUser(userData);
              setSession(session);
              // Set user ID in config service for API key retrieval
              ConfigService.getInstance().setUserId(userData.id);
            } else {
              setUser(null);
              setSession(null);
              ConfigService.getInstance().setUserId('');
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Check for demo credentials first
      if (email === 'demo@promptneutral.com' && password === 'demo123') {
        const userData: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'demo@promptneutral.com',
          name: 'Demo User',
          createdAt: new Date().toISOString()
        };

        setUser(userData);
        localStorage.setItem('promptneutral_user', JSON.stringify(userData));
        return { success: true };
      }

      // Use Supabase if available, otherwise fall back to mock authentication
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const userData = await convertSupabaseUser(data.user);
          setUser(userData);
          // Set user ID in config service for API key retrieval
          ConfigService.getInstance().setUserId(userData.id);
          return { success: true };
        }

        return { success: false, error: 'Authentication failed' };
      } else {
        // Fall back to localStorage mock authentication
        return await mockLogin(email, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Validation
      if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      if (name.trim().length < 2) {
        return { success: false, error: 'Name must be at least 2 characters' };
      }

      // Use Supabase if available, otherwise fall back to mock authentication
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            data: {
              full_name: name.trim()
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Note: User might need to confirm email before they can login
          if (!data.session) {
            return { 
              success: true, 
              error: 'Please check your email to confirm your account before logging in.' 
            };
          }

          const userData = await convertSupabaseUser(data.user);
          setUser(userData);
          return { success: true };
        }

        return { success: false, error: 'Registration failed' };
      } else {
        // Fall back to localStorage mock authentication
        return await mockSignup(email, password, name);
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } else {
      // Clear localStorage for mock authentication
      localStorage.removeItem('promptneutral_user');
    }
    
    setUser(null);
    setSession(null);
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return { success: false, error: 'Password reset is not available in demo mode' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  // Mock authentication functions (fallback when Supabase is not configured)
  const mockLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate login logic - check against stored users or use default credentials
    const storedUsers = getStoredUsers();
    const existingUser = storedUsers.find(u => u.email === email);

    if (existingUser) {
      const userData: User = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        createdAt: existingUser.createdAt
      };

      setUser(userData);
      localStorage.setItem('promptneutral_user', JSON.stringify(userData));
      // Set user ID in config service for API key retrieval
      ConfigService.getInstance().setUserId(userData.id);
      return { success: true };
    } else {
      // For demo purposes, accept demo@promptneutral.com with password "demo123"
      if (email === 'demo@promptneutral.com' && password === 'demo123') {
        const userData: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'demo@promptneutral.com',
          name: 'Demo User',
          createdAt: new Date().toISOString()
        };

        setUser(userData);
        localStorage.setItem('promptneutral_user', JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: 'Invalid email or password' };
    }
  };

  const mockSignup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const storedUsers = getStoredUsers();
    const existingUser = storedUsers.find(u => u.email === email);

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Create new user
    const userData: User = {
      id: generateUserId(),
      email: email.toLowerCase(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    // Store in localStorage (simulating database)
    const updatedUsers = [...storedUsers, userData];
    localStorage.setItem('promptneutral_users', JSON.stringify(updatedUsers));

    // Set current user
    setUser(userData);
    localStorage.setItem('promptneutral_user', JSON.stringify(userData));

    return { success: true };
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    signup,
    resetPassword,
    logout,
    isAuthenticated: !!user,
    isSupabaseAvailable: isSupabaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('promptneutral_users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};