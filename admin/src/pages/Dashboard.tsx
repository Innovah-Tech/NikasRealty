import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, DollarSign, Home, MessageSquare } from 'lucide-react';
import { axiosClient } from '@/utils/axiosClient';
import { toast } from 'sonner';

interface Stats {
  totalProperties: number;
  totalSales: number;
  totalRentals: number;
  totalRequests: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalSales: 0,
    totalRentals: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [propertiesRes, requestsRes] = await Promise.all([
        axiosClient.get('/properties/stats'),
        axiosClient.get('/requests/stats'),
      ]);

      setStats({
        totalProperties: propertiesRes.data.total || 0,
        totalSales: propertiesRes.data.sales || 0,
        totalRentals: propertiesRes.data.rentals || 0,
        totalRequests: requestsRes.data.total || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      color: 'text-primary',
    },
    {
      title: 'Sales Listings',
      value: stats.totalSales,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Rental Listings',
      value: stats.totalRentals,
      icon: Home,
      color: 'text-blue-600',
    },
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: MessageSquare,
      color: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-8 w-8 rounded-full bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your real estate portfolio</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Property management and analytics coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
