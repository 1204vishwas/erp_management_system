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
  Chip,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import api from "../api/axios.js";
import useResource from "../hooks/useResource.js";
import DataTable from "./DataTable.jsx";
import PageHeader from "./PageHeader.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

const statusColor = {
  Pending: "warning",
  Confirmed: "info",
  Ordered: "info",
  Shipped: "primary",
  Received: "success",
  Completed: "success",
  Cancelled: "error",
};

/**
 * Reusable order manager for Sales Orders and Purchase Orders.
 *
 * @param {string} endpoint      "/sales-orders" | "/purchase-orders"
 * @param {string} partyEndpoint "/customers" | "/suppliers"
 * @param {string} partyField    "customer" | "supplier"
 * @param {string} partyLabel    "Customer" | "Supplier"
 * @param {string[]} statuses    allowed status values
 * @param {string} manageRole    role (besides Admin) allowed to manage
 * @param {string} title, subtitle, addLabel
 */
export default function OrderManager({
  endpoint,
  partyEndpoint,
  partyField,
  partyLabel,
  statuses,
  manageRole,
  title,
  subtitle,
  addLabel,
  trackPayment = false,
}) {
  const role = useSelector((s) => s.auth.user?.role);
  const canManage = role === "Admin" || role === manageRole;
  const resource = useResource(endpoint);

  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form state
  const [party, setParty] = useState("");
  const [status, setStatus] = useState(statuses[0]);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ product: "", quantity: 1 }]);

  // Load reference data (parties + products) once for the dropdowns.
  useEffect(() => {
    (async () => {
      try {
        const [p1, p2] = await Promise.all([
          api.get(partyEndpoint, { params: { limit: 100 } }),
          api.get("/products", { params: { limit: 100 } }),
        ]);
        setParties(p1.data.data || []);
        setProducts(p2.data.data || []);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [partyEndpoint]);

  const resetForm = () => {
    setParty("");
    setStatus(statuses[0]);
    setNotes("");
    setLines([{ product: "", quantity: 1 }]);
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = async (row) => {
    try {
      const { data } = await api.get(`${endpoint}/${row._id}`);
      const o = data.data;
      setEditing(o);
      setParty(o[partyField]?._id || o[partyField] || "");
      setStatus(o.status);
      setNotes(o.notes || "");
      setLines(
        o.products.map((p) => ({ product: p.product?._id || p.product, quantity: p.quantity }))
      );
      setDialogOpen(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, { product: "", quantity: 1 }]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const orderTotal = lines.reduce((sum, l) => {
    const prod = products.find((p) => p._id === l.product);
    return sum + (prod ? prod.price * Number(l.quantity || 0) : 0);
  }, 0);

  const handleSubmit = async () => {
    if (!party) return toast.error(`${partyLabel} is required`);
    const validLines = lines.filter((l) => l.product && Number(l.quantity) > 0);
    if (validLines.length === 0) return toast.error("Add at least one product");

    const payload = {
      [partyField]: party,
      status,
      notes,
      products: validLines.map((l) => ({ product: l.product, quantity: Number(l.quantity) })),
    };

    try {
      if (editing) {
        await api.put(`${endpoint}/${editing._id}`, payload);
        toast.success("Order updated");
      } else {
        await api.post(endpoint, payload);
        toast.success("Order created");
      }
      setDialogOpen(false);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${endpoint}/${deleteId}`);
      toast.success("Order deleted");
      setDeleteId(null);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Update payment status (money paid to supplier) inline.
  const handlePayment = async (id, paymentStatus) => {
    try {
      await api.put(`${endpoint}/${id}`, { paymentStatus });
      toast.success(`Marked ${paymentStatus}`);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const paymentColor = { Paid: "success", Partial: "warning", Unpaid: "error" };

  const columns = [
    { field: "orderNumber", label: "Order #" },
    {
      field: "party",
      label: partyLabel,
      render: (r) => r[partyField]?.name || r[partyField]?.company || "-",
    },
    {
      field: "products",
      label: "Items",
      align: "right",
      render: (r) => r.products?.length || 0,
    },
    {
      field: "totalPrice",
      label: "Total",
      align: "right",
      render: (r) => `₹${(r.totalPrice || 0).toLocaleString()}`,
    },
    {
      field: "status",
      label: "Status",
      render: (r) => <Chip label={r.status} size="small" color={statusColor[r.status] || "default"} />,
    },
    ...(trackPayment
      ? [
          {
            field: "paymentStatus",
            label: "Payment",
            render: (r) =>
              canManage ? (
                <TextField
                  select size="small" variant="standard"
                  value={r.paymentStatus || "Unpaid"}
                  onChange={(e) => handlePayment(r._id, e.target.value)}
                  sx={{ minWidth: 100 }}
                  SelectProps={{
                    renderValue: (v) => (
                      <Chip label={v} size="small" color={paymentColor[v] || "default"} />
                    ),
                  }}
                >
                  {["Unpaid", "Partial", "Paid"].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              ) : (
                <Chip
                  label={r.paymentStatus || "Unpaid"}
                  size="small"
                  color={paymentColor[r.paymentStatus] || "default"}
                />
              ),
          },
        ]
      : []),
    {
      field: "createdAt",
      label: "Date",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    ...(canManage
      ? [
          {
            field: "actions",
            label: "Actions",
            align: "right",
            render: (r) => (
              <>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(r)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => setDeleteId(r._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <Box>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actionLabel={canManage ? addLabel : undefined}
        onAction={openCreate}
      />

      <DataTable
        columns={columns}
        rows={resource.rows}
        loading={resource.loading}
        search={resource.search}
        onSearchChange={resource.onSearchChange}
        searchPlaceholder="Search by order number..."
        page={resource.page}
        rowsPerPage={resource.rowsPerPage}
        total={resource.total}
        onPageChange={resource.setPage}
        onRowsPerPageChange={(n) => { resource.setRowsPerPage(n); resource.setPage(0); }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? `Edit ${editing.orderNumber}` : addLabel}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label={partyLabel}
                value={party} onChange={(e) => setParty(e.target.value)}
              >
                {parties.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} {p.company ? `(${p.company})` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Status"
                value={status} onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Line Items</Typography>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "50%" }}>Product</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, idx) => {
                const prod = products.find((p) => p._id === line.product);
                const subtotal = prod ? prod.price * Number(line.quantity || 0) : 0;
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        select fullWidth size="small"
                        value={line.product}
                        onChange={(e) => updateLine(idx, "product", e.target.value)}
                      >
                        {products.map((p) => (
                          <MenuItem key={p._id} value={p._id}>
                            {p.title} ({p.sku}) · Stock: {p.stock}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell align="right">₹{prod?.price ?? 0}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number" size="small" sx={{ width: 90 }}
                        inputProps={{ min: 1 }}
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="right">₹{subtotal.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small" color="error"
                        disabled={lines.length === 1}
                        onClick={() => removeLine(idx)}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Button startIcon={<AddIcon />} onClick={addLine} sx={{ mt: 1 }}>
            Add Item
          </Button>

          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Typography variant="h6">
              Total: ₹{orderTotal.toLocaleString()}
            </Typography>
          </Box>

          <TextField
            fullWidth multiline rows={2} label="Notes" sx={{ mt: 2 }}
            value={notes} onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? "Update Order" : "Create Order"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Order"
        message="This action cannot be undone. Delete this order?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
