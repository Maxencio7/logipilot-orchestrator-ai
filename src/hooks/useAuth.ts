// src/hooks/useAuth.ts
import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react'; // Added useEffect
import apiService from '@/api/apiService'; // Import apiService
import { ApiResponse, MockUser as UserType } from '@/types'; // Use UserType from types

export type UserRole = 'admin' | 'manager' | 'driver' | 'client' | 'guest';

// No longer need local MockUser, UserType from @/types is used.

interface AuthContextType {
  user: UserType | null;
  isLoading: boolean;
  login: (credentials: {email: string, password: string}) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for different roles - should use UserType
const mockUsers: Record<UserRole, UserType> = {
  admin: { id: 'USR_ADMIN', name: 'Admin User', email: 'admin@logipilot.com', role: 'admin', avatarUrl: '/placeholder.svg' },
  manager: { id: 'USR_MANAGER', name: 'Manager Mike', email: 'manager@logipilot.com', role: 'manager', avatarUrl: '/placeholder.svg' },
  driver: { id: 'USR_DRIVER', name: 'Driver Dave', email: 'driver@logipilot.com', role: 'driver', avatarUrl: '/placeholder.svg' },
  client: { id: 'USR_CLIENT', name: 'Client Clara', email: 'client@logipilot.com', role: 'client', avatarUrl: '/placeholder.svg' },
  guest: { id: 'USR_GUEST', name: 'Guest User', email: 'guest@logipilot.com', role: 'guest', avatarUrl: undefined }, // Ensure all fields match UserType
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for initial authentication check
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // No need to set Authorization header here, apiService interceptor does it
          const response = await apiService.get<ApiResponse<UserType>>('/users/me');
          if (response.data.data) {
            setUser(response.data.data);
            // Optionally, update localStorage mockUserRole if still used for role switcher debug
            localStorage.setItem('mockUserRole', response.data.data.role);
          } else {
            // Token might be invalid, or /users/me failed
            localStorage.removeItem('authToken');
            localStorage.removeItem('mockUserRole'); // Clear debug role
            setUser(null); // Or set to guest if preferred
          }
        } catch (error) {
          // Error already handled by interceptor (toast shown)
          console.error("Failed to fetch user on initial auth check:", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('mockUserRole');
          setUser(null); // Or set to guest
        }
      } else {
         // No token found in localStorage. User is not authenticated.
         setUser(null);
         localStorage.removeItem('mockUserRole'); // Ensure debug role is also cleared
      }
      setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = useCallback(async (credentials: {email: string, password: string}) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<ApiResponse<{token: string; user: UserType}>>('/auth/login', credentials);
      if (response.data.data?.token && response.data.data?.user) {
        localStorage.setItem('authToken', response.data.data.token);
        setUser(response.data.data.user);
        localStorage.setItem('mockUserRole', response.data.data.user.role); // For debug role switcher consistency
        setIsLoading(false);
        return true; // Login successful
      } else {
        // This case might occur if API returns 200 but not the expected data structure
        // The apiService interceptor should catch non-2xx errors.
        console.error("Login response missing token or user data:", response.data);
        toast.error("Login Failed", { description: response.data.error || "Invalid response from server." });
        setIsLoading(false);
        return false; // Login failed
      }
    } catch (error: any) {
      // Error is likely already handled by the apiService interceptor (toast shown)
      // but we still need to set loading state and return status.
      console.error("Login API call failed:", error);
      // Ensure toast is shown if interceptor somehow missed it or for specific logic here
      if (!error.response) { // Network or other non-HTTP error
          toast.error("Login Failed", { description: "Could not connect to the server." });
      }
      // If error.response exists, interceptor should have shown a toast.
      // If response.data.error was present in a 2xx, it was handled above.
      setIsLoading(false);
      return false; // Login failed
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true); // Optional: show loading state during logout
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('mockUserRole'); // Clear debug role
    // No need to set to guest anymore, initial useEffect will handle no token state
    setIsLoading(false);
    // TODO: In a real app, add redirect to login page, e.g., using useNavigate if inside a component
    // or window.location.href = '/login';
    // For now, the app will just show no user and role switcher will reflect 'guest' or default.
    toast.info("Logged Out", { description: "You have been successfully logged out."});
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    // This is purely for debugging with mockUsers.
    // It simulates being a different user by directly setting state and mockUserRole.
    // It does NOT involve a real token or API call.
    // This is purely for debugging with mockUsers.
    // In a real app, roles are derived from the authenticated user's token/profile.
    if (mockUsers[newRole]) {
      setUser(mockUsers[newRole]);
      localStorage.setItem('mockUserRole', newRole);
      // If a real token existed, switching roles like this would be a backend operation
      // or you'd log out and log in as a different test user.
    } else {
      console.warn(`Cannot switch to unknown role: ${newRole}`);
    }
  }, []);

  return (
    // Removed 'as MockUser' assertion, user state is already UserType | null
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
