
import React from 'react';
import { Clock, User, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const tourData = {
  title: "Paris Highlights",
  duration: "4 hours",
  distance: "5.8 km",
  creator: "TourGuide Team",
  stops: [
    "Eiffel Tower",
    "Trocadéro Gardens",
    "Arc de Triomphe",
    "Champs-Élysées",
    "Louvre Museum"
  ]
};

const TourPath: React.FC = () => {
  return (
    <div className="p-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-lg font-semibold text-tour-dark mb-1">{tourData.title}</h2>
      
      <div className="flex items-center space-x-3 text-xs text-tour-medium-gray mb-4">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{tourData.duration}</span>
        </div>
        <div>•</div>
        <div>{tourData.distance}</div>
        <div>•</div>
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          <span>{tourData.creator}</span>
        </div>
      </div>
      
      <div className="relative pl-5 before:absolute before:left-2 before:top-0 before:bottom-4 before:w-0.5 before:bg-tour-blue/30">
        {tourData.stops.map((stop, index) => (
          <div key={index} className="mb-3 relative">
            <div className="absolute left-[-20px] top-0 w-4 h-4 rounded-full bg-white border-2 border-tour-blue"></div>
            <div className="text-sm font-medium text-tour-dark">{stop}</div>
            {index < tourData.stops.length - 1 && (
              <div className="text-xs text-tour-medium-gray mt-1">10 min walk</div>
            )}
          </div>
        ))}
      </div>
      
      <Button className="w-full mt-2 bg-tour-blue hover:bg-tour-light-blue text-white flex items-center justify-center">
        <span>Start Tour</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default TourPath;
