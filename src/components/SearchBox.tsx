import { Search, Filter, Download } from "lucide-react";

interface SearchBoxProps {
  search: string;
  setSearch: (value: string) => void;
  onSearchClick: () => void;
}

export default function SearchBox({ search, setSearch, onSearchClick }: SearchBoxProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 w-64">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search here..."
          className="bg-transparent outline-none w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Search Button */}
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
        onClick={onSearchClick}
      >
        <Search size={16} /> Search
      </button>

      {/* Filter Button */}
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
      >
        <Filter size={16} /> Filter
      </button>

      {/* Export Button */}
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
      >
        <Download size={16} /> Export
      </button>
    </div>
  );
}
