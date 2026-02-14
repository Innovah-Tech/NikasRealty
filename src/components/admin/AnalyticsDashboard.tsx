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

import { analyticsService } from '@/services/firestore/analytics';

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
    const [realTimeStats, setRealTimeStats] = useState<{ activeNow: number }>({ activeNow: 0 });
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

    useEffect(() => {
        fetchAnalytics(timeRange);

        // Polling for real-time stats every 30 seconds
        const rtInterval = setInterval(async () => {
            const stats = await analyticsService.getRealTimeStats();
            if (stats) {
                setRealTimeStats({ activeNow: stats.activeNow });
            }
        }, 30000);

        // Initial fetch
        analyticsService.getRealTimeStats().then(stats => {
            if (stats) setRealTimeStats({ activeNow: stats.activeNow });
        });

        return () => clearInterval(rtInterval);
    }, [timeRange]);

    const fetchAnalytics = async (range: string) => {
        try {
            const days = range === '24h' ? 1 : range === '7d' ? 7 : 30;
            const [stats, traffic] = await Promise.all([
                analyticsService.getRealTimeStats(),
                analyticsService.getHistoricalTraffic(days)
            ]);

            if (!stats) return;

            // Map Firestore stats to Dashboard format for Pie Chart and Table
            const pageViews = Object.entries(stats.pageViews)
                .filter(([key]) => key !== 'total' && key !== 'lastUpdated')
                .map(([key, value]) => ({
                    path: key.replace(/_/g, '/'),
                    views: value as number
                }))
                .sort((a, b) => b.views - a.views);

            const colors = ['#D4AF37', '#C5A572', '#B8956A', '#A98862', '#9A7B5A'];
            const topPages = pageViews.slice(0, 5).map((pv, i) => ({
                page: pv.path === '/' || pv.path === 'home' ? 'Home' : pv.path,
                views: pv.views,
                color: colors[i % colors.length]
            }));

            // Calculate estimated visitors (simplified)
            const uniqueVisitors = traffic.daily.reduce((acc, curr) => acc + curr.visitors, 0);

            setAnalytics(prev => ({
                ...prev,
                totalVisits: (stats.pageViews.total as number) || 0,
                uniqueVisitors: uniqueVisitors,
                avgSessionDuration: traffic.avgSessionDuration,
                bounceRate: traffic.bounceRate,
                pageViews: pageViews,
                topPages: topPages,
                trafficByTime: traffic.hourly,
                trafficByDay: traffic.daily.length > 0 ? traffic.daily : [{ day: 'No Data', visitors: 0 }],
            }));
        } catch (error) {
            console.error('Error fetching dashboard analytics:', error);
        }
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
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '24h' | '7d' | '30d')}>
                    <TabsList>
                        <TabsTrigger value="24h">24 Hours</TabsTrigger>
                        <TabsTrigger value="7d">7 Days</TabsTrigger>
                        <TabsTrigger value="30d">30 Days</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Active Now</CardTitle>
                        <Activity className="h-4 w-4 text-primary animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{realTimeStats.activeNow}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Users online right now
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalVisits.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all pages
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Total unique sessions
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Average time on site
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Single page sessions
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
            <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary font-bold">
                        <Activity className="h-5 w-5" />
                        Real-time Analytics System
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-foreground/80">
                    <p>
                        This dashboard provides live visibility into your website traffic, powered directly by your custom Firestore tracking system:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Live Refresh</strong>: Dashboard data updates automatically every 30 seconds.</li>
                        <li><strong>Session Tracking</strong>: Active user counts reflect real people browsing right now.</li>
                        <li><strong>Direct Logging</strong>: Every page visit is recorded and aggregated into these charts instantly.</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                        Note: This data is separate from Google Analytics and represents immediate, raw traffic to Nikas Realty.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
