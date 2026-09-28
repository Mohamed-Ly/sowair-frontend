import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

/**
 * مودال إضافة/تعديل مدينة.
 * الرسوم ديال التوصيل بالدينار في الواجهة وبالتحويل لقروش وقت الإرسال.
 */
function CityModal({ open, handleClose, handleSave, city, isSaving }) {
  const isEdit = !!city;
  const [form, setForm] = useState({ name: "", code: "", fee: "", isActive: true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        name: city?.name ?? "",
        code: city?.code ?? "",
        fee: city ? (city.deliveryFeeCents / 100).toString() : "",
        isActive: city?.isActive ?? true,
      });
      setErrors({});
    }
  }, [open, city]);

  // Switch بيرسل <input type="checkbox"> مفيهوش value، فـ e.target.value بيبقى
  // دايماً "on" (في الاتجاهين). لازم نقرا e.target.checked للـ checkbox.
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async () => {
    const next = {};
    if (!form.name.trim()) next.name = "اسم المدينة مطلوب";
    // رسوم التوصيل بالدينار — نحوّلها لقروش
    const feeNum = form.fee === "" ? 0 : Number(form.fee);
    if (Number.isNaN(feeNum) || feeNum < 0) {
      next.fee = "أدخل رقماً صحيحاً (0 أو أكثر)";
    }
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    await handleSave({
      name: form.name.trim(),
      code: form.code.trim() || null,
      deliveryFeeCents: Math.round(feeNum * 100),
      isActive: form.isActive,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <MDBox>
        <DialogTitle>
          <MDBox fontSize="large" fontWeight="bold" textTransform="capitalize">
            {isEdit ? "تعديل المدينة" : "إضافة مدينة جديدة"}
          </MDBox>
        </DialogTitle>
        <MDBox pt={1} px={3}>
          <MDBox component="form" role="form">
            <MDBox>
              <MDBox mb={2}>
                <TextField
                  name="name"
                  label="اسم المدينة"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  autoFocus
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  name="code"
                  label="الكود (اختياري)"
                  value={form.code}
                  onChange={handleChange}
                  fullWidth
                  placeholder="TRI"
                  helperText="حروف إنجليزية قصيرة — مفيد للربط مع خدمات أخرى لاحقاً"
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  name="fee"
                  label="رسوم التوصيل للمدينة"
                  value={form.fee}
                  onChange={handleChange}
                  error={!!errors.fee}
                  helperText={errors.fee || "المنطقة تقدر تعمل لها سعر مختلف"}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">د.ل</InputAdornment>,
                  }}
                  fullWidth
                />
              </MDBox>
              <MDBox>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      color="success"
                    />
                  }
                  label={
                    <MDBox fontSize="small" fontWeight="medium">
                      مفعّلة — تظهر للعميل في قائمة التوصيل
                    </MDBox>
                  }
                />
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
        <MDBox p={2}>
          <MDBox display="flex" justifyContent="flex-end">
            <MDBox>
              <MDButton
                variant="gradient"
                color="light"
                onClick={handleClose}
                sx={{ ml: 1 }}
                disabled={isSaving}
              >
                إلغاء
              </MDButton>
              <MDButton variant="gradient" color="info" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? "جاري الحفظ..." : isEdit ? "تحديث" : "إضافة"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </Dialog>
  );
}

CityModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  city: PropTypes.object,
  isSaving: PropTypes.bool,
};

export default CityModal;
