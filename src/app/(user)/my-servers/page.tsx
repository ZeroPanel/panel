
'use client'

import { useMemo } from 'react';
import { UserStatCard } from "@/components/user/stat-card";
import { UserServerCard } from "@/components/user/server-card";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { useAppState } from '@/components/app-state-provider';

type ServerStatus = "Running" | "Stopped" | "Building";

export interface Server {
    id: string;
    name: string;
    ip: string;
    status: ServerStatus;
    image: string;
    cpuLoad: number;
    ramUsage: number;
    diskUsage: number;
    ramMax: number;
    ramCurrent: number;
    diskMax: number;
    diskCurrent: number;
    nodeId: string;
    containerId?: string;
}

const filters = ["All Servers", "Running", "Stopped", "Starting"];

function transformFirestoreData(doc: DocumentData): Server {
  const data = doc.data();
  const ports = data.ports?.[0];
  const ip = ports ? `${data.nodeName}:${ports.public}` : `${data.nodeName}`;

  const ramUsagePercentage = data.ramMax > 0 ? (data.ramUsage / (data.ramMax * 1024)) * 100 : 0;

  return {
    id: doc.id,
    name: data.name || 'Unnamed Server',
    ip: ip,
    status: data.status === 'Starting' ? 'Building' : data.status,
    image: data.image || 'https://picsum.photos/seed/placeholder/400/400',
    cpuLoad: data.cpuUsage || 0,
    ramUsage: ramUsagePercentage,
    diskUsage: 0, // Placeholder
    ramMax: data.ramMax || 0, // Assuming it's in GB
    ramCurrent: data.ramUsage / 1024 || 0, // Convert MB to GB
    diskMax: 0, // Placeholder
    diskCurrent: 0, // Placeholder
    nodeId: data.node || '',
    containerId: data.containerId || '',
  };
}


export default function MyServersPage() {
    const { isFirebaseEnabled } = useAppState();
    const firestore = isFirebaseEnabled ? useFirestore() : null;
    const containersCollection = firestore ? collection(firestore, 'containers') : null;
    const [snapshot, loading, error] = useCollection(containersCollection);

    const servers = useMemo(() => {
        if (!isFirebaseEnabled || !snapshot) return [];
        return snapshot.docs.map(transformFirestoreData);
    }, [isFirebaseEnabled, snapshot]);


    return (
        <div className="mx-auto max-w-7xl flex flex-col gap-8">
            {/* Stats Row */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <UserStatCard title="Total Servers" value={servers.length.toString()} metric="+2 this month" icon="server" metricColor="text-emerald-500" />
                <UserStatCard title="Active Instances" value={servers.filter(s => s.status === 'Running').length.toString()} metric="Running" icon="check_circle" iconColor="text-emerald-500" />
                <UserStatCard title="Total CPU Load" value={`${Math.round(servers.reduce((acc, s) => acc + s.cpuLoad, 0) / servers.length || 0)}%`} metric="Avg across fleet" icon="memory" iconColor="text-orange-400" />
                <UserStatCard title="Monthly Cost" value="$120.50" metric="USD" icon="payments" />
            </section>

            {/* Content Header & Filters */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Your Servers</h2>
                        <p className="text-text-secondary text-sm mt-1">Manage, monitor, and configure your game servers and containers.</p>
                    </div>
                </div>
                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {filters.map((filter, index) => (
                        <Button key={filter} variant={index === 0 ? 'default' : 'outline'} size="sm" className="rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap">
                            {filter}
                        </Button>
                    ))}
                </div>
            </section>
            
            {/* Server Grid */}
            {loading && <p className="text-center text-text-secondary py-16">Loading your servers...</p>}
            {error && <p className="text-center text-rose-400 py-16">Error loading servers: {error.message}</p>}

            {!loading && !error && (
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {servers.map((server) => (
                        <UserServerCard key={server.id} server={server} />
                    ))}
                </section>
            )}
        </div>
    )
}
