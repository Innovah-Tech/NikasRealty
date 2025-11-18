import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { isUsingFallbackApiUrl } from '@/config/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Set generic page title
  useEffect(() => {
    document.title = 'Login - NikasRealty';
    return () => {
      document.title = 'Nikas Realty - We Turn Dreams Into Reality';
    };
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const apiUrl = isUsingFallbackApiUrl()
        ? 'https://your-backend.onrender.com/api (fallback)'
        : import.meta.env.VITE_API_URL;
      console.log('API URL:', apiUrl);
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
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check your backend configuration.';
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

