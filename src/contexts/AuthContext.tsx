import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('promptneutral_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('promptneutral_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - simulates API call
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

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

      // Simulate login logic - check against stored users or use default credentials
      const storedUsers = getStoredUsers();
      const existingUser = storedUsers.find(u => u.email === email);

      if (existingUser) {
        // In a real app, you'd verify the password hash
        // For simulation, we'll accept any password for existing users
        const userData: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          createdAt: existingUser.createdAt
        };

        setUser(userData);
        localStorage.setItem('promptneutral_user', JSON.stringify(userData));
        return { success: true };
      } else {
        // For demo purposes, accept demo@promptneutral.com with password "demo123"
        if (email === 'demo@promptneutral.com' && password === 'demo123') {
          const userData: User = {
            id: 'demo-user-1',
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
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function - simulates API call
  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

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
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('promptneutral_user');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
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