import { Dialog, DialogTitle, DialogContent, Grid, Divider, Box } from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import { useMaterialUIController } from "context";

function OrderDetailsModal({ open, onClose, order }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  if (!order) return null;

  const formatPrice = (priceCents) => {
    return new Intl.NumberFormat("ar-LY", {
      style: "currency",
      currency: "LYD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceCents / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // نفس الـ helper الموجود في layouts/products و layouts/brands
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
    return imagePath.startsWith("/") ? `${base}${imagePath}` : `${base}/uploads/${imagePath}`;
  };

  const statusConfig = {
    PENDING: { color: "warning", label: "قيد المراجعة", icon: "schedule" },
    CONFIRMED: { color: "info", label: "مؤكد", icon: "check_circle" },
    SHIPPING: { color: "primary", label: "قيد الشحن", icon: "local_shipping" },
    PARTIALLY_DELIVERED: { color: "secondary", label: "تسليم جزئي", icon: "inventory_2" },
    DELIVERED: { color: "success", label: "تم التسليم", icon: "done_all" },
    CANCELLED: { color: "error", label: "ملغي", icon: "cancel" },
  };

  // حماية: أي حالة مش معروفة عندنا ما تكسرش الصفحة.
  // ملاحظة: هنا الـ color بيتبعت لـ MDTypography، فالقيم المسموحة مختلفة
  // عن الـ Chip (مفيش "default" هنا).
  const status = statusConfig[order?.status] || {
    color: "dark",
    label: order?.status || "غير معروف",
    icon: "help",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: darkMode ? "background.card" : "background.default",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle>
        <MDTypography variant="h5" fontWeight="medium" color={darkMode ? "white" : "dark"}>
          تفاصيل الطلب #{order.orderNumber}
        </MDTypography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* معلومات الطلب */}
          <Grid item xs={12} md={6}>
            <MDBox mb={2}>
              <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
                معلومات الطلب
              </MDTypography>
              <MDBox
                p={2}
                sx={{
                  backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  borderRadius: 1,
                  border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <MDTypography variant="caption" color={darkMode ? "white" : "dark"}>
                      رقم الطلب:
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <MDTypography
                      variant="body2"
                      fontWeight="medium"
                      color={darkMode ? "white" : "dark"}
                    >
                      {order.orderNumber}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={6}>
                    <MDTypography variant="caption" color={darkMode ? "white" : "dark"}>
                      التاريخ:
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                      {formatDate(order.createdAt)}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={6}>
                    <MDTypography variant="caption" color={darkMode ? "white" : "dark"}>
                      الحالة:
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <MDTypography variant="body2" color={status.color} fontWeight="medium">
                      <Icon sx={{ fontSize: "1rem", mr: 0.5 }}>{status.icon}</Icon>
                      {status.label}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={6}>
                    <MDTypography variant="caption" color={darkMode ? "white" : "dark"}>
                      الإجمالي:
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6}>
                    <MDTypography variant="body2" fontWeight="bold" color="success">
                      {formatPrice(order.totalCents)}
                    </MDTypography>
                  </Grid>
                </Grid>
              </MDBox>
            </MDBox>
          </Grid>

          {/* معلومات الشحن */}
          <Grid item xs={12} md={6}>
            <MDBox mb={2}>
              <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
                معلومات الشحن
              </MDTypography>
              <MDBox
                p={2}
                sx={{
                  backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  borderRadius: 1,
                  border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                }}
              >
                <MDTypography
                  variant="body2"
                  fontWeight="medium"
                  color={darkMode ? "white" : "dark"}
                  gutterBottom
                >
                  {order.shippingName}
                </MDTypography>
                <MDTypography variant="body2" color={darkMode ? "white" : "dark"} gutterBottom>
                  <Icon sx={{ fontSize: "1rem", mr: 1 }}>phone</Icon>
                  {order.shippingPhone}
                </MDTypography>
                <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                  <Icon sx={{ fontSize: "1rem", mr: 1 }}>location_on</Icon>
                  {order.shippingAddress}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>

          {/* معلومات العميل */}
          {order.user && (
            <Grid item xs={12} md={6}>
              <MDBox mb={2}>
                <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
                  معلومات العميل
                </MDTypography>
                <MDBox
                  p={2}
                  sx={{
                    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    borderRadius: 1,
                    border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  }}
                >
                  <MDTypography
                    variant="body2"
                    fontWeight="medium"
                    color={darkMode ? "white" : "dark"}
                    gutterBottom
                  >
                    {order.user.name}
                  </MDTypography>
                  <MDTypography variant="body2" color={darkMode ? "white" : "dark"} gutterBottom>
                    {order.user.email}
                  </MDTypography>
                  <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                    {order.user.phone}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
          )}

          {/* العناصر */}
          <Grid item xs={12}>
            <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
              العناصر المطلوبة ({order.items?.length || 0})
            </MDTypography>
            {order.items?.map((item, index) => {
              // الـ backend بيبعت الصورة الرئيسية بس (isPrimary, take:1)،
              // فممكن تجيب مصفوفة فاضية لو المنتج مالوش صورة رئيسية.
              const productImages = item.variant?.product?.images || [];
              const primaryImage = productImages.find((img) => img.isPrimary) || productImages[0];
              const imageUrl = getImageUrl(primaryImage?.path);
              const productName = item.variant?.product?.name || "منتج";

              return (
                <MDBox
                  key={item.id}
                  p={2}
                  mb={1}
                  sx={{
                    backgroundColor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* صورة المنتج */}
                    <Grid item xs={3} sm={1}>
                      <MDBox
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width={{ xs: 56, sm: 64 }}
                        height={{ xs: 56, sm: 64 }}
                        borderRadius="8px"
                        sx={{
                          backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                          border: "1px solid",
                          borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {imageUrl ? (
                          <MDBox
                            component="img"
                            src={imageUrl}
                            alt={productName}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Icon sx={{ fontSize: 28 }}>image</Icon>
                        )}
                      </MDBox>
                    </Grid>
                    <Grid item xs={9} sm={5}>
                      <MDTypography
                        variant="body1"
                        fontWeight="medium"
                        color={darkMode ? "white" : "dark"}
                      >
                        {productName}
                      </MDTypography>
                      <MDTypography variant="caption" color={darkMode ? "white" : "dark"}>
                        {item.variant?.option1 && `${item.variant.option1}`}
                        {item.variant?.option2 && ` • ${item.variant.option2}`}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                        الكمية: {item.qty}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                        السعر: {formatPrice(item.unitPriceCents)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <MDTypography
                        variant="body2"
                        fontWeight="bold"
                        color={darkMode ? "white" : "dark"}
                      >
                        {/* ⚠ lineTotalCents مش unitPriceCents * qty — الأول
                            بعد الخصم والتاني قبله. استعملنا الأول باش
                            المجموع يطلع زي الإجمالي النهائي فعلاً. */}
                        المجموع:{" "}
                        {formatPrice(item.lineTotalCents ?? item.unitPriceCents * item.qty)}
                      </MDTypography>
                    </Grid>
                  </Grid>

                  {/* Phase 4: تفاصيل التسليم الجزئي لكل بند */}
                  {(item.deliveredQty > 0 || item.returnedQty > 0) && (
                    <MDBox display="flex" gap={1} mt={1}>
                      {item.deliveredQty > 0 && (
                        <MDBadge
                          badgeContent={`سلّم ${item.deliveredQty}`}
                          color="success"
                          variant="gradient"
                        />
                      )}
                      {item.returnedQty > 0 && (
                        <MDBadge
                          badgeContent={`رجع ${item.returnedQty}`}
                          color="error"
                          variant="gradient"
                        />
                      )}
                    </MDBox>
                  )}
                </MDBox>
              );
            })}
          </Grid>

          {/* Phase 4: ملخّص التسليم الجزئي — يظهر غير لما يكون في تسليم فعلي */}
          {order.partiallyDeliveredAt && (
            <Grid item xs={12}>
              <Divider
                sx={{ borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
              />
              <MDBox
                mt={2}
                p={2}
                borderRadius={1}
                sx={{
                  backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "#f8f9fa",
                  border: "1px solid",
                  borderColor:
                    order.status === "PARTIALLY_DELIVERED" ? "warning.main" : "success.main",
                }}
              >
                <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
                  {order.status === "PARTIALLY_DELIVERED" ? "تسليم جزئي" : "ملخّص التسليم"}
                </MDTypography>

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <MDTypography
                      variant="caption"
                      color={darkMode ? "white" : "dark"}
                      display="block"
                    >
                      إجمالي الطلب
                    </MDTypography>
                    <MDTypography variant="h6" color={darkMode ? "white" : "dark"}>
                      {formatPrice(order.totalCents)}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MDTypography variant="caption" color="success" display="block">
                      المبلغ المقبوض فعلياً
                    </MDTypography>
                    <MDTypography variant="h6" color="success">
                      {formatPrice(order.collectedCents ?? 0)}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MDTypography variant="caption" color="error" display="block">
                      الفرق (مش مقبوض)
                    </MDTypography>
                    <MDTypography variant="h6" color="error">
                      {formatPrice(
                        Math.max(0, (order.totalCents ?? 0) - (order.collectedCents ?? 0))
                      )}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MDTypography
                      variant="caption"
                      color={darkMode ? "white" : "dark"}
                      display="block"
                    >
                      وقت التسليم
                    </MDTypography>
                    <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                      {new Date(order.partiallyDeliveredAt).toLocaleString("ar-EG")}
                    </MDTypography>
                  </Grid>
                </Grid>

                {order.returnReason && (
                  <MDBox mt={2}>
                    <MDTypography
                      variant="caption"
                      color={darkMode ? "white" : "dark"}
                      display="block"
                    >
                      سبب رجوع البضاعة
                    </MDTypography>
                    <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                      {order.returnReason}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Grid>
          )}

          {/* الإجمالي النهائي */}
          <Grid item xs={12}>
            <Divider sx={{ borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <MDTypography variant="h6" color={darkMode ? "white" : "dark"}>
                الإجمالي النهائي:
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="success">
                {formatPrice(order.totalCents)}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
      </DialogContent>

      <MDBox p={2} display="flex" justifyContent="flex-end">
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={onClose}
          sx={{
            color: darkMode ? "text.main" : "secondary.main",
            borderColor: darkMode ? "rgba(255,255,255,0.2)" : "secondary.main",
          }}
        >
          إغلاق
        </MDButton>
      </MDBox>
    </Dialog>
  );
}

OrderDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.number,
    orderNumber: PropTypes.string,
    status: PropTypes.string,
    totalCents: PropTypes.number,
    collectedCents: PropTypes.number,
    returnReason: PropTypes.string,
    partiallyDeliveredAt: PropTypes.string,
    createdAt: PropTypes.string,
    shippingName: PropTypes.string,
    shippingPhone: PropTypes.string,
    shippingAddress: PropTypes.string,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        qty: PropTypes.number,
        unitPriceCents: PropTypes.number,
        lineTotalCents: PropTypes.number,
        deliveredQty: PropTypes.number,
        returnedQty: PropTypes.number,
        variant: PropTypes.shape({
          option1: PropTypes.string,
          option2: PropTypes.string,
          product: PropTypes.shape({
            name: PropTypes.string,
            images: PropTypes.arrayOf(
              PropTypes.shape({
                id: PropTypes.number,
                path: PropTypes.string,
                isPrimary: PropTypes.bool,
              })
            ),
          }),
        }),
      })
    ),
  }),
};

OrderDetailsModal.defaultProps = {
  order: null,
};

export default OrderDetailsModal;
