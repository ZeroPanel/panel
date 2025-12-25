"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme (UI only)"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-0" />
      <Moon className="h-[1.2rem] w-[1.2rem] scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
