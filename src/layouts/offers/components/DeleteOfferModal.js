import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";

function DeleteOfferModal({ open, onClose, onConfirm, offer }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const handleConfirm = () => {
    onConfirm();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!offer) return null;

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
        <MDBox display="flex" alignItems="center" gap={1}>
          <Icon color="error">warning</Icon>
          <MDTypography variant="h5" fontWeight="medium" color="error">
            تأكيد الحذف
          </MDTypography>
        </MDBox>
      </DialogTitle>

      <DialogContent>
        <MDBox textAlign="center" py={2}>
          <Icon sx={{ fontSize: 64, color: "error", mb: 2 }}>delete_forever</Icon>

          <MDTypography variant="h6" gutterBottom>
            هل أنت متأكد من حذف هذا العرض؟
          </MDTypography>

          <MDTypography variant="body2" color="text" paragraph>
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف العرض بشكل دائم من النظام.
          </MDTypography>

          {/* تفاصيل العرض */}
          <MDBox
            p={2}
            sx={{
              backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              borderRadius: "8px",
              border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              textAlign: "right",
            }}
          >
            <MDTypography variant="h6" color="error" gutterBottom>
              {offer.title}
            </MDTypography>

            <Box sx={{ mb: 2 }}>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                الفترة:
              </MDTypography>
              <MDTypography variant="body2" sx={{ ml: 1 }}>
                من {formatDate(offer.startDate)} إلى {formatDate(offer.endDate)}
              </MDTypography>
            </Box>

            <Box>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                عدد النقرات:
              </MDTypography>
              <MDTypography variant="body2" sx={{ ml: 1 }}>
                {offer.clickCount || 0}
              </MDTypography>
            </Box>
          </MDBox>

          <MDTypography variant="caption" color="error" sx={{ mt: 2, display: "block" }}>
            ⚠️ سيتم حذف جميع البيانات المرتبطة بهذا العرض بما في ذلك الصورة.
          </MDTypography>
        </MDBox>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <MDButton variant="outlined" color={darkMode ? "white" : "dark"} onClick={onClose}>
          إلغاء
        </MDButton>
        <MDButton
          variant="gradient"
          color="error"
          onClick={handleConfirm}
          startIcon={<Icon>delete</Icon>}
        >
          حذف العرض
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DeleteOfferModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  offer: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    clickCount: PropTypes.number,
  }),
};

DeleteOfferModal.defaultProps = {
  offer: null,
};

export default DeleteOfferModal;
