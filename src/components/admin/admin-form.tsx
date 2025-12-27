"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

type BackendType = "none" | "firebase" | "supabase" | "rest";

type AdminFormValues = {
  backend: BackendType;
  enabled: boolean;
  config: {
    firebase: { projectId: string; apiKey: string };
    supabase: { projectUrl: string; anonKey: string };
    rest: { apiUrl: string; authToken: string };
  };
};

const defaultValues: AdminFormValues = {
  backend: "none",
  enabled: false,
  config: {
    firebase: { projectId: "", apiKey: "" },
    supabase: { projectUrl: "", anonKey: "" },
    rest: { apiUrl: "", authToken: "" },
  },
};

export function AdminForm() {
  const [savedConfig, setSavedConfig] = useLocalStorage<AdminFormValues>("admin-config", defaultValues);
  const { control, handleSubmit, reset } = useForm<AdminFormValues>({
    defaultValues: savedConfig,
  });
  const { toast } = useToast();

  const watchedBackend = useWatch({ control, name: "backend" });
  const isEnabled = useWatch({ control, name: "enabled" });

  const onSubmit = (data: AdminFormValues) => {
    setSavedConfig(data);
    toast({
      title: "Admin Configuration Saved",
      description: "Your backend configuration has been saved locally.",
    });
  };

  const connectionStatus = isEnabled && watchedBackend !== 'none' ? "Connected" : "Disabled";
  const connectionVariant = connectionStatus === 'Connected' ? 'default' : 'secondary';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Admin Backend Configuration</CardTitle>
            <Badge variant={connectionVariant}>Status: {connectionStatus}</Badge>
          </div>
          <CardDescription>Configure the backend connection for your panel. This is a UI-only developer tool.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 [&>svg]:text-yellow-500">
            <Info className="h-4 w-4" />
            <AlertTitle>Developer Note</AlertTitle>
            <AlertDescription>
              This panel is for debug purposes. Backend integration is not yet implemented, and this configuration is only saved to your browser's local storage.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Backend Provider</Label>
            <Controller
              name="backend"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a backend" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Mock Data)</SelectItem>
                    <SelectItem value="firebase">Firebase</SelectItem>
                    <SelectItem value="supabase">Supabase</SelectItem>
                    <SelectItem value="rest">REST API</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {watchedBackend === "firebase" && (
            <Card className="bg-background/50">
              <CardHeader><CardTitle>Firebase Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project ID</Label>
                  <Controller name="config.firebase.projectId" control={control} render={({ field }) => <Input {...field} placeholder="your-firebase-project-id" />} />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Controller name="config.firebase.apiKey" control={control} render={({ field }) => <Input type="password" {...field} placeholder="your-firebase-api-key" />} />
                </div>
              </CardContent>
            </Card>
          )}

          {watchedBackend === "supabase" && (
             <Card className="bg-background/50">
              <CardHeader><CardTitle>Supabase Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project URL</Label>
                  <Controller name="config.supabase.projectUrl" control={control} render={({ field }) => <Input {...field} placeholder="https://<project>.supabase.co" />} />
                </div>
                <div className="space-y-2">
                  <Label>Anon (Public) Key</Label>
                  <Controller name="config.supabase.anonKey" control={control} render={({ field }) => <Input type="password" {...field} placeholder="your-supabase-anon-key"/>} />
                </div>
              </CardContent>
            </Card>
          )}

          {watchedBackend === "rest" && (
            <Card className="bg-background/50">
                <CardHeader><CardTitle>REST API Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label>API URL</Label>
                    <Controller name="config.rest.apiUrl" control={control} render={({ field }) => <Input {...field} placeholder="https://your-api.com/v1" />} />
                    </div>
                    <div className="space-y-2">
                    <Label>Auth Token</Label>
                    <Controller name="config.rest.authToken" control={control} render={({ field }) => <Input type="password" {...field} placeholder="your-bearer-token" />} />
                    </div>
                </CardContent>
            </Card>
          )}

        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
            <div className="flex items-center space-x-2">
                <Controller name="enabled" control={control} render={({ field }) => <Switch id="enabled" checked={field.value} onCheckedChange={field.onChange} disabled={watchedBackend === 'none'} />} />
                <Label htmlFor="enabled">Enable Backend Connection</Label>
            </div>
            <div className="flex justify-end w-full gap-2">
                <Button type="button" variant="outline" onClick={() => reset(savedConfig)}>Reset</Button>
                <Button type="submit">Save Configuration</Button>
            </div>
        </CardFooter>
      </Card>
    </form>
  );
}
