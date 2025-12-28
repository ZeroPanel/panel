'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

export function AddLocationDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [locations, setLocations] = useLocalStorage('locations', {});
  const { toast } = useToast();

  const [id, setId] = useState('');
  const [city, setCity] = useState('');
  const [flag, setFlag] = useState('');
  
  const handleAddLocation = () => {
    if (!id || !city || !flag) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields.",
        });
        return;
    }
    setLocations(prev => ({
        ...prev,
        [id.toLowerCase()]: { city, flag }
    }));
    toast({
        title: "Location Added",
        description: `Location "${city}" has been added.`,
    });
    setId('');
    setCity('');
    setFlag('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Add a new location to be used when creating nodes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <Input id="id" value={id} onChange={e => setId(e.target.value)} className="col-span-3" placeholder="e.g. us-nyc-01" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              City
            </Label>
            <Input id="city" value={city} onChange={e => setCity(e.target.value)} className="col-span-3" placeholder="e.g. New York" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="flag" className="text-right">
              Flag
            </Label>
            <Input id="flag" value={flag} onChange={e => setFlag(e.target.value)} className="col-span-3" placeholder="e.g. 🇺🇸" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddLocation}>Save location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
