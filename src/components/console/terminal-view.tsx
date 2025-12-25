"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const initialLogs = [
  'Starting NebulaPanel v1.0.0...',
  'Connecting to server srv-1...',
  'Authentication successful.',
  'Loading environment variables...',
  'Server listening on port 3000.',
];

const randomLogs = [
  'GET /api/users 200 OK',
  'POST /api/data 201 Created',
  'WARN: High memory usage detected: 85%',
  'ERROR: Database connection lost. Reconnecting...',
  'INFO: User "admin" logged in from 192.168.1.100',
  'DEBUG: Processing background job #12345',
];

export function TerminalView() {
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [command, setCommand] = useState('');
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prevLogs) => [
        ...prevLogs,
        `[${new Date().toLocaleTimeString()}] ${randomLogs[Math.floor(Math.random() * randomLogs.length)]}`,
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSendCommand = () => {
    if (command.trim()) {
      setLogs((prevLogs) => [
        ...prevLogs,
        `> ${command}`,
        `Executing command: ${command}... (UI simulation)`,
      ]);
      setCommand('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  }

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader>
        <CardTitle>Server Console</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <div className="flex-grow bg-card-foreground/5 p-4 rounded-md overflow-y-auto">
          <pre className="font-code text-sm whitespace-pre-wrap">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            <div ref={endOfLogsRef} />
          </pre>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type a command..."
            className="font-code"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSendCommand}>
            <Send className="size-4" />
            <span className="sr-only">Send Command</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
