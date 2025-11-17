import { useEffect, useState } from "react";
import {
  getPaginatedCveChanges,
  PaginatedApiResponse,
  PaginatedChangeRecord,
  searchCveChanges,
} from "../pages/api/APICalls";

import Loader from "../components/Loader";
import CveTable from "../components/CveTable";
import SearchBox from "../components/SearchBox";

interface Column {
  id:
    | "cveId"
    | "eventName"
    | "cveChangeId"
    | "sourceIdentifier"
    | "created"
    | "details";
  label: string;
  minWidth?: number;
  align?: "right";
}

const columns: Column[] = [
  { id: "cveId", label: "CVE ID", minWidth: 120 },
  { id: "eventName", label: "Event", minWidth: 150 },
  { id: "cveChangeId", label: "Change ID", minWidth: 120 },
  { id: "sourceIdentifier", label: "Source", minWidth: 150 },
  { id: "created", label: "Created", minWidth: 150 },
  { id: "details", label: "Details", minWidth: 150 },
];

type SortOrder = "asc" | "desc" | null;

export default function Dashboard() {
  const [apiData, setApiData] = useState<PaginatedApiResponse | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [loading, setLoading] = useState(false);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState<any[]>([]);

  const openModal = (details: any[]) => {
    setModalDetails(details);
    setModalOpen(true);
  };

  // Fetch initial data
  useEffect(() => {
    const startIndex = currentPage * rowsPerPage;
    setLoading(true);

    getPaginatedCveChanges(rowsPerPage, startIndex)
      .then((res) => setApiData(res))
      .finally(() => setLoading(false));
  }, [currentPage, rowsPerPage]);

  const handleSearchClick = async () => {
    setCurrentPage(0);

    // 🔥 RESET SORTING WHEN SEARCHING
    setSortColumn(null);
    setSortOrder(null);

    if (!search.trim()) {
      loadPageData(0);
      return;
    }

    loadSearchData(0);
  };

  const loadPageData = async (page: number) => {
    const startIndex = page * rowsPerPage;
    setLoading(true);
    const res = await getPaginatedCveChanges(rowsPerPage, startIndex);
    setApiData({ ...res, isSearchResult: false });
    setLoading(false);
  };

  const loadSearchData = async (page: number) => {
    const startIndex = page * rowsPerPage;
    setLoading(true);
    const res = await searchCveChanges(search, rowsPerPage, startIndex);
    setApiData({ ...res, isSearchResult: true });
    setLoading(false);
  };

  // Filtering & Sorting
  const filteredData =
    apiData?.data
      ?.filter((item) =>
        columns.some((col) =>
          String(item[col.id]).toLowerCase().includes(search.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (!sortColumn || !sortOrder) return 0;

        let aValue = a[sortColumn as keyof PaginatedChangeRecord] as any;
        let bValue = b[sortColumn as keyof PaginatedChangeRecord] as any;

        if (sortColumn === "created") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        return sortOrder === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      }) || [];

  return (
    <div className="px-6 py-4 space-y-2 bg-white text-black relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transactions Table</h1>
          <p className="text-sm text-gray-500">
            These are details about the last transactions
          </p>
        </div>

        {/* ⬇️ SEARCH BOX MOVED TO SEPARATE COMPONENT */}
        <SearchBox
          search={search}
          setSearch={setSearch}
          onSearchClick={handleSearchClick}
        />
      </div>

      {/* TABLE */}
      <CveTable
        columns={columns}
        filteredData={filteredData}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        toggleSort={(col) => {
          if (sortColumn === col) {
            if (sortOrder === "asc") setSortOrder("desc");
            else if (sortOrder === "desc") {
              setSortColumn(null);
              setSortOrder(null);
            } else setSortOrder("asc");
          } else {
            setSortColumn(col);
            setSortOrder("asc");
          }
        }}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        totalResults={apiData?.totalResults || 0}
        onPageChange={(_, p) => {
          setLoading(true);
          setCurrentPage(p);

          if (apiData?.isSearchResult) {
            loadSearchData(p);
          } else {
            loadPageData(p);
          }
        }}
        onRowsPerPageChange={(e) => {
          setLoading(true);
          setRowsPerPage(+e.target.value);
          setCurrentPage(0);
        }}
        onOpenDetails={openModal}
      />

      {/* LOADER */}
      {loading && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/20 backdrop-blur-xs">
          <Loader />
        </div>
      )}

      {/* DETAILS MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[70vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Details</h2>

            <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
              {JSON.stringify(modalDetails, null, 2)}
            </pre>

            <button
              type="button"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
