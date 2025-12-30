
"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ChevronsRight } from 'lucide-react';
import AnsiToHtml from 'ansi-to-html';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const converter = useRef(new AnsiToHtml({
      fg: '#FFF',
      bg: 'transparent',
      newline: false,
      escapeXML: true,
      stream: true,
      colors: {
        0: '#000', 1: '#A00', 2: '#0A0', 3: '#A50', 4: '#00A', 5: '#A0A', 6: '#0AA', 7: '#AAA',
        8: '#555', 9: '#F55', 10: '#5F5', 11: '#FF5', 12: '#55F', 13: '#F5F', 14: '#5FF', 15: '#FFF'
      }
  }));

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      const isScrolledToBottom = viewport.scrollHeight - viewport.clientHeight <= viewport.scrollTop + 20;
      if (isScrolledToBottom) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
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

  const renderLogLines = () => {
    let combinedHtml = '';
    const localConverter = new AnsiToHtml({
      fg: '#FFF',
      bg: 'transparent',
      newline: false,
      escapeXML: true,
      stream: true,
      colors: {
        0: '#000', 1: '#A00', 2: '#0A0', 3: '#A50', 4: '#00A', 5: '#A0A', 6: '#0AA', 7: '#AAA',
        8: '#555', 9: '#F55', 10: '#5F5', 11: '#FF5', 12: '#55F', 13: '#F5F', 14: '#5FF', 15: '#FFF'
      }
    });


    logs.forEach((log) => {
      if (log.type === 'input') {
        combinedHtml += `<div class="flex gap-2"><span class="text-emerald-400">$</span><span class="flex-1">${log.content}</span></div>`;
      } else if (log.type === 'system') {
        const style = log.error ? 'color: #f43f5e;' : 'color: #22d3ee;';
        combinedHtml += `<p style="${style}">[System] ${log.content}</p>`;
      } else { // 'log' or 'output'
        const isError = log.error || log.content.toLowerCase().includes('error');
        const colorClass = isError ? 'text-rose-400' : 'text-text-secondary';
        combinedHtml += `<div class="${colorClass}">${localConverter.toHtml(log.content)}</div>`;
      }
    });

    return <div dangerouslySetInnerHTML={{ __html: combinedHtml }} />;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 p-4 pt-0">
        <ScrollArea className="flex-1 bg-background-dark/50 rounded-t-lg font-code text-sm leading-relaxed" viewportRef={viewportRef}>
             <pre className="p-4 whitespace-pre-wrap">
                {renderLogLines()}
            </pre>
        </ScrollArea>
         <div className="flex items-center gap-2 p-2 border-t-2 border-background-dark/50 bg-background-dark/50 rounded-b-lg shrink-0">
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
