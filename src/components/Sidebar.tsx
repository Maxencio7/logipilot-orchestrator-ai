
import React from 'react';
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
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shipments', label: 'Shipments', icon: Package },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'tracking', label: 'Tracking', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-logistics-primary text-white min-h-screen animate-slide-in">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-left hover:bg-logistics-secondary/20 ${
                  activeTab === item.id 
                    ? 'bg-white text-logistics-primary hover:bg-white/90' 
                    : 'text-white'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
