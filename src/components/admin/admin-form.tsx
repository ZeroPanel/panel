"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Server, Database, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

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

const databaseOptions: { id: BackendType; name: string; logo: React.ReactNode; }[] = [
    {
      id: "none",
      name: "None (Mock Data)",
      logo: <Server className="size-8" />,
    },
    {
      id: "firebase",
      name: "Firebase",
      logo: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#f57c00" d="M3.13 10.13L1.28 9L0 10.73l2.25 1.93l.02.02L8.5 18l3.5-6Z"/><path fill="#ffca28" d="m17.61 1.45l-1.42 1.42l-2.06 2.06l-1.22 1.22L3.13 10.13l5.37 7.87l3.5-6l5.62-5.62l1.42-1.42z"/><path fill="#ffa000" d="M17.61 1.45L8.5 10.55v7.45l9.11-16.55Z"/><path fill="#42a5f5" d="M8.5 18v5.5l12-12l-6.38-6.38z"/></svg>
      ),
    },
    {
      id: "supabase",
      name: "Supabase",
      logo: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#3ecf8e" d="M12.28.32a.49.49 0 0 0-.56 0L.32 7.55a.48.48 0 0 0-.25.35c-.03.1-.03.22.02.32L4.03 21.7a.48.48 0 0 0 .44.3h15.06a.48.48.0 0 0 .44-.3l3.94-13.48c.05-.1.05-.22.02-.32a.48.48 0 0 0-.25-.35L12.28.32Zm.46 15.65c-2.9 1.44-6.33-1.07-6.33-4.32c0-3.25 3.52-6.04 6.43-4.5s2.7 5.95-2.22 8.82Z"/></svg>
      ),
    },
    {
      id: "rest",
      name: "REST API",
      logo: <Database className="size-8" />,
    },
  ];

export function AdminForm() {
  const [savedConfig, setSavedConfig] = useLocalStorage<AdminFormValues>("admin-config", defaultValues);
  const { control, handleSubmit, reset, setValue } = useForm<AdminFormValues>({
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

          <div className="space-y-4">
            <Label className="text-base font-semibold">Panel Database</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {databaseOptions.map((option) => (
                <Card
                  key={option.id}
                  onClick={() => setValue("backend", option.id)}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors relative",
                    watchedBackend === option.id && "border-primary ring-2 ring-primary"
                  )}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                    {option.logo}
                    <p className="text-sm font-medium text-center">{option.name}</p>
                    {watchedBackend === option.id && (
                        <div className="absolute top-2 right-2 text-primary">
                            <CheckCircle className="size-5" />
                        </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
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
