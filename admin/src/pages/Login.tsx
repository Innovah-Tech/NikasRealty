import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConfigError, setApiConfigError] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    // Check if API URL is configured
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl || apiUrl.includes('localhost')) {
      setApiConfigError(true);
      console.error('API URL not configured:', apiUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setLoading(true);

    try {
      await login(email, password);
      // Only show success if login completes without errors
      // (login function handles navigation, so this won't execute if there's an error)
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle different error types
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        if (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL?.includes('localhost')) {
          errorMessage = 'API URL not configured. Please set VITE_API_URL in Vercel environment variables.';
          setApiConfigError(true);
        }
      } else if (error.response?.status === 404) {
        if (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL?.includes('localhost')) {
          errorMessage = 'API URL not configured. Please set VITE_API_URL in Vercel environment variables.';
          setApiConfigError(true);
        } else {
          errorMessage = 'API endpoint not found. Please check your backend configuration.';
        }
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request. Please check your input.';
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.error || 'Invalid email or password.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">NikasRealty Admin</CardTitle>
          <CardDescription>Sign in to manage your properties</CardDescription>
        </CardHeader>
        <CardContent>
          {apiConfigError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="font-semibold mb-1">VITE_API_URL is not set in Vercel.</p>
                <p className="text-sm mb-2">To fix this:</p>
                <ol className="text-sm list-decimal list-inside space-y-1">
                  <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                  <li>Add: <code className="bg-muted px-1 rounded">VITE_API_URL</code> = <code className="bg-muted px-1 rounded">https://your-backend.onrender.com/api</code></li>
                  <li>Select "Production" environment</li>
                  <li>Redeploy your project</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@nikasrealty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
