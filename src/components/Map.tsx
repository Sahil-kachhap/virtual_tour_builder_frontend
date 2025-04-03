import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Maximize, ZoomIn, ZoomOut, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getAllPoints } from '@/lib/searchUtils';
import { toast } from "@/components/ui/use-toast";

interface Point {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
}

interface MapProps {
  onSelectPoint: (point: Point) => void;
  selectedPoint?: Point | null;
  onMapLoad?: (map: google.maps.Map) => void;
}

// Replace this with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // You'll need to add your Google Maps API key here

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const Map: React.FC<MapProps> = ({ onSelectPoint, selectedPoint, onMapLoad }) => {
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Default center (will be replaced by user location when available)
  const [center, setCenter] = useState({
    lat: 48.8566, // Paris center as fallback
    lng: 2.3522
  });
  // Track if we're getting the user's location
  const [isLocating, setIsLocating] = useState(false);
  
  // Use the data from our utility function instead of the hardcoded sample
  const samplePoints = useMemo(() => getAllPoints(), []);

  const options = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    mapId: 'b181cac70f27f5e6', // Light mode map ID - replace with your styled map ID if you have one
  }), []);

  // Get the user's current location when the component mounts
  useEffect(() => {
    // Skip if we're already locating or if the map isn't ready
    if (isLocating || !map) return;
    
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setCenter(userLocation);
          map.panTo(userLocation);
          map.setZoom(14); // Zoom in to user's location
          
          setIsLocating(false);
          
          toast({
            title: "Location found",
            description: "Map centered on your current location.",
            duration: 3000,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          
          toast({
            title: "Location access denied",
            description: "Using default location instead. Please enable location access for better experience.",
            variant: "destructive",
            duration: 5000,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setIsLocating(false);
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Using default location.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [map, isLocating]);

  // Update the map when a point is selected via search
  useEffect(() => {
    if (selectedPoint && map) {
      map.panTo({ lat: selectedPoint.lat, lng: selectedPoint.lng });
      map.setZoom(15);
      setActiveMarker(selectedPoint.id);
    }
  }, [selectedPoint, map]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Map onLoad called");
    setMap(map);
    
    // Call the onMapLoad prop if provided
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (pointId: number) => {
    setActiveMarker(pointId);
    const point = samplePoints.find(p => p.id === pointId);
    if (point) {
      onSelectPoint(point);
    }
  };

  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom()! + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom()! - 1);
    }
  };

  const handleFullScreen = () => {
    if (map) {
      const mapDiv = map.getDiv();
      if (mapDiv.requestFullscreen) {
        mapDiv.requestFullscreen();
      }
    }
  };

  // Function to recenter map to user's location
  const handleRecenterToUser = () => {
    if (!map) return;
    
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          map.panTo(userLocation);
          map.setZoom(14);
          setIsLocating(false);
          
          toast({
            title: "Location found",
            description: "Map recentered to your location.",
            duration: 3000,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          
          toast({
            title: "Location access denied",
            description: "Could not access your location. Please enable location services.",
            variant: "destructive",
            duration: 5000,
          });
        }
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'landmark': return { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' };
      case 'museum': return { url: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png' };
      case 'historical': return { url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' };
      case 'religious': return { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' };
      case 'tour': return { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' };
      case 'park': return { url: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png' };
      default: return { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' };
    }
  };



  
  if (loadError) {
    return (
      <div className="relative w-full h-full bg-tour-light-gray rounded-xl overflow-hidden glass-panel flex items-center justify-center">
        <p>Map cannot be loaded right now, sorry.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-tour-light-gray rounded-xl overflow-hidden glass-panel">
      {!isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-tour-blue/20 border-t-tour-blue rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={options}
          >
            {samplePoints.map((point) => (
              <Marker
                key={point.id}
                position={{ lat: point.lat, lng: point.lng }}
                onClick={() => handleMarkerClick(point.id)}
                icon={getCategoryIcon(point.category)}
                animation={google.maps.Animation.DROP}
                zIndex={selectedPoint?.id === point.id ? 2 : 1}
              >
                {activeMarker === point.id && (
                  <InfoWindow 
                    onCloseClick={() => setActiveMarker(null)}
                    position={{ lat: point.lat, lng: point.lng }}
                  >
                    <div className="text-tour-dark text-sm font-medium">
                      {point.name}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
            
            {/* User location marker */}
            {isLoaded && (
              <Marker
                position={center}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
                zIndex={3}
              />
            )}
          </GoogleMap>
          
          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button variant="outline" size="icon" className="bg-white shadow-sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white shadow-sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white shadow-sm" onClick={handleFullScreen}>
              <Maximize className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white shadow-sm" 
              onClick={handleRecenterToUser}
              disabled={isLocating}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Loading indicator for location */}
          {isLocating && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-tour-blue/20 border-t-tour-blue rounded-full animate-spin"></div>
                <span className="text-xs text-tour-medium-gray">Locating you...</span>
              </div>
            </div>
          )}
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/20 pointer-events-none"></div>
        </>
      )}
    </div>
  );
};

export default Map;
