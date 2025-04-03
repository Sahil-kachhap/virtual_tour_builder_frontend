import { debounce, throttle } from "lodash";

// Type definitions for our search results
export interface SearchResult {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  place_id?: string;
}

// This is our backup sample data if the API fails or isn't loaded yet
const samplePoints = [
  {
    id: 1,
    name: "Eiffel Tower",
    lat: 48.8584,
    lng: 2.2945,
    category: "landmark",
  },
  {
    id: 2,
    name: "Louvre Museum",
    lat: 48.8606,
    lng: 2.3376,
    category: "museum",
  },
  {
    id: 3,
    name: "Notre-Dame Cathedral",
    lat: 48.853,
    lng: 2.3499,
    category: "historical",
  },
  {
    id: 4,
    name: "Arc de Triomphe",
    lat: 48.8738,
    lng: 2.295,
    category: "landmark",
  },
  {
    id: 5,
    name: "Sacré-Cœur",
    lat: 48.8867,
    lng: 2.3431,
    category: "religious",
  },
  {
    id: 6,
    name: "Paris Walking Tour",
    lat: 48.8566,
    lng: 2.3522,
    category: "tour",
  },
  {
    id: 7,
    name: "Montmartre Art Tour",
    lat: 48.8867,
    lng: 2.3431,
    category: "tour",
  },
  {
    id: 8,
    name: "Seine River Cruise",
    lat: 48.8584,
    lng: 2.2945,
    category: "tour",
  },
  {
    id: 9,
    name: "Paris Food Tour",
    lat: 48.8606,
    lng: 2.3376,
    category: "tour",
  },
  {
    id: 10,
    name: "Luxembourg Gardens",
    lat: 48.8462,
    lng: 2.3371,
    category: "park",
  },
];

// Track if the Google Maps API is loaded
let placesService: google.maps.places.PlacesService | null = null;
let autocompleteService: google.maps.places.AutocompleteService | null = null;
let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

// Initialize the Places service
export function initPlacesService(map: google.maps.Map) {
  if (window.google && window.google.maps && window.google.maps.places) {
    placesService = new google.maps.places.PlacesService(map);
    autocompleteService = new google.maps.places.AutocompleteService();
    sessionToken = new google.maps.places.AutocompleteSessionToken();
    console.log("Places services initialized successfully");
    return true;
  }
  console.warn(
    "Failed to initialize Places services - Google Maps not fully loaded"
  );
  return false;
}

// Reset session token (call this after a selection is made)
export function resetSessionToken() {
  if (window.google && window.google.maps && window.google.maps.places) {
    sessionToken = new google.maps.places.AutocompleteSessionToken();
  }
}

// Convert Google Places prediction to our SearchResult format
function mapPredictionToSearchResult(
  prediction: google.maps.places.AutocompletePrediction,
  index: number
): SearchResult {
  // Default location (will be updated when getting place details)
  const category = getCategoryFromTypes(prediction.types);

  return {
    id: index + 1, // Temporary ID
    name: prediction.structured_formatting.main_text,
    category: category,
    lat: 0, // Will be filled later with getPlaceDetails
    lng: 0, // Will be filled later with getPlaceDetails
    place_id: prediction.place_id,
  };
}

// Extract a user-friendly category from Google Places types
function getCategoryFromTypes(types: string[]): string {
  if (types.includes("tourist_attraction")) return "landmark";
  if (types.includes("museum")) return "museum";
  if (types.includes("church") || types.includes("place_of_worship"))
    return "religious";
  if (types.includes("park")) return "park";
  if (types.includes("point_of_interest")) return "landmark";
  if (types.includes("establishment")) return "landmark";
  if (types.includes("locality") || types.includes("political")) return "city";
  return types[0]?.replace("_", " ") || "landmark";
}

// Fetch place details to get lat/lng coordinates
export function getPlaceDetails(placeId: string): Promise<SearchResult> {
  return new Promise((resolve, reject) => {
    if (!placesService) {
      console.error("Places service not initialized");
      reject(new Error("Places service not initialized"));
      return;
    }

    placesService.getDetails(
      {
        placeId,
        fields: ["name", "geometry", "types"],
      },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          console.log("Place details retrieved successfully:", place);
          const category = getCategoryFromTypes(place.types || []);
          resolve({
            id: parseInt(placeId.substring(0, 8), 16) % 1000, // Generate a consistent ID from place_id
            name: place.name || "Unknown Place",
            category: category,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            place_id: placeId,
          });
        } else {
          console.error("Failed to fetch place details:", status);
          reject(new Error(`Failed to fetch place details: ${status}`));
        }
      }
    );
  });
}

// Debounced search function to avoid too many API calls
export const debouncedSearchLocations = debounce(
  (
    query: string,
    callback: (results: SearchResult[]) => void,
    errorCallback: (error: Error) => void
  ) => {
    if (!query.trim()) {
      callback([]);
      return;
    }

    // If Google Maps isn't loaded yet or services aren't initialized, use sample data
    if (
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places ||
      !autocompleteService
    ) {
      console.warn(
        "Using sample data for search as Google Places API is not available"
      );
      const results = samplePoints.filter(
        (point) =>
          point.name.toLowerCase().includes(query.toLowerCase()) ||
          point.category.toLowerCase().includes(query.toLowerCase())
      );
      callback(results);
      return;
    }

    console.log("Searching for:", query);
    autocompleteService.getPlacePredictions(
      {
        input: query,
        sessionToken: sessionToken,
        types: [], // Empty array to search all types including cities, countries, etc.
      },
      (predictions, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          predictions &&
          predictions.length > 0
        ) {
          console.log("Search predictions received:", predictions.length);
          const results = predictions.map(mapPredictionToSearchResult);
          callback(results);
        } else if (
          status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          console.log("No search results found");
          callback([]);
        } else {
          console.error("Places API search error:", status);
          // Fall back to sample data
          const results = samplePoints.filter(
            (point) =>
              point.name.toLowerCase().includes(query.toLowerCase()) ||
              point.category.toLowerCase().includes(query.toLowerCase())
          );
          callback(results);
          errorCallback(new Error(`Places API error: ${status}`));
        }
      }
    );
  },
  300 // 300ms debounce time
);

// Throttled version for rapid typing scenarios
export const throttledSearchLocations = throttle(
  (
    query: string,
    callback: (results: SearchResult[]) => void,
    errorCallback: (error: Error) => void
  ) => {
    debouncedSearchLocations(query, callback, errorCallback);
  },
  1000 // 1000ms throttle time
);

// Legacy function for backward compatibility
export function searchLocations(query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const lowerCaseQuery = query.toLowerCase();

  return samplePoints.filter(
    (point) =>
      point.name.toLowerCase().includes(lowerCaseQuery) ||
      point.category.toLowerCase().includes(lowerCaseQuery)
  );
}

export function getPointById(id: number): SearchResult | undefined {
  return samplePoints.find((point) => point.id === id);
}

export const getAllPoints = (): SearchResult[] => {
  return [...samplePoints];
};
