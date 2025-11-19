import { Search, Filter, Download } from "lucide-react";
import { useState } from "react";
import { exportCveChangesToExcel } from "../pages/api/APICalls";

interface SearchBoxProps {
  search: string;
  setSearch: (value: string) => void;
  onSearchClick: () => void;
  onFilterClick?: () => void;
  appliedFilterCount?: number;
  selectedEvents?: string[];
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
  const [loading, setLoading] = useState(false);
  const isDisabled = search.trim().length === 0;
  const isFilterApplied = appliedFilterCount > 0;

  const handleExport = async () => {
    try {
      setLoading(true);
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
    <div className="lg:flex  space-y-2 lg:space-y-0  w-full space-x-2  ">
      {/* Search Section */}

      <div className="flex justify-between  w-full">
        <div className="flex items-center gap-2 px-3 py-2 border rounded-l-lg bg-gray-50 w-full">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search here via CVE ID, ChangeID ,Source..."
            className="bg-transparent outline-none  text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          disabled={isDisabled}
          onClick={onSearchClick}
          className={`flex items-center gap-2 px-4 py-2 border rounded-r-lg 
            ${
              isDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-700 bg-[#01308b] text-white"
            }`}
        >
          <Search size={23} />
        </button>
      </div>

      <button
        type="button"
        onClick={onFilterClick}
        className="relative flex items-center  gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 w-full sm:w-auto"
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
        className={`flex items-center  gap-2 px-4 py-2 border rounded-lg w-full sm:w-auto
            ${
              isFilterApplied
                ? "bg-[#01308b] text-white"
                : "bg-white text-black"
            }
            hover:bg-blue-800`}
      >
        <Download size={16} />
        {loading ? "Exporting..." : "Export"}
      </button>
    </div>
  );
}
