"use client";

import { useEffect, useState } from "react";
import { headscale } from "@/lib/headscale-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Desktop, Users, CheckCircle, Warning } from "@phosphor-icons/react";

interface StatsData {
  nodesCount: number;
  usersCount: number;
  onlineCount: number;
  dbHealthy: boolean;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    nodesCount: 0,
    usersCount: 0,
    onlineCount: 0,
    dbHealthy: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [health, nodes, users] = await Promise.all([
          headscale.health.check(),
          headscale.nodes.list(),
          headscale.users.list(),
        ]);

        setStats({
          nodesCount: nodes.nodes.length,
          usersCount: users.users.length,
          onlineCount: nodes.nodes.filter((n: { online: boolean }) => n.online).length,
          dbHealthy: health.databaseConnectivity,
        });
      } catch {
        setStats((prev) => ({ ...prev, dbHealthy: false }));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    { label: "Total Nodes", value: stats.nodesCount, icon: Desktop },
    { label: "Online Nodes", value: stats.onlineCount, icon: CheckCircle },
    { label: "Users", value: stats.usersCount, icon: Users },
    { label: "DB Health", value: stats.dbHealthy ? "OK" : "Error", icon: stats.dbHealthy ? CheckCircle : Warning },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
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

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
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