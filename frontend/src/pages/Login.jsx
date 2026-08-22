import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
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
  Divider,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { login } from "../features/auth/authSlice.js";

const schema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, status, error } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (token) navigate(from, { replace: true });
  }, [token, navigate, from]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      const result = await dispatch(login(values));
      if (login.fulfilled.match(result)) {
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      }
    },
  });

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
      <Paper sx={{ p: 4, width: "100%", maxWidth: 420 }} elevation={6}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 42 }} />
          <Typography variant="h5">ERP Management System</Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account
          </Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link component={RouterLink} to="/register">
            Register
          </Link>
        </Typography>

        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary" component="div">
          Demo (after seeding): admin@erp.com / admin123
        </Typography>
      </Paper>
    </Box>
  );
}
