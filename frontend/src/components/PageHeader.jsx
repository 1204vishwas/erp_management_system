import { Box, Typography, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// Consistent page title + optional "Add" action button.
export default function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionLabel && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
