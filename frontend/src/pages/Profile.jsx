import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Avatar,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import api from "../api/axios.js";
import { setUser } from "../features/auth/authSlice.js";
import PageHeader from "../components/PageHeader.jsx";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  password: Yup.string().test(
    "len",
    "At least 6 characters",
    (v) => !v || v.length >= 6
  ),
  confirm: Yup.string().oneOf([Yup.ref("password")], "Passwords must match"),
});

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      password: "",
      confirm: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          phone: values.phone,
          address: values.address,
        };
        if (values.password) payload.password = values.password;
        const { data } = await api.put("/profile", payload);
        dispatch(setUser({ ...user, ...data.user }));
        toast.success("Profile updated");
        formik.setFieldValue("password", "");
        formik.setFieldValue("confirm", "");
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const f = (name, label, type = "text", extra = {}) => (
    <TextField
      fullWidth label={label} name={name} type={type}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      {...extra}
    />
  );

  return (
    <Box>
      <PageHeader title="My Profile" subtitle="View and update your account details" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 88, height: 88, mx: "auto", fontSize: 32 }}>
              {initials}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 2 }}>{user?.name}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
            <Chip label={user?.role} color="primary" sx={{ mt: 1 }} />
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1} sx={{ textAlign: "left" }}>
              <Typography variant="body2"><strong>Phone:</strong> {user?.phone || "-"}</Typography>
              <Typography variant="body2"><strong>Address:</strong> {user?.address || "-"}</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Edit Details</Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>{f("name", "Full Name")}</Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" value={user?.email || ""} disabled />
                </Grid>
                <Grid item xs={12} sm={6}>{f("phone", "Phone")}</Grid>
                <Grid item xs={12} sm={6}>{f("address", "Address")}</Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Change Password (optional)
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={6}>{f("password", "New Password", "password")}</Grid>
                <Grid item xs={12} sm={6}>{f("confirm", "Confirm Password", "password")}</Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button type="submit" variant="contained">Save Changes</Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
