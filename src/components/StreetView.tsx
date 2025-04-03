
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface StreetViewProps {
  locationName: string;
}

// Sample data for demonstration (we'll look up coordinates by location name - simplified version)
const locationCoordinates: Record<string, { lat: number, lng: number }> = {
  'Eiffel Tower': { lat: 48.8584, lng: 2.2945 },
  'Louvre Museum': { lat: 48.8606, lng: 2.3376 },
  'Notre-Dame Cathedral': { lat: 48.8530, lng: 2.3499 },
  'Arc de Triomphe': { lat: 48.8738, lng: 2.2950 },
  'Sacré-Cœur': { lat: 48.8867, lng: 2.3431 },
  // Default fallback if the location is not found
  'default': { lat: 48.8566, lng: 2.3522 }, // Paris center
};

const StreetView: React.FC<StreetViewProps> = ({ locationName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewAngle, setViewAngle] = useState(0);
  
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  
  useEffect(() => {
    // Google Maps script loading
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        initializeStreetView();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeStreetView;
      document.head.appendChild(script);
    };

    // Initialize Street View once Google Maps is loaded
    const initializeStreetView = () => {
      if (!streetViewRef.current) return;
      
      setIsLoading(true);
      
      // Get coordinates for the location
      const coordinates = locationCoordinates[locationName] || locationCoordinates.default;
      
      // Create the Street View panorama
      const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
        position: coordinates,
        pov: {
          heading: viewAngle,
          pitch: 0,
        },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
        motionTracking: false,
        motionTrackingControl: false,
        fullscreenControl: false,
      });
      
      panoramaRef.current = panorama;
      
      // Wait for the panorama to be ready
      google.maps.event.addListenerOnce(panorama, 'status_changed', () => {
        const status = panorama.getStatus();
        if (status === google.maps.StreetViewStatus.OK) {
          setIsLoading(false);
        } else {
          console.warn('Street View not available for this location');
          setIsLoading(false);
        }
      });
    };

    loadGoogleMapsScript();
    
    return () => {
      if (panoramaRef.current) {
        // Cleanup if needed
      }
    };
  }, [locationName]);

  useEffect(() => {
    if (panoramaRef.current) {
      panoramaRef.current.setPov({
        heading: viewAngle,
        pitch: 0,
      });
    }
  }, [viewAngle]);
  
  const rotateView = (direction: 'left' | 'right') => {
    setViewAngle(prev => {
      let newAngle;
      if (direction === 'left') {
        newAngle = prev - 90;
      } else {
        newAngle = prev + 90;
      }
      return newAngle % 360;
    });
  };

  return (
    <div className="relative w-full h-72 bg-tour-light-gray rounded-xl overflow-hidden glass-panel">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <RotateCw className="h-6 w-6 text-tour-blue animate-spin" />
          <span className="ml-2 text-sm text-tour-medium-gray">Loading view...</span>
        </div>
      ) : (
        <>          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm" onClick={() => rotateView('left')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-md flex items-center">
              <Compass className="h-4 w-4 text-tour-blue mr-2" />
              <span className="text-xs font-medium">{viewAngle}°</span>
            </div>
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm" onClick={() => rotateView('right')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Location label */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-md text-sm font-medium">
            {locationName}
          </div>
        </>
      )}
    </div>
  );
};

export default StreetView;
