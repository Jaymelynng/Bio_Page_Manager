import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { usePinAuth } from '@/hooks/usePinAuth';

export default function NoAccess() {
  const navigate = useNavigate();
  const { signOut } = usePinAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/biopage/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
          <CardDescription>
            This area is for administrators only. Your PIN does not have admin permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} className="w-full" variant="outline">
            Sign out and try a different PIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
