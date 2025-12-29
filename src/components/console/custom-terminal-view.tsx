"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Log = {
  type: 'log' | 'input' | 'output' | 'system';
  content: string;
  error?: boolean;
};

interface CustomTerminalViewProps {
  logs: Log[];
  onCommand: (command: string) => void;
}

export function CustomTerminalView({ logs, onCommand }: CustomTerminalViewProps) {
  const [command, setCommand] = useState('');
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSendCommand = () => {
    if (command.trim()) {
      onCommand(command);
      setCommand('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  }

  const renderLogLine = (log: Log, index: number) => {
    const isError = log.error || log.content.toLowerCase().includes('error');
    switch (log.type) {
      case 'input':
        return (
          <div key={index} className="flex gap-2">
            <span className="text-emerald-400">$</span>
            <span className="flex-1">{log.content}</span>
          </div>
        );
      case 'system':
        return <p key={index} className={cn("text-cyan-400", log.error && "text-rose-400")}>[System] {log.content}</p>;
      case 'output':
        return <pre key={index} className="text-text-secondary whitespace-pre-wrap">{log.content}</pre>;
      case 'log':
      default:
        return (
          <p key={index} className={cn("text-text-secondary", isError && "text-rose-400")}>
            {log.content}
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col h-full flex-grow p-4 pt-0">
        <div className="flex-grow bg-background-dark/50 p-4 rounded-t-lg overflow-y-auto font-code text-sm leading-relaxed no-scrollbar">
            {logs.map(renderLogLine)}
            <div ref={endOfLogsRef} />
        </div>
         <div className="flex items-center gap-2 p-2 border-t-2 border-background-dark/50 bg-background-dark/50 rounded-b-lg">
            <ChevronsRight className="text-primary size-5 shrink-0"/>
            <Input
                placeholder="Type a command and press Enter..."
                className="font-code bg-transparent border-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
            />
            <Button onClick={handleSendCommand} size="sm" className="bg-primary/80 hover:bg-primary">
                <Send className="size-4" />
                <span className="sr-only">Send Command</span>
            </Button>
        </div>
    </div>
  );
}
