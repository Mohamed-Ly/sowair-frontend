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
import brandApi from "./services/brandApi";

// Components
import CreateBrandModal from "./components/CreateBrandModal";
import EditBrandModal from "./components/EditBrandModal";
import DeleteBrandModal from "./components/DeleteBrandModal";

function Brands() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Pagination states
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

  // Fetch brands with pagination
  const fetchBrands = async (
    page = pagination.page,
    limit = pagination.limit,
    search = searchTerm
  ) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search && { q: search }),
      };

      const response = await brandApi.getAllBrands(params);

      // معالجة البيانات
      const responseData = response.data?.data || response.data;
      const brandsData = responseData?.items || [];
      const total = responseData?.total || 0;
      const pages = responseData?.pages || Math.ceil(total / limit);

      setBrands(brandsData);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total,
        pages,
      }));
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // التحميل الأولي
  useEffect(() => {
    fetchBrands();
  }, []);

  // البحث مع debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBrands(1, pagination.limit, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // تغيير الصفحة
  const handlePageChange = (event, value) => {
    console.log("📄 Changing to page:", value);
    fetchBrands(value, pagination.limit, searchTerm);
  };

  // تغيير عدد النتائج
  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value);
    fetchBrands(1, newLimit, searchTerm);
  };

  // إنشاء ماركة
  const handleCreateBrand = async (brandData) => {
    try {
      await brandApi.createBrand(brandData);
      await fetchBrands(pagination.page, pagination.limit, searchTerm);
      setCreateModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  // تعديل ماركة
  const handleEditBrand = async (brandData) => {
    try {
      await brandApi.updateBrand(selectedBrand.id, brandData);
      await fetchBrands(pagination.page, pagination.limit, searchTerm);
      setEditModalOpen(false);
      setSelectedBrand(null);
    } catch (error) {
      throw error;
    }
  };

  // حذف ماركة
  const handleDeleteBrand = async () => {
    try {
      await brandApi.deleteBrand(selectedBrand.id);
      await fetchBrands(pagination.page, pagination.limit, searchTerm);
      setDeleteModalOpen(false);
      setSelectedBrand(null);
    } catch (error) {
      throw error;
    }
  };

  // فتح نافذة التعديل
  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setEditModalOpen(true);
  };

  // فتح نافذة الحذف
  const openDeleteModal = (brand) => {
    setSelectedBrand(brand);
    setDeleteModalOpen(true);
  };

  // مسح البحث
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5000${imagePath}`;
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
                <MDTypography
                  variant="h6"
                  color="white"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  إدارة الماركات
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color={darkMode ? "light" : "dark"}
                  onClick={() => setCreateModalOpen(true)}
                  startIcon={<Icon>add</Icon>}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                    boxShadow: darkMode
                      ? "0 2px 6px rgba(255,255,255,0.1)"
                      : "0 2px 6px rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: darkMode
                        ? "0 4px 12px rgba(255,255,255,0.15)"
                        : "0 4px 12px rgba(0,0,0,0.15)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  إضافة ماركة
                </MDButton>
              </MDBox>

              {/* Search Box */}
              <MDBox p={2} pb={1}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="ابحث عن ماركة بالاسم، الرابط، أو البلد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon
                          sx={{
                            color: darkMode ? "text.main" : "text.secondary",
                          }}
                        >
                          search
                        </Icon>
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          sx={{
                            color: darkMode ? "text.main" : "text.secondary",
                            "&:hover": {
                              color: darkMode ? "error.light" : "error.main",
                            },
                          }}
                        >
                          <Icon>close</Icon>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: darkMode ? "background.card" : "white",
                      "& fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: darkMode ? "primary.main" : "primary.main",
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: darkMode ? "text.main" : "text.primary",
                      "&::placeholder": {
                        color: darkMode ? "text.secondary" : "text.disabled",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </MDBox>

              {/* جدول مبسط مع Pagination خارجي */}
              <MDBox pt={1} pb={2}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      جاري تحميل البيانات...
                    </MDTypography>
                  </MDBox>
                ) : brands.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      لا توجد ماركات
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
                              #
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "20%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              اسم الماركة
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
                              بلاد الماركة
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "13%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              الصورة
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
                              الرابط
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
                              الحالة
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "20%",
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
                          {brands.map((brand, index) => (
                            <TableRow
                              key={brand.id}
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
                                  {brand.id}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography variant="button" fontWeight="medium">
                                  {brand.name}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography variant="button" fontWeight="medium" color="text">
                                  {brand.country || "-"}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                {brand.image ? (
                                  <MDBox
                                    component="img"
                                    src={getImageUrl(brand.image)}
                                    alt={brand.name}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "1px solid",
                                      borderColor: darkMode
                                        ? "rgba(255,255,255,0.2)"
                                        : "rgba(0,0,0,0.1)",
                                    }}
                                  />
                                ) : (
                                  <MDBox
                                    display="inline-flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    width={40}
                                    height={40}
                                    borderRadius="8px"
                                    sx={{
                                      backgroundColor: darkMode
                                        ? "rgba(255,255,255,0.05)"
                                        : "rgba(0,0,0,0.03)",
                                      color: darkMode ? "text.main" : "text.secondary",
                                    }}
                                  >
                                    <Icon sx={{ fontSize: 24 }}>image</Icon>
                                  </MDBox>
                                )}
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography
                                  variant="button"
                                  fontWeight="medium"
                                  color="primary"
                                  sx={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    "&:hover": { color: "secondary.main" },
                                  }}
                                >
                                  {brand.slug}
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
                                    backgroundColor: brand.isActive
                                      ? darkMode
                                        ? "rgba(76, 175, 80, 0.15)"
                                        : "rgba(76, 175, 80, 0.1)"
                                      : darkMode
                                      ? "rgba(244, 67, 54, 0.15)"
                                      : "rgba(244, 67, 54, 0.1)",
                                    border: "1px solid",
                                    borderColor: brand.isActive
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
                                      color: brand.isActive ? "success.main" : "error.main",
                                    }}
                                  >
                                    {brand.isActive ? "check_circle" : "cancel"}
                                  </Icon>
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="bold"
                                    color={brand.isActive ? "success" : "error"}
                                  >
                                    {brand.isActive ? "مفعل" : "غير مفعل"}
                                  </MDTypography>
                                </MDBox>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDBox display="flex" gap={1} justifyContent="center">
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => openEditModal(brand)}
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
                                    <Icon fontSize="small">edit</Icon>
                                  </IconButton>

                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => openDeleteModal(brand)}
                                    sx={{
                                      backgroundColor: darkMode
                                        ? "rgba(244,67,54,0.1)"
                                        : "rgba(244,67,54,0.05)",
                                      "&:hover": {
                                        backgroundColor: darkMode
                                          ? "rgba(244,67,54,0.2)"
                                          : "rgba(244,67,54,0.1)",
                                      },
                                    }}
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

                    {/* Pagination خارجي - هذا هو الحل الصحيح */}
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
                          إظهار {brands.length} من أصل {pagination.total} ماركة
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
      <CreateBrandModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateBrand}
      />

      <EditBrandModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBrand(null);
        }}
        onSubmit={handleEditBrand}
        brand={selectedBrand}
      />

      <DeleteBrandModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBrand(null);
        }}
        onConfirm={handleDeleteBrand}
        brand={selectedBrand}
      />
    </DashboardLayout>
  );
}

export default Brands;
