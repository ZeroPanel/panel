"use client";

import { mockFiles } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Folder, MoreVertical, Trash, Upload, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function FileExplorer() {
  const { toast } = useToast();

  const handleAction = (action: string, fileName: string) => {
    toast({
      title: `${action} triggered`,
      description: `Action "${action}" on "${fileName}" is a UI simulation.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>File Manager</CardTitle>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAction('Upload', 'new file(s)')}>
                <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  {file.type === 'folder' ? <Folder className="text-accent" /> : <File />}
                </TableCell>
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell>{file.size || '—'}</TableCell>
                <TableCell>{file.modified}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('Rename', file.name)}>
                        <Pencil className="mr-2 h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Delete', file.name)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
