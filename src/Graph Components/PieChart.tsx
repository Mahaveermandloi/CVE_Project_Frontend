import { useEffect, useState } from "react";
import { PieChart as MUIPieChart } from "@mui/x-charts/PieChart";
// removed: import payload from "../../public/cwe_analysis_all.json";
import { getEventCounts, EventCountsResponse } from "../pages/api/GraphAPI";

interface PieDataItem {
  id: string;
  value: number;
  label: string;
  color: string;
}

/** simple deterministic hash -> color generator */
function hashToColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  const hex = (Math.abs(h) % 0xffffff).toString(16).padStart(6, "0");
  return `#${hex}`;
}

/** human-friendly number formatter with commas */
function formatNumber(n: number) {
  return n.toLocaleString();
}

export default function PieChartFromFile() {
  const [pieData, setPieData] = useState<PieDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getEventCounts()
      .then((resp: EventCountsResponse) => {
        if (!mounted) return;

        // Map event_counts object -> array of { id, value, label, color }
        const pairs = Object.entries(resp.event_counts ?? {});
        const items: PieDataItem[] = pairs.map(([k, v]) => ({
          id: k,
          value: typeof v === "number" ? v : Number(v ?? 0),
          label: k,
          color: hashToColor(k),
        }));

        items.sort((a, b) => b.value - a.value);
        setPieData(items.slice(0, 10));
      })
      .catch((err) => {
        console.error("Failed to fetch event counts:", err);
        setError(err?.message ?? "Failed to fetch event counts");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-4">Loading event counts…</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (pieData.length === 0) {
    return <div className="p-4">No event count data available.</div>;
  }

  const valueFormatter = (item: any) => `${formatNumber(Number(item.value))}`;

  return (
    <div className="flex justify-center items-center p-4">
      <MUIPieChart
        series={[
          {
            type: "pie",
            data: pieData,
            highlightScope: { fade: "global", highlight: "item" },
            faded: { innerRadius: 40, additionalRadius: -10, color: "gray" },
            valueFormatter,
            arcLabelMinAngle: 20,
          },
        ]}
        height={240}
        width={240}
      />
    </div>
  );
}
