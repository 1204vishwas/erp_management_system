import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios.js";
import useResource from "../hooks/useResource.js";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const emptyProduct = {
  title: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  reorderLevel: 10,
  description: "",
};

const schema = Yup.object({
  title: Yup.string().required("Title is required"),
  sku: Yup.string().required("SKU is required"),
  price: Yup.number().min(0, "Must be >= 0").required("Price is required"),
  stock: Yup.number().min(0, "Must be >= 0").required("Stock is required"),
  reorderLevel: Yup.number().min(0, "Must be >= 0"),
});

export default function Products() {
  const role = useSelector((s) => s.auth.user?.role);
  const canManage = role === "Admin" || role === "Inventory";
  const resource = useResource("/products");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setDialogOpen(true);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: editing || emptyProduct,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (editing) {
          await api.put(`/products/${editing._id}`, values);
          toast.success("Product updated");
        } else {
          await api.post("/products", values);
          toast.success("Product created");
        }
        setDialogOpen(false);
        resource.refetch();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success("Product deleted");
      setDeleteId(null);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { field: "title", label: "Title" },
    { field: "sku", label: "SKU" },
    { field: "category", label: "Category" },
    { field: "price", label: "Price", align: "right", render: (r) => `₹${r.price}` },
    {
      field: "stock",
      label: "Stock",
      align: "right",
      render: (r) => (
        <Chip
          label={r.stock}
          size="small"
          color={r.stock <= r.reorderLevel ? "error" : "success"}
          variant={r.stock <= r.reorderLevel ? "filled" : "outlined"}
        />
      ),
    },
    { field: "reorderLevel", label: "Reorder", align: "right" },
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

  const f = (name, label, type = "text") => (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={type}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
    />
  );

  return (
    <Box>
      <PageHeader
        title="Product Management"
        subtitle="Add, edit, delete and search products"
        actionLabel={canManage ? "Add Product" : undefined}
        onAction={openCreate}
      />

      <DataTable
        columns={columns}
        rows={resource.rows}
        loading={resource.loading}
        search={resource.search}
        onSearchChange={resource.onSearchChange}
        searchPlaceholder="Search by title, SKU or category..."
        page={resource.page}
        rowsPerPage={resource.rowsPerPage}
        total={resource.total}
        onPageChange={resource.setPage}
        onRowsPerPageChange={(n) => {
          resource.setRowsPerPage(n);
          resource.setPage(0);
        }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>{f("title", "Title")}</Grid>
              <Grid item xs={12} sm={6}>{f("sku", "SKU")}</Grid>
              <Grid item xs={12} sm={6}>{f("category", "Category")}</Grid>
              <Grid item xs={12} sm={6}>{f("price", "Price", "number")}</Grid>
              <Grid item xs={12} sm={6}>{f("stock", "Stock", "number")}</Grid>
              <Grid item xs={12} sm={6}>{f("reorderLevel", "Reorder Level", "number")}</Grid>
              <Grid item xs={12}>{f("description", "Description")}</Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editing ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Product"
        message="This action cannot be undone. Delete this product?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
