import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SearchBar from './SearchBar';
import { SearchResult, initPlacesService } from '@/lib/searchUtils';

interface HeaderProps {
  onSearch?: (result: SearchResult) => void;
  mapInstance?: google.maps.Map | null;
}

const Header: React.FC<HeaderProps> = ({ onSearch, mapInstance }) => {
  // Initialize Places service when map is available
  useEffect(() => {
    if (mapInstance) {
      const success = initPlacesService(mapInstance);
      console.log("Places service initialization:", success ? "successful" : "failed");
    }
  }, [mapInstance]);

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-white shadow-sm animate-fade-in">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/" className="text-xl font-medium text-tour-dark tracking-tight">
          <span className="font-light">Tour</span>Guide
        </Link>
      </div>
      
      <div className="hidden md:block flex-1 mx-10 max-w-md">
        <SearchBar onSelectResult={onSearch} />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-tour-medium-gray" asChild>
          <Link to="/sign-in">Sign In</Link>
        </Button>
        <Button size="sm" className="bg-tour-blue hover:bg-tour-light-blue text-white shadow-sm" asChild>
          <Link to="/create-tour">Create Tour</Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
