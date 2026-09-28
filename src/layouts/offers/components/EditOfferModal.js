import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";

// العرض = بانر للعرض فقط: صورة + عنوان + وصف + تواريخ.
// مفيش خصم ولا ربط بمنتجات — تعديل البانر موجود فقط.

function EditOfferModal({ open, onClose, onSubmit, offer }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
    displayOrder: 0,
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  function toDateTimeLocalValue(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
    return imagePath.startsWith("/") ? `${base}${imagePath}` : `${base}/uploads/${imagePath}`;
  };

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || "",
        description: offer.description || "",
        startDate: toDateTimeLocalValue(offer.startDate),
        endDate: toDateTimeLocalValue(offer.endDate),
        isActive: offer.isActive ?? true,
        displayOrder: offer.displayOrder ?? 0,
        image: null,
      });
      setImagePreview(offer.image ? getImageUrl(offer.image) : null);
      setErrors({});
    }
  }, [offer]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "حجم الصورة يجب ألا يتجاوز 5MB" }));
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "نوع الملف غير مدعوم. استخدم JPG, PNG, أو WebP" }));
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان العرض مطلوب";
    } else if (formData.title.trim().length < 2 || formData.title.trim().length > 100) {
      newErrors.title = "العنوان يجب أن يكون بين 2 و 100 حرف";
    }

    if (!formData.startDate) {
      newErrors.startDate = "تاريخ البداية مطلوب";
    }
    if (!formData.endDate) {
      newErrors.endDate = "تاريخ النهاية مطلوب";
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "تاريخ النهاية لازم يكون بعد تاريخ البداية";
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
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        isActive: formData.isActive,
        displayOrder: Number(formData.displayOrder) || 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      // ما نبعتش image إلا لو الأدمن اختار صورة جديدة — الباك بيحتفظ بالقديمة
      if (formData.image) submitData.image = formData.image;

      await onSubmit(submitData);
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "حدث خطأ أثناء تحديث العرض";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : null}
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
          تعديل العرض
        </MDTypography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {errors.general && (
            <MDBox mb={2}>
              <MDTypography
                variant="body2"
                color="error"
                align="center"
                sx={{
                  p: 1,
                  backgroundColor: "rgba(244,67,54,0.1)",
                  borderRadius: 1,
                  border: "1px solid rgba(244,67,54,0.3)",
                }}
              >
                {errors.general}
              </MDTypography>
            </MDBox>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="عنوان العرض"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                disabled={loading}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="الوصف"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                disabled={loading}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid item xs={12}>
              <MDTypography variant="subtitle2" color={darkMode ? "white" : "dark"} mb={1}>
                صورة العرض
              </MDTypography>
              <Box
                onClick={() => document.getElementById("edit-offer-image-input").click()}
                sx={{
                  cursor: "pointer",
                  border: "2px dashed",
                  borderColor: errors.image
                    ? "error.main"
                    : darkMode
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.3)",
                  borderRadius: 1,
                  p: 2,
                  textAlign: "center",
                  overflow: "hidden",
                }}
              >
                {imagePreview ? (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="صورة العرض"
                    sx={{ maxHeight: 180, maxWidth: "100%" }}
                  />
                ) : (
                  <Icon sx={{ fontSize: 40, color: darkMode ? "white" : "text.secondary" }}>
                    cloud_upload
                  </Icon>
                )}
                <MDTypography
                  variant="button"
                  color={darkMode ? "white" : "dark"}
                  display="block"
                  mt={1}
                >
                  اضغط لتغيير الصورة
                </MDTypography>
              </Box>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="edit-offer-image-input"
              />
              {errors.image && (
                <MDTypography variant="caption" color="error" display="block" mt={0.5}>
                  {errors.image}
                </MDTypography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="تاريخ البداية"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="تاريخ النهاية"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                error={!!errors.endDate}
                helperText={errors.endDate}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="ترتيب العرض"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                disabled={loading}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={loading}
                  />
                }
                label="العرض مُفعّل"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <MDBox display="flex" justifyContent="flex-end" gap={1} sx={{ p: 2, width: "100%" }}>
            <MDButton variant="gradient" color="dark" onClick={onClose} disabled={loading}>
              إلغاء
            </MDButton>
            <MDButton variant="gradient" color="info" type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </MDButton>
          </MDBox>
        </DialogActions>
      </form>
    </Dialog>
  );
}

EditOfferModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  offer: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    isActive: PropTypes.bool,
    displayOrder: PropTypes.number,
  }),
};

export default EditOfferModal;
