import { useRef } from "react";
import { Dialog, DialogContent, Box, Grid } from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";

function InvoicePrint({ open, onClose, order }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const printRef = useRef();
  const storeName = "سوير";
  const logoUrl = `${window.location.origin}/sowair-logo.png`;

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة ${order.orderNumber}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              padding: 24px;
              direction: rtl;
              color: #333;
            }
            .store-logo { width: 88px; height: 88px; object-fit: contain; margin-bottom: 6px; }
            .header { text-align: center; margin-bottom: 24px; }
            .header .store-name { font-size: 26px; font-weight: bold; color: #5f0b28; margin: 0; }
            .header .store-sub { font-size: 13px; color: #777; margin: 2px 0 14px; }
            .title-row { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 14px 0 2px; }
            .title-row h2 { font-size: 20px; color: #5f0b28; margin: 0; }
            .invoice-meta { font-size: 12px; color: #888; }
            .section { margin: 18px 0; }
            .section h3 { font-size: 15px; color: #5f0b28; border-bottom: 2px solid #5f0b28; padding-bottom: 6px; margin: 0 0 10px; }
            .section table { width: 100%; border-collapse: collapse; }
            .section table th, .section table td { border: 1px solid #ddd; padding: 8px 10px; text-align: right; font-size: 13px; }
            .section table th { background-color: #f7ecef; color: #5f0b28; }
            .info-grid td { border: none !important; padding: 4px 0 !important; }
            .total-box { margin-top: 18px; }
            .total-line { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
            .total-line.grand { font-size: 18px; font-weight: bold; color: #5f0b28; border-top: 2px solid #5f0b28; margin-top: 6px; padding-top: 10px; }
            @media print {
              body { padding: 12px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

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

  const statusLabels = {
    PENDING: "قيد المراجعة",
    CONFIRMED: "مؤكد",
    SHIPPING: "قيد الشحن",
    DELIVERED: "تم التسليم",
    CANCELLED: "ملغي",
  };

  const cityName = order.deliveryCityName || order.deliveryCity?.name || null;
  const areaName = order.deliveryAreaName || order.deliveryArea?.name || null;
  const hasDeliveryFee = (order.deliveryFeeCents || 0) > 0;
  const itemSubtotal = order.totalCents || 0;
  const grandTotal = itemSubtotal + (order.deliveryFeeCents || 0);

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
      <DialogContent>
        <Box ref={printRef}>
          {/* رأس الفاتورة */}
          <Box className="header" mb={3}>
            <img src={logoUrl} alt="شعار سوير" className="store-logo" />
            <MDTypography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
              {storeName}
            </MDTypography>
            <MDTypography variant="subtitle2" color="text" display="block">
              متجر متعدد المنتجات — عطور، تجميل، والعناية الشخصية
            </MDTypography>
            <Box className="title-row" mt={2}>
              <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
                فاتورة بيع
              </MDTypography>
              <MDTypography variant="h5" color="primary">
                #{order.orderNumber}
              </MDTypography>
            </Box>
            <MDTypography
              variant="body2"
              color={darkMode ? "text.main" : "text.secondary"}
              align="center"
            >
              تاريخ الإصدار: {formatDate(new Date())}
            </MDTypography>
          </Box>

          <Grid container spacing={2}>
            {/* معلومات المتجر */}
            <Grid item xs={12} md={6}>
              <Box className="section">
                <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
                  معلومات المتجر
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>الاسم:</strong> {storeName}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>العنوان:</strong> طرابلس - ليبيا
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>الهاتف:</strong> 0912345678
                </MDTypography>
              </Box>
            </Grid>

            {/* معلومات العميل */}
            <Grid item xs={12} md={6}>
              <Box className="section">
                <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
                  معلومات العميل
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>الاسم:</strong> {order.shippingName}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>الهاتف:</strong> {order.shippingPhone}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  <strong>العنوان:</strong> {order.shippingAddress}
                </MDTypography>
                {cityName && (
                  <MDTypography variant="body2" color="text">
                    <strong>المدينة:</strong> {cityName}
                  </MDTypography>
                )}
                {areaName && (
                  <MDTypography variant="body2" color="text">
                    <strong>المنطقة:</strong> {areaName}
                  </MDTypography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* تفاصيل الطلب */}
          <Box className="section" mb={2}>
            <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
              تفاصيل الطلب
            </MDTypography>
            <Grid container spacing={0}>
              <Grid item xs={6}>
                <MDTypography variant="body2" color="text">
                  <strong>رقم الطلب:</strong> {order.orderNumber}
                </MDTypography>
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="body2" color="text">
                  <strong>تاريخ الطلب:</strong> {formatDate(order.createdAt)}
                </MDTypography>
              </Grid>
              <Grid item xs={6}>
                <MDTypography variant="body2" color="text">
                  <strong>الحالة:</strong> {statusLabels[order.status]}
                </MDTypography>
              </Grid>
            </Grid>
          </Box>

          {/* جدول العناصر */}
          <Box className="section">
            <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
              العناصر المطلوبة
            </MDTypography>
            <table className="table" width="100%">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.variant?.product?.name}
                      {item.variant?.option1 && ` - ${item.variant.option1}`}
                      {item.variant?.option2 && ` - ${item.variant.option2}`}
                    </td>
                    <td>{item.qty}</td>
                    <td>{formatPrice(item.unitPriceCents)}</td>
                    <td>{formatPrice(item.unitPriceCents * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {/* الإجمالي */}
          <Box className="total-box">
            <MDBox
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 1,
                backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(95,11,40,0.05)",
              }}
            >
              <MDBox className="total-line" display="flex" justifyContent="space-between" mb={0.5}>
                <MDTypography variant="body1" color="text">
                  إجمالي المنتجات
                </MDTypography>
                <MDTypography variant="body1" fontWeight="medium" color="text">
                  {formatPrice(itemSubtotal)}
                </MDTypography>
              </MDBox>
              {hasDeliveryFee && (
                <MDBox
                  className="total-line"
                  display="flex"
                  justifyContent="space-between"
                  mb={0.5}
                >
                  <MDTypography variant="body1" color="text">
                    رسوم التوصيل (تدفع عند الاستلام)
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="medium" color="text">
                    {formatPrice(order.deliveryFeeCents)}
                  </MDTypography>
                </MDBox>
              )}
              <MDBox className="total-line grand" display="flex" justifyContent="space-between">
                <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
                  {hasDeliveryFee ? "المبلغ الكلي" : "الإجمالي"}
                </MDTypography>
                <MDTypography variant="h5" color="primary">
                  {formatPrice(grandTotal)}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Box>

          {/* تذييل الفاتورة */}
          <Box mt={4} pt={2} sx={{ borderTop: "1px solid #ddd" }}>
            <MDTypography
              variant="body2"
              align="center"
              color={darkMode ? "text.main" : "text.secondary"}
            >
              شكراً لثقتكم بمتجر سوير
            </MDTypography>
            <MDTypography
              variant="caption"
              align="center"
              color={darkMode ? "text.main" : "text.secondary"}
              display="block"
            >
              للاستفسار: 0912345678
            </MDTypography>
          </Box>
        </Box>

        {/* أزرار التحكم (لن تطبع) */}
        <Box className="no-print" mt={3} display="flex" gap={2} justifyContent="center">
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
          <MDButton
            variant="gradient"
            color="success"
            onClick={handlePrint}
            startIcon={<Icon>print</Icon>}
          >
            طباعة الفاتورة
          </MDButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

InvoicePrint.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.number,
    orderNumber: PropTypes.string,
    status: PropTypes.string,
    totalCents: PropTypes.number,
    deliveryFeeCents: PropTypes.number,
    createdAt: PropTypes.string,
    shippingName: PropTypes.string,
    shippingPhone: PropTypes.string,
    shippingAddress: PropTypes.string,
    deliveryCityName: PropTypes.string,
    deliveryAreaName: PropTypes.string,
    deliveryCity: PropTypes.shape({ name: PropTypes.string }),
    deliveryArea: PropTypes.shape({ name: PropTypes.string }),
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

InvoicePrint.defaultProps = {
  order: null,
};

export default InvoicePrint;
