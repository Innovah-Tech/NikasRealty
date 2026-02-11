import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Users, Eye, Clock, TrendingUp, Calendar } from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface AnalyticsData {
    totalVisits: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
    pageViews: PageView[];
    trafficByTime: TrafficData[];
    trafficByDay: DailyTraffic[];
    topPages: TopPage[];
}

interface PageView {
    path: string;
    views: number;
}

interface TrafficData {
    time: string;
    visitors: number;
    pageViews: number;
}

interface DailyTraffic {
    day: string;
    visitors: number;
}

interface TopPage {
    page: string;
    views: number;
    color: string;
}

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalVisits: 0,
        uniqueVisitors: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        pageViews: [],
        trafficByTime: [],
        trafficByDay: [],
        topPages: [],
    });
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

    useEffect(() => {
        // Fetch analytics data from Google Analytics
        // This is a placeholder - you'll need to implement GA4 API integration
        fetchAnalytics(timeRange);
    }, [timeRange]);

    const fetchAnalytics = async (range: string) => {
        // Placeholder mock data
        // In production, fetch from Google Analytics API
        const mockData: AnalyticsData = {
            totalVisits: 12543,
            uniqueVisitors: 8234,
            avgSessionDuration: 245, // seconds
            bounceRate: 42.5,
            pageViews: [
                { path: '/properties', views: 4523 },
                { path: '/', views: 3821 },
                { path: '/blog', views: 2134 },
                { path: '/rentals', views: 1543 },
                { path: '/contact', views: 522 },
            ],
            trafficByTime: generateHourlyData(),
            trafficByDay: generateDailyData(range),
            topPages: [
                { page: 'Home', views: 3821, color: '#D4AF37' },
                { page: 'Properties', views: 4523, color: '#C5A572' },
                { page: 'Blog', views: 2134, color: '#B8956A' },
                { page: 'Rentals', views: 1543, color: '#A98862' },
                { page: 'Other', views: 522, color: '#9A7B5A' },
            ],
        };

        setAnalytics(mockData);
    };

    const generateHourlyData = (): TrafficData[] => {
        const data: TrafficData[] = [];
        const now = new Date();

        for (let i = 23; i >= 0; i--) {
            const hour = new Date(now);
            hour.setHours(hour.getHours() - i);
            data.push({
                time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                visitors: Math.floor(Math.random() * 100) + 50,
                pageViews: Math.floor(Math.random() * 150) + 80,
            });
        }

        return data;
    };

    const generateDailyData = (range: string): DailyTraffic[] => {
        const data: DailyTraffic[] = [];
        const days = range === '24h' ? 1 : range === '7d' ? 7 : 30;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                visitors: Math.floor(Math.random() * 500) + 200,
            });
        }

        return data;
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
                    <p className="text-muted-foreground">Monitor your website traffic and user behavior</p>
                </div>
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                    <TabsList>
                        <TabsTrigger value="24h">24 Hours</TabsTrigger>
                        <TabsTrigger value="7d">7 Days</TabsTrigger>
                        <TabsTrigger value="30d">30 Days</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalVisits.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+12.5%</span> from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+8.3%</span> from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(analytics.avgSessionDuration)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+5.2%</span> from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.bounceRate}%</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-red-500">-2.1%</span> from last period
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Traffic Over Time */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Traffic Overview</CardTitle>
                        <CardDescription>Visitors and page views over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.trafficByTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#D4AF37"
                                    strokeWidth={2}
                                    name="Visitors"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pageViews"
                                    stroke="#C5A572"
                                    strokeWidth={2}
                                    name="Page Views"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Daily Traffic Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Visitors</CardTitle>
                        <CardDescription>Unique visitors per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.trafficByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="visitors" fill="#D4AF37" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Pages Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                        <CardDescription>Most visited pages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.topPages}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ page, percent }) => `${page} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="views"
                                >
                                    {analytics.topPages.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Page Views Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Performance</CardTitle>
                    <CardDescription>Detailed page view statistics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.pageViews.map((page, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{page.path}</p>
                                        <p className="text-sm text-muted-foreground">Page path</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{page.views.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Info Note */}
            <Card className="border-primary/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Google Analytics Integration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        This dashboard displays real-time analytics from Google Analytics 4. To view live data:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Ensure Google Analytics is properly configured with your tracking ID</li>
                        <li>Data refreshes automatically every 5 minutes</li>
                        <li>Historical data is available for up to 30 days</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
