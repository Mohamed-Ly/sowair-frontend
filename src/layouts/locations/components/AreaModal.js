import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// مودال إضافة/تعديل منطقة
function AreaModal({ open, handleClose, handleSave, area, cities, defaultCityId, isSaving }) {
  const isEdit = !!area;
  const [form, setForm] = useState({
    name: "",
    cityId: "",
    fee: "",
    isActive: true,
    useCityFee: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        name: area?.name ?? "",
        cityId: area ? String(area.cityId) : defaultCityId ? String(defaultCityId) : "",
        fee:
          area?.deliveryFeeCents !== null && area?.deliveryFeeCents !== undefined
            ? (area.deliveryFeeCents / 100).toString()
            : "",
        isActive: area?.isActive ?? true,
        // المنطقة الجديدة بدون سعر خاص = ترث سعر المدينة
        useCityFee: !area || area.deliveryFeeCents === null || area.deliveryFeeCents === undefined,
      });
      setErrors({});
    }
  }, [open, area, defaultCityId]);

  // نفس حالة المدينة: الـ Switch (isActive + useCityFee) بيرسل checkbox
  // مفيهوش value، فـ e.target.value = "on" دايماً. نقرا checked للـ checkbox.
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async () => {
    const next = {};
    if (!form.name.trim()) next.name = "اسم المنطقة مطلوب";
    if (!form.cityId) next.cityId = "اختر المدينة";

    let feeCents = null;
    if (!form.useCityFee && form.fee !== "") {
      const feeNum = Number(form.fee);
      if (Number.isNaN(feeNum) || feeNum < 0) {
        next.fee = "أدخل رقماً صحيحاً (0 أو أكثر)";
      } else {
        feeCents = Math.round(feeNum * 100);
      }
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    await handleSave({
      name: form.name.trim(),
      cityId: Number(form.cityId),
      // null = ترث رسوم المدينة
      deliveryFeeCents: form.useCityFee ? null : feeCents ?? 0,
      isActive: form.isActive,
    });
  };

  const selectedCity = cities.find((c) => String(c.id) === String(form.cityId));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <MDBox>
        <DialogTitle>
          <MDBox fontSize="large" fontWeight="bold" textTransform="capitalize">
            {isEdit ? "تعديل المنطقة" : "إضافة منطقة جديدة"}
          </MDBox>
        </DialogTitle>
        <MDBox pt={1} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <TextField
                name="name"
                label="اسم المنطقة"
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
                name="cityId"
                select
                label="المدينة"
                value={form.cityId}
                onChange={handleChange}
                error={!!errors.cityId}
                helperText={errors.cityId}
                fullWidth
              >
                {cities.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <FormControlLabel
                control={
                  <Switch
                    name="useCityFee"
                    checked={form.useCityFee}
                    onChange={handleChange}
                    color="info"
                  />
                }
                label={
                  <MDBox fontSize="small" fontWeight="medium">
                    نفس رسوم التوصيل تبع المدينة
                    {selectedCity && (
                      <MDBox component="span" fontSize="caption" color="text" display="block">
                        {selectedCity.name}: {selectedCity.deliveryFeeCents / 100} د.ل
                      </MDBox>
                    )}
                  </MDBox>
                }
              />
            </MDBox>
            {!form.useCityFee && (
              <MDBox mb={2}>
                <TextField
                  name="fee"
                  label="رسوم التوصيل للمنطقة"
                  value={form.fee}
                  onChange={handleChange}
                  error={!!errors.fee}
                  helperText={errors.fee}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">د.ل</InputAdornment>,
                  }}
                  fullWidth
                />
              </MDBox>
            )}
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
                    مفعّلة — تظهر للعميل
                  </MDBox>
                }
              />
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

AreaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  area: PropTypes.object,
  cities: PropTypes.array.isRequired,
  defaultCityId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isSaving: PropTypes.bool,
};

export default AreaModal;
