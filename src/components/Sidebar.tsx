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
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // Still use Button for consistent styling if NavLink is wrapped

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const Sidebar = () => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'shipments', label: 'Shipments', icon: Package, path: '/shipments' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' }, // Assuming /reports will be added
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain, path: '/ai-assistant' },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, path: '/alerts' }, // Assuming /alerts will be added
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' }, // Assuming /analytics
    { id: 'fleet', label: 'Fleet', icon: Truck, path: '/fleet' }, // Assuming /fleet
    { id: 'tracking', label: 'Tracking', icon: MapPin, path: '/tracking' }, // Assuming /tracking
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }, // Assuming /settings
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `w-full justify-start text-left hover:bg-logistics-secondary/20 ${
      isActive
        ? 'bg-white text-logistics-primary hover:bg-white/90'
        : 'text-white hover:text-slate-100'
    }`;

  return (
    <aside className="w-64 bg-logistics-primary text-white min-h-full flex-shrink-0 animate-slide-in">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => navLinkClasses({ isActive })}
              >
                {/* We can wrap the content in a Button component if we want its exact styling, or style directly */}
                <Button
                  variant="ghost" // Use ghost variant as base, active style will override
                  className="w-full justify-start text-left pointer-events-none" // pointer-events-none because NavLink handles click
                  asChild // Important: allows NavLink to control navigation while Button provides style
                >
                  <span> {/* Extra span can help if direct styling on Button conflicts */}
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
