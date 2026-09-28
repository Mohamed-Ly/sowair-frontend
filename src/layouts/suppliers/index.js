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
import Button from "@mui/material/Button";
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
import supplierApi from "./services/supplierApi";

// Components
import CreateSupplierModal from "./components/CreateSupplierModal";
import EditSupplierModal from "./components/EditSupplierModal";
import DeleteSupplierModal from "./components/DeleteSupplierModal";

function Suppliers() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Set RTL direction
  useEffect(() => {
    setDirection(dispatch, "rtl");
    return () => setDirection(dispatch, "ltr");
  }, [dispatch]);

  const fetchSuppliers = async (
    page = pagination.page,
    limit = pagination.limit,
    search = searchTerm
  ) => {
    try {
      setLoading(true);
      const params = { page, limit, ...(search && { q: search }) };

      const response = await supplierApi.getAllSuppliers(params);
      const responseData = response.data?.data || response.data;
      const items = responseData?.items || [];
      const total = responseData?.total || 0;

      setSuppliers(items);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total,
        pages: responseData?.pages || Math.ceil(total / limit),
      }));
    } catch (error) {
      console.error("❌ Error fetching suppliers:", error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(1, pagination.limit, "");
  }, []);

  // البحث مع debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuppliers(1, pagination.limit, searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePageChange = (event, value) => {
    fetchSuppliers(value, pagination.limit, searchTerm);
  };

  const handleCreateSupplier = async (data) => {
    await supplierApi.createSupplier(data);
    await fetchSuppliers(pagination.page, pagination.limit, searchTerm);
    setCreateModalOpen(false);
  };

  const handleEditSupplier = async (data) => {
    await supplierApi.updateSupplier(selectedSupplier.id, data);
    await fetchSuppliers(pagination.page, pagination.limit, searchTerm);
    setEditModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = async () => {
    await supplierApi.deleteSupplier(selectedSupplier.id);
    await fetchSuppliers(pagination.page, pagination.limit, searchTerm);
    setDeleteModalOpen(false);
    setSelectedSupplier(null);
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setEditModalOpen(true);
  };

  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setDeleteModalOpen(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white" sx={{ fontWeight: "bold" }}>
                  إدارة الموردين
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color={darkMode ? "light" : "dark"}
                  onClick={() => setCreateModalOpen(true)}
                  startIcon={<Icon>add</Icon>}
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: "bold" }}
                >
                  إضافة مورد
                </MDButton>
              </MDBox>

              {/* حقل البحث */}
              <MDBox pt={3} px={3}>
                <TextField
                  fullWidth
                  label="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon>search</Icon>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: darkMode ? "text.main" : "text.primary",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                      },
                    },
                  }}
                />
              </MDBox>

              <MDBox pt={1} pb={2}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      جاري تحميل البيانات...
                    </MDTypography>
                  </MDBox>
                ) : suppliers.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      لا يوجد موردين
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
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              #
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              الاسم
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              الهاتف
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              البريد
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              المنتجات
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              الحالة
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                              الإجراءات
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {suppliers.map((supplier, index) => (
                            <TableRow
                              key={supplier.id}
                              sx={{
                                backgroundColor:
                                  index % 2 === 0
                                    ? darkMode
                                      ? "rgba(255,255,255,0.02)"
                                      : "rgba(0,0,0,0.01)"
                                    : "transparent",
                                "&:hover": {
                                  backgroundColor: darkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.03)",
                                },
                              }}
                            >
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography variant="button" fontWeight="medium">
                                  {supplier.id}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography variant="button" fontWeight="medium">
                                  {supplier.name}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography variant="button">
                                  {supplier.phone || "-"}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography variant="button">
                                  {supplier.email || "-"}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography
                                  variant="button"
                                  color={supplier._count?.variants ? "text.main" : "text.secondary"}
                                  fontWeight={supplier._count?.variants ? "bold" : "regular"}
                                >
                                  {supplier._count?.variants ?? 0}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDBox
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: "6px",
                                    backgroundColor: supplier.isActive
                                      ? darkMode
                                        ? "rgba(76, 175, 80, 0.15)"
                                        : "rgba(76, 175, 80, 0.1)"
                                      : darkMode
                                      ? "rgba(244, 67, 54, 0.15)"
                                      : "rgba(244, 67, 54, 0.1)",
                                    border: "1px solid",
                                    borderColor: supplier.isActive
                                      ? darkMode
                                        ? "rgba(76, 175, 80, 0.3)"
                                        : "rgba(76, 175, 80, 0.2)"
                                      : darkMode
                                      ? "rgba(244, 67, 54, 0.3)"
                                      : "rgba(244, 67, 54, 0.2)",
                                  }}
                                >
                                  <Icon
                                    sx={{
                                      fontSize: "1rem",
                                      mr: 0.5,
                                      color: supplier.isActive ? "success.main" : "error.main",
                                    }}
                                  >
                                    {supplier.isActive ? "check_circle" : "cancel"}
                                  </Icon>
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="bold"
                                    color={supplier.isActive ? "success" : "error"}
                                  >
                                    {supplier.isActive ? "مفعل" : "غير مفعل"}
                                  </MDTypography>
                                </MDBox>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDBox display="flex" gap={1} justifyContent="center">
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => openEditModal(supplier)}
                                  >
                                    <Icon fontSize="small">edit</Icon>
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => openDeleteModal(supplier)}
                                  >
                                    <Icon fontSize="small">delete</Icon>
                                  </IconButton>
                                </MDBox>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

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
                      <MDTypography
                        variant="button"
                        color={darkMode ? "white" : "dark"}
                        fontWeight="medium"
                      >
                        إظهار {suppliers.length} من أصل {pagination.total} مورد
                      </MDTypography>

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

      <CreateSupplierModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSupplier}
      />

      <EditSupplierModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleEditSupplier}
        supplier={selectedSupplier}
      />

      <DeleteSupplierModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedSupplier(null);
        }}
        onConfirm={handleDeleteSupplier}
        supplier={selectedSupplier}
      />
    </DashboardLayout>
  );
}

export default Suppliers;
