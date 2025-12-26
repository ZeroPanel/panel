'use client';
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
  Play,
  RefreshCw,
  StopCircle,
  Cpu,
  Clock,
  MemoryStick,
  Send,
  Terminal,
} from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type LogEntry = {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'SERVER';
  message: string;
};

const initialLogs: LogEntry[] = [
  { time: '14:02:10', level: 'INFO', message: 'Starting minecraft server version 1.20.1' },
  { time: '14:02:10', level: 'INFO', message: 'Loading properties' },
  { time: '14:02:10', level: 'INFO', message: 'Default game type: SURVIVAL' },
  { time: '14:02:10', level: 'INFO', message: 'Generating keypair' },
  { time: '14:02:11', level: 'INFO', message: 'Starting Minecraft server on *:25565' },
  { time: '14:02:11', level: 'INFO', message: 'Using default channel type' },
  {
    time: '14:02:15',
    level: 'WARN',
    message: 'Ambiguity between arguments [teleport, destination] and [teleport, targets) with inputs: [Player, 0123, @e, dd12be42-52a9-4a91-a8a1-11c01849e498]',
  },
  { time: '14:02:18', level: 'INFO', message: 'Preparing level "world"' },
  { time: '14:02:20', level: 'INFO', message: 'Preparing start region for dimension minecraft:overworld' },
  { time: '14:02:22', level: 'INFO', message: 'Time elapsed: 4215 ms' },
  { time: '14:02:22', level: 'SUCCESS', message: 'Done (12.450s)! For help, type "help"' },
  { time: '14:05:01', level: 'INFO', message: 'Player AdminUser joined the game' },
  { time: '14:05:01', level: 'INFO', message: 'AdminUser[/127.0.0.1:54321] logged in with entity id 234 at (-120.5, 64.0, 201.3)' },
  {
    time: '14:10:45',
    level: 'ERROR',
    message: 'Could not pass event PlayerInteractEvent to Plugin v1.0\njava.lang.NullPointerException: null\nat com.example.plugin.Main.onInteract(Main.java:45)',
  },
  { time: '14:12:00', level: 'INFO', message: 'Saving...' },
  { time: '14:12:01', level: 'INFO', message: 'Saved the game' },
  { time: '14:15:22', level: 'INFO', message: 'Executing command: /say Hello World' },
  { time: '14:15:22', level: 'SERVER', message: 'Hello World' },
];

const levelStyles = {
  INFO: 'text-blue-400',
  WARN: 'text-yellow-400',
  ERROR: 'text-red-400',
  SUCCESS: 'text-green-400',
  SERVER: 'text-purple-400',
};

const ConsolePage = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [command, setCommand] = useState('');
  const [filter, setFilter] = useState('All');

  const handleSendCommand = () => {
    if (command.trim()) {
      const newLog: LogEntry = {
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        level: 'SERVER',
        message: command,
      };
      setLogs([...logs, newLog]);
      setCommand('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  };

  const filteredLogs = logs.filter(
    (log) => filter === 'All' || log.level === filter.toUpperCase()
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/my-servers">Servers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Minecraft SMP</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2 mt-2">
            <h1 className="text-2xl font-bold text-white">Minecraft SMP</h1>
             <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                Running
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400">
            <Play className="size-4 mr-2" />
            Start
          </Button>
          <Button variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-400">
            <RefreshCw className="size-4 mr-2" />
            Restart
          </Button>
          <Button variant="outline" className="bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-400">
            <StopCircle className="size-4 mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card-dark border-border-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">CPU Load</CardTitle>
            <Cpu className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
          </CardContent>
        </Card>
        <Card className="bg-card-dark border-border-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">RAM Usage</CardTitle>
            <MemoryStick className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              4.2 GB <span className="text-sm text-text-secondary">/ 8 GB</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card-dark border-border-dark">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Uptime</CardTitle>
            <Clock className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1d 08h 14m</div>
          </CardContent>
        </Card>
      </div>

      {/* Server Console */}
      <Card className="bg-card-dark border-border-dark flex flex-col flex-grow">
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-primary" />
            <CardTitle>Server Console</CardTitle>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-background-dark p-1">
            {['All', 'Info', 'Warn', 'Error'].map((level) => (
              <Button
                key={level}
                variant={filter === level ? 'default' : 'ghost'}
                size="sm"
                className="px-3 text-xs"
                onClick={() => setFilter(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-4 bg-background-dark/50 rounded-b-lg">
          <pre className="font-code text-sm whitespace-pre-wrap">
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex gap-4">
                <span className="text-text-secondary">[{log.time}]</span>
                <span className={`${levelStyles[log.level]} font-bold`}>
                  [{log.level}]
                </span>
                <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
              </div>
            ))}
          </pre>
        </CardContent>
        <div className="flex items-center gap-2 p-4 border-t border-border-dark bg-card-dark rounded-b-lg">
          <span className="text-green-400 font-code">root@server:~#</span>
          <Input
            placeholder="Type a command..."
            className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-code"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button size="icon" className="bg-primary hover:bg-primary/90" onClick={handleSendCommand}>
            <Send className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConsolePage;
