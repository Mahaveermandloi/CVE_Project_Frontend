import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { getAnalysisStatus, type AnalysisStatusResponse } from "../pages/api/GraphAPI";

export default function AnalysisStatusBar() {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 6 colors (rainbow style)
  const colors = ["#d32f2f", "#f57c00", "#fbc02d", "#388e3c", "#1976d2", "#ab47bc"];

  useEffect(() => {
    let mounted = true;

    getAnalysisStatus()
      .then((resp: AnalysisStatusResponse) => {
        if (!mounted) return;

        const items = resp.analysis_status || [];

        setLabels(items.map((i) => i.status_label));
        setValues(items.map((i) => Number(i.count)));
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load analysis status");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: "red" }}>{error}</div>;
  if (!labels.length) return <div style={{ padding: 16 }}>No data.</div>;

  return (
    <BarChart
      height={420}
      xAxis={[
        {
          data: labels,
          scaleType: "band",
          colorMap: {
            type: "ordinal",
            colors,
          },
        },
      ]}
      series={[
        {
          data: values,
          label: "Count",
        },
      ]}
    />
  );
}
