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
  X // Import X icon for close button
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface SidebarProps {
  toggleMobileSidebar?: () => void; // Optional: only needed if sidebar has its own close button for mobile
}

const Sidebar = ({ toggleMobileSidebar }: SidebarProps) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'shipments', label: 'Shipments', icon: Package, path: '/shipments' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain, path: '/ai-assistant' },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, path: '/alerts' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'fleet', label: 'Fleet', icon: Truck, path: '/fleet' },
    { id: 'tracking', label: 'Tracking', icon: MapPin, path: '/tracking' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ease-in-out
     focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-opacity-75
    ${
      isActive
        ? 'bg-white text-logistics-primary shadow-sm' // Active state: white background, primary text, subtle shadow
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground'
    }`;
    // Inactive state: uses sidebar-specific colors from theme, with hover and focus states.

  // The `animate-slide-in` class is removed from here as transitions will be handled by the wrapper in MainLayout.tsx
  // Added `h-full` to ensure it takes full height when absolutely positioned on mobile.
  return (
    <aside className="w-64 bg-logistics-primary text-white h-full flex-shrink-0 md:min-h-full">
      <div className="p-6">
        <div className="flex justify-between items-center md:hidden mb-4">
          <span className="text-lg font-semibold text-white">Menu</span>
          {toggleMobileSidebar && ( // Only show close button if toggle function is provided
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="text-white hover:bg-logistics-secondary/30">
              <X className="w-6 h-6" />
            </Button>
          )}
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => navLinkClasses({ isActive })}
                onClick={toggleMobileSidebar} // Close sidebar on link click in mobile view
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left pointer-events-none"
                  asChild
                >
                  <span>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </span>
                </Button>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
