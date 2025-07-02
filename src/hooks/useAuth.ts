// src/hooks/useAuth.ts
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'driver' | 'client' | 'guest';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: MockUser | null;
  isLoading: boolean;
  login: (role: UserRole) => void; // Simulate login with a specific role
  logout: () => void;
  switchRole: (newRole: UserRole) => void; // For debugging/testing roles
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for different roles
const mockUsers: Record<UserRole, MockUser> = {
  admin: { id: 'USR_ADMIN', name: 'Admin User', email: 'admin@logipilot.com', role: 'admin', avatarUrl: '/placeholder.svg' },
  manager: { id: 'USR_MANAGER', name: 'Manager Mike', email: 'manager@logipilot.com', role: 'manager', avatarUrl: '/placeholder.svg' },
  driver: { id: 'USR_DRIVER', name: 'Driver Dave', email: 'driver@logipilot.com', role: 'driver', avatarUrl: '/placeholder.svg' },
  client: { id: 'USR_CLIENT', name: 'Client Clara', email: 'client@logipilot.com', role: 'client', avatarUrl: '/placeholder.svg' },
  guest: { id: 'USR_GUEST', name: 'Guest User', email: 'guest@logipilot.com', role: 'guest' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null); // Start as logged out
  const [isLoading, setIsLoading] = useState(true); // Simulate initial auth check

  // Simulate initial auth check (e.g., checking localStorage or a token)
  useState(() => {
    setTimeout(() => {
      // For demo, log in as admin by default after a short delay
      // In a real app, you'd check for a stored session.
      const storedRole = localStorage.getItem('mockUserRole') as UserRole | null;
      if (storedRole && mockUsers[storedRole]) {
        setUser(mockUsers[storedRole]);
      } else {
        // Default to guest or a specific role if no stored role
         setUser(mockUsers.admin); // Default to admin for now
         localStorage.setItem('mockUserRole', 'admin');
      }
      setIsLoading(false);
    }, 500); // Simulate loading delay
  });

  const login = useCallback((role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      if (mockUsers[role]) {
        setUser(mockUsers[role]);
        localStorage.setItem('mockUserRole', role);
      } else {
        console.warn(`No mock user found for role: ${role}. Defaulting to guest.`);
        setUser(mockUsers.guest);
        localStorage.setItem('mockUserRole', 'guest');
      }
      setIsLoading(false);
    }, 300);
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      setUser(null);
      localStorage.removeItem('mockUserRole');
      // In a real app, you'd redirect to login page here or handle guest state
      // For this mock, let's default to guest on logout for continued app use
      setUser(mockUsers.guest);
      localStorage.setItem('mockUserRole', 'guest');
      setIsLoading(false);
    }, 300);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    if (mockUsers[newRole]) {
      setUser(mockUsers[newRole]);
      localStorage.setItem('mockUserRole', newRole);
      // Typically, you'd want to force a re-render or redirect if needed
      // window.location.reload(); // A bit heavy-handed, but ensures everything re-evaluates
    } else {
      console.warn(`Cannot switch to unknown role: ${newRole}`);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
