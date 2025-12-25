import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  metric: string;
  delta?: string;
  deltaType?: "increase" | "decrease";
  progress: number;
  progressColor: string;
}

export function StatCard({ title, value, icon: Icon, metric, delta, deltaType, progress, progressColor }: StatCardProps) {
  const DeltaIcon = deltaType === "increase" ? ArrowUp : ArrowDown;
  const deltaColor = deltaType === "increase" ? "text-green-500" : "text-red-500";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">{metric}</span>
            {delta && (
                <span className={cn("flex items-center text-xs", deltaColor)}>
                    <DeltaIcon className="h-3 w-3" /> {delta}
                </span>
            )}
        </div>
        <Progress value={progress} className={cn("mt-4 h-2 [&>*]:rounded-full", progressColor)} />
      </CardContent>
    </Card>
  );
}
