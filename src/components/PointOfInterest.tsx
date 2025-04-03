
import React from 'react';
import { Clock, Users, Star, MapPin, ExternalLink } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PointData {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  visitTime: string;
  crowdLevel: string;
  facts: string[];
}

interface PointOfInterestProps {
  point: PointData;
}

const PointOfInterest: React.FC<PointOfInterestProps> = ({ point }) => {
  return (
    <div className="w-full h-full overflow-y-auto px-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
        <img 
          src={point.image} 
          alt={point.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <Badge className="absolute top-3 left-3 bg-white text-tour-dark">
          {point.category}
        </Badge>
        <div className="absolute bottom-3 left-3 flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < point.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-tour-dark mb-2">{point.name}</h2>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center text-xs text-tour-medium-gray">
          <Clock className="h-3 w-3 mr-1" />
          <span>{point.visitTime}</span>
        </div>
        <div className="flex items-center text-xs text-tour-medium-gray">
          <Users className="h-3 w-3 mr-1" />
          <span>{point.crowdLevel}</span>
        </div>
        <div className="flex items-center text-xs text-tour-medium-gray">
          <MapPin className="h-3 w-3 mr-1" />
          <span>View on map</span>
        </div>
      </div>
      
      <p className="text-sm text-tour-dark/80 mb-4">{point.description}</p>
      
      <Separator className="my-4" />
      
      <h3 className="text-sm font-medium text-tour-dark mb-2">Key Facts</h3>
      <ul className="space-y-2 mb-6">
        {point.facts.map((fact, index) => (
          <li key={index} className="text-xs text-tour-dark/80 flex">
            <span className="text-tour-blue mr-2">•</span>
            {fact}
          </li>
        ))}
      </ul>
      
      <div className="flex space-x-2 mb-4">
        <Button variant="outline" size="sm" className="text-xs flex-1">
          Add to Itinerary
        </Button>
        <Button size="sm" className="text-xs bg-tour-blue hover:bg-tour-light-blue text-white flex-1">
          <ExternalLink className="h-3 w-3 mr-1" />
          Visit Website
        </Button>
      </div>
    </div>
  );
};

export default PointOfInterest;
