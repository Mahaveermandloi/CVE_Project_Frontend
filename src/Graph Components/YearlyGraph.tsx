// src/components/YearlyGraph.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getCveYearCounts, CveYearCountsResponse } from "../pages/api/GraphAPI";

type YearStatistic = {
  year: number;
  totalCves: number;
  dailyAverage?: number;
};

const fmt = (n: number) => n.toLocaleString();

// shorthand for React.createElement
const h = React.createElement;

export default function YearlyGraph() {
  // dataset comes from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearStats, setYearStats] = useState<YearStatistic[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCveYearCounts()
      .then((resp: CveYearCountsResponse) => {
        if (!mounted) return;

        const stats: YearStatistic[] = (resp.year_counts || [])
          .map((y) => ({
            year: Number(y.event_year),
            totalCves: Number(y.count),
          }))
          .sort((a, b) => a.year - b.year);

        setYearStats(stats);
      })
      .catch((err) => {
        console.error("Failed to fetch cve-year-counts:", err);
        setError(err?.message ?? "Failed to fetch year counts");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // chartData: all years (static)
  const chartData = useMemo(() => {
    return yearStats.map((ys) => ({
      year: String(ys.year),
      total: ys.totalCves,
      yearNum: ys.year,
    }));
  }, [yearStats]);

  const containerStyle: React.CSSProperties = {
    padding: 15,
    background: "#f8fafc",
    borderRadius: 8,
  };
  const cardStyle: React.CSSProperties = {
    background: "",
    borderRadius: 8,
    padding: 16,
  };

  // Build chart element
  const areaChartElement = h(
    AreaChart,
    { data: chartData, margin: { top: 10, right: 30, left: 20, bottom: 20 } },
    h(CartesianGrid, { strokeDasharray: "3 3" }),
    h(XAxis, { dataKey: "year", ticks: chartData.map((d) => d.year) }),
    h(YAxis, {
      tickFormatter: (v: any) => {
        const n = Number(v);
        if (Number.isFinite(n)) return `${Math.round(n / 1000)}k`;
        return v;
      },
    }),
    h(Tooltip, {
      formatter: (value: any) => [fmt(Number(value)), "CVEs"],
    }),
    h(Legend, null),
    h(Area, {
      type: "monotone",
      dataKey: "total",
      stroke: "#1776ff",
      fill: "#e6f0ff",
      activeDot: { r: 6 },
      isAnimationActive: false,
    })
  );

  const responsiveProps: any = {
    width: "100%",
    height: "100%",
    children: areaChartElement,
  };

  if (loading)
    return h("div", { style: { padding: 24 } }, "Loading yearly CVE data…");
  if (error)
    return h(
      "div",
      { style: { padding: 24, color: "red" } },
      `Error: ${error}`
    );
  if (yearStats.length === 0)
    return h("div", { style: { padding: 24 } }, "No year data available.");

  return h(
    "div",
    { style: containerStyle },
    // Header
    h(
      "div",
      { style: { marginBottom: 2 } },
      h(
        "h3",
        { style: { margin: 0, fontSize: 20, fontWeight: 700 } },
        "CVE Publications by Year"
      ),
      h(
        "div",
        { style: { textAlign: "center", color: "#6b7280", marginTop: 0 } },
        "CVEs Published (all years)"
      )
    ),

    // Chart card
    h(
      "div",
      { style: cardStyle },
      // Chart container
      h(
        "div",
        { style: { width: "100%", height: 380 } },
        h(ResponsiveContainer as any, responsiveProps)
      ),

      // summary row
      h(
        "div",
        {
          style: {
            marginTop: 14,
            color: "#374151",
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
          },
        },
        h(
          "div",
          null,
          h("strong", null, "Years: "),
          yearStats.map((s) => s.year).join(", ")
        ),
        h(
          "div",
          null,
          h("strong", null, "Total CVEs: "),
          yearStats.reduce((acc, y) => acc + y.totalCves, 0).toLocaleString()
        )
      )
    )
  );
}
