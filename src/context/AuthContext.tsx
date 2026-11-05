import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  loginAsDemo: (targetRole: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'customer',
  isAuthenticated: false,
  login: async () => {},
  loginAsDemo: async () => {},
  logout: () => {},
  switchRole: () => {},
});

// Demo accounts for instant one-click testing
const DEMO_USERS: Record<UserRole, { email: string; pass: string }> = {
  customer: { email: 'customer@quickbasket.com', pass: 'cust123' },
  delivery: { email: 'delivery@quickbasket.com', pass: 'rider123' },
  admin: { email: 'admin@quickbasket.com', pass: 'admin123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('qb_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to Priya Sundaram (Customer)
    return {
      id: 'usr_cust_1',
      name: 'Priya Sundaram',
      email: 'customer@quickbasket.com',
      role: 'customer',
      phone: '+91 99440 88990',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('qb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('qb_user');
    }
  }, [user]);

  const login = async (email: string, pass: string, reqRole?: string) => {
    const res = await api.login(email, pass, reqRole);
    setUser(res.user);
  };

  const loginAsDemo = async (targetRole: UserRole) => {
    const cred = DEMO_USERS[targetRole];
    const res = await api.login(cred.email, cred.pass, targetRole);
    setUser(res.user);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = async (newRole: UserRole) => {
    await loginAsDemo(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
