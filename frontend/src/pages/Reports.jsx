import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import api from "../api/axios.js";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Reports() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/reports", {
        params: { from: from || undefined, to: to || undefined },
      });
      setData(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <Box>
        <PageHeader title="Reports & Balance Sheet" subtitle="Loading..." />
      </Box>
    );
  }

  const bs = data.balanceSheet;

  // Top metric cards
  const cards = [
    { label: "Total Sales", value: money(data.sales.total), icon: <PointOfSaleIcon />, color: "#1565c0" },
    { label: "Total Purchases", value: money(data.purchases.total), icon: <ShoppingCartIcon />, color: "#8e24aa" },
    { label: "Goods Received (Qty)", value: data.grn.receivedQty, icon: <MoveToInboxIcon />, color: "#6d4c41" },
    { label: "Total Invoiced", value: money(data.invoices.invoicedTotal), icon: <ReceiptLongIcon />, color: "#3949ab" },
  ];

  // Export the whole balance sheet to PDF.
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ERP - Balance Sheet & Business Report", 14, 18);
    doc.setFontSize(10);
    const period =
      data.range.from || data.range.to
        ? `Period: ${data.range.from || "start"} to ${data.range.to || "today"}`
        : "Period: All time";
    doc.text(period, 14, 25);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    autoTable(doc, {
      startY: 38,
      head: [["Balance Sheet", "Amount"]],
      body: [
        ["Cash Received (Paid Invoices)", money(bs.cashReceived)],
        ["Accounts Receivable (Unpaid Invoices)", money(bs.accountsReceivable)],
        ["Inventory Value (Stock on hand)", money(bs.inventoryValue)],
        ["Total Assets", money(bs.assetsTotal)],
        ["Purchase Expenditure", money(bs.purchaseExpenditure)],
        ["Tax Collected", money(bs.taxCollected)],
        ["Net Position", money(bs.netPosition)],
      ],
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Money In / Out", "Amount"]],
      body: [
        ["Money Received (paid invoices)", money(data.moneyFlow.received)],
        ["Money To Receive (unpaid invoices)", money(data.moneyFlow.toReceive)],
        ["Money Paid Out (to suppliers)", money(data.moneyFlow.paidOut)],
        ["Money To Pay (owed to suppliers)", money(data.moneyFlow.toPay)],
        ["Net Cash Flow", money(data.moneyFlow.netCash)],
      ],
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Sales & Purchases", "Count", "Value"]],
      body: [
        ["Sales Orders", data.sales.count, money(data.sales.total)],
        ["Purchase Orders", data.purchases.count, money(data.purchases.total)],
        ["GRNs (goods received)", data.grn.count, `${data.grn.receivedQty} units`],
        ["Invoices", data.invoices.count, money(data.invoices.invoicedTotal)],
      ],
    });

    doc.save("balance-sheet.pdf");
  };

  return (
    <Box>
      <PageHeader
        title="Reports & Balance Sheet"
        subtitle="Consolidated view of sales, purchases, goods received and invoices"
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <TextField
            type="date" label="From" size="small" InputLabelProps={{ shrink: true }}
            value={from} onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            type="date" label="To" size="small" InputLabelProps={{ shrink: true }}
            value={to} onChange={(e) => setTo(e.target.value)}
          />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
            Apply
          </Button>
          <Button
            variant="outlined"
            onClick={() => { setFrom(""); setTo(""); }}
          >
            Clear
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={exportPDF}>
            Export PDF
          </Button>
        </Stack>
      </Paper>

      {/* Metric cards */}
      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      {/* Money In vs Money Out - traffic-light view */}
      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Money In vs Money Out
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MoneyCard tone="green" label="Money Received" hint="Paid invoices" value={money(data.moneyFlow.received)} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MoneyCard tone="orange" label="Money To Receive" hint="Unpaid invoices" value={money(data.moneyFlow.toReceive)} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MoneyCard tone="green" label="Money Paid Out" hint="Paid to suppliers" value={money(data.moneyFlow.paidOut)} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MoneyCard tone="red" label="Money To Pay" hint="Owed to suppliers" value={money(data.moneyFlow.toPay)} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MoneyCard
            tone={data.moneyFlow.netCash >= 0 ? "green" : "red"}
            label="Net Cash Flow"
            hint="Received − Paid out"
            value={money(data.moneyFlow.netCash)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* Balance sheet */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Balance Sheet</Typography>
            <Divider />
            <Table size="small">
              <TableBody>
                <SectionRow label="ASSETS / INCOME" />
                <Row label="Cash Received (Paid Invoices)" value={money(bs.cashReceived)} />
                <Row label="Accounts Receivable (Unpaid)" value={money(bs.accountsReceivable)} />
                <Row label="Inventory Value (Stock on hand)" value={money(bs.inventoryValue)} />
                <Row label="Total Assets" value={money(bs.assetsTotal)} bold />
                <SectionRow label="EXPENDITURE" />
                <Row label="Purchase Expenditure (total)" value={money(bs.purchaseExpenditure)} />
                <Row
                  label="— Paid to suppliers"
                  value={<Chip size="small" color="success" label={money(bs.purchasePaid)} />}
                />
                <Row
                  label="— Still payable"
                  value={<Chip size="small" color="error" label={money(bs.purchasePayable)} />}
                />
                <Row label="Tax Collected (payable)" value={money(bs.taxCollected)} />
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, fontSize: 15 }}>Net Position</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={money(bs.netPosition)}
                      color={bs.netPosition >= 0 ? "success" : "error"}
                      sx={{ fontWeight: 800 }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Invoices summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Invoices Summary</Typography>
            <Divider />
            <Table size="small">
              <TableBody>
                <Row label="Total Invoices" value={data.invoices.count} />
                <Row label="Sub Total (pre-tax)" value={money(data.invoices.subTotal)} />
                <Row label="Tax Collected" value={money(data.invoices.taxCollected)} />
                <Row label="Total Invoiced" value={money(data.invoices.invoicedTotal)} bold />
                <Row
                  label="Paid"
                  value={<Chip size="small" color="success" label={`${data.invoices.paidCount} · ${money(data.invoices.totalPaid)}`} />}
                />
                <Row
                  label="Unpaid (receivable)"
                  value={<Chip size="small" color="warning" label={`${data.invoices.unpaidCount} · ${money(data.invoices.totalReceivable)}`} />}
                />
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Sales by status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Sales Orders by Status</Typography>
            <Divider />
            <StatusTable rows={data.sales.byStatus} money={money} />
          </Paper>
        </Grid>

        {/* Purchases by status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Purchase Orders by Status</Typography>
            <Divider />
            <StatusTable rows={data.purchases.byStatus} money={money} />
          </Paper>
        </Grid>

        {/* Recent GRN */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Goods Received Notes (GRN){" "}
              <Chip label={`${data.grn.count} total`} size="small" sx={{ ml: 1 }} />
            </Typography>
            <Divider />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GRN #</TableCell>
                  <TableCell>Purchase Order</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Qty Received</TableCell>
                  <TableCell align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.grn.recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No GRNs in this period</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.grn.recent.map((g) => (
                    <TableRow key={g.grnNumber}>
                      <TableCell>{g.grnNumber}</TableCell>
                      <TableCell>{g.purchaseOrder}</TableCell>
                      <TableCell align="right">{g.items}</TableCell>
                      <TableCell align="right">{g.qty}</TableCell>
                      <TableCell align="right">{new Date(g.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// Traffic-light money card: green = good/received, orange = pending, red = owed.
const TONES = {
  green: { bg: "#e8f5e9", border: "#2e7d32", text: "#1b5e20" },
  orange: { bg: "#fff8e1", border: "#f9a825", text: "#e65100" },
  red: { bg: "#ffebee", border: "#e53935", text: "#b71c1c" },
};

const MoneyCard = ({ tone, label, hint, value }) => {
  const t = TONES[tone] || TONES.green;
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        bgcolor: t.bg,
        borderLeft: `6px solid ${t.border}`,
      }}
    >
      <Typography variant="body2" sx={{ color: t.text, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color: t.text, fontWeight: 800, my: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: t.text, opacity: 0.8 }}>
        {hint}
      </Typography>
    </Paper>
  );
};

const Row = ({ label, value, bold }) => (
  <TableRow>
    <TableCell sx={{ fontWeight: bold ? 700 : 400 }}>{label}</TableCell>
    <TableCell align="right" sx={{ fontWeight: bold ? 700 : 400 }}>{value}</TableCell>
  </TableRow>
);

const SectionRow = ({ label }) => (
  <TableRow>
    <TableCell colSpan={2} sx={{ bgcolor: "action.hover", fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>
      {label}
    </TableCell>
  </TableRow>
);

const StatusTable = ({ rows, money }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Status</TableCell>
        <TableCell align="right">Count</TableCell>
        <TableCell align="right">Value</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
            <Typography color="text.secondary">No data</Typography>
          </TableCell>
        </TableRow>
      ) : (
        rows.map((r) => (
          <TableRow key={r.status}>
            <TableCell><Chip label={r.status} size="small" /></TableCell>
            <TableCell align="right">{r.count}</TableCell>
            <TableCell align="right">{money(r.total)}</TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);
