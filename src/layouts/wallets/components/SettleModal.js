import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useMaterialUIController } from "context";

const fieldSx = (darkMode) => ({
  "& .MuiInputLabel-root": { color: darkMode ? "text.main" : "text.primary" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
    },
    "&:hover fieldset": {
      borderColor: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
    },
  },
});

function SettleModal({ open, onClose, onSubmit, courier }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [amountDin, setAmountDin] = useState("");
  const [method, setMethod] = useState("نقدي");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const balanceCents = courier?.wallet?.balanceCents || 0;

  useEffect(() => {
    if (open) {
      setAmountDin("");
      setMethod("نقدي");
      setNote("");
      setError("");
    }
  }, [open]);

  const handleAmountChange = (e) => {
    const v = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(v)) {
      setAmountDin(v);
      setError("");
    }
  };

  const handleSubmit = async () => {
    const din = parseFloat(amountDin);
    if (!din || din <= 0) {
      setError("أدخل مبلغاً صحيحاً أكبر من صفر");
      return;
    }
    const amountCents = Math.round(din * 100);
    if (amountCents > balanceCents) {
      setError(`الرصيد الحالي ${Math.round(balanceCents / 100)} د.ل فقط — لا يمكن الصرف أكثر منه`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ amountCents, method, note: note.trim() || null });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.data?.message || err.response?.data?.message || "حدث خطأ أثناء الصرف"
      );
    } finally {
      setLoading(false);
    }
  };

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
        <MDTypography variant="h5" fontWeight="medium" color={darkMode ? "white" : "dark"}>
          صرف رصيد — {courier?.name || ""}
        </MDTypography>
        <MDTypography variant="button" color="text">
          الرصيد الحالي: <b>{Math.round(balanceCents / 100)} د.ل</b>
        </MDTypography>
      </DialogTitle>

      <DialogContent>
        <MDBox pt={1} pb={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="المبلغ (دينار) *"
                value={amountDin}
                onChange={handleAmountChange}
                inputMode="decimal"
                disabled={loading}
                sx={fieldSx(darkMode)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="طريقة الصرف"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={loading}
                sx={fieldSx(darkMode)}
              >
                <MenuItem value="نقدي">نقدي</MenuItem>
                <MenuItem value="تحويل بنكي">تحويل بنكي</MenuItem>
                <MenuItem value="محفظة إلكترونية">محفظة إلكترونية</MenuItem>
                <MenuItem value="أخرى">أخرى</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ملاحظة"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                multiline
                rows={2}
                sx={fieldSx(darkMode)}
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              </Grid>
            )}
          </Grid>
        </MDBox>
      </DialogContent>

      <DialogActions>
        <MDButton
          variant="gradient"
          color="success"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? (
              <Icon sx={{ animation: "spin 1s linear infinite" }}>refresh</Icon>
            ) : (
              <Icon>paid</Icon>
            )
          }
        >
          {loading ? "جاري الصرف..." : "صرف الآن"}
        </MDButton>
        <MDButton variant="gradient" color="light" onClick={onClose} disabled={loading}>
          إلغاء
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

SettleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  courier: PropTypes.object,
};

export default SettleModal;
