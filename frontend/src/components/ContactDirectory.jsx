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
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios.js";
import useResource from "../hooks/useResource.js";
import DataTable from "./DataTable.jsx";
import PageHeader from "./PageHeader.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

const empty = { name: "", company: "", email: "", contact: "", address: "", gstNo: "" };

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Enter a valid email"),
});

/**
 * Shared CRUD directory for Customers and Suppliers (same field shape).
 *
 * @param {string} endpoint    e.g. "/customers"
 * @param {string} title       page title
 * @param {string} subtitle    page subtitle
 * @param {string[]} manageRoles roles (besides Admin) that may edit
 * @param {string} addLabel    add-button label
 */
export default function ContactDirectory({
  endpoint,
  title,
  subtitle,
  manageRoles = [],
  addLabel,
}) {
  const role = useSelector((s) => s.auth.user?.role);
  const canManage = role === "Admin" || manageRoles.includes(role);
  const resource = useResource(endpoint);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: editing || empty,
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        if (editing) {
          await api.put(`${endpoint}/${editing._id}`, values);
          toast.success("Updated");
        } else {
          await api.post(endpoint, values);
          toast.success("Created");
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
      await api.delete(`${endpoint}/${deleteId}`);
      toast.success("Deleted");
      setDeleteId(null);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { field: "name", label: "Name" },
    { field: "company", label: "Company" },
    { field: "email", label: "Email" },
    { field: "contact", label: "Contact" },
    { field: "address", label: "Address" },
    ...(canManage
      ? [
          {
            field: "actions",
            label: "Actions",
            align: "right",
            render: (r) => (
              <>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => { setEditing(r); setDialogOpen(true); }}>
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

  const f = (name, label) => (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={formik.values[name] || ""}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
    />
  );

  return (
    <Box>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actionLabel={canManage ? addLabel : undefined}
        onAction={() => { setEditing(null); setDialogOpen(true); }}
      />

      <DataTable
        columns={columns}
        rows={resource.rows}
        loading={resource.loading}
        search={resource.search}
        onSearchChange={resource.onSearchChange}
        searchPlaceholder="Search by name, company or email..."
        page={resource.page}
        rowsPerPage={resource.rowsPerPage}
        total={resource.total}
        onPageChange={resource.setPage}
        onRowsPerPageChange={(n) => { resource.setRowsPerPage(n); resource.setPage(0); }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editing ? `Edit ${title}` : addLabel}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>{f("name", "Name")}</Grid>
              <Grid item xs={12} sm={6}>{f("company", "Company")}</Grid>
              <Grid item xs={12} sm={6}>{f("email", "Email")}</Grid>
              <Grid item xs={12} sm={6}>{f("contact", "Contact")}</Grid>
              <Grid item xs={12} sm={6}>{f("gstNo", "GST No.")}</Grid>
              <Grid item xs={12}>{f("address", "Address")}</Grid>
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
        title={`Delete ${title}`}
        message="This action cannot be undone. Continue?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
