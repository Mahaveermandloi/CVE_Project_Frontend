// import { useEffect, useState } from "react";
// import YearlyGraph from "@/Graph Components/YearlyGraph";
// import PieChart from "../Graph Components/PieChart";
// import SourceChart from "../Graph Components/SourceChart";
// import AnalysisStatusBar from "../Graph Components/AnalysisStatusBar";
// import MonthlyData from "../Graph Components/MonthlyData";
// //

// export default function Graph() {
//   return (
//     // outer wrapper = viewport height
//     <div className=" flex flex-col text-black overflow-hidden">
//       {/* compact header */}
//       <div className="px-3 py-2 bg-white shadow-sm">
//         <h2 className="text-lg font-semibold">CVE Growth Over Time</h2>
//         <p className="text-xs text-gray-600">Summary and quick stats</p>
//       </div>

//       <div className="flex-1 min-h-0 ">
//         <YearlyGraph />
//         <div className="grid  grid-rows-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 ">
//           <div className=" shadow rounded-md flex items-center justify-center text-base font-medium  overflow-hidden">
//             <PieChart />
//           </div>
//           <SourceChart />
//           <AnalysisStatusBar />
//           <MonthlyData />
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/graph.tsx  (or wherever your Graph component lives)
import { useEffect, useState } from "react";
import YearlyGraph from "@/Graph Components/YearlyGraph";
import PieChart from "../Graph Components/PieChart";
import SourceChart from "../Graph Components/SourceChart";
import AnalysisStatusBar from "../Graph Components/AnalysisStatusBar";
import MonthlyData from "../Graph Components/MonthlyData";

export default function Graph() {
  return (
    <div className="min-h-screen flex flex-col  bg-gray-300 text-slate-900">
      <div className="flex  px-3 py-2  flex-col md:flex-row justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-lg lg:text-2xl font-semibold">
            Common Vulnerabilities and Exposures
          </h1>
          <p className="text-sm text-gray-500">
            These are details about the last incidents
          </p>
        </div>
      </div>

      <main className="flex-1 bg-gray-300 p-2">
        {/* Yearly graph full width */}
        <section className="mb-6">
          <div className="bg-white rounded-lg shadow-sm ">
            <YearlyGraph />
          </div>
        </section>

        {/* 2x2 responsive grid for the 4 smaller charts/cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <div className=" rounded-lg bg-white shadow-2xl  p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Analysis Status
            </h3>
            <div className="">
              <AnalysisStatusBar />
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-2xl  p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              CWE / Category Breakdown
            </h3>
            <div className="">
              <PieChart />
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-2xl  p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Top Data Sources
            </h3>
            <div className="">
              <SourceChart />
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-2xl  p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Monthly Events (selected year)
            </h3>
            <div className="">
              <MonthlyData />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
