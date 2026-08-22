import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import api from "../api/axios.js";
import useResource from "../hooks/useResource.js";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const statusColor = { Paid: "success", Unpaid: "warning", Cancelled: "error" };

export default function Invoices() {
  const role = useSelector((s) => s.auth.user?.role);
  const canManage = role === "Admin" || role === "Sales";
  const resource = useResource("/invoices");

  const [salesOrders, setSalesOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSO, setSelectedSO] = useState("");
  const [taxRate, setTaxRate] = useState(18);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/sales-orders", { params: { limit: 100 } });
        setSalesOrders(data.data || []);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    if (!selectedSO) return toast.error("Select a sales order");
    try {
      await api.post("/invoices", { salesOrder: selectedSO, taxRate: Number(taxRate) });
      toast.success("Invoice generated");
      setDialogOpen(false);
      setSelectedSO("");
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/invoices/${id}`, { status });
      toast.success("Invoice updated");
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${deleteId}`);
      toast.success("Invoice deleted");
      setDeleteId(null);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Export a single invoice to PDF using jsPDF + autotable.
  const exportPDF = async (row) => {
    try {
      const { data } = await api.get(`/invoices/${row._id}`);
      const inv = data.data;
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("INVOICE", 14, 20);
      doc.setFontSize(11);
      doc.text(`Invoice No: ${inv.invoiceNumber}`, 14, 30);
      doc.text(`Date: ${new Date(inv.createdAt).toLocaleDateString()}`, 14, 36);
      doc.text(`Sales Order: ${inv.salesOrder?.orderNumber || "-"}`, 14, 42);

      doc.text("Bill To:", 140, 30);
      doc.text(inv.customer?.name || "-", 140, 36);
      if (inv.customer?.company) doc.text(inv.customer.company, 140, 42);
      if (inv.customer?.address) doc.text(inv.customer.address, 140, 48);

      autoTable(doc, {
        startY: 58,
        head: [["#", "Item", "Qty", "Unit Price", "Amount"]],
        body: inv.items.map((it, i) => [
          i + 1,
          it.title,
          it.quantity,
          it.price.toFixed(2),
          (it.quantity * it.price).toFixed(2),
        ]),
      });

      const y = doc.lastAutoTable.finalY + 10;
      doc.text(`Sub Total: ${inv.subTotal.toFixed(2)}`, 140, y);
      doc.text(`Tax (${inv.taxRate}%): ${inv.taxAmount.toFixed(2)}`, 140, y + 6);
      doc.setFontSize(13);
      doc.text(`Total: ${inv.total.toFixed(2)}`, 140, y + 14);
      doc.setFontSize(11);
      doc.text(`Status: ${inv.status}`, 14, y + 14);

      doc.save(`${inv.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { field: "invoiceNumber", label: "Invoice #" },
    { field: "so", label: "Sales Order", render: (r) => r.salesOrder?.orderNumber || "-" },
    { field: "customer", label: "Customer", render: (r) => r.customer?.name || "-" },
    { field: "total", label: "Total", align: "right", render: (r) => `₹${(r.total || 0).toLocaleString()}` },
    {
      field: "status",
      label: "Status",
      render: (r) =>
        canManage ? (
          <TextField
            select size="small" variant="standard"
            value={r.status}
            onChange={(e) => handleStatus(r._id, e.target.value)}
            sx={{ minWidth: 110 }}
          >
            {["Unpaid", "Paid", "Cancelled"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        ) : (
          <Chip label={r.status} size="small" color={statusColor[r.status]} />
        ),
    },
    {
      field: "actions",
      label: "Actions",
      align: "right",
      render: (r) => (
        <>
          <Tooltip title="Export PDF">
            <IconButton size="small" color="primary" onClick={() => exportPDF(r)}>
              <PictureAsPdfIcon fontSize="small" />
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
        title="Invoice Generation"
        subtitle="Generate invoices from sales orders and export to PDF"
        actionLabel={canManage ? "Generate Invoice" : undefined}
        onAction={() => setDialogOpen(true)}
      />

      <DataTable
        columns={columns}
        rows={resource.rows}
        loading={resource.loading}
        search={resource.search}
        onSearchChange={resource.onSearchChange}
        searchPlaceholder="Search by invoice number..."
        page={resource.page}
        rowsPerPage={resource.rowsPerPage}
        total={resource.total}
        onPageChange={resource.setPage}
        onRowsPerPageChange={(n) => { resource.setRowsPerPage(n); resource.setPage(0); }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                select fullWidth label="Sales Order"
                value={selectedSO} onChange={(e) => setSelectedSO(e.target.value)}
              >
                {salesOrders.map((so) => (
                  <MenuItem key={so._id} value={so._id}>
                    {so.orderNumber} — {so.customer?.name || "Customer"} (₹{so.totalPrice})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="number" fullWidth label="Tax Rate (%)"
                value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={!selectedSO}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Invoice"
        message="This action cannot be undone. Delete this invoice?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
