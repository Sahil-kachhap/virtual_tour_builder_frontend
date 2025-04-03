import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertTriangle } from 'lucide-react';
import { 
  SearchResult, 
  debouncedSearchLocations, 
  getPlaceDetails,
  resetSessionToken
} from '@/lib/searchUtils';
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onSelectResult?: (result: SearchResult) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelectResult }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search effect when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      
      debouncedSearchLocations(
        searchQuery,
        (results) => {
          setSearchResults(results);
          setIsLoading(false);
        },
        (error) => {
          console.error("Search error:", error);
          setError("Failed to retrieve search results. Using sample data instead.");
          setIsLoading(false);
          
          toast({
            title: "Search Error",
            description: "Could not connect to Google Places API. Using sample data instead.",
            variant: "destructive",
          });
        }
      );
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [searchQuery, toast]);

  const handleSelectResult = async (result: SearchResult) => {
    try {
      setIsLoading(true);
      
      // If we have a place_id, get full details including coordinates
      if (result.place_id) {
        const placeDetails = await getPlaceDetails(result.place_id);
        
        if (onSelectResult) {
          onSelectResult(placeDetails);
        }
      } else {
        // Otherwise use the result as is (for sample data)
        if (onSelectResult) {
          onSelectResult(result);
        }
      }
      
      setSearchQuery(result.name);
      setSearchResults([]);
      setIsFocused(false);
      resetSessionToken(); // Reset the session token after a selection
    } catch (error) {
      console.error("Error getting place details:", error);
      toast({
        title: "Error",
        description: "Failed to get location details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div 
      ref={searchRef}
      className="relative"
    >
      <div 
        className={`
          relative w-full flex items-center px-3 py-2 rounded-xl 
          transition-all duration-300 ease-in-out
          ${isFocused 
            ? 'bg-white shadow-md border border-tour-blue/20' 
            : 'bg-tour-light-gray border border-transparent'
          }
        `}
      >
        <Search className={`h-4 w-4 ${isFocused ? 'text-tour-blue' : 'text-tour-medium-gray'} transition-colors`} />
        <input
          type="text"
          placeholder="Search for locations or tours..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="flex-1 bg-transparent border-none outline-none px-3 py-1 text-sm text-tour-dark placeholder:text-tour-medium-gray/70"
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="text-tour-medium-gray hover:text-tour-dark transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Search results dropdown */}
      {isFocused && searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {searchResults.map((result) => (
              <li 
                key={result.id + result.name}
                onClick={() => handleSelectResult(result)}
                className="px-4 py-2 hover:bg-tour-light-gray cursor-pointer flex items-center"
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ 
                    backgroundColor: 
                      result.category === 'landmark' ? '#3b82f6' : 
                      result.category === 'museum' ? '#8b5cf6' :
                      result.category === 'historical' ? '#f59e0b' :
                      result.category === 'religious' ? '#10b981' : '#6b7280'
                  }}
                />
                <span className="text-sm text-tour-dark">{result.name}</span>
                <span className="ml-2 text-xs text-tour-medium-gray capitalize">{result.category}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* No results message */}
      {isFocused && searchQuery && searchResults.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg p-3 text-center">
          <p className="text-sm text-tour-medium-gray">No results found</p>
        </div>
      )}
      
      {/* Error message */}
      {isFocused && error && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg p-3">
          <div className="flex items-center text-amber-600 mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <p className="text-xs font-medium">Using sample data</p>
          </div>
          <p className="text-xs text-tour-medium-gray">{error}</p>
        </div>
      )}
      
      {/* Loading indicator */}
      {isFocused && isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg p-3 text-center">
          <div className="w-5 h-5 border-2 border-tour-blue/20 border-t-tour-blue rounded-full animate-spin mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
