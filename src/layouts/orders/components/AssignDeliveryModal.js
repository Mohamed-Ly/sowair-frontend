import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import orderApi from "../services/orderApi";

const ASSIGNABLE_STATUSES = ["PENDING", "CONFIRMED", "SHIPPING"];

function AssignDeliveryModal({ open, onClose, onSubmit, order }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [deliverers, setDeliverers] = useState([]);
  const [deliveryId, setDeliveryId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) {
      setDeliveryId("");
      setNote("");
      loadDeliverers();
    }
  }, [open]);

  const loadDeliverers = async () => {
    try {
      setFetching(true);
      const res = await orderApi.getDeliverers();
      const list = res.data?.data?.deliverers || res.data?.deliverers || [];
      setDeliverers(list);
    } catch (error) {
      console.error("Failed to load deliverers:", error);
      setDeliverers([]);
    } finally {
      setFetching(false);
    }
  };

  const canAssign = order && ASSIGNABLE_STATUSES.includes(order.status);

  const handleSubmit = async () => {
    if (!deliveryId) return;
    setLoading(true);
    try {
      await onSubmit({
        orderId: order.id,
        deliveryId: parseInt(deliveryId, 10),
        note: note.trim() || undefined,
      });
    } catch (error) {
      console.error("Error assigning delivery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <MDTypography variant="h5" fontWeight="medium" color={darkMode ? "white" : "dark"}>
          تعيين مندوب توصيل
        </MDTypography>
        {order && (
          <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
            رقم الطلب: {order.orderNumber}
          </MDTypography>
        )}
      </DialogTitle>

      <DialogContent>
        {!canAssign ? (
          <MDBox
            mt={1}
            p={2}
            sx={{
              backgroundColor: darkMode ? "rgba(244,67,54,0.12)" : "rgba(244,67,54,0.06)",
              borderRadius: 1,
              border: `1px solid ${darkMode ? "rgba(244,67,54,0.4)" : "rgba(244,67,54,0.2)"}`,
            }}
          >
            <MDTypography variant="caption" color={darkMode ? "white" : "dark"}>
              لا يمكن تعيين مندوب لهذا الطلب في حالته الحالية. التعيين متاح للطلبات قيد المراجعة أو
              المؤكدة أو قيد الشحن.
            </MDTypography>
          </MDBox>
        ) : (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>المندوب</InputLabel>
              <Select
                value={deliveryId}
                onChange={(e) => setDeliveryId(e.target.value)}
                label="المندوب"
                disabled={fetching}
                startAdornment={fetching ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
              >
                {fetching && deliverers.length === 0 ? (
                  <MenuItem disabled>جاري تحميل المندوبين...</MenuItem>
                ) : deliverers.length === 0 ? (
                  <MenuItem disabled>
                    لا يوجد مندوبون. أنشئ مستخدماً بدور &quot;مندوب&quot; أولاً
                  </MenuItem>
                ) : (
                  deliverers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      <Box display="flex" alignItems="center">
                        <Icon sx={{ mr: 1 }}>delivery_dining</Icon>
                        {d.name} ({d.phone})
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="ملاحظة (اختياري)"
              multiline
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: تسليم قبل العاشرة مساءً..."
              sx={{
                "& .MuiInputLabel-root": {
                  color: darkMode ? "text.main" : "text.primary",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                  },
                  "& .MuiInputBase-input": {
                    color: darkMode ? "text.main" : "text.primary",
                  },
                },
              }}
            />

            <MDBox
              mt={2}
              p={2}
              sx={{
                backgroundColor: darkMode ? "rgba(33,150,243,0.1)" : "rgba(33,150,243,0.05)",
                borderRadius: 1,
                border: `1px solid ${darkMode ? "rgba(33,150,243,0.2)" : "rgba(33,150,243,0.1)"}`,
              }}
            >
              <MDTypography variant="caption" color={darkMode ? "white" : "dark"}>
                <strong>ملاحظة:</strong> سيقبل المندوب المهمة وتتحول حالة الطلب إلى &quot;قيد
                الشحن&quot;، وعند التسليم ستتحول إلى &quot;تم التسليم&quot; تلقائياً.
              </MDTypography>
            </MDBox>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
          color={darkMode ? "inherit" : "primary"}
          sx={{ color: darkMode ? "text.main" : "primary.main" }}
        >
          إلغاء
        </Button>
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSubmit}
          disabled={!canAssign || !deliveryId || loading}
          startIcon={<Icon>local_shipping</Icon>}
        >
          {loading ? "جاري التعيين..." : "تعيين المندوب"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

AssignDeliveryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.number,
    orderNumber: PropTypes.string,
    status: PropTypes.string,
  }),
};

AssignDeliveryModal.defaultProps = {
  order: null,
};

export default AssignDeliveryModal;
