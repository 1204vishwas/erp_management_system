import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import DescriptionIcon from "@mui/icons-material/Description";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BusinessIcon from "@mui/icons-material/Business";
import AssessmentIcon from "@mui/icons-material/Assessment";

export const DRAWER_WIDTH = 240;

// Nav items with the roles allowed to see them (Admin sees everything).
const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon />, roles: ["all"] },
  { label: "Products", path: "/products", icon: <Inventory2Icon />, roles: ["all"] },
  { label: "Customers", path: "/customers", icon: <PeopleIcon />, roles: ["all"] },
  { label: "Suppliers", path: "/suppliers", icon: <BusinessIcon />, roles: ["all"] },
  { label: "Sales Orders", path: "/sales-orders", icon: <ShoppingCartIcon />, roles: ["all"] },
  { label: "Purchase Orders", path: "/purchase-orders", icon: <LocalShippingIcon />, roles: ["all"] },
  { label: "GRN", path: "/grn", icon: <MoveToInboxIcon />, roles: ["all"] },
  { label: "Invoices", path: "/invoice", icon: <ReceiptLongIcon />, roles: ["all"] },
  { label: "Reports / Balance Sheet", path: "/reports", icon: <AssessmentIcon />, roles: ["all"] },
  { label: "User Management", path: "/admin", icon: <AdminPanelSettingsIcon />, roles: ["Admin"] },
];

function NavContent() {
  const role = useSelector((state) => state.auth.user?.role);

  const visible = navItems.filter(
    (item) => item.roles.includes("all") || role === "Admin" || item.roles.includes(role)
  );

  return (
    <div>
      <Toolbar sx={{ px: 2 }}>
        <DescriptionIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap fontWeight={800} color="primary">
          ERP System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {visible.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              "&.active": {
                bgcolor: "primary.main",
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
              mx: 1,
              my: 0.5,
              borderRadius: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
}

// Responsive sidebar: permanent on desktop, temporary drawer on mobile.
export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        <NavContent />
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, borderRight: "1px solid #e0e0e0" },
        }}
      >
        <NavContent />
      </Drawer>
    </Box>
  );
}
