import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Tooltip,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api/axios.js";
import useResource from "../hooks/useResource.js";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function GRN() {
  const role = useSelector((s) => s.auth.user?.role);
  const canManage = role === "Admin" || role === "Inventory" || role === "Purchase";
  const resource = useResource("/grn");

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState("");
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [viewing, setViewing] = useState(null);

  // Load purchase orders that are not yet received for the dropdown.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/purchase-orders", { params: { limit: 100 } });
        setPurchaseOrders(data.data || []);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, []);

  const openCreate = () => {
    setSelectedPO("");
    setItems([]);
    setRemarks("");
    setDialogOpen(true);
  };

  // When a PO is selected, load its lines and default received = ordered.
  const handleSelectPO = async (poId) => {
    setSelectedPO(poId);
    try {
      const { data } = await api.get(`/purchase-orders/${poId}`);
      const po = data.data;
      setItems(
        po.products.map((p) => ({
          product: p.product?._id || p.product,
          title: p.title,
          orderedQty: p.quantity,
          receivedQty: p.quantity,
        }))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateReceived = (idx, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, receivedQty: value } : it))
    );
  };

  const handleSubmit = async () => {
    if (!selectedPO) return toast.error("Select a purchase order");
    try {
      await api.post("/grn", {
        purchaseOrder: selectedPO,
        remarks,
        items: items.map((it) => ({
          product: it.product,
          receivedQty: Number(it.receivedQty) || 0,
        })),
      });
      toast.success("GRN created & stock updated");
      setDialogOpen(false);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/grn/${deleteId}`);
      toast.success("GRN deleted");
      setDeleteId(null);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { field: "grnNumber", label: "GRN #" },
    {
      field: "po",
      label: "Purchase Order",
      render: (r) => r.purchaseOrder?.orderNumber || "-",
    },
    { field: "supplier", label: "Supplier", render: (r) => r.supplier?.name || "-" },
    {
      field: "items",
      label: "Items",
      align: "right",
      render: (r) => r.items?.length || 0,
    },
    {
      field: "receivedDate",
      label: "Received",
      render: (r) => new Date(r.receivedDate).toLocaleDateString(),
    },
    {
      field: "actions",
      label: "Actions",
      align: "right",
      render: (r) => (
        <>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => setViewing(r)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canManage && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setDeleteId(r._id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Goods Receipt Notes (GRN)"
        subtitle="Record goods received against purchase orders"
        actionLabel={canManage ? "New GRN" : undefined}
        onAction={openCreate}
      />

      <DataTable
        columns={columns}
        rows={resource.rows}
        loading={resource.loading}
        search={resource.search}
        onSearchChange={resource.onSearchChange}
        searchPlaceholder="Search by GRN number..."
        page={resource.page}
        rowsPerPage={resource.rowsPerPage}
        total={resource.total}
        onPageChange={resource.setPage}
        onRowsPerPageChange={(n) => { resource.setRowsPerPage(n); resource.setPage(0); }}
      />

      {/* Create GRN */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Goods Receipt Note</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Purchase Order"
                value={selectedPO} onChange={(e) => handleSelectPO(e.target.value)}
              >
                {purchaseOrders.map((po) => (
                  <MenuItem key={po._id} value={po._id}>
                    {po.orderNumber} — {po.supplier?.name || "Supplier"} ({po.status})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {items.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                Received Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Ordered</TableCell>
                    <TableCell align="right">Received</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{it.title}</TableCell>
                      <TableCell align="right">{it.orderedQty}</TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number" size="small" sx={{ width: 100 }}
                          inputProps={{ min: 0 }}
                          value={it.receivedQty}
                          onChange={(e) => updateReceived(idx, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          <TextField
            fullWidth multiline rows={2} label="Remarks" sx={{ mt: 2 }}
            value={remarks} onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!selectedPO}>
            Create GRN
          </Button>
        </DialogActions>
      </Dialog>

      {/* View GRN */}
      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {viewing?.grnNumber}{" "}
          <Chip label={viewing?.purchaseOrder?.orderNumber} size="small" sx={{ ml: 1 }} />
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Supplier: {viewing?.supplier?.name || "-"} · Received:{" "}
            {viewing && new Date(viewing.receivedDate).toLocaleString()}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Ordered</TableCell>
                <TableCell align="right">Received</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {viewing?.items?.map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell>{it.title}</TableCell>
                  <TableCell align="right">{it.orderedQty}</TableCell>
                  <TableCell align="right">{it.receivedQty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {viewing?.remarks && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Remarks: {viewing.remarks}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete GRN"
        message="This action cannot be undone. Delete this GRN?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
