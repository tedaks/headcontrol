"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Desktop, Users, CheckCircle, Warning } from "@phosphor-icons/react";
import { getErrorMessage } from "@/lib/utils";

interface StatsData {
  nodesCount: number;
  usersCount: number;
  onlineCount: number;
  dbHealthy: boolean | null;
}

// Simple in-memory cache to avoid refetching on every mount
const cache: {
  data?: StatsData;
  ts?: number;
} = {};

const TTL_MS = 30_000;

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    nodesCount: 0,
    usersCount: 0,
    onlineCount: 0,
    dbHealthy: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      // Use cached data if still fresh
      if (cache.data && cache.ts && Date.now() - cache.ts < TTL_MS) {
        setStats(cache.data);
        setLoading(false);
        return;
      }

      try {
        const [healthRes, nodesRes, usersRes] = await Promise.all([
          fetch("/api/headscale/health"),
          fetch("/api/headscale/node"),
          fetch("/api/headscale/user"),
        ]);

        if (!healthRes.ok || !nodesRes.ok || !usersRes.ok) {
          const failed = !healthRes.ok ? healthRes : !nodesRes.ok ? nodesRes : usersRes;
          const data = await failed.json().catch(() => ({}));
          setError(getErrorMessage(data, "Failed to load stats"));
          return;
        }

        const [health, nodes, users] = await Promise.all([
          healthRes.json(),
          nodesRes.json(),
          usersRes.json(),
        ]);

        const next: StatsData = {
          nodesCount: nodes.nodes?.length ?? 0,
          usersCount: users.users?.length ?? 0,
          onlineCount: (nodes.nodes ?? []).filter((n: { online: boolean }) => n.online).length,
          dbHealthy: health.databaseConnectivity ?? false,
        };

        cache.data = next;
        cache.ts = Date.now();
        setStats(next);
      } catch {
        setError("Failed to load dashboard stats");
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
    { label: "DB Health", value: stats.dbHealthy === null ? "..." : stats.dbHealthy ? "OK" : "Error", icon: stats.dbHealthy ? CheckCircle : Warning },
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

  if (error) {
    return (
      <div className="space-y-4">
        <Badge variant="destructive">{error}</Badge>
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
