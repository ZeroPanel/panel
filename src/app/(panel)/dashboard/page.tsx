import { StatCard } from "@/components/dashboard/stat-card";
import { NetworkTrafficChart } from "@/components/dashboard/network-traffic-chart";
import { NodeHealth } from "@/components/dashboard/node-health";
import { ServerInstances } from "@/components/dashboard/server-instances";
import { HardDrive, Server, Cpu, MemoryStick } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-8">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Servers" 
          value="12" 
          delta="+2" 
          icon={Server} 
          progress={75}
          progressColor="bg-primary"
        />
        <StatCard 
          title="CPU Load" 
          value="45%" 
          delta="+5%" 
          deltaType="increase"
          icon={Cpu} 
          progress={45} 
          progressColor="bg-warning"
        />
        <StatCard 
          title="Memory Usage" 
          value="12" 
          icon={MemoryStick} 
          progress={37.5}
          progressColor="bg-primary"
          metric="GB"
          subMetric="of 32GB"
        />
        <StatCard 
          title="Disk Space" 
          value="1.2" 
          icon={HardDrive} 
          progress={20} 
          progressColor="bg-success"
          metric="TB"
          subMetric="Free"
        />
      </section>
      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetworkTrafficChart />
        </div>
        <div>
          <NodeHealth />
        </div>
      </section>
      
      <ServerInstances />

    </div>
  );
}
