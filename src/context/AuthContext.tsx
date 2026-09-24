import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Customer, Admin } from '../backend/types/index.ts';
import {
  getCurrentUser,
  setCurrentUser,
  authenticateCustomer,
  authenticateAdmin,
  logoutUser,
} from '../backend/services/bankService.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  loginCustomer: (email: string) => Promise<boolean>;
  loginAdmin: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUserRole: (role: 'customer' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((u) => {
        if (mounted) {
          setUser(u);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loginCustomer = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    const cust = await authenticateCustomer(email);
    setIsLoading(false);
    if (cust) {
      setUser(cust);
      return true;
    }
    return false;
  };

  const loginAdmin = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    const adm = await authenticateAdmin(email);
    setIsLoading(false);
    if (adm) {
      setUser(adm);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const switchUserRole = async (role: 'customer' | 'admin') => {
    if (role === 'customer') {
      await loginCustomer('alexander.sterling@royalbank.com');
    } else {
      await loginAdmin('admin@royalbank.com');
    }
  };

  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'compliance_officer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isCustomer,
        isAdmin,
        loginCustomer,
        loginAdmin,
        logout,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
