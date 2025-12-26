'use client'

import { cn } from "@/lib/utils";
import { CheckCircle, Server, MemoryStick, CreditCard } from "lucide-react";

interface UserStatCardProps {
    title: string;
    value: string;
    metric: string;
    icon: "server" | "check_circle" | "memory" | "payments";
    metricColor?: string;
    iconColor?: string;
}

const iconMap = {
    server: Server,
    check_circle: CheckCircle,
    memory: MemoryStick,
    payments: CreditCard,
}

export function UserStatCard({ title, value, metric, icon, metricColor, iconColor }: UserStatCardProps) {
    const Icon = iconMap[icon];

    return (
        <div className="flex flex-col gap-1 rounded-xl p-5 border border-border-dark bg-card-dark shadow-sm">
            <div className="flex justify-between items-start">
                <p className="text-text-secondary text-sm font-medium">{title}</p>
                <Icon className={cn("text-primary", iconColor)} size={24} />
            </div>
            <div className="flex items-end gap-2 mt-2">
                <p className="text-white text-3xl font-bold">{value}</p>
                <span className={cn("text-sm font-medium mb-1", metricColor || "text-text-secondary")}>{metric}</span>
            </div>
        </div>
    );
}
