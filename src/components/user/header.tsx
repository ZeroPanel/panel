"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, HelpCircle, Menu, Plus, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export function UserHeader() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-border-dark bg-background-dark/50 backdrop-blur-md px-6 py-4 z-10 sticky top-0">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="text-white">
          <Menu />
        </Button>
        <h2 className="text-white text-lg font-bold">NexusPanel</h2>
      </div>

      <div className="hidden lg:flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-text-secondary" size={20} />
          </div>
          <Input
            className="block w-full pl-10 pr-3 py-2 bg-card-dark border border-transparent rounded-lg leading-5 text-white placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search servers, IPs, or tags..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="bg-card-dark border-border-dark hover:bg-primary hover:text-white">
            <Link href="/dashboard">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin View
            </Link>
        </Button>
        <Button variant="ghost" size="icon" className="flex items-center justify-center size-10 rounded-lg hover:bg-card-dark text-white relative transition-colors">
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
        </Button>
        <Button variant="ghost" size="icon" className="flex items-center justify-center size-10 rounded-lg hover:bg-card-dark text-white transition-colors">
          <HelpCircle size={22} />
        </Button>
        <Button className="hidden lg:flex items-center justify-center h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-lg shadow-primary/20">
          <Plus className="mr-2" size={20} />
          Create Server
        </Button>
      </div>
    </header>
  );
}
