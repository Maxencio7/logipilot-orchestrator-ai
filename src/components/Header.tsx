
import React from 'react';
import { Bell, Search, User, Settings, Menu } from 'lucide-react'; // Added Menu icon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header = ({ toggleMobileSidebar }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Hamburger Menu for Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden" // Only show on mobile (screens smaller than md)
          onClick={toggleMobileSidebar}
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">Open menu</span>
        </Button>

        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 logistics-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LP</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">LogiPilot</h1>
        </div>

        {/* Search Bar - hidden on small screens, visible on medium and up */}
        <div className="relative ml-4 md:ml-8 hidden sm:block"> {/* Hidden on xs, visible sm and up */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search..." // Shortened placeholder for smaller screens if it were visible
            className="pl-10 w-64 md:w-96 bg-slate-50 border-slate-200" // Adjusted width
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search Icon for very small screens - an alternative to full search bar */}
        <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Search">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
            3
          </span>
          <span className="sr-only">3 new notifications</span>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User profile">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
