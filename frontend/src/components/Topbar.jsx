import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Divider,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "../features/auth/authSlice.js";
import { DRAWER_WIDTH } from "./Sidebar.jsx";

export default function Topbar({ onMenuClick }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  const handleLogout = () => {
    setAnchor(null);
    dispatch(logout());
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          ERP Management System
        </Typography>

        <Chip label={user?.role || "User"} color="primary" size="small" sx={{ mr: 2 }} />

        <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
          <Avatar sx={{ bgcolor: "secondary.main", width: 36, height: 36 }}>
            {initials}
          </Avatar>
        </IconButton>

        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography fontWeight={600}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchor(null); navigate("/profile"); }}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
