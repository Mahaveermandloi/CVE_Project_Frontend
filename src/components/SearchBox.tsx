// components/SearchBox.tsx
import { Search, Filter, Download, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  exportCveChangesToExcel,
  searchCveChanges,
} from "../pages/api/APICalls";
import CreateCveModal from "./CreateCveModal";

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
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Local internal buffer
  const [localSearch, setLocalSearch] = useState(search);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const suggestTimer = useRef<number | null>(null);

  const isDisabled = localSearch.trim().length === 0;
  const isFilterApplied = appliedFilterCount > 0;

  useEffect(() => {
    // close suggestions when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // suggestions (debounced)
  useEffect(() => {
    if (suggestTimer.current) {
      clearTimeout(suggestTimer.current);
      suggestTimer.current = null;
    }

    if (localSearch.trim().length > 3) {
      suggestTimer.current = window.setTimeout(async () => {
        try {
          setSuggestLoading(true);
          const res = await searchCveChanges(localSearch.trim(), 10, 0);
          const items = Array.isArray(res?.data) ? res.data : [];
          setSuggestions(items.slice(0, 10));
          setSuggestOpen(true);
        } catch (err) {
          console.error("Suggestion fetch failed", err);
          setSuggestions([]);
          setSuggestOpen(false);
        } finally {
          setSuggestLoading(false);
        }
      }, 250);
    } else {
      setSuggestions([]);
      setSuggestOpen(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const handleExport = async () => {
    try {
      setLoading(true);
      const result = await exportCveChangesToExcel(
        selectedEvents,
        startDate,
        endDate
      );
      if (!result) return;
      alert("Excel file exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export Excel file");
    } finally {
      setLoading(false);
    }
  };

  // When user clicks the Search button: navigate to /search_result?q=... and also call parent onSearchClick
  const handleSearchClick = () => {
    const q = localSearch.trim();
    if (!q) return;

    // navigate to the dedicated search page — the page will read ?q=...
    router.push(`/search_results?q=${encodeURIComponent(q)}`);

    // keep compatibility: update parent search and call handler (optional)
    try {
      setSearch(localSearch);
      onSearchClick();
    } catch (e) {
      // ignore if parent not provided
    }

    setSuggestOpen(false);
  };

  // Enter navigates to page (no table filtering performed here)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = localSearch.trim();
      if (!q) return;
      router.push(`/search_results?q=${encodeURIComponent(q)}`);
      setSuggestOpen(false);
    } else if (e.key === "ArrowDown" && suggestions.length > 0) {
      const first = document.querySelector<HTMLButtonElement>("#suggestion-0");
      first?.focus();
    }
  };

  // Clicking a suggestion navigates to search page for that item
  const handleSuggestionClick = (item: any) => {
    const q =
      item?.cveId || item?.eventName || item?.sourceIdentifier || localSearch;
    router.push(`/search_results?q=${encodeURIComponent(q)}`);
    setSuggestOpen(false);
  };

  return (
    <>
      <div className="lg:flex space-y-2 lg:space-y-0 space-x-2">
        <div
          className="flex justify-between w-full lg:w-[600px]"
          ref={wrapperRef}
        >
          <div className="relative flex items-center gap-2 px-3 py-2 border rounded-l-lg bg-gray-50 flex-1">
            <input
              type="text"
              placeholder="Search here via CVE ID, ChangeID, Source..."
              className="bg-transparent outline-none text-sm w-full"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                // DO NOT call setSearch here — table should not apply filters while typing
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setSuggestOpen(true);
              }}
            />

            {/* Suggestions dropdown */}
            {suggestOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border shadow-lg rounded-md max-h-60 overflow-auto">
                {suggestLoading ? (
                  <div className="p-3 text-sm">Loading...</div>
                ) : suggestions.length ? (
                  suggestions.map((item: any, idx: number) => {
                    const primary =
                      item?.cveId ||
                      (item?.eventName && `${item.eventName}`) ||
                      (item?.sourceIdentifier && `${item.sourceIdentifier}`) ||
                      "";
                    const secondary =
                      item?.eventName && item?.cveId
                        ? `${item.eventName}`
                        : item?.sourceIdentifier || "";

                    return (
                      <button
                        type="button"
                        key={item}
                        id={`suggestion-${idx}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(item);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-3"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{primary}</span>
                          {secondary && (
                            <span className="text-xs text-gray-500">
                              {secondary}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-sm text-gray-500">
                    No suggestions
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isDisabled}
            onClick={handleSearchClick}
            className={`flex items-center gap-2 px-4 py-2 border rounded-r-lg ${
              isDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-blue-700 bg-[#01308b] text-white"
            }`}
          >
            <Search size={23} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg w-full sm:w-auto ${
              isFilterApplied
                ? "bg-[#01308b] text-white"
                : "bg-white text-black"
            } hover:bg-blue-800`}
          >
            <Download size={16} />
            {loading ? "Exporting..." : "Export"}
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg w-full sm:w-auto bg-[#01308b] text-white hover:bg-blue-900"
          >
            <Plus size={16} /> Create
          </button>
        </div>
      </div>

      {createModalOpen && (
        <CreateCveModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={() => {
            setCreateModalOpen(false);
          }}
        />
      )}
    </>
  );
}
