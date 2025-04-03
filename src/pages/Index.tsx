import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Map from "@/components/Map";
import StreetView from "@/components/StreetView";
import PointOfInterest from "@/components/PointOfInterest";
import TourPath from "@/components/TourPath";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Map as MapIcon, MapPin } from "lucide-react";
import { SearchResult, getPointById } from "@/lib/searchUtils";

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
          <Map
            onSelectPoint={(point) => setSelectedPoint(point)}
            selectedPoint={selectedPoint}
            onMapLoad={handleMapLoad}
          />
        </div>

        {/* Right section - Details */}
        <div className="md:col-span-1 lg:col-span-5 flex flex-col h-[80vh] md:h-[calc(100vh-7rem)]">
        {selectedPoint ? (
            <div className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden">
              <StreetView locationName={selectedPoint.name} />
              
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="info" className="w-full h-full flex flex-col">
                  <TabsList className="self-center my-2 bg-tour-light-gray">
                    <TabsTrigger value="info" className="flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      <span>Information</span>
                    </TabsTrigger>
                    <TabsTrigger value="tour" className="flex items-center">
                      <MapIcon className="h-4 w-4 mr-1" />
                      <span>Tour Path</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="flex-1 overflow-hidden mt-0">
                    {selectedPoint && pointsData[selectedPoint.id as keyof typeof pointsData] && (
                      <PointOfInterest point={pointsData[selectedPoint.id as keyof typeof pointsData]} />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="tour" className="flex-1 overflow-hidden mt-0">
                    <TourPath />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="flex-1 glass-panel rounded-xl flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-full bg-tour-light-gray flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-tour-blue" />
              </div>
              <h2 className="text-xl font-semibold text-tour-dark mb-2">Select a Location</h2>
              <p className="text-sm text-tour-medium-gray mb-4">
                Click on any point of interest on the map to view detailed information and 360° street views.
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-4">
                <div className="flex flex-col items-center p-3 bg-tour-light-gray rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mb-2"></div>
                  <span className="text-xs text-tour-dark/70">Landmarks</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-tour-light-gray rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mb-2"></div>
                  <span className="text-xs text-tour-dark/70">Museums</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-tour-light-gray rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mb-2"></div>
                  <span className="text-xs text-tour-dark/70">Historical</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-tour-light-gray rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mb-2"></div>
                  <span className="text-xs text-tour-dark/70">Religious</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
