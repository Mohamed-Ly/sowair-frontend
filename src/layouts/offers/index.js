/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
import Switch from "@mui/material/Switch";

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
import offerApi from "./services/offerApi";

// Components
import CreateOfferModal from "./components/CreateOfferModal";
import EditOfferModal from "./components/EditOfferModal";
import DeleteOfferModal from "./components/DeleteOfferModal";

function Offers() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

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

  // Fetch offers with pagination
  const fetchOffers = async (
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

      const response = await offerApi.getAllOffers(params);

      // معالجة البيانات
      const responseData = response.data?.data || response.data;
      const offersData = responseData?.offers || [];
      const total = responseData?.pagination?.total || 0;
      const pages = responseData?.pagination?.pages || Math.ceil(total / limit);

      setOffers(offersData);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total,
        pages,
      }));
    } catch (error) {
      console.error("❌ Error fetching offers:", error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  // التحميل الأولي
  useEffect(() => {
    fetchOffers();
  }, []);

  // البحث مع debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOffers(1, pagination.limit, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // تغيير الصفحة
  const handlePageChange = (event, value) => {
    console.log("📄 Changing to page:", value);
    fetchOffers(value, pagination.limit, searchTerm);
  };

  // إنشاء عرض
  // في صفحة Offers.js - تحديث دالة handleCreateOffer
  const handleCreateOffer = async (offerData) => {
    try {
      console.log("🔄 Starting to create offer with data:", offerData);

      const response = await offerApi.createOffer(offerData);
      console.log("✅ Offer creation response:", response);

      await fetchOffers(pagination.page, pagination.limit, searchTerm);
      setCreateModalOpen(false);

      toast.success("تم إنشاء العرض بنجاح");
    } catch (error) {
      console.error("❌ Error creating offer:", error);
      console.log("📋 Error details:", {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      // إعادة الخطأ مع التفاصيل الكاملة
      throw error;
    }
  };

  // تعديل عرض
  const handleEditOffer = async (offerData) => {
    try {
      console.log("🔄 Starting offer update with data:", offerData);

      await offerApi.updateOffer(selectedOffer.id, offerData);

      // ✅ إعادة جلب البيانات للتأكد من المزامنة
      await fetchOffers(pagination.page, pagination.limit, searchTerm);

      setEditModalOpen(false);
      setSelectedOffer(null);

      console.log("✅ Offer updated and data refetched");
    } catch (error) {
      console.error("❌ Error updating offer:", error);
      throw error;
    }
  };

  // حذف عرض
  const handleDeleteOffer = async () => {
    try {
      await offerApi.deleteOffer(selectedOffer.id);
      await fetchOffers(pagination.page, pagination.limit, searchTerm);
      setDeleteModalOpen(false);
      setSelectedOffer(null);
    } catch (error) {
      throw error;
    }
  };

  // تفعيل/تعطيل عرض
  const handleToggleOffer = async (offerId, currentStatus) => {
    try {
      await offerApi.toggleOffer(offerId);
      await fetchOffers(pagination.page, pagination.limit, searchTerm);
    } catch (error) {
      console.error("❌ Error toggling offer:", error);
    }
  };

  // فتح نافذة التعديل
  const openEditModal = (offer) => {
    setSelectedOffer(offer);
    setEditModalOpen(true);
  };

  // فتح نافذة الحذف
  const openDeleteModal = (offer) => {
    setSelectedOffer(offer);
    setDeleteModalOpen(true);
  };

  // مسح البحث
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // دوال المساعدة
  // العرض بانر للعرض فقط: مفيش نوع خصم ولا هدف ولا بنود مرتبطة.
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-LY");
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
                  إدارة العروض
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
                  إضافة عرض
                </MDButton>
              </MDBox>

              {/* Search Box */}
              <MDBox p={2} pb={1}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="ابحث عن عرض بالاسم أو الوصف..."
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
                ) : offers.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      لا توجد عروض
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
                                width: "20%",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                color: darkMode ? "text.main" : "text.primary",
                                py: 2,
                              }}
                            >
                              العنوان
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
                              الفترة
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
                                width: "5%",
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
                          {offers.map((offer, index) => (
                            <TableRow
                              key={offer.id}
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
                                  {offer.id}
                                </MDTypography>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDTypography variant="button" fontWeight="medium">
                                  {offer.title}
                                </MDTypography>
                                {offer.description && (
                                  <MDTypography
                                    variant="caption"
                                    color="text"
                                    display="block"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {offer.description.length > 50
                                      ? `${offer.description.substring(0, 50)}...`
                                      : offer.description}
                                  </MDTypography>
                                )}
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDBox>
                                  <MDTypography
                                    variant="caption"
                                    display="block"
                                    fontWeight="medium"
                                  >
                                    من {formatDate(offer.startDate)}
                                  </MDTypography>
                                  <MDTypography variant="caption" display="block" color="text">
                                    إلى {formatDate(offer.endDate)}
                                  </MDTypography>
                                </MDBox>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                {/* نستخدم الـ MDBox لتحقيق شكل يشبه الـ Chip/Badge */}
                                <MDBox
                                  sx={{
                                    // **1. المحاذاة والتنسيق:**
                                    display: "inline-flex",
                                    alignItems: "center", // توسيط رأسي للعناصر (المفتاح والنص)
                                    justifyContent: "center", // توسيط أفقي للعناصر داخل الـ Box (اختياري)

                                    // **2. المسافات والأبعاد:**
                                    padding: "2px 8px 2px 4px", // مسافة داخلية: (أعلى يمين أسفل يسار) لتجنب تكرار py/px
                                    borderRadius: "16px", // جعل الحواف أكثر استدارة (شكل الـ Chip)
                                    minWidth: "120px", // إعطاء عرض أدنى للحقل لجعله أكثر ثباتًا بصريًا

                                    // **3. منطق الألوان (نستخدم لون واحد أساسي):**
                                    backgroundColor: offer.isActive
                                      ? darkMode
                                        ? "rgba(76, 175, 80, 0.15)" // أخضر غامق (مفعل)
                                        : "rgba(76, 175, 80, 0.1)" // أخضر فاتح (مفعل)
                                      : darkMode
                                      ? "rgba(244, 67, 54, 0.15)" // أحمر غامق (غير مفعل)
                                      : "rgba(244, 67, 54, 0.1)", // أحمر فاتح (غير مفعل)

                                    // **4. الحدود (اختياري، يمكنك تركه أو إزالته):**
                                    border: "1px solid",
                                    borderColor: offer.isActive
                                      ? darkMode
                                        ? "rgba(76, 175, 80, 0.3)"
                                        : "rgba(76, 175, 80, 0.2)"
                                      : darkMode
                                      ? "rgba(244, 67, 54, 0.3)"
                                      : "rgba(244, 67, 54, 0.2)",
                                  }}
                                >
                                  {/* زر الـ Switch */}
                                  <Switch
                                    checked={offer.isActive}
                                    onChange={() => handleToggleOffer(offer.id, offer.isActive)}
                                    color="success" // استخدام لون النجاح (الأخضر)
                                    size="small"
                                    // **تعديل بسيط لـ Switch:** لتقليل الهامش المدمج وجعله أقرب للنص
                                    sx={{ m: 0, "& .MuiSwitch-thumb": { boxShadow: "none" } }}
                                  />

                                  {/* النص المصاحب للحالة */}
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="bold"
                                    color={offer.isActive ? "success" : "error"}
                                    sx={{
                                      ml: 0.5, // تقليل المسافة بعد المفتاح قليلاً
                                      lineHeight: "inherit", // ضمان محاذاة النص مع العناصر الأخرى
                                    }}
                                  >
                                    {offer.isActive ? "مفعل" : "غير مفعل"}
                                  </MDTypography>
                                </MDBox>
                              </TableCell>
                              <TableCell style={{ textAlign: "center" }}>
                                <MDBox display="flex" gap={1} justifyContent="center">
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => openEditModal(offer)}
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
                                    onClick={() => openDeleteModal(offer)}
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

                    {/* Pagination خارجي - نفس المعمارية */}
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
                          إظهار {offers.length} من أصل {pagination.total} عرض
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
      <CreateOfferModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateOffer}
      />

      <EditOfferModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedOffer(null);
        }}
        onSubmit={handleEditOffer}
        offer={selectedOffer}
      />

      <DeleteOfferModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedOffer(null);
        }}
        onConfirm={handleDeleteOffer}
        offer={selectedOffer}
      />
    </DashboardLayout>
  );
}

export default Offers;
