import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useMaterialUIController } from "context";

function EditVariantModal({ open, onClose, onSubmit, variant }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [formData, setFormData] = useState({
    option1: "",
    option2: "",
    priceCents: "",
    stockQty: "",
    sku: "",
    barcode: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (variant) {
      setFormData({
        option1: variant.option1 || "",
        option2: variant.option2 || "",
        priceCents: (variant.priceCents / 100).toString(), // تحويل القرش إلى ريال
        stockQty: variant.stockQty?.toString() || "",
        sku: variant.sku || "",
        // barcode: variant.barcode || "",
        isActive: variant.isActive ?? true,
      });
    }
  }, [variant]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.priceCents || formData.priceCents < 0) {
      newErrors.priceCents = "السعر مطلوب ويجب أن يكون رقمًا موجبًا";
    }

    if (formData.stockQty && formData.stockQty < 0) {
      newErrors.stockQty = "المخزون يجب أن يكون 0 أو أكبر";
    }

    if (formData.option1 && formData.option1.length > 120) {
      newErrors.option1 = "الخيار الأول غير صالح";
    }

    if (formData.option2 && formData.option2.length > 120) {
      newErrors.option2 = "الخيار الثاني غير صالح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        priceCents: parseInt(formData.priceCents) * 100, // تحويل الدينار إلى سنت
        stockQty: formData.stockQty ? parseInt(formData.stockQty) : 0,
        option1: formData.option1 || null,
        option2: formData.option2 || null,
        sku: formData.sku || null,
        // barcode: formData.barcode || null,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error updating variant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      option1: "",
      option2: "",
      priceCents: "",
      stockQty: "",
      sku: "",
      // barcode: "",
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  if (!variant) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          تعديل المتغير
        </MDTypography>
        <MDTypography variant="body2" color={darkMode ? "text.main" : "text.secondary"}>
          ID: {variant.id}
        </MDTypography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* الخيار 1 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الخيار 1 (اختياري)"
                placeholder="مثال: مقاس L، سعة 100 مل، اللون أحمر"
                name="option1"
                value={formData.option1}
                onChange={handleChange}
                error={!!errors.option1}
                helperText={errors.option1}
                disabled={loading}
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
                  },
                }}
              />
            </Grid>

            {/* الخيار 2 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الخيار 2 (اختياري)"
                placeholder="مثال: اللون أسود، EDP، طراز Pro"
                name="option2"
                value={formData.option2}
                onChange={handleChange}
                error={!!errors.option2}
                helperText={errors.option2}
                disabled={loading}
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
                  },
                }}
              />
            </Grid>

            {/* السعر */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="السعر (دينار) *"
                name="priceCents"
                type="number"
                value={formData.priceCents}
                onChange={handleChange}
                error={!!errors.priceCents}
                helperText={errors.priceCents}
                disabled={loading}
                InputProps={{
                  endAdornment: <MDTypography variant="button">د.ل</MDTypography>,
                }}
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
                  },
                }}
              />
            </Grid>

            {/* المخزون */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="المخزون"
                name="stockQty"
                type="number"
                value={formData.stockQty}
                onChange={handleChange}
                error={!!errors.stockQty}
                helperText={errors.stockQty}
                disabled={loading}
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
                  },
                }}
              />
            </Grid>

            {/* SKU */}
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                label="SKU (كود المنتج)"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={loading}
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
                  },
                }}
              />
            </Grid>

            {/* الباركود */}
            {/* <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الباركود"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                disabled={loading}
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
                  },
                }}
              />
            </Grid> */}

            {/* الحالة */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    color="success"
                  />
                }
                label={
                  <MDTypography
                    variant="button"
                    color={darkMode ? "white" : "dark"}
                    fontWeight="medium"
                  >
                    {formData.isActive ? "مفعل" : "غير مفعل"}
                  </MDTypography>
                }
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
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
            color="info"
            type="submit"
            disabled={loading}
            startIcon={
              loading ? (
                <Icon sx={{ animation: "spin 1s linear infinite" }}>refresh</Icon>
              ) : (
                <Icon>check</Icon>
              )
            }
            sx={{
              "& .MuiSvgIcon-root": {
                animation: loading ? "spin 1s linear infinite" : "none",
              },
            }}
          >
            {loading ? "جاري التحديث..." : "تحديث"}
          </MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

EditVariantModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  variant: PropTypes.object,
};

export default EditVariantModal;
