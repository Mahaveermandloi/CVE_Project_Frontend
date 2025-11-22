// pages/search_result.tsx
import { useEffect, useState } from "react";
import {
  getPaginatedCveChanges,
  PaginatedApiResponse,
  PaginatedChangeRecord,
  searchCveChanges,
  filterCveChanges,
} from "../pages/api/APICalls";
import DetailsModal from "@/components/DetailsModal";
import { useRouter } from "next/router";

import FilterBox from "../components/FilterBox";

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
    | "actions";
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

export default function SearchResultPage() {
  const router = useRouter();
  const { q } = router.query;

  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{
    id: number | null;
    cveId: string | null;
  }>({
    id: null,
    cveId: null,
  });

  const [apiData, setApiData] = useState<PaginatedApiResponse | null>(null);

  const [search, setSearch] = useState<string>(
    (typeof q === "string" && q) || ""
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
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

  // When the query param q changes, update local search and load data

  useEffect(() => {
    if (!router.isReady) return;
    const query = typeof router.query.q === "string" ? router.query.q : "";
    setSearch(query);
    setCurrentPage(0);
    setSortColumn(null);
    setSortOrder(null);

    if (!query.trim()) {
      setApiData(null);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await searchCveChanges(query, rowsPerPage, 0);
        setApiData({ ...res, isSearchResult: true });
      } catch (err) {
        console.error("Failed to load search results", err);
        setApiData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [router.isReady, router.query.q, rowsPerPage]);

  const loadSearchData = async (page: number, queryStr?: string) => {
    const startIndex = page * rowsPerPage;
    setLoading(true);
    try {
      const qToUse = queryStr ?? search;
      const res = await searchCveChanges(qToUse, rowsPerPage, startIndex);
      setApiData({ ...res, isSearchResult: true });
    } finally {
      setLoading(false);
    }
  };

  const loadPageData = async (page: number) => {
    const startIndex = page * rowsPerPage;
    setLoading(true);
    try {
      const res = await getPaginatedCveChanges(rowsPerPage, startIndex);
      setApiData({ ...res, isSearchResult: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = async () => {
    // navigate to same page with q param (this will trigger useEffect and load search)
    if (!search.trim()) {
      router.push("/search_result");
      return;
    }
    router.push(`/search_result?q=${encodeURIComponent(search.trim())}`);
  };

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

    setApiData({ ...res, isFilterResult: true });
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

  const filteredData =
    apiData?.data
      ?.filter((item) =>
        columns
          .filter((col) => col.id !== "actions")
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

  return (
    <div className="px-2 lg:px-6 py-2 bg-white text-black relative">
      <div className="flex mb-4   flex-col md:flex-row justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-lg lg:text-2xl font-semibold">
            Common Vulnerabilities and Exposures
          </h1>
          <p className="text-sm text-gray-500">
            These are details about the last incidents
          </p>
        </div>

        {/* ⬇️ SEARCH BOX MOVED TO SEPARATE COMPONENT */}
        <div className="">
          <SearchBox
            search={search}
            setSearch={setSearch}
            onSearchClick={handleSearchClick}
            onFilterClick={() => {
              /* no-op: filter UI is now always visible in sidebar */
            }}
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
      </div>

      <div className="flex gap-5  ">
        <FilterBox
          onApply={(payload) => handleApplyFilter(payload)}
          initialEvents={filterCriteria.events}
          initialStartDate={filterCriteria.startDate}
          initialEndDate={filterCriteria.endDate}
        />
        {/* TABLE */}
        <main className="w-4/5 shadow-2xl">
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
                // loadFilteredData(p);
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
            onEditRecord={(record) => setEditRecord(record)}
            onDeleteRecord={(id, cveId) => setDeleteInfo({ id, cveId })}
          />
        </main>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/20 backdrop-blur-xs">
          <Loader />
        </div>
      )}

      <EditCveModal
        open={editRecord !== null}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSaved={async () => {
          setEditRecord(null);
          // refresh
          if (apiData?.isSearchResult) {
            await loadSearchData(currentPage);
          } else {
            await loadPageData(currentPage);
          }
        }}
      />

      <DeleteCveModal
        open={deleteInfo.id !== null}
        id={deleteInfo.id}
        cveId={deleteInfo.cveId}
        onClose={() => setDeleteInfo({ id: null, cveId: null })}
        onDeleted={() => {
          setDeleteInfo({ id: null, cveId: null });
          alert("Record Deleted Successfully");
          // go back to search page (keeps same url)
          router.push("/search_result");
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
