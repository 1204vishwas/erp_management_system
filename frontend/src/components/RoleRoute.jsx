import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

// Role-based route guard. Admins always pass.
export default function RoleRoute({ roles = [], children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) return <Navigate to="/login" replace />;

  const allowed = user?.role === "Admin" || roles.includes(user?.role);
  if (!allowed) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center", maxWidth: 420 }}>
          <LockIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6">Access Denied</Typography>
          <Typography color="text.secondary">
            You do not have permission to view this page.
          </Typography>
        </Paper>
      </Box>
    );
  }
  return children;
}
