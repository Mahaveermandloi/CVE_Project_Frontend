import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
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
  currentPage: number;
  totalResults: number;

  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

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
            {filteredData.length ? (
              filteredData.map((row) => (
                <TableRow hover key={row.id}>
                  {columns.map((column) => {
                    const value = row[column.id];

                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.id === "created" ? (
                          new Date(value).toLocaleString()
                        ) : column.id === "details" ? (
                          Array.isArray(value) && value.length === 0 ? (
                            "No Data"
                          ) : value && Object.keys(value).length === 0 ? (
                            "No Data"
                          ) : (
                            <button
                              type="button"
                              className="text-blue-600 underline"
                              onClick={() => onOpenDetails(value)}
                            >
                              View
                            </button>
                          )
                        ) : (
                          String(value)
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    <div className="flex justify-center gap-4 text-lg">
                      <FaEdit
                        className="text-blue-600 cursor-pointer hover:scale-110"
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

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100, 500]}
        component="div"
        count={totalResults}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
}
