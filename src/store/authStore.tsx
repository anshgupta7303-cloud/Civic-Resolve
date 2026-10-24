import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  quickSwitchUser: (role: UserRole) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; ward?: string; password?: string }) => Promise<void>;
}

const DEFAULT_CITIZEN: User = {
  id: 'usr-citizen-1',
  name: 'Sarah Jenkins',
  email: 'citizen@city.gov',
  phone: '+1 (555) 234-5678',
  ward: 'Ward 4',
  role: 'CITIZEN',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civic_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('civic_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('civic_user', JSON.stringify(user));
      localStorage.setItem('civic_auth_token', token);
    } else {
      localStorage.removeItem('civic_user');
      localStorage.removeItem('civic_auth_token');
      setToken(null);
    }
  }, [user, token]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone?: string;
    ward?: string;
    password?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const quickSwitchUser = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const emailMap: Record<UserRole, string> = {
        CITIZEN: 'citizen@city.gov',
        OFFICER: 'officer@city.gov',
        ADMIN: 'admin@city.gov',
      };
      await login(emailMap[role], 'password123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        quickSwitchUser,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
