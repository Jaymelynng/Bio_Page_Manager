import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePinAuth } from '@/hooks/usePinAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
import biohubHero from '@/assets/biohub-hero.png';

export default function AuthPage() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyPin, isAuthenticated, loading } = usePinAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/biopage');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, error } = await verifyPin(pin);
      
      if (success) {
        toast({
          title: 'Welcome!',
          description: 'You have been signed in successfully.',
        });
        navigate('/biopage');
      } else {
        toast({
          title: 'Invalid PIN',
          description: error || 'Please check your PIN and try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <img 
              src={biohubHero} 
              alt="BioHub" 
              className="h-16 w-auto mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to BioHub
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your PIN to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pin" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                PIN Code
              </Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
                minLength={4}
                maxLength={6}
                className="h-14 text-center text-2xl tracking-widest font-mono"
                autoComplete="off"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading || pin.length < 4}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
