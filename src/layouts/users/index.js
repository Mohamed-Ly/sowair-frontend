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
import userApi from "./services/userApi";

// Components
import DeleteUserModal from "./components/DeleteUserModal";
import UserStatsCard from "./components/UserStatsCard";

function Users() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // States للبحث والتصفية
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // States للمودالات
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // ألوان أدوار المستخدمين
  const roleConfig = {
    ADMIN: { color: "error", label: "أدمن", icon: "admin_panel_settings" },
    CUSTOMER: { color: "info", label: "عميل", icon: "person" },
    DELIVERY: { color: "warning", label: "مندوب", icon: "delivery_dining" },
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
      const response = await userApi.getUsersCount();
      const statsData = response.data?.data?.counts || response.data?.counts || {};
      setStats(statsData);
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      setStats({});
    } finally {
      setStatsLoading(false);
    }
  };

  // جلب المستخدمين
  const fetchUsers = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
      };

      const response = await userApi.getAllUsers(params);
      const responseData = response.data?.data || response.data;

      const usersData = responseData?.users || [];
      const total = responseData?.pagination?.total || 0;
      const pages = responseData?.pagination?.pages || Math.ceil(total / limit);

      setUsers(usersData);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total,
        pages,
      }));
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // التحميل الأولي
  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  // البحث مع debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, pagination.limit);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter]);

  // تغيير الصفحة
  const handlePageChange = (event, value) => {
    fetchUsers(value, pagination.limit);
  };

  // تحديث بيانات المستخدم
  const handleUpdateUser = async (userData) => {
    try {
      await userApi.updateUser(selectedUser.id, userData);
      await fetchUsers(pagination.page, pagination.limit);
      await fetchStats(); // تحديث الإحصائيات
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      throw error;
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async () => {
    try {
      await userApi.deleteUserAdmin(selectedUser.id);
      await fetchUsers(pagination.page, pagination.limit);
      await fetchStats(); // تحديث الإحصائيات
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      throw error;
    }
  };

  // تغيير دور مستخدم (تفعيل/تعطيل المندوب)
  const handleChangeRole = async (user, newRole) => {
    const confirmMsg =
      newRole === "DELIVERY"
        ? `هل تريد تفعيل "${user.name}" كمندوب توصيل؟`
        : `هل تريد إلغاء دور المندوب عن "${user.name}" وإعادته عميلاً؟`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await userApi.changeUserRole(user.id, newRole);
      await fetchUsers(pagination.page, pagination.limit);
      await fetchStats(); // تحديث الإحصائيات
    } catch (error) {
      const msg = error.response?.data?.message || "فشل تغيير الدور";
      window.alert(msg);
    }
  };

  // المسؤول الحالي من localStorage لمنع تغيير دوره
  const currentUserId = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      return stored?.id;
    } catch {
      return null;
    }
  })();

  // فتح تفاصيل المستخدم
  //   const openDetailsModal = (user) => {
  //     setSelectedUser(user);
  //     setDetailsModalOpen(true);
  //   };

  // فتح تعديل المستخدم
  //   const openEditModal = (user) => {
  //     setSelectedUser(user);
  //     setEditModalOpen(true);
  //   };

  // فتح حذف المستخدم
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
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
        {/* إحصائيات المستخدمين */}
        <Grid container spacing={3} style={{ marginBottom: "50px" }} mb={3}>
          <UserStatsCard stats={stats} loading={statsLoading} darkMode={darkMode} />
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
                  إدارة المستخدمين
                </MDTypography>
              </MDBox>

              {/* فلترات البحث */}
              <MDBox p={2} display="flex" gap={2} flexWrap="wrap">
                {/* بحث نصي */}
                <TextField
                  variant="outlined"
                  placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
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

                {/* فلتر الدور */}
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>الدور</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="الدور"
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
                    <MenuItem value="ADMIN">أدمن</MenuItem>
                    <MenuItem value="CUSTOMER">عميل</MenuItem>
                    <MenuItem value="DELIVERY">مندوب</MenuItem>
                  </Select>
                </FormControl>
              </MDBox>

              {/* جدول المستخدمين */}
              <MDBox pt={1} pb={2}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      جاري تحميل المستخدمين...
                    </MDTypography>
                  </MDBox>
                ) : users.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      لا توجد مستخدمين
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
                                width: "10%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              المستخدم
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "10%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              البريد الإلكتروني
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "10%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              رقم الهاتف
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "10%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              الدور
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "10%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              تاريخ التسجيل
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "10%",
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
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {user.name}
                                </MDTypography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDTypography variant="body2" color="text">
                                  {user.email}
                                </MDTypography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDTypography variant="body2" color="text">
                                  {user.phone}
                                </MDTypography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <Chip
                                  icon={<Icon>{roleConfig[user.role]?.icon}</Icon>}
                                  label={roleConfig[user.role]?.label}
                                  color={roleConfig[user.role]?.color}
                                  variant="filled"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDTypography variant="body2">
                                  {formatDate(user.createdAt)}
                                </MDTypography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "center" }}>
                                <MDBox display="flex" justifyContent="center" gap={1}>
                                  {/* تفعيل/تعطيل المندوب */}
                                  {user.role === "CUSTOMER" && (
                                    <IconButton
                                      color="warning"
                                      size="small"
                                      title="تعيين كمندوب توصيل"
                                      onClick={() => handleChangeRole(user, "DELIVERY")}
                                      sx={{
                                        backgroundColor: darkMode
                                          ? "rgba(255,152,0,0.1)"
                                          : "rgba(255,152,0,0.05)",
                                        "&:hover": {
                                          backgroundColor: darkMode
                                            ? "rgba(255,152,0,0.2)"
                                            : "rgba(255,152,0,0.1)",
                                        },
                                      }}
                                    >
                                      <Icon fontSize="small">delivery_dining</Icon>
                                    </IconButton>
                                  )}
                                  {user.role === "DELIVERY" && (
                                    <IconButton
                                      color="info"
                                      size="small"
                                      title="إلغاء دور المندوب وإعادته عميلاً"
                                      onClick={() => handleChangeRole(user, "CUSTOMER")}
                                      sx={{
                                        backgroundColor: darkMode
                                          ? "rgba(33,150,243,0.1)"
                                          : "rgba(33,150,243,0.05)",
                                        "&:hover": {
                                          backgroundColor: darkMode
                                            ? "rgba(33,150,243,0.2)"
                                            : "rgba(33,150,243,0.1)",
                                        },
                                      }}
                                    >
                                      <Icon fontSize="small">person</Icon>
                                    </IconButton>
                                  )}

                                  {/* حذف */}
                                  <IconButton
                                    color="error"
                                    size="small"
                                    disabled={user.id === currentUserId}
                                    onClick={() => openDeleteModal(user)}
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

                    {/* Pagination خارجي - مثل التصنيفات والماركات */}
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
                          إظهار {users.length} من أصل {pagination.total} مستخدم
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

      <DeleteUserModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        user={selectedUser}
      />
    </DashboardLayout>
  );
}

export default Users;
