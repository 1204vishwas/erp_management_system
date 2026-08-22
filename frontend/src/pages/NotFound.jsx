import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h1" fontWeight={800} color="primary">404</Typography>
      <Typography variant="h6">Page not found</Typography>
      <Typography color="text.secondary">
        The page you are looking for doesn&apos;t exist.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Go to Dashboard
      </Button>
    </Box>
  );
}
