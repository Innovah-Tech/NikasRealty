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
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
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
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      // Fetch user data after login (don't set loading state since we're navigating)
      const userData = await fetchUser(false);
      // Ensure user data was fetched successfully before navigation
      if (userData) {
        setLoading(false);
        navigate('/dashboard');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
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
