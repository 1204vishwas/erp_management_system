import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, LinearProgress } from "@mui/material";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

// App shell: sidebar + topbar + routed page content.
export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loading = useSelector((state) => state.ui.loadingCount > 0);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Topbar onMenuClick={() => setMobileOpen((v) => !v)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar />
        {loading && <LinearProgress />}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
