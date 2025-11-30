import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { RegisterRequest, AuthResponse, ProfileResponse } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageBase64?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        apiService.setToken(savedToken);
      } catch {
        // If localStorage data is corrupted, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await apiService.login({
        email,
        password,
      });

      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        profileImageBase64: response.user.profileImageBase64,
      };

      setUser(userData);
      setToken(response.token);
      apiService.setToken(response.token);

      // Persist to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Fetch full profile data to get profile image
      try {
        const profileResponse: ProfileResponse = await apiService.get('/Profile');
        const updatedUser: User = {
          ...userData,
          profileImageBase64: profileResponse.profileImageBase64,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (profileError) {
        console.warn('Failed to fetch profile image:', profileError);
        // Continue without profile image
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await apiService.register(userData);

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        profileImageBase64: response.user.profileImageBase64,
      };

      setUser(user);
      setToken(response.token);
      apiService.setToken(response.token);

      // Persist to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));

      // Fetch full profile data to get profile image
      try {
        const profileResponse: ProfileResponse = await apiService.get('/Profile');
        const updatedUser: User = {
          ...user,
          profileImageBase64: profileResponse.profileImageBase64,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (profileError) {
        console.warn('Failed to fetch profile image:', profileError);
        // Continue without profile image
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    apiService.clearToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshProfile = async () => {
    try {
      const profileResponse: ProfileResponse = await apiService.get('/Profile');
      if (user) {
        const updatedUser: User = {
          ...user,
          firstName: profileResponse.firstName || user.firstName,
          lastName: profileResponse.secondName || user.lastName,
          profileImageBase64: profileResponse.profileImageBase64,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: !!token,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };

