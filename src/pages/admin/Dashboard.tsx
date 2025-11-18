import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, DollarSign, Home, MessageSquare, FileText } from 'lucide-react';
import { propertiesService } from '@/services/firestore/properties';
import { requestsService } from '@/services/firestore/requests';
import { blogsService } from '@/services/firestore/blogs';
import { toast } from 'sonner';

interface Stats {
  totalProperties: number;
  totalSales: number;
  totalRentals: number;
  totalRequests: number;
  totalBlogs: number;
  publishedBlogs: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalSales: 0,
    totalRentals: 0,
    totalRequests: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [propertiesStats, requestsStats, blogsStats] = await Promise.all([
        propertiesService.getStats(),
        requestsService.getStats(),
        blogsService.getStats().catch(() => ({ total: 0, published: 0 })),
      ]);

      setStats({
        totalProperties: propertiesStats.total || 0,
        totalSales: propertiesStats.sales || 0,
        totalRentals: propertiesStats.rentals || 0,
        totalRequests: requestsStats.total || 0,
        totalBlogs: blogsStats.total || 0,
        publishedBlogs: blogsStats.published || 0,
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
    {
      title: 'Blog Posts',
      value: stats.totalBlogs,
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Published Blogs',
      value: stats.publishedBlogs,
      icon: FileText,
      color: 'text-indigo-600',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

export default AdminDashboard;
