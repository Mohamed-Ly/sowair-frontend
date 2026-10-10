import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useMaterialUIController } from "context";

function DeleteProductModal({ open, onClose, onConfirm, product }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting product:", error);
      setErrorMessage(
        error?.response?.data?.data?.message || "حدث خطأ أثناء حذف المنتج. جرّب مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: darkMode ? "background.card" : "background.default",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle>
        <MDTypography variant="h5" fontWeight="medium" color="error">
          تأكيد الحذف
        </MDTypography>
      </DialogTitle>

      <DialogContent>
        <MDBox display="flex" alignItems="center" mb={2}>
          <Icon
            sx={{
              fontSize: "3rem",
              color: "error.main",
              mr: 2,
            }}
          >
            warning
          </Icon>
          <MDTypography variant="body1" color={darkMode ? "white" : "dark"}>
            هل أنت متأكد من حذف المنتج &quot;{product.name}&quot;؟
          </MDTypography>
        </MDBox>
        <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
          لا يمكن التراجع عن هذا الإجراء. سيتم حذف المنتج بشكل دائم. الملاحظة: المنتجات المرتبطة
          بطلبات سابقة لا يمكن حذفها نهائياً لحماية التقارير — يمكنك بدلاً من ذلك إلغاء تفعيلها.
        </MDTypography>
        {errorMessage && (
          <MDBox mt={2} p={2} bgColor="error.light" borderRadius="md">
            <MDTypography variant="body2" color="white" fontWeight="medium">
              {errorMessage}
            </MDTypography>
          </MDBox>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          color={darkMode ? "inherit" : "primary"}
          sx={{
            color: darkMode ? "text.main" : "primary.main",
          }}
        >
          إلغاء
        </Button>
        <MDButton
          variant="gradient"
          color="error"
          onClick={handleConfirm}
          disabled={loading}
          startIcon={
            loading ? (
              <Icon sx={{ animation: "spin 1s linear infinite" }}>refresh</Icon>
            ) : (
              <Icon>delete</Icon>
            )
          }
          sx={{
            "& .MuiSvgIcon-root": {
              animation: loading ? "spin 1s linear infinite" : "none",
            },
          }}
        >
          {loading ? "جاري الحذف..." : "حذف"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DeleteProductModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  product: PropTypes.object,
};

export default DeleteProductModal;
