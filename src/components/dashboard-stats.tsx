'use client';

import useSWR from 'swr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Desktop, Users, CheckCircle, Warning } from '@phosphor-icons/react';

interface StatsData {
  nodesCount: number;
  usersCount: number;
  onlineCount: number;
  dbHealthy: boolean | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function DashboardStats() {
  const {
    data: health,
    error: healthError,
    isLoading: healthLoading,
  } = useSWR('/api/headscale/health', fetcher, { refreshInterval: 30000 });
  const {
    data: nodes,
    error: nodesError,
    isLoading: nodesLoading,
  } = useSWR('/api/headscale/node', fetcher, { refreshInterval: 30000 });
  const {
    data: users,
    error: usersError,
    isLoading: usersLoading,
  } = useSWR('/api/headscale/user', fetcher, { refreshInterval: 30000 });

  const loading = healthLoading || nodesLoading || usersLoading;
  const errorMessage = healthError?.message || nodesError?.message || usersError?.message || '';

  const stats: StatsData = loading
    ? { nodesCount: 0, usersCount: 0, onlineCount: 0, dbHealthy: null }
    : {
        nodesCount: nodes?.nodes?.length ?? 0,
        usersCount: users?.users?.length ?? 0,
        onlineCount: (nodes?.nodes ?? []).filter((n: { online: boolean }) => n.online).length,
        dbHealthy: health?.databaseConnectivity ?? false,
      };

  const statItems = [
    { label: 'Total Nodes', value: stats.nodesCount, icon: Desktop },
    { label: 'Online Nodes', value: stats.onlineCount, icon: CheckCircle },
    { label: 'Users', value: stats.usersCount, icon: Users },
    {
      label: 'DB Health',
      value: stats.dbHealthy === null ? '...' : stats.dbHealthy ? 'OK' : 'Error',
      icon: stats.dbHealthy ? CheckCircle : Warning,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">...</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <Badge variant="destructive">{errorMessage}</Badge>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats.dbHealthy ? (
        <Badge variant="default">Connected</Badge>
      ) : (
        <Badge variant="destructive">Unable to connect to Headscale</Badge>
      )}
    </>
  );
}
