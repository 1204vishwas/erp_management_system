import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Box,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Reusable data table with a search box and server-side pagination.
 *
 * Props:
 *  - columns: [{ field, label, render?(row), align? }]
 *  - rows: array of records
 *  - loading, search, onSearchChange
 *  - page (0-based), rowsPerPage, total, onPageChange, onRowsPerPageChange
 *  - searchable (default true)
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  search = "",
  onSearchChange,
  page = 0,
  rowsPerPage = 10,
  total = 0,
  onPageChange,
  onRowsPerPageChange,
  searchable = true,
  searchPlaceholder = "Search...",
}) {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {searchable && (
        <Box sx={{ p: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>
      )}

      <TableContainer sx={{ maxHeight: "62vh" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.field} align={col.align || "left"} sx={{ fontWeight: 700 }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow hover key={row._id}>
                  {columns.map((col) => (
                    <TableCell key={col.field} align={col.align || "left"}>
                      {col.render ? col.render(row) : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(e, p) => onPageChange?.(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}
