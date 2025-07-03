import React, { useEffect, useState } from 'react';
import { Bell, Search, User, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import { Bell, Search, User, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useDebounce } from '@/hooks/useDebounce';
import SearchResultsDropdown from './SearchResultsDropdown'; // Import the new component

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header = ({ toggleMobileSidebar }: HeaderProps) => {
  const {
    searchQuery,
    searchQuery,
    setSearchQuery,
    triggerSearch,
    clearSearch,
    searchResults,
    isLoading,
    error,
  } = useGlobalSearch();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null); // Ref for the search container

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);
    if (newQuery.trim() !== '') {
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
      clearSearch();
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery.trim() !== '') {
      triggerSearch(debouncedSearchQuery);
      setIsDropdownVisible(true);
    } else {
      // If the debounced query is empty, but the direct input is also empty, hide dropdown
      if (searchQuery.trim() === '') {
        setIsDropdownVisible(false);
        clearSearch(); // Ensure results are cleared
      }
      // if debounced is empty but input has text (e.g. fast typing then delete),
      // we might want to keep dropdown visible if there were previous non-empty results for "searchQuery"
      // For now, this simpler logic should work.
    }
  }, [debouncedSearchQuery, triggerSearch, clearSearch, searchQuery]);

  const handleSearchFocus = () => {
    if (searchQuery.trim() !== '' || searchResults.length > 0 ) {
      setIsDropdownVisible(true);
    }
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const closeDropdown = () => {
    setIsDropdownVisible(false);
    // Optional: clearSearch(); or setSearchQuery('');
    // Depending on desired behavior after clicking a result
  };

  return (
    // Added relative and z-50 for dropdown positioning context
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between relative z-50">
      <div className="flex items-center space-x-2 md:space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileSidebar}
          aria-label="Open menu" // Ensuring aria-label is present
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">Open menu</span>
        </Button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 logistics-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LP</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">LogiPilot</h1>
        </div>

        {/* Search Bar Container - referenced by searchContainerRef */}
        <div className="relative ml-4 md:ml-8 hidden sm:block" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10 pointer-events-none" />
          <Input 
            placeholder="Search anything..."
            className="pl-10 w-64 md:w-96 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleSearchFocus}
            // onBlur is handled by click outside now
          />
          {isDropdownVisible && (
            <SearchResultsDropdown
              results={searchResults}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              onClose={closeDropdown}
            />
          )}
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
