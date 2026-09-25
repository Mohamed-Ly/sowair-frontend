import { useRef } from "react";
import { Dialog, DialogContent, Box } from "@mui/material";
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
              margin: 20px; 
              direction: rtl;
            }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            .table th { background-color: #f5f5f5; }
            .total { font-size: 18px; font-weight: bold; text-align: left; margin-top: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
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
          <Box className="header" mb={4}>
            <MDTypography
              variant="h4"
              fontWeight="bold"
              color={darkMode ? "white" : "dark"}
              gutterBottom
            >
              فاتورة بيع
            </MDTypography>
            <MDTypography variant="h5" color="primary">
              #{order.orderNumber}
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              تاريخ الإصدار: {formatDate(new Date())}
            </MDTypography>
          </Box>

          {/* معلومات المتجر */}
          <Box className="section" mb={3}>
            <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
              معلومات المتجر
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              المتجر الإلكتروني
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              طرابلس - ليبيا
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              هاتف: 0912345678
            </MDTypography>
          </Box>

          {/* معلومات العميل */}
          <Box className="section" mb={3}>
            <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
              معلومات العميل
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              <strong>الاسم:</strong> {order.shippingName}
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              <strong>الهاتف:</strong> {order.shippingPhone}
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              <strong>العنوان:</strong> {order.shippingAddress}
            </MDTypography>
          </Box>

          {/* تفاصيل الطلب */}
          <Box className="section" mb={3}>
            <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
              تفاصيل الطلب
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              <strong>رقم الطلب:</strong> {order.orderNumber}
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              <strong>تاريخ الطلب:</strong> {formatDate(order.createdAt)}
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
              <strong>الحالة:</strong> {statusLabels[order.status]}
            </MDTypography>
          </Box>

          {/* جدول العناصر */}
          <Box className="section">
            <MDTypography variant="h6" color={darkMode ? "white" : "dark"} gutterBottom>
              العناصر المطلوبة
            </MDTypography>
            <table className="table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
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
          <Box className="total">
            <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
              الإجمالي: {formatPrice(order.totalCents)}
            </MDTypography>
          </Box>

          {/* تذييل الفاتورة */}
          <Box mt={4} pt={2} style={{ borderTop: "1px solid #ddd" }}>
            <MDTypography
              variant="body2"
              align="center"
              color={darkMode ? "text.main" : "text.secondary"}
            >
              شكراً لثقتكم بنا
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
    createdAt: PropTypes.string,
    shippingName: PropTypes.string,
    shippingPhone: PropTypes.string,
    shippingAddress: PropTypes.string,
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
