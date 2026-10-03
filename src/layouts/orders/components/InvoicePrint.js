import { useRef } from "react";
import { Dialog, DialogContent, Box } from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";

const receiptStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #1a1a1a; }
  @page { size: 60mm auto; margin: 0; }

  .receipt-paper { background: #f4f4f4; padding: 16px; border-radius: 8px; }
  .receipt { width: 6cm; margin: 0 auto; padding: 2mm; direction: rtl; font-size: 12px; line-height: 1.5; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.12); border-radius: 4px; }

  .receipt__header { text-align: center; border-bottom: 1.5px dashed #bbb; padding-bottom: 6px; margin-bottom: 8px; }
  .receipt__logo { width: 56px; height: 56px; object-fit: contain; margin-bottom: 2px; }
  .receipt__store { font-size: 15px; font-weight: 700; color: #5f0b28; }
  .receipt__doc { font-size: 12px; font-weight: 700; margin: 2px 0 1px; }
  .receipt__number { font-size: 12px; direction: ltr; }
  .receipt__date { font-size: 10px; color: #666; }

  .receipt__row { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dashed #e3e3e3; padding: 3px 0; }
  .receipt__row .k { color: #666; white-space: nowrap; }
  .receipt__row .v { text-align: left; word-break: break-word; }

  .receipt__totals { margin-top: 8px; }
  .receipt__grand { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; color: #5f0b28; border-top: 1.5px solid #5f0b28; margin-top: 4px; padding-top: 6px; }

  .receipt__footer { text-align: center; margin-top: 10px; border-top: 1px dashed #bbb; padding-top: 6px; font-size: 10px; color: #555; }

  @media print {
    .receipt-paper { background: #fff; padding: 0; }
    .receipt { box-shadow: none; border-radius: 0; }
  }
`;

function InvoicePrint({ open, onClose, order }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const printRef = useRef();
  const storeName = "متجر سوير";
  const logoUrl = `${window.location.origin}/sowair-logo.png`;

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>فاتورة ${order.orderNumber}</title>
          <style>${receiptStyles}</style>
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

  const cityName = order.deliveryCityName || order.deliveryCity?.name || null;
  const areaName = order.deliveryAreaName || order.deliveryArea?.name || null;
  const hasDeliveryFee = (order.deliveryFeeCents || 0) > 0;
  const itemSubtotal = order.totalCents || 0;
  const totalQty = (order.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
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
        <Box ref={printRef} className="receipt-paper">
          <style>{receiptStyles}</style>
          <Box className="receipt">
            {/* رأس الفاتورة */}
            <Box className="receipt__header">
              <img src={logoUrl} alt="شعار سوير" className="receipt__logo" />
              <div className="receipt__store">{storeName}</div>
              <div className="receipt__doc">فاتورة بيع</div>
              <div className="receipt__number">#{order.orderNumber}</div>
              <div className="receipt__date">تاريخ الإصدار: {formatDate(new Date())}</div>
            </Box>

            {/* عدد المنتجات */}
            <div className="receipt__row">
              <span className="k">عدد المنتجات</span>
              <span className="v">{totalQty}</span>
            </div>

            {/* معلومات العميل */}
            <div className="receipt__row">
              <span className="k">العميل</span>
              <span className="v">{order.shippingName}</span>
            </div>
            <div className="receipt__row">
              <span className="k">الهاتف</span>
              <span className="v" dir="ltr">
                {order.shippingPhone}
              </span>
            </div>
            <div className="receipt__row">
              <span className="k">العنوان</span>
              <span className="v">{order.shippingAddress}</span>
            </div>
            {cityName && (
              <div className="receipt__row">
                <span className="k">المدينة</span>
                <span className="v">{cityName}</span>
              </div>
            )}
            {areaName && (
              <div className="receipt__row">
                <span className="k">المنطقة</span>
                <span className="v">{areaName}</span>
              </div>
            )}

            {/* الإجمالي */}
            <Box className="receipt__totals">
              <div className="receipt__row">
                <span className="k">إجمالي المنتجات</span>
                <span className="v">{formatPrice(itemSubtotal)}</span>
              </div>
              {hasDeliveryFee && (
                <div className="receipt__row">
                  <span className="k">رسوم التوصيل</span>
                  <span className="v">{formatPrice(order.deliveryFeeCents)}</span>
                </div>
              )}
              <div className="receipt__grand">
                <span>{hasDeliveryFee ? "المبلغ الكلي" : "الإجمالي"}</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </Box>

            {/* تذييل الفاتورة */}
            <Box className="receipt__footer">
              <div>شكراً لثقتكم بمتجر سوير</div>
              <div>للاستفسار: 0912345678</div>
            </Box>
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
    totalCents: PropTypes.number,
    deliveryFeeCents: PropTypes.number,
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
      })
    ),
  }),
};

InvoicePrint.defaultProps = {
  order: null,
};

export default InvoicePrint;
