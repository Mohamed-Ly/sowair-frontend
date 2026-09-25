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
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

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
import productApi from "./services/productApi";
import brandApi from "../brands/services/brandApi";
import categoryApi from "../categories/services/categoryApi";

// Components
import CreateProductModal from "./components/CreateProductModal";
import EditProductModal from "./components/EditProductModal";
import DeleteProductModal from "./components/DeleteProductModal";

function Products() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Fetch brands and categories for dropdowns
  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        brandApi.getAllBrands({ limit: 1000 }),
        categoryApi.getAllCategories({ limit: 1000 }),
      ]);

      setBrands(brandsResponse.data?.data?.items || brandsResponse.data?.items || []);
      setCategories(categoriesResponse.data?.data?.items || categoriesResponse.data?.items || []);
    } catch (error) {
      console.error("❌ Error fetching brands or categories:", error);
    }
  };

  // Fetch products with pagination
  const fetchProducts = async (
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

      const response = await productApi.getAllProducts(params);

      // معالجة البيانات
      const responseData = response.data?.data || response.data;
      const productsData = responseData?.items || [];
      const total = responseData?.total || 0;
      const pages = responseData?.pages || Math.ceil(total / limit);

      setProducts(productsData);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total,
        pages,
      }));
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // التحميل الأولي
  useEffect(() => {
    fetchBrandsAndCategories();
    fetchProducts();
  }, []);

  // البحث مع debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1, pagination.limit, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // تغيير الصفحة
  const handlePageChange = (event, value) => {
    console.log("📄 Changing to page:", value);
    fetchProducts(value, pagination.limit, searchTerm);
  };

  // إنشاء منتج
  const handleCreateProduct = async (productData) => {
    try {
      await productApi.createProduct(productData);
      await fetchProducts(pagination.page, pagination.limit, searchTerm);
      setCreateModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  // تعديل منتج
  const handleEditProduct = async (productData) => {
    try {
      await productApi.updateProduct(selectedProduct.id, productData);
      await fetchProducts(pagination.page, pagination.limit, searchTerm);
      setEditModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      throw error;
    }
  };

  // حذف منتج
  const handleDeleteProduct = async () => {
    try {
      await productApi.deleteProduct(selectedProduct.id);
      await fetchProducts(pagination.page, pagination.limit, searchTerm);
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      throw error;
    }
  };

  // فتح نافذة التعديل
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  // فتح نافذة الحذف
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  // مسح البحث
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // الحصول على الصورة الرئيسية
  const getPrimaryImage = (product) => {
    const primaryImage = product.images?.find((img) => img.isPrimary);
    return primaryImage || product.images?.[0];
  };

  // بناء URL الصورة
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return imagePath.startsWith("/")
      ? `http://localhost:5000${imagePath}`
      : `http://localhost:5000/uploads/${imagePath}`;
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
                  إدارة المنتجات
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
                  إضافة منتج
                </MDButton>
              </MDBox>

              {/* Search Box */}
              <MDBox p={2} pb={1}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="ابحث عن منتج بالاسم، الوصف، الماركة، أو التصنيف..."
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

              {/* جدول المنتجات مع الصور */}
              <MDBox pt={1} pb={2}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      جاري تحميل البيانات...
                    </MDTypography>
                  </MDBox>
                ) : products.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      لا توجد منتجات
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
                                width: "5%",
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
                                width: "10%",
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
                                width: "20%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              المنتج
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
                              الماركة
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
                              التصنيف
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
                                width: "15%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              الصور
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
                          {products.map((product, index) => {
                            const primaryImage = getPrimaryImage(product);
                            const imageUrl = getImageUrl(primaryImage?.path);

                            return (
                              <TableRow
                                key={product.id}
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
                                    {product.id}
                                  </MDTypography>
                                </TableCell>

                                {/* الصورة */}
                                <TableCell style={{ textAlign: "center" }}>
                                  <Avatar
                                    src={imageUrl}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      margin: "0 auto",
                                      borderRadius: "8px",
                                      backgroundColor: darkMode
                                        ? "rgba(255,255,255,0.1)"
                                        : "rgba(0,0,0,0.04)",
                                    }}
                                  >
                                    <Icon>image</Icon>
                                  </Avatar>
                                </TableCell>

                                {/* معلومات المنتج */}
                                <TableCell style={{ textAlign: "center" }}>
                                  <MDTypography
                                    variant="button"
                                    fontWeight="medium"
                                    display="block"
                                  >
                                    {product.name}
                                  </MDTypography>
                                  {product.description && (
                                    <MDTypography variant="caption" color="text" display="block">
                                      {product.description.length > 50
                                        ? `${product.description.substring(0, 50)}...`
                                        : product.description}
                                    </MDTypography>
                                  )}
                                </TableCell>

                                {/* الماركة - Chip محسّن */}
                                <TableCell style={{ textAlign: "center" }}>
                                  <Chip
                                    label={product.brand?.name || "-"}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      borderRadius: "12px",
                                      fontWeight: "bold",
                                      borderWidth: "2px",
                                    }}
                                  />
                                </TableCell>

                                {/* التصنيف - Chip محسّن */}
                                <TableCell style={{ textAlign: "center" }}>
                                  <Chip
                                    label={product.category?.name || "-"}
                                    color="secondary"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      borderRadius: "12px",
                                      fontWeight: "bold",
                                      borderWidth: "2px",
                                    }}
                                  />
                                </TableCell>

                                {/* الحالة */}
                                <TableCell style={{ textAlign: "center" }}>
                                  <MDBox
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: "6px",
                                      backgroundColor: product.isActive
                                        ? darkMode
                                          ? "rgba(76, 175, 80, 0.15)"
                                          : "rgba(76, 175, 80, 0.1)"
                                        : darkMode
                                        ? "rgba(244, 67, 54, 0.15)"
                                        : "rgba(244, 67, 54, 0.1)",
                                      border: "1px solid",
                                      borderColor: product.isActive
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
                                        color: product.isActive ? "success.main" : "error.main",
                                      }}
                                    >
                                      {product.isActive ? "check_circle" : "cancel"}
                                    </Icon>
                                    <MDTypography
                                      variant="caption"
                                      fontWeight="bold"
                                      color={product.isActive ? "success" : "error"}
                                    >
                                      {product.isActive ? "مفعل" : "غير مفعل"}
                                    </MDTypography>
                                  </MDBox>
                                </TableCell>

                                {/* عدد الصور */}
                                <TableCell style={{ textAlign: "center" }}>
                                  <Chip
                                    icon={<Icon>photo_library</Icon>}
                                    label={product.images?.length || 0}
                                    color="info"
                                    variant="filled"
                                    size="small"
                                    sx={{
                                      borderRadius: "12px",
                                      fontWeight: "bold",
                                    }}
                                  />
                                </TableCell>

                                {/* الإجراءات */}
                                <TableCell style={{ textAlign: "center" }}>
                                  <MDBox display="flex" gap={1} justifyContent="center">
                                    <IconButton
                                      color="info"
                                      size="small"
                                      onClick={() => openEditModal(product)}
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
                                      onClick={() => openDeleteModal(product)}
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
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Pagination خارجي */}
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
                          إظهار {products.length} من أصل {pagination.total} منتج
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
      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
        brands={brands}
        categories={categories}
      />

      <EditProductModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditProduct}
        product={selectedProduct}
        brands={brands}
        categories={categories}
      />

      <DeleteProductModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        product={selectedProduct}
      />
    </DashboardLayout>
  );
}

export default Products;
