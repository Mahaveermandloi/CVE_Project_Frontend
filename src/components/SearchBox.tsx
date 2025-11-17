import { Search, Filter, Download } from "lucide-react";
import { useState } from "react";
import { exportCveChangesToExcel } from "../pages/api/APICalls"; // make sure this is imported

interface SearchBoxProps {
  search: string;
  setSearch: (value: string) => void;
  onSearchClick: () => void;
  onFilterClick?: () => void;
  appliedFilterCount?: number; // NEW
  selectedEvents?: string[]; // added to pass filters
  startDate?: string;
  endDate?: string;
}

export default function SearchBox({
  search,
  setSearch,
  onSearchClick,
  onFilterClick,
  appliedFilterCount = 0,
  selectedEvents = [],
  startDate,
  endDate,
}: SearchBoxProps) {
  const [loading, setLoading] = useState(false); // added loader state
  const isDisabled = search.trim().length === 0;
  const isFilterApplied = appliedFilterCount > 0;

  const handleExport = async () => {
    try {
      setLoading(true); // show loader
      alert("done");
      await exportCveChangesToExcel(selectedEvents, startDate, endDate);
      alert("Excel file exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export Excel file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 w-96">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search here via CVE ID, ChangeID ,Source..."
          className="bg-transparent outline-none w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Search Button */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={onSearchClick}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
          isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "hover:bg-black bg-gray-600 text-white"
        }`}
      >
        <Search size={22} />
      </button>

      {/* Filter Button with Badge */}
      <button
        type="button"
        onClick={onFilterClick}
        className="relative flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
      >
        <Filter size={16} /> Filter
        {appliedFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {appliedFilterCount}
          </span>
        )}
      </button>

      {/* Export Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleExport}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-blue-800 ${
          isFilterApplied ? "bg-blue-600 text-white" : "bg-white text-black"
        }`}
      >
        <Download size={16} /> {loading ? "Exporting..." : "Export"}
      </button>
    </div>
  );
}
