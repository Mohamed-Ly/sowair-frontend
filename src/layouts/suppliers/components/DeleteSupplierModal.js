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

function DeleteSupplierModal({ open, onClose, onConfirm, supplier }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء الحذف");
    } finally {
      setLoading(false);
    }
  };

  if (!supplier) return null;

  const linked = supplier._count?.variants ?? 0;

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
          <Icon sx={{ fontSize: "3rem", color: "error.main", mr: 2 }}>warning</Icon>
          <MDTypography variant="body1" color={darkMode ? "white" : "dark"}>
            هل أنت متأكد من حذف المورد &quot;{supplier.name}&quot;؟
          </MDTypography>
        </MDBox>

        {linked > 0 ? (
          <MDBox
            mb={2}
            p={2}
            sx={{
              borderRadius: "8px",
              backgroundColor: darkMode ? "rgba(237, 108, 2, 0.1)" : "rgba(237, 108, 2, 0.08)",
              border: "1px solid",
              borderColor: darkMode ? "rgba(237, 108, 2, 0.3)" : "rgba(237, 108, 2, 0.2)",
            }}
          >
            <MDTypography variant="body2" color="warning" fontWeight="bold">
              لا يمكن الحذف — يوجد {linked} منتج مرتبط بهذا المورد.
            </MDTypography>
            <MDTypography
              variant="caption"
              color={darkMode ? "text.main" : "text.secondary"}
              display="block"
              mt={0.5}
            >
              أوقف المورد بدلاً من حذفه، أو انقل منتجاته لمورد آخر أولاً. سعر الشراء لن يُحذف.
            </MDTypography>
          </MDBox>
        ) : (
          <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
            لا يمكن التراجع عن هذا الإجراء. سيتم حذف المورد بشكل دائم.
          </MDTypography>
        )}

        {error && (
          <MDBox
            mt={2}
            p={1.5}
            sx={{
              borderRadius: "6px",
              backgroundColor: darkMode ? "rgba(244, 67, 54, 0.1)" : "rgba(244, 67, 54, 0.08)",
            }}
          >
            <MDTypography variant="caption" color="error" fontWeight="bold">
              {error}
            </MDTypography>
          </MDBox>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          color={darkMode ? "inherit" : "primary"}
          sx={{ color: darkMode ? "text.main" : "primary.main" }}
        >
          {linked > 0 ? "إغلاق" : "إلغاء"}
        </Button>
        <MDButton
          variant="gradient"
          color="error"
          onClick={handleConfirm}
          disabled={loading || linked > 0}
          startIcon={
            loading ? (
              <Icon sx={{ animation: "spin 1s linear infinite" }}>refresh</Icon>
            ) : (
              <Icon>delete</Icon>
            )
          }
        >
          {loading ? "جاري الحذف..." : "حذف"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DeleteSupplierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  supplier: PropTypes.object,
};

export default DeleteSupplierModal;
