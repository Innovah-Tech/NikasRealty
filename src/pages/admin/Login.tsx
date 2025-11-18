import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConfigError, setApiConfigError] = useState(false);
  const { login } = useAuth();

  // Set generic page title
  useEffect(() => {
    document.title = 'Login - NikasRealty';
    return () => {
      document.title = 'Nikas Realty - We Turn Dreams Into Reality';
    };
  }, []);

  useEffect(() => {
    // Only show error in production if VITE_API_URL is not set
    // In development, localhost is fine
    const apiUrl = import.meta.env.VITE_API_URL;
    const isProduction = import.meta.env.PROD;
    
    if (isProduction && !apiUrl) {
      setApiConfigError(true);
    } else if (import.meta.env.DEV) {
      // In development, log but don't show error
      console.log('🔗 API URL:', apiUrl || 'http://localhost:4000/api (default)');
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
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle different error types
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        // Only show config error in production
        if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
          errorMessage = 'API URL not configured. Please set VITE_API_URL in Vercel environment variables.';
          setApiConfigError(true);
        } else if (import.meta.env.DEV) {
          errorMessage = 'Cannot connect to backend. Make sure the backend server is running on http://localhost:4000';
        }
      } else if (error.response?.status === 404) {
        // Only show config error in production
        if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
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
          <CardTitle className="text-2xl">NikasRealty</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
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
                placeholder="your.email@example.com"
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

export default AdminLogin;

