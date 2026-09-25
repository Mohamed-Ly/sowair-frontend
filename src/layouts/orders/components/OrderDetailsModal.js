import { Dialog, DialogTitle, DialogContent, Grid, Divider, Box } from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
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

  const statusConfig = {
    PENDING: { color: "warning", label: "قيد المراجعة", icon: "schedule" },
    CONFIRMED: { color: "info", label: "مؤكد", icon: "check_circle" },
    SHIPPING: { color: "primary", label: "قيد الشحن", icon: "local_shipping" },
    DELIVERED: { color: "success", label: "تم التسليم", icon: "done_all" },
    CANCELLED: { color: "error", label: "ملغي", icon: "cancel" },
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
                    <MDTypography
                      variant="body2"
                      color={statusConfig[order.status]?.color}
                      fontWeight="medium"
                    >
                      <Icon sx={{ fontSize: "1rem", mr: 0.5 }}>
                        {statusConfig[order.status]?.icon}
                      </Icon>
                      {statusConfig[order.status]?.label}
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
            {order.items?.map((item, index) => (
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
                  <Grid item xs={12} sm={6}>
                    <MDTypography
                      variant="body1"
                      fontWeight="medium"
                      color={darkMode ? "white" : "dark"}
                    >
                      {item.variant?.product?.name}
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
                      المجموع: {formatPrice(item.unitPriceCents * item.qty)}
                    </MDTypography>
                  </Grid>
                </Grid>
              </MDBox>
            ))}
          </Grid>

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
        variant: PropTypes.shape({
          option1: PropTypes.string,
          option2: PropTypes.string,
          product: PropTypes.shape({
            name: PropTypes.string,
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
