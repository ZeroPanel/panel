import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  metric?: string;
  subMetric?: string;
  delta?: string;
  deltaType?: "increase" | "decrease"; // Not used in new design, but kept for potential future use
  progress: number;
  progressColor: string;
}

export function StatCard({ title, value, icon: Icon, metric, subMetric, delta, progress, progressColor }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl p-5 bg-secondary border border-white/5 hover:border-primary/30 transition-colors shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <Icon className="text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
            <p className="text-white text-3xl font-bold">{value}{metric && <span className="text-base font-normal text-muted-foreground">{metric}</span>}</p>
            {subMetric && <p className="text-muted-foreground text-xs font-medium">{subMetric}</p>}
            {delta && (
                <p className="text-success text-xs font-medium flex items-center">
                    <TrendingUp className="text-[14px]" />
                    {delta}
                </p>
            )}
        </div>
        <div className="w-full bg-background h-1.5 rounded-full mt-3 overflow-hidden">
            <div className={cn("h-full rounded-full", progressColor)} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
  );
}
