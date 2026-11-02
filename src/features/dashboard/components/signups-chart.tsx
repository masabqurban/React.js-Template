import { formatNumber } from "@/lib/format";

import type { DashboardSummary } from "../api/dashboard.queries";

/**
 * A dependency-free bar chart. Charting libraries add 50–100 kB for a chart
 * like this; plain CSS keeps the bundle small. The bars are hidden from
 * assistive technology, which reads the same numbers from a real table.
 */
export function SignupsChart({ data }: { data: DashboardSummary["signups"] }) {
  const max = Math.max(...data.map((point) => point.count), 1);

  return (
    <figure className="grid gap-4">
      <div
        aria-hidden
        className="flex h-56 items-end gap-3 border-b border-border sm:gap-6"
      >
        {data.map((point) => (
          <div
            key={point.month}
            className="flex h-full flex-1 flex-col justify-end gap-2"
          >
            <span className="text-center text-xs font-medium text-muted-foreground">
              {formatNumber(point.count)}
            </span>
            <div
              className="rounded-t-md bg-primary transition-[height] duration-500"
              style={{ height: `${(point.count / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="flex gap-3 sm:gap-6">
        {data.map((point) => (
          <span
            key={point.month}
            className="flex-1 text-center text-xs text-muted-foreground"
          >
            {point.month}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">New signups per month</figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Signups</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.month}>
              <td>{point.month}</td>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
