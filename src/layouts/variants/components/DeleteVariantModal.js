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

function DeleteVariantModal({ open, onClose, onConfirm, variant }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting variant:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!variant) return null;

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
          تأكيد حذف المتغير
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
          <MDBox>
            <MDTypography variant="body1" color={darkMode ? "white" : "dark"} fontWeight="medium">
              هل أنت متأكد من حذف المتغير؟
            </MDTypography>
            <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"} mt={1}>
              {variant.option1 && `الخيار 1: ${variant.option1}`}
              {variant.option2 && ` • الخيار 2: ${variant.option2}`}
              {variant.sku && ` • SKU: ${variant.sku}`}
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
          لا يمكن التراجع عن هذا الإجراء. سيتم حذف المتغير بشكل دائم.
        </MDTypography>

        <MDBox
          mt={2}
          p={2}
          sx={{
            backgroundColor: darkMode ? "rgba(244,67,54,0.1)" : "rgba(244,67,54,0.05)",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "error.main",
          }}
        >
          <MDTypography variant="caption" color="error" fontWeight="bold">
            ⚠️ تحذير: إذا كان هذا المتغير مرتبطاً بأي طلبات أو سلة مستخدمين، فقد يؤثر حذفه على تلك
            البيانات.
          </MDTypography>
        </MDBox>
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

DeleteVariantModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  variant: PropTypes.object,
};

export default DeleteVariantModal;
