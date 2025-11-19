// import { useEffect, useState } from "react";
// import PieChart from "../Graph Components/PieChart";
// import Loader from "../components/Loader";
// import Tables from "../Graph Components/Tables";
// import LineChart from "../Graph Components/LineChart";

// import axios from "axios";

// interface PieDataItem {
//   id: string;
//   value: number;
//   label: string;
//   color: string;
// }

// interface CveGrowthItem {
//   year: number;
//   count: number;
// }

// export default function Graph() {
//   const [pieData, setPieData] = useState<PieDataItem[]>([]);
//   const [tableStats, setTableStats] = useState<any>(null);
//   const [growthYears, setGrowthYears] = useState<number[]>([]);
//   const [growthCounts, setGrowthCounts] = useState<number[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     alert("hi");

//     const loadData = async () => {
//       try {
//         const [
//           pieRes,

//           // tableRes, growthRes
//         ] = await Promise.all([
//           axios.get(
//             "https://cve-project-backend.onrender.com/api/cvechanges/event-counts/"
//           ),
//           // axios.get("http://127.0.0.1:8000/api/cvechanges/cve-dashboard/"),
//           // axios.get("http://127.0.0.1:8000/api/cvechanges/growth/"),
//         ]);

//         /* PIE DATA */
//         const pieMapped = Object.entries(pieRes.data.data)
//           .map(([label, value]) => ({
//             id: label,
//             value: value as number,
//             label: label,
//             color: "#" + Math.floor(Math.random() * 16777215).toString(16),
//           }))
//           .sort((a, b) => b.value - a.value);

//         setPieData(pieMapped);

//         // /* TABLE DATA */
//         // setTableStats(tableRes.data);

//         // /* LINE DATA */
//         // const years = growthRes.data.growth.map((g: CveGrowthItem) => g.year);
//         // const counts = growthRes.data.growth.map((g: CveGrowthItem) => g.count);

//         // setGrowthYears(years);
//         // setGrowthCounts(counts);
//       } catch (err) {
//         console.error("GRAPH DATA LOAD ERROR:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   if (loading) return <Loader />;

//   return (
//     <div className="px-6 py-4 space-y-10 bg-white text-black">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* PIE CHART */}
//         <div className="bg-white shadow rounded-xl p-4 flex justify-center items-center">
//           <PieChart data={pieData} />
//         </div>

//         {/* TABLES */}
//         <div className="bg-white shadow rounded-xl p-4">
//           <Tables
//             cveProcessed={tableStats.cve_processed}
//             cveStatusCounts={tableStats.cve_status_counts}
//           />
//         </div>
//       </div>

//       {/* LINE CHART */}
//       <div className="bg-white shadow rounded-xl p-6">
//         <h2 className="text-xl font-semibold mb-4">CVE Growth Over Time</h2>

//         <LineChart years={growthYears} counts={growthCounts} />
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import LineChart from "../Graph Components/LineChart";
import axios from "axios";

interface CveGrowthItem {
  year: number;
  count: number;
}

export default function Graph() {
  const [growthYears, setGrowthYears] = useState<number[]>([]);
  const [growthCounts, setGrowthCounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const growthRes = await axios.get(
          "http://127.0.0.1:8000/api/cvechanges/growth/"
        );

        /* LINE DATA */
        const years = growthRes.data.growth.map((g: CveGrowthItem) => g.year);
        const counts = growthRes.data.growth.map((g: CveGrowthItem) => g.count);

        setGrowthYears(years);
        setGrowthCounts(counts);
      } catch (err) {
        console.error("GRAPH DATA LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* 🔥 BLURRED LOADER OVERLAY — SAME STYLE AS DASHBOARD */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-white text-black px-6 py-8 space-y-10
    
    relative
    "
    >
      {/* LINE CHART */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">CVE Growth Over Time</h2>

        <LineChart years={growthYears} counts={growthCounts} />
      </div>
    </div>
  );
}
