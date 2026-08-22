import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaidIcon from "@mui/icons-material/Paid";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import PageHeader from "../components/PageHeader.jsx";

const PIE_COLORS = ["#1565c0", "#00897b", "#f9a825", "#8e24aa", "#e53935"];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data.data);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, []);

  const c = data?.counts || {};
  const cards = [
    { label: "Products", value: c.products ?? 0, icon: <Inventory2Icon />, color: "#1565c0" },
    { label: "Customers", value: c.customers ?? 0, icon: <PeopleIcon />, color: "#00897b" },
    { label: "Suppliers", value: c.suppliers ?? 0, icon: <BusinessIcon />, color: "#6d4c41" },
    { label: "Sales Orders", value: c.salesOrders ?? 0, icon: <ShoppingCartIcon />, color: "#f9a825" },
    { label: "Purchase Orders", value: c.purchaseOrders ?? 0, icon: <LocalShippingIcon />, color: "#8e24aa" },
    { label: "Invoices", value: c.invoices ?? 0, icon: <ReceiptLongIcon />, color: "#3949ab" },
    { label: "Revenue (Paid)", value: `₹${(c.revenue ?? 0).toLocaleString()}`, icon: <PaidIcon />, color: "#2e7d32" },
    { label: "Low Stock", value: c.lowStock ?? 0, icon: <WarningAmberIcon />, color: "#e53935" },
  ];

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Business overview & key metrics" />

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="h6" gutterBottom>
              Sales Orders by Month
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={data?.charts?.salesByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Orders" fill="#1565c0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="Value" fill="#00897b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="h6" gutterBottom>
              Order Status
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={data?.charts?.salesByStatus || []}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={100}
                  label
                >
                  {(data?.charts?.salesByStatus || []).map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Alerts (Low Stock)
            </Typography>
            <Divider />
            {(data?.lowStockProducts || []).length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                All products are sufficiently stocked.
              </Typography>
            ) : (
              <List dense>
                {data.lowStockProducts.map((p) => (
                  <ListItem
                    key={p._id}
                    secondaryAction={
                      <Chip
                        label={`Stock ${p.stock} / reorder ${p.reorderLevel}`}
                        color="error"
                        size="small"
                      />
                    }
                  >
                    <ListItemText primary={p.title} secondary={`SKU: ${p.sku}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
