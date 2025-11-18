import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '@/utils/axiosClient';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (setLoadingState = true) => {
    try {
      const response = await axiosClient.get('/auth/me');
      if (response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('❌ Failed to fetch user:', error);
        console.error('Response:', error.response?.data);
      }
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  };

  const login = async (email: string, password: string) => {
    // Clear any existing token before attempting login
    localStorage.removeItem('token');
    setUser(null);
    
    try {
      if (import.meta.env.DEV) {
        console.log('🔐 Attempting login for:', email);
      }
      
      // Step 1: Authenticate and get token
      const response = await axiosClient.post('/auth/login', { email, password });
      
      if (!response.data?.token) {
        throw new Error('No token received from server');
      }
      
      const { token } = response.data;
      if (import.meta.env.DEV) {
        console.log('✅ Login successful, token received');
      }
      
      // Step 2: Store token temporarily (will be removed if fetchUser fails)
      localStorage.setItem('token', token);
      
      // Step 3: Fetch user data to verify token and get user info
      try {
        const userData = await fetchUser(false);
        
        if (!userData) {
          throw new Error('Failed to fetch user data');
        }
        
        if (import.meta.env.DEV) {
          console.log('✅ User data fetched:', userData.email);
        }
        
        // Ensure user state is set before navigation
        setUser(userData);
        setLoading(false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Setting user and navigating to dashboard');
          console.log('User data:', userData);
        }
        
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          if (import.meta.env.DEV) {
            console.log('🚀 Navigating to /dashboard');
          }
          navigate('/dashboard', { replace: true });
        }, 100);
      } catch (fetchError: any) {
        // If fetchUser fails, remove the token and rethrow
        if (import.meta.env.DEV) {
          console.error('❌ Failed to fetch user after login:', fetchError);
        }
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        
        // Provide more specific error message
        if (fetchError.response?.status === 401) {
          throw new Error('Authentication failed. Please try logging in again.');
        } else if (fetchError.response?.status === 404) {
          throw new Error('User endpoint not found. Please check your backend configuration.');
        } else {
          throw new Error('Failed to verify authentication. Please try again.');
        }
      }
    } catch (error: any) {
      // Clean up on any error
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      
      if (import.meta.env.DEV) {
        console.error('❌ Login failed:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      
      // Re-throw the error so the Login component can handle it
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
