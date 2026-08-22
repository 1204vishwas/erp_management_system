import { createTheme } from "@mui/material/styles";

// Central Material-UI theme for a professional, consistent look.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565c0" },
    secondary: { main: "#00897b" },
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
