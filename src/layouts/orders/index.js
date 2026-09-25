/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Context
import { useMaterialUIController, setDirection } from "context";

// API services
import orderApi from "./services/orderApi";

// Components
import OrderDetailsModal from "./components/OrderDetailsModal";
import UpdateStatusModal from "./components/UpdateStatusModal";
import DeleteOrderModal from "./components/DeleteOrderModal";
import AssignDeliveryModal from "./components/AssignDeliveryModal";
import OrderStatsCard from "./components/OrderStatsCard";
import InvoicePrint from "./components/InvoicePrint";

function Orders() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // States للبحث والتصفية
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // States للمودالات
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // ألوان حالات الطلب
  const statusConfig = {
    PENDING: { color: "warning", label: "قيد المراجعة", icon: "schedule" },
    CONFIRMED: { color: "info", label: "مؤكد", icon: "check_circle" },
    SHIPPING: { color: "primary", label: "قيد الشحن", icon: "local_shipping" },
    DELIVERED: { color: "success", label: "تم التسليم", icon: "done_all" },
    CANCELLED: { color: "error", label: "ملغي", icon: "cancel" },
  };

  // Set RTL direction
  useEffect(() => {
    setDirection(dispatch, "rtl");
    return () => setDirection(dispatch, "ltr");
  }, [dispatch]);

  // جلب الإحصائيات
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await orderApi.getOrderStats();

      // التصحيح هنا - البيانات تأتي في response.data.data.stats أو response.data.stats
      const statsData = response.data?.data?.stats || response.data?.stats || {};
      console.log("📊 Stats response:", response.data); // للتdebug
      console.log("📈 Processed stats:", statsData); // للتdebug

      setStats(statsData);
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      setStats({});
    } finally {
      setStatsLoading(false);
    }
  };

  // جلب الطلبات
  const fetchOrders = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      };

      const response = await orderApi.getAllOrders(params);
      const responseData = response.data?.data || response.data;

      const ordersData = responseData?.orders || [];
      const total = responseData?.pagination?.total || 0;
      const pages = responseData?.pagination?.pages || Math.ceil(total / limit);

      setOrders(ordersData);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total,
        pages,
      }));
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // التحميل الأولي
  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  // البحث مع debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(1, pagination.limit);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, dateRange]);

  // تغيير الصفحة
  const handlePageChange = (event, value) => {
    fetchOrders(value, pagination.limit);
  };

  // تحديث حالة الطلب
  const handleUpdateStatus = async (statusData) => {
    try {
      await orderApi.updateOrderStatus(selectedOrder.id, statusData);
      await fetchOrders(pagination.page, pagination.limit);
      await fetchStats(); // تحديث الإحصائيات
      setStatusModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      throw error;
    }
  };

  // حذف طلب
  const handleDeleteOrder = async () => {
    try {
      await orderApi.deleteOrder(selectedOrder.id);
      await fetchOrders(pagination.page, pagination.limit);
      await fetchStats(); // تحديث الإحصائيات
      setDeleteModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      throw error;
    }
  };

  // فتح تفاصيل الطلب
  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  // فتح تحديث الحالة
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusModalOpen(true);
  };

  // فتح حذف الطلب
  const openDeleteModal = (order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
  };

  // فتح تعيين مندوب توصيل
  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setAssignModalOpen(true);
  };

  // تعيين مندوب توصيل
  const handleAssignDelivery = async (assignData) => {
    await orderApi.assignDelivery(assignData);
    await fetchOrders(pagination.page, pagination.limit);
    setAssignModalOpen(false);
    setSelectedOrder(null);
  };

  // طباعة الفاتورة
  const handlePrintInvoice = (order) => {
    setSelectedOrder(order);
    setPrintModalOpen(true);
  };

  // تنسيق السعر
  const formatPrice = (priceCents) => {
    return new Intl.NumberFormat("ar-LY", {
      style: "currency",
      currency: "LYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceCents / 100);
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* إحصائيات الطلبات */}
        <Grid container style={{ marginBottom: "50px" }} spacing={3} mb={3}>
          <OrderStatsCard stats={stats} loading={statsLoading} darkMode={darkMode} />
        </Grid>

        <Grid container spacing={6}>
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
                  إدارة الطلبات
                </MDTypography>
                {/* <MDTypography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                  عرض وإدارة جميع طلبات المتجر
                </MDTypography> */}
              </MDBox>

              {/* فلترات البحث */}
              <MDBox p={2} display="flex" gap={2} flexWrap="wrap">
                {/* بحث نصي */}
                <TextField
                  variant="outlined"
                  placeholder="ابحث برقم الطلب، اسم العميل، أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: { xs: 250, md: 350 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon>search</Icon>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* فلتر الحالة */}
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>حالة الطلب</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="حالة الطلب"
                    sx={{
                      height: "40px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                      },
                    }}
                  >
                    <MenuItem value="">الكل</MenuItem>
                    <MenuItem value="PENDING">قيد المراجعة</MenuItem>
                    <MenuItem value="CONFIRMED">مؤكد</MenuItem>
                    <MenuItem value="SHIPPING">قيد الشحن</MenuItem>
                    <MenuItem value="DELIVERED">تم التسليم</MenuItem>
                    <MenuItem value="CANCELLED">ملغي</MenuItem>
                  </Select>
                </FormControl>

                {/* فلتر التاريخ */}
                <TextField
                  label="من تاريخ"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="إلى تاريخ"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </MDBox>

              {/* جدول الطلبات */}
              <MDBox pt={1} pb={2}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      جاري تحميل الطلبات...
                    </MDTypography>
                  </MDBox>
                ) : orders.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      لا توجد طلبات
                    </MDTypography>
                  </MDBox>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{
                              backgroundColor: darkMode
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.02)",
                              borderBottom: "2px solid",
                              borderBottomColor: darkMode
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.1)",
                            }}
                          >
                            <TableCell
                              sx={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              رقم الطلب
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              العميل
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              الإجمالي
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              الحالة
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              تاريخ الطلب
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              الإجراءات
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDTypography variant="button" fontWeight="bold">
                                  {order.orderNumber}
                                </MDTypography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDBox>
                                  <MDTypography variant="body2" fontWeight="medium">
                                    {order.shippingName}
                                  </MDTypography>
                                  <MDTypography variant="caption" color="text">
                                    {order.shippingPhone}
                                  </MDTypography>
                                </MDBox>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDTypography variant="button" fontWeight="bold" color="success">
                                  {formatPrice(order.totalCents)}
                                </MDTypography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Chip
                                  icon={<Icon>{statusConfig[order.status]?.icon}</Icon>}
                                  label={statusConfig[order.status]?.label}
                                  color={statusConfig[order.status]?.color}
                                  variant="filled"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDTypography variant="body2">
                                  {formatDate(order.createdAt)}
                                </MDTypography>
                              </TableCell>
                              <TableCell>
                                <MDBox display="flex" justifyContent="center" gap={1}>
                                  {/* تفاصيل */}
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => openDetailsModal(order)}
                                  >
                                    <Icon>visibility</Icon>
                                  </IconButton>

                                  {/* تحديث الحالة */}
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => openStatusModal(order)}
                                  >
                                    <Icon>edit</Icon>
                                  </IconButton>

                                  {/* طباعة الفاتورة */}
                                  <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() => handlePrintInvoice(order)}
                                  >
                                    <Icon>print</Icon>
                                  </IconButton>

                                  {/* تعيين مندوب */}
                                  <IconButton
                                    color="warning"
                                    size="small"
                                    onClick={() => openAssignModal(order)}
                                    disabled={
                                      order.status !== "PENDING" &&
                                      order.status !== "CONFIRMED" &&
                                      order.status !== "SHIPPING"
                                    }
                                  >
                                    <Icon>delivery_dining</Icon>
                                  </IconButton>

                                  {/* حذف */}
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => openDeleteModal(order)}
                                    disabled={order.status !== "CANCELLED"}
                                  >
                                    <Icon>delete</Icon>
                                  </IconButton>
                                </MDBox>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Pagination خارجي - مثل المستخدمين والتصنيفات والماركات */}
                    <MDBox
                      p={2}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        borderTop: "1px solid",
                        borderTopColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      }}
                    >
                      <MDBox display="flex" alignItems="center" gap={2}>
                        <MDTypography
                          variant="button"
                          color={darkMode ? "white" : "dark"}
                          fontWeight="medium"
                        >
                          إظهار {orders.length} من أصل {pagination.total} طلب
                        </MDTypography>
                      </MDBox>

                      <Stack spacing={2}>
                        <Pagination
                          count={pagination.pages}
                          page={pagination.page}
                          onChange={handlePageChange}
                          color="primary"
                          size="medium"
                          sx={{
                            "& .MuiPaginationItem-root": {
                              color: darkMode ? "text.main" : "text.primary",
                              borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                              "&:hover": {
                                backgroundColor: darkMode
                                  ? "rgba(255,255,255,0.1)"
                                  : "rgba(0,0,0,0.1)",
                              },
                            },
                            "& .MuiPaginationItem-root.Mui-selected": {
                              backgroundColor: darkMode ? "primary.main" : "primary.main",
                              color: "white",
                              "&:hover": {
                                backgroundColor: darkMode ? "primary.dark" : "primary.dark",
                              },
                            },
                          }}
                        />
                      </Stack>
                    </MDBox>
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Modals */}
      <OrderDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <UpdateStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleUpdateStatus}
        order={selectedOrder}
        currentStatus={selectedOrder?.status}
      />

      <InvoicePrint
        open={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <DeleteOrderModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDeleteOrder}
        order={selectedOrder}
      />

      <AssignDeliveryModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleAssignDelivery}
        order={selectedOrder}
      />
    </DashboardLayout>
  );
}

export default Orders;
