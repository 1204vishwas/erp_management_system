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
  MenuItem,
  Grid,
  IconButton,
  Chip,
  Tooltip,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios.js";
import useResource from "../hooks/useResource.js";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const roles = ["Admin", "Sales", "Purchase", "Inventory"];
const roleColor = { Admin: "error", Sales: "primary", Purchase: "secondary", Inventory: "warning" };

export default function Users() {
  const currentUser = useSelector((s) => s.auth.user);
  const resource = useResource("/users");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const schema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    role: Yup.string().oneOf(roles).required("Role is required"),
    password: editing
      ? Yup.string().min(6, "At least 6 characters")
      : Yup.string().min(6, "At least 6 characters").required("Password is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: editing
      ? { name: editing.name, email: editing.email, role: editing.role, phone: editing.phone || "", password: "" }
      : { name: "", email: "", role: "Sales", phone: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const payload = { ...values };
        if (!payload.password) delete payload.password;
        if (editing) {
          await api.put(`/users/${editing._id}`, payload);
          toast.success("User updated");
        } else {
          await api.post("/users", payload);
          toast.success("User created");
        }
        setDialogOpen(false);
        resource.refetch();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { active: !user.active });
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteId}`);
      toast.success("User deleted");
      setDeleteId(null);
      resource.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { field: "name", label: "Name" },
    { field: "email", label: "Email" },
    {
      field: "role",
      label: "Role",
      render: (r) => <Chip label={r.role} size="small" color={roleColor[r.role] || "default"} />,
    },
    { field: "phone", label: "Phone", render: (r) => r.phone || "-" },
    {
      field: "active",
      label: "Active",
      render: (r) => (
        <Switch
          checked={r.active}
          size="small"
          disabled={r._id === currentUser?._id}
          onChange={() => toggleActive(r)}
        />
      ),
    },
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
            <span>
              <IconButton
                size="small" color="error"
                disabled={r._id === currentUser?._id}
                onClick={() => setDeleteId(r._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </>
      ),
    },
  ];

  const f = (name, label, type = "text") => (
    <TextField
      fullWidth label={label} name={name} type={type}
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
        title="User Management"
        subtitle="Admin-only: manage users and roles"
        actionLabel="Add User"
        onAction={() => { setEditing(null); setDialogOpen(true); }}
      />

      <DataTable
        columns={columns}
        rows={resource.rows}
        loading={resource.loading}
        search={resource.search}
        onSearchChange={resource.onSearchChange}
        searchPlaceholder="Search by name or email..."
        page={resource.page}
        rowsPerPage={resource.rowsPerPage}
        total={resource.total}
        onPageChange={resource.setPage}
        onRowsPerPageChange={(n) => { resource.setRowsPerPage(n); resource.setPage(0); }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>{f("name", "Name")}</Grid>
              <Grid item xs={12} sm={6}>{f("email", "Email")}</Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Role" name="role"
                  value={formik.values.role} onChange={formik.handleChange}
                >
                  {roles.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>{f("phone", "Phone")}</Grid>
              <Grid item xs={12}>
                {f("password", editing ? "New Password (optional)" : "Password", "password")}
              </Grid>
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
        title="Delete User"
        message="This action cannot be undone. Delete this user?"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
