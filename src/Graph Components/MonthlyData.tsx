// src/components/MonthlyEventsChart.tsx
import React, { useEffect, useMemo, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  getMonthlyEventTrends,
  type MonthlyEventResponse,
  type MonthlyEvent,
} from "../pages/api/GraphAPI";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// small sanitizer to produce valid object keys from event names
function sanitizeKey(s: string) {
  return s
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/__+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function valueFormatter(v: number | null | undefined) {
  if (v == null) return "";
  return Number(v).toLocaleString();
}

export default function MonthlyData({ initialYear }: { initialYear?: number }) {
  const [year, setYear] = useState<number | undefined>(initialYear);
  const [response, setResponse] = useState<MonthlyEventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch when mount or year changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMonthlyEventTrends(year);
        if (!mounted) return;
        setResponse(data);
        // if no explicit year passed, the API returns `year` — keep state in sync
        if (data?.year && year === undefined) setYear(data.year);
      } catch (err: any) {
        console.error("Failed to fetch monthly event trends", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to fetch");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [year]);

  const dataset = useMemo(() => {
    if (!response) return [];

    const events = response.events || [];
    // build mapping eventKey -> monthly array
    const eventKeyMap: Record<string, number[]> = {};
    const eventKeyToLabel: Record<string, string> = {};
    events.forEach((e) => {
      const key = sanitizeKey(e.eventName);
      // ensure monthly length 12
      const monthly = Array.from({ length: 12 }, (_, i) =>
        Number(e.monthly?.[i] ?? 0)
      );
      eventKeyMap[key] = monthly;
      eventKeyToLabel[key] = e.eventName;
    });

    // construct rows for months Jan..Dec
    const rows = MONTHS.map((m, mi) => {
      const base: Record<string, any> = { month: m };
      for (const key of Object.keys(eventKeyMap)) {
        base[key] = eventKeyMap[key][mi] ?? 0;
      }
      return base;
    });

    return rows;
  }, [response]);

  // series: build series entries for BarChart from response.events order
  const series = useMemo(() => {
    if (!response) return [];
    return response.events.map((e) => {
      return {
        dataKey: sanitizeKey(e.eventName),
        label: e.eventName,
        valueFormatter,
      };
    });
  }, [response]);

  // build list of available years for dropdown (if provided by API)
  const availableYears = useMemo(
    () => response?.available_years ?? (response ? [response.year] : []),
    [response]
  );

  if (loading) return <div style={{ padding: 16 }}>Loading monthly data…</div>;
  if (error)
    return <div style={{ padding: 16, color: "red" }}>Error: {error}</div>;
  if (!response) return <div style={{ padding: 16 }}>No data.</div>;

  return (
    <div style={{ width: "100%" }}>
      {/* sample image returned by backend (local path will be transformed by your tool) */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label style={{ color: "#666" }}>Year:</label>
          <select
            value={String(year ?? response.year)}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ padding: "6px 8px", borderRadius: 6 }}
          >
            {/* if API provided available_years use them, otherwise allow current year only */}
            {(availableYears.length ? availableYears : [response.year]).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div style={{ width: "100%", height: 360 }}>
        <BarChart
          dataset={dataset}
          xAxis={[{ dataKey: "month" }]}
          series={series}
          yAxis={[{ label: "Count", width: 80 }]}
          // optional aesthetics:
          height={340}
          margin={{ left: 24 }}
        />
      </div>

      {/* totals summary
      <div style={{ marginTop: 12 }}>
        <strong>Shown events:</strong>{" "}
        {response.events
          .map((e) => `${e.eventName} (${e.total.toLocaleString()})`)
          .join(" · ")}
      </div> */}
    </div>
  );
}
