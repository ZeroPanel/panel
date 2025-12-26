import {
    Server,
    CreditCard,
    LifeBuoy,
    Settings,
    LogOut,
    Terminal,
  } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Image from "next/image";
  
const menuItems = [
    { href: "/my-servers", label: "My Servers", icon: Server },
    { href: "/console", label: "Console", icon: Terminal },
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/support", label: "Support", icon: LifeBuoy },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function UserAppSidebar() {
    return (
        <aside className="hidden lg:flex w-72 flex-col border-r border-border-dark bg-background-dark">
            <div className="flex flex-col h-full p-4">
                {/* Branding */}
                <div className="flex gap-3 px-2 py-4 mb-6">
                    <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6P68lC3vjd_jpMr0aU-Z8rARjJFRMUpAWe1mnxHHPoal6mxB2w8a312DrKEdNEYENNVJWdAXs52m_dJdxlWnSxvfj2zVWMTNGEox-Tu4XT3rg0lVxS9hCxId2z9gm_7Rjz_gNnPiE-VAHNI0HZzGKoLoeiO0GgwVTzcd6IK8eMKIc5ydB8XebMhIImYf71_buJDip7XHzyosHUao_kZzdY0C8zOQysQGs8Ppt34qey0qnFstq5sXhF1GWPThbbmuVKA4K4nB8TJM" alt="NexusPanel Logo" width={40} height={40} className="rounded-full" data-ai-hint="logo" />
                    <div className="flex flex-col justify-center">
                        <h1 className="text-white text-base font-bold leading-none">NexusPanel</h1>
                        <p className="text-text-secondary text-xs font-normal mt-1">v2.4.0-stable</p>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex flex-col gap-2 flex-1">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                            item.label === 'My Servers' // This logic needs to be updated if another page is active
                              ? 'bg-card-dark text-white shadow-sm ring-1 ring-white/5'
                              : 'text-text-secondary hover:bg-card-dark hover:text-white'
                          }`}>
                            <item.icon className={`transition-colors ${item.label === 'My Servers' ? 'text-primary' : 'text-text-secondary group-hover:text-white'}`} size={24} />
                            <p className="text-sm font-medium">{item.label}</p>
                        </Link>
                    ))}
                </nav>

                {/* User Profile Snippet */}
                <div className="mt-auto pt-4 border-t border-border-dark">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="h-9 w-9 border border-border-dark">
                            <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxQRnu5_uN8hohVObCkEAgX_GjB_DJhytHhSQpor2CNPmqrrAe6eITu9qEoeYuk1pa21apZYc-3Nd2_UqOGCo8t5nPbi2A_ABT2N9GtsNxaluR4xRtyhRZHpZ_w1BcttDu-97uJzyoyFMVIOvwtnjQLXDXWsD5JcJcmHk223CCazwauOSw-i9D-WMwp3ct4yAaikamnGwNiP05-eN1i95HhZmbxMTR-Mp73xGYe1HWUAWI5K4V1yhtycw2oA65NUYFbUMOntC-ryc" alt="User avatar" data-ai-hint="man portrait"/>
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-white text-sm font-medium truncate">Alex Developer</p>
                            <p className="text-text-secondary text-xs truncate">alex@dev.co</p>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto text-text-secondary hover:text-white h-auto w-auto p-0">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
