import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import StreetView from '@/components/StreetView';
import PointOfInterest from '@/components/PointOfInterest';
import TourPath from '@/components/TourPath';
import GoogleMapsKeyInput from '@/components/GoogleMapsKeyInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Map as MapIcon, MapPin } from 'lucide-react';
import { SearchResult, getPointById } from '@/lib/searchUtils';

// Sample point of interest data (in real app, this would come from an API)
const pointsData = {
  // ... keep existing code (pointsData objects) the same
};

interface Point {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
}

const Index = () => {
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  
  const handleApiKeySubmit = (key: string) => {
    setGoogleMapsApiKey(key);
    // You can add additional logic here if needed
  };
  
  const handleSearchResult = (result: SearchResult) => {
    console.log("Search result selected:", result);
    setSelectedPoint(result);
  };
  
  const handleMapLoad = (map: google.maps.Map) => {
    console.log("Map instance loaded");
    setMapInstance(map);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onSearch={handleSearchResult} mapInstance={mapInstance} />
      
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4 p-4">
        {/* Left section - Map */}
        <div className="md:col-span-2 lg:col-span-7 h-[80vh] md:h-[calc(100vh-7rem)] glass-panel rounded-xl overflow-hidden">
          {!googleMapsApiKey ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-md w-full">
                <GoogleMapsKeyInput onKeySubmit={handleApiKeySubmit} />
              </div>
            </div>
          ) : (
            <Map 
              onSelectPoint={(point) => setSelectedPoint(point)} 
              selectedPoint={selectedPoint}
              onMapLoad={handleMapLoad}
            />
          )}
        </div>
        
        {/* Right section - Details */}
        <div className="md:col-span-1 lg:col-span-5 flex flex-col h-[80vh] md:h-[calc(100vh-7rem)]">
          {/* ... keep existing code (right section content) the same */}
        </div>
      </main>
    </div>
  );
};

export default Index;
