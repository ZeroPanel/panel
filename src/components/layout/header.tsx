import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Grid, MessageSquare, Search, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import placeholderImages from "@/lib/placeholder-images.json";
import { Input } from "../ui/input";
import Link from "next/link";

export function Header() {
  const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2');

  return (
    <header className="flex items-center justify-between border-b border-surface-dark bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <SidebarTrigger />
        </div>
        <div className="hidden sm:flex items-center gap-3 text-white">
          <Grid className="text-primary" />
          <h2 className="text-lg font-bold leading-tight tracking-tight">Dashboard</h2>
        </div>
        
        <div className="hidden lg:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-muted-foreground text-[20px]" />
          </div>
          <Input placeholder="Search servers, nodes..." className="block w-64 bg-surface-dark border-transparent rounded-lg py-2 pl-10 pr-3 text-sm text-white placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:bg-[#2a4555] transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button asChild variant="outline" size="sm">
            <Link href="/my-servers">
                <User className="mr-2 h-4 w-4" />
                User View
            </Link>
        </Button>
        <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="flex items-center justify-center size-9 rounded-lg hover:bg-surface-dark text-text-secondary hover:text-white transition-colors relative">
                <Bell className="text-[20px]" />
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
            </Button>
            <Button variant="ghost" size="icon" className="flex items-center justify-center size-9 rounded-lg hover:bg-surface-dark text-text-secondary hover:text-white transition-colors">
                <MessageSquare className="text-[20px]" />
            </Button>
        </div>
        <div className="h-6 w-px bg-surface-dark"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-1 rounded-full hover:bg-surface-dark transition-colors h-auto py-0">
              <span className="hidden sm:block text-sm font-medium text-white">Jane Admin</span>
              <Avatar className="h-8 w-8 ring-2 ring-surface-dark">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Jane Admin" data-ai-hint={userAvatar.imageHint} />}
                <AvatarFallback>JA</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Jane Admin</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
