import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, DollarSign, Home, MessageSquare, FileText, Users, Download } from 'lucide-react';
import { propertiesService } from '@/services/firestore/properties';
import { requestsService } from '@/services/firestore/requests';
import { blogsService } from '@/services/firestore/blogs';
import { analyticsService, type Visit } from '@/services/firestore/analytics';
import { teamService } from '@/services/firestore/team';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Stats {
  totalProperties: number;
  totalSales: number;
  totalRentals: number;
  totalRequests: number;
  totalBlogs: number;
  publishedBlogs: number;
  totalTeam: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalSales: 0,
    totalRentals: 0,
    totalRequests: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    totalTeam: 0,
  });
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [propertiesStats, requestsStats, blogsStats, visits, teamMembers] = await Promise.all([
        propertiesService.getStats(),
        requestsService.getStats(),
        blogsService.getStats().catch(() => ({ total: 0, published: 0 })),
        analyticsService.getRecentVisits(6),
        teamService.getAll().catch(() => [])
      ]);

      setStats({
        totalProperties: propertiesStats.total || 0,
        totalSales: propertiesStats.sales || 0,
        totalRentals: propertiesStats.rentals || 0,
        totalRequests: requestsStats.total || 0,
        totalBlogs: blogsStats.total || 0,
        publishedBlogs: blogsStats.published || 0,
        totalTeam: (teamMembers as any[]).length,
      });
      setRecentVisits(visits as Visit[]);
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const allVisits = await analyticsService.getRecentVisits(500);
      if (allVisits.length === 0) {
        toast.info("No activity to export");
        return;
      }

      const headers = ["Path", "Timestamp", "Session ID"];
      const csvContent = [
        headers.join(","),
        ...(allVisits as Visit[]).map(visit => [
          visit.path,
          visit.timestamp ? new Date(visit.timestamp as any).toISOString() : "N/A",
          visit.sessionId
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `nikas_realty_activity_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Recent activity exported successfully");
    } catch (error) {
      toast.error("Failed to export activity");
      console.error(error);
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
    {
      title: 'Team Members',
      value: stats.totalTeam,
      icon: Users,
      color: 'text-rose-600',
      href: '/admin/team'
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
            <Card
              key={card.title}
              className={card.href ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}
              onClick={() => card.href && navigate(card.href)}
            >
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {recentVisits.length > 0 ? (
              <div className="space-y-4">
                {recentVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Visitor viewed <span className="text-primary">{visit.path}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {visit.timestamp ? formatDistanceToNow(new Date(visit.timestamp as any), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      ID: {visit.sessionId.substring(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
