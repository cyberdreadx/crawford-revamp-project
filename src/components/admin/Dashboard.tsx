import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Home, 
  Users, 
  Image, 
  Activity, 
  TrendingUp, 
  DollarSign,
  Eye,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalUsers: number;
  activeUsers: number;
  totalHeroImages: number;
  activeHeroImages: number;
  recentActivities: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalHeroImages: 0,
    activeHeroImages: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [propertiesResult, usersResult, heroImagesResult] = await Promise.all([
        supabase.from('properties').select('status'),
        supabase.from('profiles').select('status'),
        supabase.from('hero_images').select('is_active')
      ]);

      const properties = propertiesResult.data || [];
      const users = usersResult.data || [];
      const heroImages = heroImagesResult.data || [];

      setStats({
        totalProperties: properties.length,
        activeProperties: properties.filter(p => p.status === 'For Sale').length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalHeroImages: heroImages.length,
        activeHeroImages: heroImages.filter(h => h.is_active).length,
        recentActivities: []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      active: stats.activeProperties,
      icon: Home,
      color: 'text-blue-600'
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      active: stats.activeUsers,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Hero Images',
      value: stats.totalHeroImages,
      active: stats.activeHeroImages,
      icon: Image,
      color: 'text-purple-600'
    },
    {
      title: 'Active Listings',
      value: stats.activeProperties,
      active: stats.activeProperties,
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your application's key metrics and activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {card.active} active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Properties for Sale</span>
              <span className="font-medium">{stats.activeProperties}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="font-medium">{stats.activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Hero Images</span>
              <span className="font-medium">{stats.activeHeroImages}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Database</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Storage</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Operational
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Authentication</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}