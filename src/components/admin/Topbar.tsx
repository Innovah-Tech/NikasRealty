import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Welcome back, {user?.displayName || user?.email || 'Admin'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/admin/add-property')}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Property
          </Button>
          <Button
            variant="outline"
            onClick={logout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

