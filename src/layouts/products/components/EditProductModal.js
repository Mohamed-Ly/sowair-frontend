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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Box,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useMaterialUIController } from "context";

function EditProductModal({ open, onClose, onSubmit, product, brands = [], categories = [] }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    isActive: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        brandId: product.brand?.id || "",
        categoryId: product.category?.id || "",
        isActive: product.isActive ?? true,
      });
      setExistingImages(product.images || []);
      setNewImages([]);
      setImagesToRemove([]);
    }
  }, [product]);

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

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // التحقق من عدد الصور
    if (existingImages.length - imagesToRemove.length + newImages.length + files.length > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "يمكنك رفع 5 صور فقط",
      }));
      return;
    }

    const uploadedImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isNew: true,
    }));

    setNewImages((prev) => [...prev, ...uploadedImages]);

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const removeExistingImage = (imageId) => {
    setImagesToRemove((prev) => [...prev, imageId]);
  };

  const removeNewImage = (imageId) => {
    setNewImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const restoreImage = (imageId) => {
    setImagesToRemove((prev) => prev.filter((id) => id !== imageId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم المنتج مطلوب";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "اسم المنتج يجب أن يكون على الأقل حرفين";
    } else if (formData.name.trim().length > 120) {
      newErrors.name = "اسم المنتج يجب ألا يتجاوز 120 حرفاً";
    }

    if (!formData.brandId) {
      newErrors.brandId = "الماركة مطلوبة";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "التصنيف مطلوب";
    }

    const totalImages = existingImages.length - imagesToRemove.length + newImages.length;
    if (totalImages === 0) {
      newErrors.images = "يجب أن يحتوي المنتج على صورة واحدة على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("brandId", formData.brandId);
      submitData.append("categoryId", formData.categoryId);
      submitData.append("isActive", formData.isActive);

      // إضافة الصور الجديدة
      newImages.forEach((image) => {
        submitData.append("images", image.file);
      });

      // إضافة IDs الصور المراد حذفها
      if (imagesToRemove.length > 0) {
        submitData.append("removeImageIds", JSON.stringify(imagesToRemove));
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      brandId: "",
      categoryId: "",
      isActive: true,
    });
    setExistingImages([]);
    setNewImages([]);
    setImagesToRemove([]);
    setErrors({});
    onClose();
  };

  if (!product) return null;

  // بناء URL الصورة
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return imagePath.startsWith("/")
      ? `http://localhost:5000${imagePath}`
      : `http://localhost:5000/uploads/${imagePath}`;
  };

  const remainingImages = existingImages.filter((img) => !imagesToRemove.includes(img.id));
  const totalImages = remainingImages.length + newImages.length;

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
          تعديل المنتج
        </MDTypography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* اسم المنتج */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="اسم المنتج *"
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

            {/* الماركة - Dropdown محسّن */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.brandId}>
                <InputLabel
                  sx={{
                    color: darkMode ? "text.main" : "text.primary",
                    "&.Mui-focused": {
                      color: darkMode ? "primary.main" : "primary.main",
                    },
                  }}
                >
                  الماركة *
                </InputLabel>
                <Select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  label="الماركة *"
                  disabled={loading}
                  sx={{
                    height: "42px",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                    },
                  }}
                >
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id} sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={brand.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ borderRadius: "8px" }}
                        />
                        {brand.country && (
                          <Typography variant="caption" color="text.secondary">
                            ({brand.country})
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.brandId && (
                  <MDTypography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    {errors.brandId}
                  </MDTypography>
                )}
              </FormControl>
            </Grid>

            {/* التصنيف - Dropdown محسّن */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel
                  sx={{
                    color: darkMode ? "text.main" : "text.primary",
                    "&.Mui-focused": {
                      color: darkMode ? "primary.main" : "primary.main",
                    },
                  }}
                >
                  التصنيف *
                </InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="التصنيف *"
                  disabled={loading}
                  sx={{
                    height: "42px",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id} sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={category.name}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ borderRadius: "8px" }}
                        />
                        {category.parent && (
                          <Typography variant="caption" color="text.secondary">
                            ({category.parent.name})
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <MDTypography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    {errors.categoryId}
                  </MDTypography>
                )}
              </FormControl>
            </Grid>

            {/* الوصف */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="الوصف"
                name="description"
                value={formData.description}
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

            {/* إدارة الصور */}
            <Grid item xs={12}>
              <MDBox>
                <MDTypography variant="h6" color={darkMode ? "white" : "dark"} mb={2}>
                  إدارة صور المنتج ({totalImages}/5)
                </MDTypography>

                {/* زر رفع صور جديدة */}
                <MDButton
                  component="label"
                  variant="outlined"
                  color="info"
                  startIcon={<Icon>add_photo_alternate</Icon>}
                  disabled={loading || totalImages >= 5}
                  sx={{ mb: 2 }}
                >
                  إضافة صور جديدة
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleNewImageUpload}
                  />
                </MDButton>

                <MDTypography variant="caption" color="text" display="block" mb={2}>
                  الصور الحالية: {remainingImages.length} | الصور الجديدة: {newImages.length} |
                  الإجمالي: {totalImages}
                </MDTypography>

                {errors.images && (
                  <MDTypography variant="caption" color="error" display="block" mb={2}>
                    {errors.images}
                  </MDTypography>
                )}

                {/* الصور الحالية */}
                {existingImages.length > 0 && (
                  <MDBox mb={3}>
                    <MDTypography variant="h6" color={darkMode ? "white" : "dark"} mb={1}>
                      الصور الحالية
                    </MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={2}>
                      {existingImages.map((image) => {
                        const isRemoved = imagesToRemove.includes(image.id);
                        return (
                          <MDBox
                            key={image.id}
                            position="relative"
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: `2px solid ${
                                isRemoved
                                  ? "error.main"
                                  : darkMode
                                  ? "rgba(255,255,255,0.1)"
                                  : "rgba(0,0,0,0.1)"
                              }`,
                              opacity: isRemoved ? 0.6 : 1,
                            }}
                          >
                            <img
                              src={getImageUrl(image.path)}
                              alt={`صورة ${image.id}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                isRemoved ? restoreImage(image.id) : removeExistingImage(image.id)
                              }
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                backgroundColor: isRemoved ? "success.main" : "rgba(244,67,54,0.8)",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: isRemoved ? "success.dark" : "error.main",
                                },
                                width: 24,
                                height: 24,
                              }}
                            >
                              <Icon fontSize="small">{isRemoved ? "replay" : "delete"}</Icon>
                            </IconButton>
                            {image.isPrimary && (
                              <Chip
                                label="رئيسية"
                                size="small"
                                color="success"
                                sx={{
                                  position: "absolute",
                                  bottom: 4,
                                  left: 4,
                                  height: 20,
                                  fontSize: "0.6rem",
                                }}
                              />
                            )}
                            {isRemoved && (
                              <MDBox
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: "rgba(0,0,0,0.5)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography variant="caption" color="white" fontWeight="bold">
                                  محذوفة
                                </Typography>
                              </MDBox>
                            )}
                          </MDBox>
                        );
                      })}
                    </MDBox>
                  </MDBox>
                )}

                {/* الصور الجديدة */}
                {newImages.length > 0 && (
                  <MDBox>
                    <MDTypography variant="h6" color={darkMode ? "white" : "dark"} mb={1}>
                      الصور الجديدة
                    </MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={2}>
                      {newImages.map((image, index) => (
                        <MDBox
                          key={image.id}
                          position="relative"
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: `2px solid ${
                              darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                            }`,
                          }}
                        >
                          <img
                            src={image.preview}
                            alt={`صورة جديدة ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeNewImage(image.id)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              backgroundColor: "rgba(244,67,54,0.8)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "error.main",
                              },
                              width: 24,
                              height: 24,
                            }}
                          >
                            <Icon fontSize="small">close</Icon>
                          </IconButton>
                          <Chip
                            label="جديدة"
                            size="small"
                            color="info"
                            sx={{
                              position: "absolute",
                              bottom: 4,
                              left: 4,
                              height: 20,
                              fontSize: "0.6rem",
                            }}
                          />
                        </MDBox>
                      ))}
                    </MDBox>
                  </MDBox>
                )}
              </MDBox>
            </Grid>

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

EditProductModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  product: PropTypes.object,
  brands: PropTypes.array,
  categories: PropTypes.array,
};

export default EditProductModal;
