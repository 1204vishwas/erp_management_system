import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import api from "../api/axios.js";
import { startLoading, stopLoading } from "../features/ui/uiSlice.js";

/**
 * Generic list-fetching hook with search, pagination and refetch.
 * Expects the backend paginated envelope: { data, pagination:{ total, ... } }.
 *
 * @param {string} endpoint e.g. "/products"
 */
export default function useResource(endpoint) {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // 0-based for MUI
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debounceRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    dispatch(startLoading());
    try {
      const { data } = await api.get(endpoint, {
        params: { page: page + 1, limit: rowsPerPage, search: search || undefined },
      });
      setRows(data.data || []);
      setTotal(data.pagination?.total ?? (data.data?.length || 0));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      dispatch(stopLoading());
    }
  }, [endpoint, page, rowsPerPage, search, dispatch]);

  // Debounce search input; refetch on page / size / search changes.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchData]);

  const onSearchChange = (value) => {
    setPage(0);
    setSearch(value);
  };

  return {
    rows,
    total,
    loading,
    search,
    onSearchChange,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    refetch: fetchData,
  };
}
