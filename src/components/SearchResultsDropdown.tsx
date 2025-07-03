// src/components/SearchResultsDropdown.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchResultItem } from '@/types';
import { Loader2, AlertTriangle, Package, User, Info } from 'lucide-react';

interface SearchResultsDropdownProps {
  results: SearchResultItem[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  onClose: () => void; // Callback to close the dropdown, e.g., after navigation
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  results,
  isLoading,
  error,
  searchQuery,
  onClose,
}) => {
  const getIconForType = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'Shipment':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'Client':
        return <User className="w-4 h-4 text-green-500" />;
      case 'Alert':
        return <Info className="w-4 h-4 text-red-500" />; // Or AlertTriangle for more critical alerts
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="absolute top-full mt-2 w-full md:w-96 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg p-4 z-50">
        <div className="flex items-center justify-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full mt-2 w-full md:w-96 bg-white border border-slate-200 rounded-md shadow-lg p-4 z-50">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>Error: {error.message}</span>
        </div>
      </div>
    );
  }

  if (searchQuery.trim() !== '' && results.length === 0 && !isLoading) {
    return (
      <div className="absolute top-full mt-2 w-full md:w-96 bg-white border border-slate-200 rounded-md shadow-lg p-4 z-50">
        <p className="text-slate-600 text-center">No results found for "{searchQuery}"</p>
      </div>
    );
  }

  // Do not render if query is empty and not loading/erroring, or if no results and query is empty
  if (results.length === 0 || searchQuery.trim() === '') {
      return null;
  }

  return (
    <div className="absolute top-full mt-2 w-full md:w-96 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg z-50">
      <ul className="divide-y divide-slate-100">
        {results.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <Link
              to={item.link}
              onClick={onClose} // Close dropdown on item click
              className="block p-3 hover:bg-slate-50 transition-colors duration-150"
            >
              <div className="flex items-center mb-1">
                {getIconForType(item.type)}
                <span className="ml-2 text-xs text-slate-500 uppercase">{item.type}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 mb-0.5 truncate" title={item.title}>
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 truncate" title={item.description}>
                {item.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {results.length > 0 && (
         <div className="p-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Found {results.length} item(s)
        </div>
      )}
    </div>
  );
};

export default SearchResultsDropdown;
