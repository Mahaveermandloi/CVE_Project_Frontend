// components/CveTable.tsx
import React, { useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa6";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right";
}

interface CveTableProps {
  columns: Column[];
  filteredData: any[];
  sortColumn: string | null;
  sortOrder: "asc" | "desc" | null;
  toggleSort: (column: string) => void;

  rowsPerPage: number;
  currentPage: number; // zero-based
  totalResults: number;

  // pageChange expects (event, newPageZeroBased)
  onPageChange: (event: unknown, newPage: number) => void;

  // rowsPerPage change handler - accepts a change event
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;

  onOpenDetails: (details: any[]) => void;

  onEditRecord: (id: number) => void;
  onDeleteRecord: (id: number, cveId: string) => void;
}

export default function CveTable({
  columns,
  filteredData,
  sortColumn,
  sortOrder,
  toggleSort,

  rowsPerPage,
  currentPage,
  totalResults,

  onPageChange,
  onRowsPerPageChange,

  onOpenDetails,

  onEditRecord,
  onDeleteRecord,
}: CveTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalResults / rowsPerPage));
  const [gotoValue, setGotoValue] = useState<string>("");

  // (Optional) condensed page list for future use — currently using MUI Pagination
  const pageList = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  const handleGoto = (raw?: string) => {
    const v = raw ?? gotoValue;
    if (!v) return;
    const n = Number(v);
    if (Number.isNaN(n)) return;
    const target = Math.max(1, Math.min(totalPages, Math.floor(n)));
    // convert to zero-based page index
    onPageChange(null, target - 1);
    setGotoValue("");
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", minHeight: 600 }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
        
        
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                
                
                <TableCell
                  key={col.id}
                  align={col.align}
                  style={{ minWidth: col.minWidth, cursor: "pointer" }}
                  onClick={() => toggleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortColumn === col.id ? (
                      sortOrder === "asc" ? (
                        <FaSortUp className="text-blue-600" />
                      ) : (
                        <FaSortDown className="text-blue-600" />
                      )
                    ) : (
                      <FaSort className="text-gray-400" />
                    )}
                  </div>
                </TableCell>


              ))}

              <TableCell align="center" style={{ minWidth: 80 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData && filteredData.length ? (
              filteredData.map((row) => (
                <TableRow hover key={row.id}>
                  {columns.map((column) => {
                    const value = row[column.id];

                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.id === "created" ? (
                          value ? (
                            new Date(value).toLocaleString()
                          ) : (
                            ""
                          )
                        ) : column.id === "details" ? (
                          Array.isArray(value) && value.length === 0 ? (
                            "No Data"
                          ) : value && Object.keys(value).length === 0 ? (
                            "No Data"
                          ) : (
                            <button
                              type="button"
                              className="text-[#01308b] underline"
                              onClick={() => onOpenDetails(value)}
                            >
                              View
                            </button>
                          )
                        ) : (
                          String(value ?? "")
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    <div className="flex justify-center gap-4 text-lg">
                      <FaEdit
                        className="text-[#01308b] cursor-pointer hover:scale-110"
                        onClick={() => onEditRecord(row)}
                      />

                      <FaTrash
                        className="text-red-600 cursor-pointer hover:scale-110"
                        onClick={() => onDeleteRecord(row.id, row.cveId)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>



        </Table>
      </TableContainer>

      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <strong>
              {Math.min(totalResults, currentPage * rowsPerPage + 1)}-
              {Math.min(totalResults, (currentPage + 1) * rowsPerPage)}
            </strong>{" "}
            of <strong>{totalResults}</strong>
          </div>

          <div className="  flex  ">
            <Stack spacing={2}>
              <Pagination
                count={Math.max(1, Math.ceil(totalResults / rowsPerPage))}
                page={currentPage + 1}
                onChange={(e, page) => onPageChange(e, page - 1)}
                siblingCount={1}
                boundaryCount={1}
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#01308b", // text color
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "#01308b",
                    color: "white",
                  },
                  "& .MuiPaginationItem-root.Mui-selected:hover": {
                    backgroundColor: "#001f5e",
                  },
                }}
              />
            </Stack>
          </div>

          <div className="flex items-center gap-2">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-sm text-gray-600">Rows per page</label>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(e)}
              className="border rounded px-2 py-1"
              aria-label="Rows per page"
            >
              {[10, 25, 50, 100, 500].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>



      
    </Paper>
  );
}
