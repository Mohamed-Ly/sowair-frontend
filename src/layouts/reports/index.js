// layouts/reports/index.js
import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Dashboard layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Context
import { useMaterialUIController, setDirection } from "context";

// Components
import ReportsBarChart from "./components/ReportsBarChart";
import ReportsPieChart from "./components/ReportsPieChart";

// API
import reportsApi from "./services/reportsApi";

function formatMoney(cents) {
  return (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getInitialRange() {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - 29);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(today) };
}

function Reports() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const initial = getInitialRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [granularity, setGranularity] = useState("day");

  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDirection(dispatch, "rtl");
    return () => setDirection(dispatch, "ltr");
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [from, to, granularity]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = { from, to, granularity };
      const [sRes, pRes] = await Promise.all([
        reportsApi.getSummary(params),
        reportsApi.getProducts({ from, to }),
      ]);
      const sData = sRes.data?.data?.report || sRes.data?.report || {};
      const pData = pRes.data?.data?.report?.products || pRes.data?.report?.products || [];
      setSummary(sData);
      setProducts(pData);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = (type, format) => {
    reportsApi
      .exportReport({ from, to, granularity, type, format })
      .then((res) => {
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `report-${type}-${new Date().toISOString().slice(0, 10)}.${format}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("Export failed:", err));
  };

  const bucketLabels = (summary?.byPeriod || []).map((b) => b.label);
  const revenueData = (summary?.byPeriod || []).map((b) => b.revenueCents / 100);
  const ordersData = (summary?.byPeriod || []).map((b) => b.orders);

  const statusData = summary?.byStatus || {};

  const statCards = [
    {
      label: "إجمالي الطلبات",
      value: summary?.totalOrders ?? "—",
      icon: "receipt_long",
      color: "info",
    },
    {
      label: "تم التسليم",
      value: summary?.deliveredOrders ?? "—",
      icon: "check_circle",
      color: "success",
    },
    {
      label: "طلبات ملغاة",
      value: summary?.cancelledOrders ?? "—",
      icon: "cancel",
      color: "error",
    },
    {
      label: "الإيرادات",
      value: summary ? `${formatMoney(summary.totalRevenueCents || 0)} د.ل` : "—",
      icon: "payments",
      color: "warning",
    },
    {
      label: "متوسط قيمة الطلب",
      value: summary ? `${formatMoney(summary.averageOrderValueCents || 0)} د.ل` : "—",
      icon: "monitoring",
      color: "secondary",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* شريط الفلاتر */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={3}>
                  التقارير
                </MDTypography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="من تاريخ"
                      type="date"
                      value={from}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setFrom(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="إلى تاريخ"
                      type="date"
                      value={to}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      select
                      label="مدة التجميع"
                      value={granularity}
                      onChange={(e) => setGranularity(e.target.value)}
                    >
                      <MenuItem value="day">يومي</MenuItem>
                      <MenuItem value="week">أسبوعي</MenuItem>
                      <MenuItem value="month">شهري</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDBox display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        startIcon={<Icon>download</Icon>}
                        onClick={() => downloadExport("sales", "csv")}
                      >
                        تصدير المبيعات CSV
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<Icon>picture_as_pdf</Icon>}
                        onClick={() => downloadExport("sales", "pdf")}
                      >
                        تصدير المبيعات PDF
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<Icon>download</Icon>}
                        onClick={() => downloadExport("products", "csv")}
                      >
                        تصدير المنتجات CSV
                      </MDButton>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* بطاقات الإحصائيات */}
        <Grid container spacing={3} mb={3}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.label}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={2}
                  px={2}
                  variant="gradient"
                  bgColor={card.color}
                  borderRadius="lg"
                  coloredShadow={card.color}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon fontSize="large" color="white">
                    {card.icon}
                  </Icon>
                </MDBox>
                <MDBox pt={2} pb={3} px={2} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold">
                    {card.value}
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    fontWeight="medium"
                    color="text"
                    sx={{ opacity: 0.7 }}
                  >
                    {card.label}
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* المخططات */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={8}>
            <ReportsBarChart
              labels={bucketLabels}
              datasets={[
                {
                  label: "عدد الطلبات",
                  data: ordersData,
                },
                {
                  label: "الإيرادات (د.ل)",
                  data: revenueData,
                },
              ]}
              loading={loading}
              title="المبيعات حسب الفترة"
              ySuffix=""
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <ReportsPieChart data={statusData} loading={loading} title="توزيع حالات الطلبات" />
          </Grid>
        </Grid>

        {/* جدول أفضل المنتجات */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white" fontWeight="bold">
                  أفضل المنتجات مبيعاً
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                          borderBottom: "2px solid",
                          borderBottomColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                        }}
                      >
                        <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                          المنتج
                        </TableCell>
                        <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                          التصنيف
                        </TableCell>
                        <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                          الماركة
                        </TableCell>
                        <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                          المتغير
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: darkMode ? "text.main" : "text.primary" }}
                        >
                          الكمية
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: darkMode ? "text.main" : "text.primary" }}
                        >
                          الإيرادات
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            align="center"
                            sx={{ color: darkMode ? "text.main" : "text.primary" }}
                          >
                            جاري تحميل البيانات...
                          </TableCell>
                        </TableRow>
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            align="center"
                            sx={{ color: darkMode ? "text.main" : "text.primary" }}
                          >
                            لا توجد بيانات في هذه الفترة
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((p) => (
                          <TableRow key={p.productId}>
                            <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                              {p.name}
                            </TableCell>
                            <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                              {p.category}
                            </TableCell>
                            <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                              {p.brand}
                            </TableCell>
                            <TableCell sx={{ color: darkMode ? "text.main" : "text.primary" }}>
                              {p.variant || "—"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ color: darkMode ? "text.main" : "text.primary" }}
                            >
                              {p.totalQty}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ color: darkMode ? "text.main" : "text.primary" }}
                            >
                              {p.revenue}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Reports;
