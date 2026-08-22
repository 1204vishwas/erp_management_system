import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Stack,
  Alert,
  MenuItem,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { register } from "../features/auth/authSlice.js";

const roles = ["Sales", "Purchase", "Inventory"];

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
  role: Yup.string().oneOf(roles).required("Role is required"),
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirm: "", role: "Sales" },
    validationSchema: schema,
    onSubmit: async (values) => {
      const { confirm, ...payload } = values;
      const result = await dispatch(register(payload));
      if (register.fulfilled.match(result)) {
        toast.success("Account created!");
        navigate("/dashboard", { replace: true });
      }
    },
  });

  const field = (name, label, type = "text") => (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={type}
      margin="normal"
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
    />
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#1565c0 0%,#00897b 100%)",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 460 }} elevation={6}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 42 }} />
          <Typography variant="h5">Create Account</Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={formik.handleSubmit}>
          {field("name", "Full Name")}
          {field("email", "Email")}
          <TextField
            select
            fullWidth
            label="Role"
            name="role"
            margin="normal"
            value={formik.values.role}
            onChange={formik.handleChange}
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
          {field("password", "Password", "password")}
          {field("confirm", "Confirm Password", "password")}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating..." : "Register"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
