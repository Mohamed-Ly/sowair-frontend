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
  MenuItem,
  Box,
  Checkbox,
} from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useMaterialUIController } from "context";

function EditBrandModal({ open, onClose, onSubmit, brand }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    isActive: true,
    imageUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  function buildImageUrl(image) {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${image}`;
  }

  // قائمة الدول العربية والعالمية
  const countries = [
    { value: "", label: "اختر البلد" },
    { value: "السعودية", label: "السعودية" },
    { value: "الإمارات", label: "الإمارات العربية المتحدة" },
    { value: "مصر", label: "مصر" },
    { value: "الأردن", label: "الأردن" },
    { value: "لبنان", label: "لبنان" },
    { value: "الكويت", label: "الكويت" },
    { value: "قطر", label: "قطر" },
    { value: "عمان", label: "عُمان" },
    { value: "البحرين", label: "البحرين" },
    { value: "العراق", label: "العراق" },
    { value: "الجزائر", label: "الجزائر" },
    { value: "المغرب", label: "المغرب" },
    { value: "تونس", label: "تونس" },
    { value: "فرنسا", label: "فرنسا" },
    { value: "إيطاليا", label: "إيطاليا" },
    { value: "إسبانيا", label: "إسبانيا" },
    { value: "ألمانيا", label: "ألمانيا" },
    { value: "بريطانيا", label: "بريطانيا" },
    { value: "الولايات المتحدة", label: "الولايات المتحدة الأمريكية" },
    { value: "كندا", label: "كندا" },
    { value: "تركيا", label: "تركيا" },
    { value: "الهند", label: "الهند" },
    { value: "الصين", label: "الصين" },
    { value: "اليابان", label: "اليابان" },
    { value: "كوريا الجنوبية", label: "كوريا الجنوبية" },
    { value: "أخرى", label: "أخرى" },
  ];

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        country: brand.country || "",
        isActive: brand.isActive ?? true,
        imageUrl: "",
      });
      setImageFile(null);
      setRemoveImage(false);
      setImagePreview(brand.image ? buildImageUrl(brand.image) : null);
    }
  }, [brand]);

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

    if (!formData.name.trim()) {
      newErrors.name = "اسم الماركة مطلوب";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "اسم الماركة يجب أن يكون على الأقل حرفين";
    } else if (formData.name.trim().length > 60) {
      newErrors.name = "اسم الماركة يجب ألا يتجاوز 60 حرفاً";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // تنظيف البيانات - إذا كان البلد فارغاً نرسل null
      const submitData = {
        name: formData.name.trim(),
        country: formData.country || null,
        isActive: formData.isActive,
      };
      if (imageFile) {
        submitData.image = imageFile;
      } else if (removeImage) {
        submitData.image = "";
      } else if (formData.imageUrl && formData.imageUrl.trim()) {
        submitData.image = formData.imageUrl.trim();
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error updating brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      country: "",
      isActive: true,
      imageUrl: "",
    });
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    onClose();
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
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  if (!brand) return null;

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
          تعديل الماركة
        </MDTypography>
        <MDTypography variant="body2" color="text">
          {brand.name}
        </MDTypography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* اسم الماركة */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم الماركة *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
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

            {/* بلد الماركة */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="بلد الماركة"
                name="country"
                value={formData.country}
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
              >
                {countries.map((country) => (
                  <MenuItem key={country.value} value={country.value}>
                    {country.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* حالة التفعيل */}
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

            <Grid item xs={12}>
              <MDTypography variant="h6" gutterBottom>
                صورة الماركة (اختياري)
              </MDTypography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="رابط صورة جديد (URL لوضع صورة أخرى)"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                disabled={loading}
                placeholder="/uploads/example.jpg أو رابط كامل https://..."
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

            <Grid item xs={12}>
              <Box
                sx={{
                  border: `2px dashed ${
                    errors.image ? "red" : darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                  }`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                }}
                onClick={() => document.getElementById("brand-image-input").click()}
              >
                <input
                  id="brand-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  disabled={loading}
                />

                {imagePreview ? (
                  <Box>
                    <img
                      src={imagePreview}
                      alt="معاينة الصورة"
                      style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                    />
                    <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
                      انقر لتغيير الصورة
                    </MDTypography>
                  </Box>
                ) : (
                  <Box>
                    <Icon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }}>cloud_upload</Icon>
                    <MDTypography variant="body2" color="text">
                      لا توجد صورة حالياً - انقر لرفع صورة للتحديد
                    </MDTypography>
                    <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                      JPG, PNG, WebP - الحد الأقصى 5MB
                    </MDTypography>
                  </Box>
                )}
              </Box>
              {errors.image && (
                <MDTypography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                  {errors.image}
                </MDTypography>
              )}
            </Grid>

            {brand.image && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={removeImage}
                      onChange={(e) => {
                        setRemoveImage(e.target.checked);
                        if (e.target.checked) {
                          setImagePreview(null);
                          setImageFile(null);
                        } else if (brand.image) {
                          setImagePreview(buildImageUrl(brand.image));
                        }
                      }}
                      color="error"
                      disabled={loading || !!imageFile}
                    />
                  }
                  label={
                    <MDTypography variant="button" color="error" fontWeight="medium">
                      إزالة الصورة الحالية
                    </MDTypography>
                  }
                />
              </Grid>
            )}
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

EditBrandModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  brand: PropTypes.object,
};

export default EditBrandModal;
