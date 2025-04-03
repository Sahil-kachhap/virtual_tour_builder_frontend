import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Map, Clock, User, Plus, MapPin } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { SearchResult } from '@/lib/searchUtils';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  duration: z.string().min(1, { message: "Duration is required" }),
});

const CreateTour = () => {
  const { toast } = useToast();
  const [locations, setLocations] = React.useState<SearchResult[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({...values, locations});
    
    toast({
      title: "Tour created",
      description: "Your tour has been successfully created.",
    });
  }

  const handleAddLocation = (result: SearchResult) => {
    if (!locations.some(loc => loc.id === result.id)) {
      setLocations([...locations, result]);
    }
  };

  const handleRemoveLocation = (id: string | number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto glass-panel rounded-xl p-8 shadow-md animate-fade-up">
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-tour-dark tracking-tight">
              Create a New Tour
            </h1>
            <p className="text-tour-medium-gray mt-2">Design your custom tour experience</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tour-dark">Tour Title</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tour-medium-gray" />
                        <Input 
                          placeholder="E.g. Historical Paris Walking Tour" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Create a catchy title for your tour
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tour-dark">Description</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe your tour experience..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about what visitors will experience
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tour-dark">Duration</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tour-medium-gray" />
                        <Input 
                          placeholder="E.g. 2 hours" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Estimated duration of the tour
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <FormLabel className="text-tour-dark">Add Locations</FormLabel>
                <div className="relative">
                  <SearchBar onSelectResult={handleAddLocation} />
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-tour-dark mb-2">Tour Stops:</h3>
                  {locations.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-tour-medium-gray/30 rounded-md">
                      <MapPin className="h-6 w-6 text-tour-medium-gray/50 mx-auto mb-2" />
                      <p className="text-tour-medium-gray text-sm">
                        No locations added yet. Use the search bar above to add locations to your tour.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {locations.map((location, index) => (
                        <li 
                          key={location.id} 
                          className="flex items-center justify-between p-3 bg-tour-light-gray rounded-md"
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white text-xs"
                              style={{ 
                                backgroundColor: 
                                  location.category === 'landmark' ? '#3b82f6' : 
                                  location.category === 'museum' ? '#8b5cf6' :
                                  location.category === 'historical' ? '#f59e0b' :
                                  location.category === 'religious' ? '#10b981' : '#6b7280'
                              }}
                            >
                              {index + 1}
                            </div>
                            <span className="text-tour-dark">{location.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveLocation(location.id)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-tour-blue hover:bg-tour-light-blue text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Tour
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default CreateTour;