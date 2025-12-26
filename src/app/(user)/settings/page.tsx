import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserSettingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-card-dark border-border-dark">
        <CardHeader>
          <CardTitle className="text-white">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">Settings page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
