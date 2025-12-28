'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Globe, Loader2, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';

type City = {
  name: string;
  countryName: string;
  countryCode: string;
};

type LocationResult = City & { flag: string };

const countryCodeToFlag = (code: string) => {
  if (!code) return '🏳️';
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join('');
};

export function AddLocationDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const { toast } = useToast();
  const { isFirebaseEnabled } = useAppState();
  const firestore = isFirebaseEnabled ? useFirestore() : null;

  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://api.geonames.org/searchJSON?q=${encodeURIComponent(
          term
        )}&maxRows=10&featureClass=P&orderby=population&username=studio`
      );
      const data = await response.json();
      if (data.geonames) {
        const uniqueCities = new Map<string, LocationResult>();
        data.geonames.forEach((city: City) => {
          const key = `${city.name}, ${city.countryName}`;
          if (!uniqueCities.has(key)) {
            uniqueCities.set(key, { ...city, flag: countryCodeToFlag(city.countryCode) });
          }
        });
        setResults(Array.from(uniqueCities.values()));
      }
    } catch (error) {
      console.error('Error fetching city data:', error);
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: 'Could not fetch city data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, handleSearch]);
  
  const handleAddLocation = async () => {
    if (!selectedLocation) {
        toast({ variant: 'destructive', title: 'No location selected' });
        return;
    }
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Database not available' });
        return;
    }

    try {
        const locationsCollection = collection(firestore, 'locations');
        await addDoc(locationsCollection, {
            city: selectedLocation.name,
            country: selectedLocation.countryName,
            flag: selectedLocation.flag,
        });
        toast({
            title: 'Location Added',
            description: `${selectedLocation.name} has been added successfully.`,
        });
        setSearchTerm('');
        setResults([]);
        setSelectedLocation(null);
        onOpenChange(false);
    } catch (error) {
        console.error('Error adding location to Firestore:', error);
        toast({ variant: 'destructive', title: 'Failed to add location' });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card-dark border-border-dark text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="text-primary" /> Add New Location
          </DialogTitle>
          <DialogDescription>
            Search for a city to add as a new node location.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <Input
            placeholder="Search for a city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background-dark border-border-dark focus:ring-primary"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />
          )}
        </div>
        <ScrollArea className="h-64 border border-border-dark rounded-md">
          <div className="p-2 space-y-1">
            {results.length === 0 && !isLoading && (
              <p className="text-center text-sm text-text-secondary py-4">
                {searchTerm.length > 1 ? 'No cities found.' : 'Start typing to search.'}
              </p>
            )}
            {results.map((city, index) => (
              <button
                key={index}
                onClick={() => setSelectedLocation(city)}
                className={`w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors ${
                  selectedLocation?.name === city.name && selectedLocation?.countryName === city.countryName
                    ? 'bg-primary text-white'
                    : 'hover:bg-accent'
                }`}
              >
                <span className="text-xl">{city.flag}</span>
                <div>
                  <p className="font-medium">{city.name}</p>
                  <p className="text-xs text-gray-400">{city.countryName}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddLocation} disabled={!selectedLocation}>
            <Plus className="mr-2" size={16} /> Add Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
