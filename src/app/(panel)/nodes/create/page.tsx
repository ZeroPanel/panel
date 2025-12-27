'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Cpu,
  Fingerprint,
  HardDrive,
  HelpCircle,
  Network,
  Plus,
  Settings2,
  Share,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Error';

type SystemInfo = {
    type: 'system_info';
    data: {
        storage: { total: number };
        ram: { total: number };
        cpu: { model: string; count: number };
    };
};

export default function CreateNodePage() {
  const [fqdn, setFqdn] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const [totalMemory, setTotalMemory] = useState('16384');
  const [totalDisk, setTotalDisk] = useState('512000');
  const [cpuInfo, setCpuInfo] = useState<{ model: string; count: number } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Clear previous connection if it exists
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      setCpuInfo(null);

      if (!fqdn) {
        setConnectionStatus('Disconnected');
        return;
      }

      setConnectionStatus('Connecting');

      try {
        const newWs = new WebSocket(`wss://${fqdn}`);
        wsRef.current = newWs;

        const openHandler = () => {
          setConnectionStatus('Connected');
          const payload = {
            website: window.location.hostname,
            dummyKey: 'a1b2-c3d4-e5f6-g7h8',
          };
          newWs.send(JSON.stringify(payload));
        };

        const messageHandler = (event: MessageEvent) => {
          try {
            const messageData: SystemInfo = JSON.parse(event.data);
            if (messageData.type === 'system_info') {
                const memoryMb = Math.round(messageData.data.ram.total / (1024 * 1024));
                const diskMb = Math.round(messageData.data.storage.total / (1024 * 1024));
                setTotalMemory(memoryMb.toString());
                setTotalDisk(diskMb.toString());
                setCpuInfo(messageData.data.cpu);
            }
          } catch (e) {
            console.log("WebSocket message received (not JSON):", event.data);
          }
        };

        const closeHandler = () => {
          // Only update status if this is still the active WebSocket instance
          if (wsRef.current === newWs) {
            setConnectionStatus('Disconnected');
            setCpuInfo(null);
          }
        };
        
        const errorHandler = (error: Event) => {
          console.error('WebSocket Error:', error);
          if (wsRef.current === newWs) {
            setConnectionStatus('Error');
            setCpuInfo(null);
          }
          newWs.close();
        };
        
        newWs.addEventListener('open', openHandler);
        newWs.addEventListener('message', messageHandler);
        newWs.addEventListener('close', closeHandler);
        newWs.addEventListener('error', errorHandler);

      } catch (e) {
        console.error("Failed to create WebSocket:", e);
        setConnectionStatus('Error');
        setCpuInfo(null);
      }

    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [fqdn]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  const statusConfig: Record<ConnectionStatus, { icon: React.ReactNode; text: string; color: string }> = {
    'Disconnected': { icon: <WifiOff size={16} />, text: 'No Connection', color: 'text-text-secondary' },
    'Connecting': { icon: <HelpCircle size={16} className="animate-pulse" />, text: 'Connecting...', color: 'text-amber-400' },
    'Connected': { icon: <Wifi size={16} />, text: 'Connected', color: 'text-emerald-400' },
    'Error': { icon: <WifiOff size={16} />, text: 'Connection Failed', color: 'text-rose-400' },
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/nodes">Nodes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Node</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-white">Create New Node</h1>
          <p className="text-text-secondary mt-1">
            Configure the connection details, resource limits, and allocation
            settings for a new server node.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Fingerprint className="text-primary size-6" />
              <CardTitle>Identification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="node-name">Node Name</Label>
                  <Input id="node-name" placeholder="e.g. node01.mars" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="New York, USA (US-NYC-01)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-nyc-01">
                        New York, USA (US-NYC-01)
                      </SelectItem>
                      <SelectItem value="de-fra-01">
                        Frankfurt, DE (DE-FRA-01)
                      </SelectItem>
                      <SelectItem value="jp-tok-01">
                        Tokyo, JP (JP-TOK-01)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe the purpose or physical location of this node."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-3">
                <Switch id="public-node" />
                <div>
                  <Label htmlFor="public-node">Public Node</Label>
                  <p className="text-sm text-text-secondary">
                    Allow automatic allocation to this node.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Settings2 className="text-primary size-6" />
                    <CardTitle>Configuration</CardTitle>
                </div>
                <div className={cn("flex items-center gap-2 text-xs font-medium", statusConfig[connectionStatus].color)}>
                  {statusConfig[connectionStatus].icon}
                  {statusConfig[connectionStatus].text}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fqdn">Fully Qualified Domain Name</Label>
                <div className="relative">
                   <Network className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                   <Input id="fqdn" placeholder="node.example.com" className="pl-10" value={fqdn} onChange={(e) => setFqdn(e.target.value)} />
                </div>
                <p className="text-sm text-text-secondary">
                  Enter the domain name used to connect to the daemon. An IP
                  address can technically be used but is not recommended for SSL.
                </p>
              </div>
                {cpuInfo && connectionStatus === 'Connected' && (
                    <div className="p-4 bg-card-dark border border-border-dark rounded-lg flex items-center gap-4">
                        <Cpu className="text-blue-400" size={32} />
                        <div>
                            <p className="text-white font-medium">{cpuInfo.model}</p>
                            <p className="text-sm text-text-secondary">{cpuInfo.count} Cores</p>
                        </div>
                    </div>
                )}
                 <div className="flex items-center space-x-3 p-4 bg-card-dark border border-border-dark rounded-lg">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-md">
                        <Share size={20} />
                    </div>
                    <div>
                        <Label htmlFor="ssl">Communicate over SSL</Label>
                        <p className="text-sm text-text-secondary">
                          Secure the connection between the panel and daemon.
                        </p>
                    </div>
                    <Switch id="ssl" defaultChecked className="ml-auto"/>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-8 sticky top-24">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <HardDrive className="text-primary size-6" />
              <CardTitle>Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="total-memory">Total Memory</Label>
                    <span className="text-xs font-medium bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">RAM</span>
                </div>
                <div className="flex items-center gap-2">
                    <Input id="total-memory" value={totalMemory} onChange={(e) => setTotalMemory(e.target.value)} />
                    <span className="text-sm text-text-secondary font-medium">MB</span>
                </div>
                 <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-sm">
                        <Label>Over-allocation</Label>
                        <span className="font-medium">0%</span>
                    </div>
                    <Slider defaultValue={[0]} max={200} step={10} />
                    <p className="text-xs text-text-secondary">Set to 0 to disable over-allocation.</p>
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label htmlFor="total-disk">Total Disk Space</Label>
                    <span className="text-xs font-medium bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">SSD</span>
                </div>
                <div className="flex items-center gap-2">
                    <Input id="total-disk" value={totalDisk} onChange={(e) => setTotalDisk(e.target.value)} />
                    <span className="text-sm text-text-secondary font-medium">MB</span>
                </div>
                 <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-sm">
                        <Label>Over-allocation</Label>
                        <span className="font-medium">0%</span>
                    </div>
                    <Slider defaultValue={[0]} max={200} step={10} />
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       <div className="py-4 border-t border-border-dark flex items-center justify-between sticky bottom-0 bg-background z-10">
          <p className="text-sm text-text-secondary">Changes are not saved until you click create.</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/nodes">Cancel</Link>
            </Button>
            <Button>
              <Plus className="mr-2" />
              Create Node
            </Button>
          </div>
        </div>
    </div>
  );
}
