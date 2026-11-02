import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserStatusBadge } from "@/features/users";
import {
  formatCurrency,
  formatNumber,
  formatPercentChange,
  initials,
} from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  dashboardSummaryQueryOptions,
  recentUsersQueryOptions,
  type DashboardSummary,
} from "../api/dashboard.queries";
import { SignupsChart } from "./signups-chart";

type Stat = DashboardSummary["stats"][number];

function formatStat({ value, unit }: Stat) {
  if (unit === "currency") return formatCurrency(value);
  if (unit === "percent") return `${value}%`;
  return formatNumber(value);
}

export function DashboardPage({ userName }: { userName: string }) {
  const { data: summary } = useSuspenseQuery(dashboardSummaryQueryOptions());
  const { data: recent } = useSuspenseQuery(recentUsersQueryOptions());

  return (
    <div className="grid gap-6 *:min-w-0">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${userName.split(" ")[0] ?? userName}. Here's what's happening.`}
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.stats.map((stat) => {
          // For churn, going down is good.
          const good =
            stat.key === "churn" ? stat.change <= 0 : stat.change >= 0;
          const Trend = stat.change >= 0 ? TrendingUp : TrendingDown;
          return (
            <li key={stat.key}>
              <Card className="h-full">
                <CardContent className="grid gap-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">
                    {formatStat(stat)}
                  </p>
                  <p
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      good ? "text-success" : "text-destructive",
                    )}
                  >
                    <Trend aria-hidden className="size-3.5" />
                    {formatPercentChange(stat.change)}
                    <span className="font-normal text-muted-foreground">
                      vs last month
                    </span>
                  </p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New signups</CardTitle>
            <CardDescription>Last six months</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupsChart data={summary.signups} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent users</CardTitle>
            <Link
              to="/users"
              className="text-sm font-medium text-link hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4">
              {recent.data.map((user) => (
                <li key={user.id} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-link"
                  >
                    {initials(user.name)}
                  </span>
                  <span className="grid min-w-0 flex-1">
                    <Link
                      to="/users/$userId"
                      params={{ userId: user.id }}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {user.name}
                    </Link>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                  <UserStatusBadge status={user.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
