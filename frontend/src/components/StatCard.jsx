import { Paper, Box, Typography, Avatar } from "@mui/material";

// Metric tile for the dashboard.
export default function StatCard({ label, value, icon, color = "primary.main" }) {
  return (
    <Paper sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
      <Avatar sx={{ bgcolor: color, width: 52, height: 52 }}>{icon}</Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}
