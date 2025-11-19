import React from "react";

interface CveProcessedItem {
  new_cve_received: number;
  new_cve_analyzed: number;
  modified_cve_received: number;
  modified_cve_reanalyzed: number;
}

interface CveProcessed {
  today: CveProcessedItem;
  this_week: CveProcessedItem;
  this_month: CveProcessedItem;
  last_month: CveProcessedItem;
  this_year: CveProcessedItem;
}

interface CveStatusCounts {
  Total: number;
  Received: number;
  "Awaiting Analysis": number;
  "Undergoing Analysis": number;
  Modified: number;
  Deferred: number;
  Rejected: number;
}

interface Props {
  cveProcessed: CveProcessed;
  cveStatusCounts: CveStatusCounts;
}

export default function Tables({ cveProcessed, cveStatusCounts }: Props) {
  const processedRows = Object.entries(cveProcessed);

  return (
    <div className="p-6 space-y-10">
      {/* ------------------ CVE PROCESSED TABLE ------------------ */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">CVE Processed Summary</h2>

        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Period</th>
              <th className="p-3 border">New CVE Received</th>
              <th className="p-3 border">New CVE Analyzed</th>
              <th className="p-3 border">Modified CVE Received</th>
              <th className="p-3 border">Modified CVE Reanalyzed</th>
            </tr>
          </thead>

          <tbody>
            {processedRows.map(([period, stats]) => (
              <tr key={period} className="text-center">
                <td className="border p-2 font-medium capitalize">
                  {period.replace("_", " ")}
                </td>
                <td className="border p-2">{stats.new_cve_received}</td>
                <td className="border p-2">{stats.new_cve_analyzed}</td>
                <td className="border p-2">{stats.modified_cve_received}</td>
                <td className="border p-2">{stats.modified_cve_reanalyzed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------ STATUS COUNTS TABLE ------------------ */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">CVE Status Counts</h2>

        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Count</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(cveStatusCounts).map(([key, value]) => (
              <tr key={key} className="text-center">
                <td className="border p-2 font-medium">{key}</td>
                <td className="border p-2">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
