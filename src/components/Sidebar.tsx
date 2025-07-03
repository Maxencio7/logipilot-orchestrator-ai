import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Brain, 
  AlertTriangle, 
  Settings,
  BarChart3,
  Truck,
  MapPin,
  DollarSign as DollarSignIcon,
  Users2, // For role switcher
  RefreshCcw, // For role switcher
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '@/hooks/useAuth'; // Import useAuth and UserRole
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For role switcher
import { Separator } from '@/components/ui/separator';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  allowedRoles: UserRole[]; // Add roles that can see this item
}

const Sidebar = () => {
  const { user, switchRole, isLoading } = useAuth();

  const allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', allowedRoles: ['admin', 'manager', 'driver', 'client'] },
    { id: 'shipments', label: 'Shipments', icon: Package, path: '/shipments', allowedRoles: ['admin', 'manager', 'driver'] },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients', allowedRoles: ['admin', 'manager'] },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports', allowedRoles: ['admin', 'manager', 'driver'] },
    { id: 'financials', label: 'Financials', icon: DollarSignIcon, path: '/financials', allowedRoles: ['admin', 'manager']},
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain, path: '/ai-assistant', allowedRoles: ['admin', 'manager', 'driver', 'client'] },
    // { id: 'alerts', label: 'Alerts', icon: AlertTriangle, path: '/alerts', allowedRoles: ['admin', 'manager', 'driver', 'client'] }, // Alerts are usually global via Bell
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', allowedRoles: ['admin', 'manager'] },
    { id: 'fleet', label: 'Fleet', icon: Truck, path: '/fleet', allowedRoles: ['admin', 'manager', 'driver'] },
    { id: 'tracking', label: 'Tracking', icon: MapPin, path: '/tracking', allowedRoles: ['admin', 'manager', 'driver', 'client'] },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', allowedRoles: ['admin', 'manager', 'driver', 'client'] },
  ];

  const availableMenuItems = user ? allMenuItems.filter(item => item.allowedRoles.includes(user.role)) : [];


  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `w-full justify-start text-left hover:bg-logistics-secondary/20 ${
      isActive
        ? 'bg-white text-logistics-primary hover:bg-white/90'
        : 'text-white hover:text-slate-100'
    }`;

  return (
    <aside className="w-64 bg-logistics-primary text-white min-h-full flex flex-col justify-between flex-shrink-0 animate-slide-in">
      <div>
        <div className="p-6"> {/* Assuming logo/brand might go here above nav */}
          {/* <h2 className="text-xl font-semibold">LogiPilot Nav</h2> */}
        </div>
        <nav className="space-y-1 px-3">
          {availableMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => navLinkClasses({ isActive }) + " flex items-center p-2 rounded-md text-sm"}
                end // Use 'end' for NavLinks that should only be active on exact match (like /dashboard)
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher for Debugging - Placed at the bottom */}
      <div className="p-3 mt-auto border-t border-logistics-secondary/20">
        <Separator className="my-2 bg-logistics-secondary/20"/>
        <div className="p-2 space-y-2">
            <label htmlFor="role-switcher" className="text-xs font-medium text-slate-300 flex items-center">
                <Users2 className="w-4 h-4 mr-1.5"/> Current Role:
            </label>
            {isLoading ? (
                 <div className="flex items-center text-sm text-slate-300"><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Loading...</div>
            ) : user ? (
                <Select value={user.role} onValueChange={(newRole) => switchRole(newRole as UserRole)}>
                    <SelectTrigger className="w-full bg-logistics-secondary/30 border-logistics-secondary/50 text-white h-9">
                        <SelectValue placeholder="Switch role" />
                    </SelectTrigger>
                    <SelectContent className="bg-logistics-primary border-logistics-secondary text-white">
                        {(Object.keys(mockUsers) as UserRole[]).map(roleKey => (
                            <SelectItem key={roleKey} value={roleKey} className="hover:bg-logistics-secondary/50 focus:bg-logistics-secondary/50">
                                {mockUsers[roleKey].name} ({roleKey})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <p className="text-sm text-slate-400">Logged out</p>
            )}
        </div>
      </div>
    </aside>
  );
};

// Need to import mockUsers to populate the switcher
const mockUsers: Record<UserRole, {name: string}> = {
  admin: { name: 'Admin' },
  manager: { name: 'Manager' },
  driver: { name: 'Driver' },
  client: { name: 'Client' },
  guest: { name: 'Guest' },
};


export default Sidebar;
