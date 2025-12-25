import { StatCard } from "@/components/dashboard/stat-card";
import { NetworkTrafficChart } from "@/components/dashboard/network-traffic-chart";
import { NodeHealth } from "@/components/dashboard/node-health";
import { ServerInstances } from "@/components/dashboard/server-instances";
import { HardDrive, Server, Cpu, MemoryStick, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Servers" 
          value="12" 
          delta="+2" 
          icon={Server} 
          progress={66}
          progressColor="bg-cyan-500"
          metric="" />
        <StatCard 
          title="CPU Load" 
          value="45%" 
          delta="+5%" 
          deltaType="increase"
          icon={Cpu} 
          progress={45} 
          progressColor="bg-yellow-500"
          metric="" />
        <StatCard 
          title="Memory Usage" 
          value="12" 
          icon={MemoryStick} 
          progress={37.5}
          progressColor="bg-cyan-500"
          metric="GB of 32GB" />
        <StatCard 
          title="Disk Space" 
          value="1.2" 
          icon={HardDrive} 
          progress={12} 
          progressColor="bg-cyan-500"
          metric="TB Free" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetworkTrafficChart />
        </div>
        <div>
          <NodeHealth />
        </div>
      </div>
      
      <ServerInstances />

    </div>
  );
}
