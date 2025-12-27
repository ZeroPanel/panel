"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileWarning, Code } from "lucide-react";

export default function EditorPage() {
  const [filePath, setFilePath] = useState("src/app/page.tsx");
  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
  };
  
  const handleSaveFile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: fileContent }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save file.');
      }

      toast({
        title: "File Saved",
        description: `Successfully saved ${filePath}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: "Error Saving File",
        description: errorMessage,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code />
                    App Code Editor
                </CardTitle>
                <CardDescription>
                    A developer tool to directly edit application files. Use with caution.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <Alert variant="destructive" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 [&>svg]:text-yellow-500">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                        You are editing the application's source code directly. Incorrect changes can break the app. This feature is disabled in production.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Label htmlFor="file-path">File Path</Label>
                    <Input 
                        id="file-path"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        placeholder="e.g., src/app/page.tsx" 
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="file-content">File Content</Label>
                    <Textarea 
                        id="file-content"
                        value={fileContent}
                        onChange={handleFileContentChange}
                        placeholder="// File content will appear here..."
                        className="font-code min-h-[400px]"
                    />
                </div>
                
                <div className="flex justify-end">
                    <Button onClick={handleSaveFile} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save File'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
