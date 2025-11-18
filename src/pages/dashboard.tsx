import { useEffect, useState } from "react";
import {
  getPaginatedCveChanges,
  PaginatedApiResponse,
  PaginatedChangeRecord,
  searchCveChanges,
} from "../pages/api/APICalls";
import DetailsModal from "@/components/DetailsModal";

import FilterModal from "../components/FilterModal";
import { filterCveChanges } from "../pages/api/APICalls";

import Loader from "../components/Loader";
import CveTable from "../components/CveTable";
import SearchBox from "../components/SearchBox";
import EditCveModal from "@/components/EditCveModal";
import DeleteCveModal from "@/components/DeleteCveModal";

interface Column {
  id:
    | "cveId"
    | "eventName"
    | "cveChangeId"
    | "sourceIdentifier"
    | "created"
    | "details"
    | "actions"; // <-- NEW
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
  // <-- NEW
];

type SortOrder = "asc" | "desc" | null;

export default function Dashboard() {
  const [editId, setEditId] = useState<number | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);

  const [deleteInfo, setDeleteInfo] = useState<{
    id: number | null;
    cveId: string | null;
  }>({ id: null, cveId: null });
  const [apiData, setApiData] = useState<PaginatedApiResponse | null>(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(500);
  const [loading, setLoading] = useState(false);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState<any[]>([]);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<{
    events: string[];
    startDate?: string;
    endDate?: string;
  }>({ events: [] });

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

  const fetchData = async () => {
    const startIndex = currentPage * rowsPerPage;
    setLoading(true);

    try {
      // If filtered
      if (apiData?.isFilterResult) {
        const res = await filterCveChanges(
          filterCriteria.events,
          filterCriteria.startDate,
          filterCriteria.endDate,
          rowsPerPage,
          startIndex
        );
        setApiData({ ...res, isFilterResult: true });
        return;
      }

      // If searching
      if (apiData?.isSearchResult) {
        const res = await searchCveChanges(search, rowsPerPage, startIndex);
        setApiData({ ...res, isSearchResult: true });
        return;
      }

      // Default — normal pagination
      const res = await getPaginatedCveChanges(rowsPerPage, startIndex);
      setApiData(res);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredData =
    apiData?.data
      ?.filter((item) =>
        columns
          .filter((col) => col.id !== "actions") // ⬅ prevent indexing error
          .some((col) =>
            String(item[col.id as keyof PaginatedChangeRecord])
              .toLowerCase()
              .includes(search.toLowerCase())
          )
      )
      .sort((a, b) => {
        if (!sortColumn || !sortOrder || sortColumn === "actions") return 0;

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

  const handleApplyFilter = async (payload: {
    events: string[];
    startDate?: string;
    endDate?: string;
  }) => {
    setCurrentPage(0);
    setSortColumn(null);
    setSortOrder(null);
    setFilterCriteria(payload);
    setLoading(true);

    const res = await filterCveChanges(
      payload.events,
      payload.startDate,
      payload.endDate,
      rowsPerPage,
      0
    );

    setApiData({ ...res, isFilterResult: true }); // IMPORTANT
    setLoading(false);
  };

  const loadFilteredData = async (page: number) => {
    const startIndex = page * rowsPerPage;
    setLoading(true);

    const res = await filterCveChanges(
      filterCriteria.events,
      filterCriteria.startDate,
      filterCriteria.endDate,
      rowsPerPage,
      startIndex
    );

    setApiData({ ...res, isFilterResult: true });
    setLoading(false);
  };

  return (
    <div className="px-6 py-2  bg-white text-black relative">
      {/* HEADER */}
      <div className="flex mb-4 flex-col md:flex-row justify-between items-center gap-4">
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
          onFilterClick={() => setFilterModalOpen(true)}
          appliedFilterCount={
            filterCriteria.events.length +
            (filterCriteria.startDate ? 1 : 0) +
            (filterCriteria.endDate ? 1 : 0)
          }
          selectedEvents={filterCriteria.events}
          startDate={filterCriteria.startDate}
          endDate={filterCriteria.endDate}
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

          if (apiData?.isFilterResult) {
            loadFilteredData(p);
          } else if (apiData?.isSearchResult) {
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
        // onEditRecord={(id) => setEditId(id)}

        onEditRecord={(record) => setEditRecord(record)}
        onDeleteRecord={(id, cveId) => setDeleteInfo({ id, cveId })}
      />

      {/* LOADER */}
      {loading && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/20 backdrop-blur-xs">
          <Loader />
        </div>
      )}

      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(p) => {
          setFilterModalOpen(false);
          handleApplyFilter(p);
        }}
        initialEvents={filterCriteria.events}
        initialStartDate={filterCriteria.startDate}
        initialEndDate={filterCriteria.endDate}
      />


      <EditCveModal
        open={editRecord !== null}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSaved={() => {
          setEditRecord(null);
          fetchData();
        }}
      />

      <DeleteCveModal
        open={deleteInfo.id !== null}
        id={deleteInfo.id}
        cveId={deleteInfo.cveId}
        onClose={() => setDeleteInfo({ id: null, cveId: null })}
        onDeleted={() => {
          setDeleteInfo({ id: null, cveId: null });
          fetchData();
        }}
      />

      <DetailsModal
        open={modalOpen}
        details={modalDetails}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
