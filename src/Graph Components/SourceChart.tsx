// src/components/SourceChart.tsx
import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { getTopSources, type TopSourcesResponse } from "../pages/api/GraphAPI";

/**
 * Optional: local screenshot you uploaded (useful for reference or preview)
 * Path: /mnt/data/1fba50a7-7150-42bf-bf06-d7df96d67aee.png
 */

const chartSetting = {
  xAxis: [
    {
      label: "count",
    },
  ],
  height: 400,
  margin: { left: 0 },
};

const valueFormatter = (v: number | null | undefined) =>
  v == null ? "" : `${Number(v).toLocaleString()}`;

export default function SourceChart() {
  const [dataset, setDataset] = useState<{ source: string; total: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getTopSources()
      .then((resp: TopSourcesResponse) => {
        if (!mounted) return;
        // map API data to dataset expected by BarChart
        const data = (resp.top_sources || []).map((item) => ({
          source: item.source,
          total: Number(item.total_count),
        }));
        setDataset(data);
      })
      .catch((err) => {
        console.error("Failed to load top sources:", err);
        setError(err?.message ?? "Failed to load top sources");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading top sources…</div>;
  if (error)
    return (
      <div style={{ padding: 20, color: "red" }}>Error: {String(error)}</div>
    );
  if (!dataset.length)
    return <div style={{ padding: 20 }}>No source data available.</div>;

  return (
    <BarChart
      dataset={dataset}
      yAxis={[{ scaleType: "band", dataKey: "source", width: 320 }]}
      series={[{ dataKey: "total", label: "Source count", valueFormatter }]}
      layout="horizontal"
      {...chartSetting}
    />
  );
}
