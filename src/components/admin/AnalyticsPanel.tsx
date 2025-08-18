import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';

export default function AnalyticsPanel() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  const mockAnalyticsData = {
    overview: {
      totalViews: 12450,
      uniqueVisitors: 3280,
      avgSessionTime: '3m 24s',
      bounceRate: '34.2%',
      topPages: [
        { page: '/', views: 4521, percentage: 36.3 },
        { page: '/properties', views: 3210, percentage: 25.8 },
        { page: '/luxury-properties', views: 2187, percentage: 17.6 },
        { page: '/contact', views: 1453, percentage: 11.7 },
        { page: '/about', views: 1079, percentage: 8.7 }
      ],
      devices: {
        desktop: 52.3,
        mobile: 38.7,
        tablet: 9.0
      },
      traffic: {
        organic: 45.2,
        direct: 28.7,
        referral: 15.3,
        social: 10.8
      }
    },
    properties: {
      totalViews: 8934,
      mostViewed: [
        { title: 'Broadwater Waterfront Estate', views: 1234, inquiries: 23 },
        { title: 'Modern Luxury Villa', views: 987, inquiries: 18 },
        { title: 'Beachfront Paradise', views: 756, inquiries: 15 },
        { title: 'Contemporary Penthouse', views: 654, inquiries: 12 },
        { title: 'Luxury Garden Home', views: 543, inquiries: 9 }
      ],
      conversionRate: '2.8%',
      avgTimeOnProperty: '4m 15s'
    },
    users: {
      totalUsers: 3280,
      newUsers: 892,
      returningUsers: 2388,
      userGrowth: '+12.3%',
      topLocations: [
        { location: 'New York, NY', users: 456 },
        { location: 'Los Angeles, CA', users: 334 },
        { location: 'Miami, FL', users: 298 },
        { location: 'Chicago, IL', users: 267 },
        { location: 'Houston, TX', users: 234 }
      ]
    }
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const exportData = () => {
    // Mock export functionality
    alert('Analytics data export feature would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor site performance and user behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.avgSessionTime}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3m</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.bounceRate}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+2.1%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalyticsData.overview.topPages.map((page, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{page.page}</p>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${page.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">{page.views.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{page.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Desktop</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${mockAnalyticsData.overview.devices.desktop}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{mockAnalyticsData.overview.devices.desktop}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mobile</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${mockAnalyticsData.overview.devices.mobile}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{mockAnalyticsData.overview.devices.mobile}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tablet</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${mockAnalyticsData.overview.devices.tablet}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{mockAnalyticsData.overview.devices.tablet}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalyticsData.properties.mostViewed.map((property, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{property.title}</p>
                        <p className="text-xs text-muted-foreground">{property.views} views</p>
                      </div>
                      <Badge variant="secondary">
                        {property.inquiries} inquiries
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Property Views</span>
                  <span className="font-medium">{mockAnalyticsData.properties.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">{mockAnalyticsData.properties.conversionRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Time on Property</span>
                  <span className="font-medium">{mockAnalyticsData.properties.avgTimeOnProperty}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="font-medium">{mockAnalyticsData.users.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Users</span>
                  <span className="font-medium">{mockAnalyticsData.users.newUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Returning Users</span>
                  <span className="font-medium">{mockAnalyticsData.users.returningUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User Growth</span>
                  <span className="font-medium text-green-600">{mockAnalyticsData.users.userGrowth}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalyticsData.users.topLocations.map((location, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm">{location.location}</span>
                      <span className="font-medium">{location.users}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Organic Search</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${mockAnalyticsData.overview.traffic.organic}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{mockAnalyticsData.overview.traffic.organic}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Direct</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${mockAnalyticsData.overview.traffic.direct}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{mockAnalyticsData.overview.traffic.direct}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Referral</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${mockAnalyticsData.overview.traffic.referral}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{mockAnalyticsData.overview.traffic.referral}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Media</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${mockAnalyticsData.overview.traffic.social}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{mockAnalyticsData.overview.traffic.social}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}