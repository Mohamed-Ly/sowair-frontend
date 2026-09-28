/**
 =========================================================
 * Material Dashboard 2 React - v2.2.0
 =========================================================
 */

import { useState, useEffect, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Context
import { useMaterialUIController, setDirection } from "context";

// API services
import locationApi from "./services/locationApi";

// Components
import CityModal from "./components/CityModal";
import AreaModal from "./components/AreaModal";

const toDinar = (cents) => (cents ?? 0) / 100;

function Locations() {
  const [controller, dispatch] = useMaterialUIController();
  // الـ state فيه direction مش rtl
  const rtl = controller.direction === "rtl";

  // Set RTL direction
  useEffect(() => {
    setDirection(dispatch, "rtl");
    return () => setDirection(dispatch, "ltr");
  }, [dispatch]);

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  // مودالات
  const [cityModal, setCityModal] = useState({ open: false, city: null });
  const [areaModal, setAreaModal] = useState({ open: false, area: null, cityId: null });

  const loadCities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await locationApi.getCities({ limit: 200 });
      const items = data?.data?.items ?? [];
      setCities(items);
      // افتح أول مدينة تلقائياً
      setExpanded((prev) => {
        const keys = Object.keys(prev);
        if (keys.length) return prev;
        return items.length ? { [items[0].id]: true } : {};
      });
    } catch (err) {
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const notify = (msg, color = "success") => {
    if (window.MD_Notification) {
      window.MD_Notification.show({ message: msg, color, position: "top", time: 3000 });
    }
  };

  // استخراج رسالة حقيقية من خطأ السيرفر.
  // الـ 422 بيرجع { message, errors: { field: msg } } — message هنا نص، بس
  // لو errors موجودين فبيدفعونا نشوف أول خطأ حقل بدل "فشل التحقق" العام.
  const errorMessage = (err, fallback) => {
    const data = err?.response?.data?.data;
    const fieldErrors = data?.errors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const first = Object.values(fieldErrors)[0];
      if (typeof first === "string" && first) return first;
    }
    if (typeof data?.message === "string" && data.message) return data.message;
    if (typeof err?.response?.data?.message === "string") return err.response.data.message;
    return fallback;
  };

  // ============ حفظ مدينة ============
  const handleSaveCity = async (payload) => {
    setSaving(true);
    try {
      if (cityModal.city) {
        await locationApi.updateCity(cityModal.city.id, payload);
        notify("تم تحديث المدينة");
      } else {
        await locationApi.createCity(payload);
        notify("تمت إضافة المدينة");
      }
      setCityModal({ open: false, city: null });
      await loadCities();
    } catch (err) {
      notify(errorMessage(err, "فشل حفظ المدينة"), "error");
    } finally {
      setSaving(false);
    }
  };

  // ============ حفظ منطقة ============
  const handleSaveArea = async (payload) => {
    setSaving(true);
    try {
      if (areaModal.area) {
        await locationApi.updateArea(areaModal.area.id, payload);
        notify("تم تحديث المنطقة");
      } else {
        await locationApi.createArea(payload);
        notify("تمت إضافة المنطقة");
      }
      setAreaModal({ open: false, area: null, cityId: null });
      await loadCities();
    } catch (err) {
      notify(errorMessage(err, "فشل حفظ المنطقة"), "error");
    } finally {
      setSaving(false);
    }
  };

  // ============ حذف ============
  const handleDeleteCity = async (city) => {
    const hasOrders = city._count?.orders > 0;
    if (hasOrders) {
      notify(`ما ينفعش تحذف «${city.name}» — فيها طلبات. غيّرها لـ"غير مفعّلة"`, "warning");
      return;
    }
    if (
      !window.confirm(
        `متأكد من حذف «${city.name}»؟\n` + `كل مناطقها (${city._count?.areas ?? 0}) بتمسح معاها.`
      )
    ) {
      return;
    }
    try {
      await locationApi.deleteCity(city.id);
      notify("تم حذف المدينة");
      await loadCities();
    } catch (err) {
      notify(err?.response?.data?.data?.message || "فشل الحذف", "error");
    }
  };

  const handleDeleteArea = async (area) => {
    if (area._count?.orders > 0) {
      notify(`ما ينفعش تحذف «${area.name}» — فيها طلبات. غيّرها لـ"غير مفعّلة"`, "warning");
      return;
    }
    if (!window.confirm(`متأكد من حذف المنطقة «${area.name}»؟`)) return;
    try {
      await locationApi.deleteArea(area.id);
      notify("تم حذف المنطقة");
      await loadCities();
    } catch (err) {
      notify(err?.response?.data?.data?.message || "فشل الحذف", "error");
    }
  };

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = cities.filter((c) => c.name.includes(search.trim()));

  return (
    <DashboardLayout position="s1">
      <DashboardNavbar />
      <MDBox pt={3} px={3} mb={3}>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={3}
        >
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">
              المدن والمناطق
            </MDTypography>
            <MDTypography variant="body2" color="text">
              القوائم اللي بيختار منها العميل المدينة والمنطقة وقت الطلب
            </MDTypography>
          </MDBox>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => setCityModal({ open: true, city: null })}
          >
            <MDBox fontSize="small" textTransform="capitalize">
              إضافة مدينة
            </MDBox>
          </MDButton>
        </MDBox>

        <MDBox mb={3}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دوّر على مدينة..."
            sx={{ maxWidth: 420 }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon>search</Icon>
                </InputAdornment>
              ),
            }}
          />
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" py={6}>
            <CircularProgress color="info" />
          </MDBox>
        ) : filtered.length === 0 ? (
          <Card>
            <MDBox py={6} px={3} textAlign="center">
              <Icon fontSize="large" color="secondary">
                location_on
              </Icon>
              <MDTypography variant="h6" mt={1}>
                {search ? "ما لقيناش مدينة بهذا الاسم" : "لا توجد مدن حاليا"}
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={1} mb={2}>
                {search ? "جرّب كلمة أخرى" : "ابدأ بإضافة أول مدينة، وبعدها ضيف مناطق ليها"}
              </MDTypography>
              {!search && (
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={() => setCityModal({ open: true, city: null })}
                >
                  إضافة مدينة
                </MDButton>
              )}
            </MDBox>
          </Card>
        ) : (
          <MDBox>
            {filtered.map((city) => {
              const isOpen = !!expanded[city.id];
              const areas = city.areas ?? [];
              return (
                <Card key={city.id} sx={{ mb: 2 }}>
                  <MDBox p={2}>
                    <MDBox
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                    >
                      <MDBox
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ cursor: "pointer", flex: 1, minWidth: 0 }}
                        onClick={() => toggle(city.id)}
                      >
                        <Icon
                          fontSize="small"
                          color="secondary"
                          sx={{
                            transition: "transform .2s",
                            transform: isOpen ? "rotate(90deg)" : "none",
                          }}
                        >
                          {rtl ? "chevron_left" : "chevron_right"}
                        </Icon>
                        <MDBox minWidth={0}>
                          <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <MDTypography variant="h6" fontWeight="bold" textTransform="none">
                              {city.name}
                            </MDTypography>
                            {city.code && (
                              <Chip
                                label={city.code}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            )}
                            <Chip
                              label={city.isActive ? "مفعّلة" : "موقوفة"}
                              size="small"
                              color={city.isActive ? "success" : "default"}
                            />
                          </MDBox>
                          <MDTypography variant="caption" color="text">
                            {toDinar(city.deliveryFeeCents)} د.ل · {areas.length} منطقة ·{" "}
                            {city._count?.orders ?? 0} طلب
                          </MDTypography>
                        </MDBox>
                      </MDBox>

                      <MDBox display="flex" alignItems="center" gap={0.5}>
                        <Tooltip title="ضفف منطقة">
                          <IconButton
                            onClick={() =>
                              setAreaModal({ open: true, area: null, cityId: city.id })
                            }
                          >
                            <Icon fontSize="small">add_location_alt</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل المدينة">
                          <IconButton onClick={() => setCityModal({ open: true, city })}>
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف المدينة">
                          <IconButton onClick={() => handleDeleteCity(city)}>
                            <Icon fontSize="small" color="error">
                              delete
                            </Icon>
                          </IconButton>
                        </Tooltip>
                      </MDBox>
                    </MDBox>
                  </MDBox>

                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Divider />
                    <MDBox p={2} bgColor="grey-100">
                      {areas.length === 0 ? (
                        <MDBox textAlign="center" py={2}>
                          <MDTypography variant="body2" color="text" mb={1}>
                            ما كايناش مناطق في {city.name} — العميل ما يقدرش يختار
                          </MDTypography>
                          <MDButton
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() =>
                              setAreaModal({ open: true, area: null, cityId: city.id })
                            }
                          >
                            ضيف أول منطقة
                          </MDButton>
                        </MDBox>
                      ) : (
                        areas.map((area) => (
                          <MDBox
                            key={area.id}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            p={1.5}
                            mb={1}
                            bgColor="white"
                            borderRadius="lg"
                          >
                            <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <MDTypography variant="button" fontWeight="medium" color="text">
                                {area.name}
                              </MDTypography>
                              {!area.isActive && (
                                <Chip label="موقوفة" size="small" color="default" />
                              )}
                              <MDTypography variant="caption" color="text">
                                {area.deliveryFeeCents === null
                                  ? `ترث رسوم المدينة (${toDinar(city.deliveryFeeCents)} د.ل)`
                                  : `${toDinar(area.deliveryFeeCents)} د.ل`}
                              </MDTypography>
                            </MDBox>
                            <MDBox display="flex" alignItems="center" gap={0.5}>
                              <Tooltip title="تعديل المنطقة">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setAreaModal({ open: true, area, cityId: city.id })
                                  }
                                >
                                  <Icon fontSize="small">edit</Icon>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="حذف المنطقة">
                                <IconButton size="small" onClick={() => handleDeleteArea(area)}>
                                  <Icon fontSize="small" color="error">
                                    delete
                                  </Icon>
                                </IconButton>
                              </Tooltip>
                            </MDBox>
                          </MDBox>
                        ))
                      )}
                    </MDBox>
                  </Collapse>
                </Card>
              );
            })}
          </MDBox>
        )}

        {/* <Grid container spacing={3} mt={1}>
          <Grid item xs={12} lg={4}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" fontWeight="bold" mb={1}>
                  ليه snapshot؟
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={1}>
                  الطلب بيخزّن اسم المدينة والمنطقة مع الأرقام. لو غيّرت اسم منطقة بعدين، الطلبات
                  القديمة بتقرا بالاسم القديم — تاريخك ما بيتبدّلش.
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" fontWeight="bold" mb={1}>
                  ليه «غير مفعّلة» بدل الحذف؟
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={1}>
                  حطّينا منع للحذف لو في طلبات — لأن الحذف بيمسح تاريخ. إلا مفعّلتها، هي مخفية على
                  العميل بس الطلبات القديمة بتفضل صحيحة.
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" fontWeight="bold" mb={1}>
                  رسوم التوصيل
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={1}>
                  كل مدينة عندها رسوم، والمنطقة تقدر تعيّله. في الـ API:{" "}
                  <code>POST /api/locations/fee</code> بـ <code>{'{ "areaId": 1 }'}</code> عشان تعرف
                  السعر قبل ما العميل يأكد.
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid> */}
      </MDBox>
      <Footer />
      <CityModal
        open={cityModal.open}
        city={cityModal.city}
        handleClose={() => setCityModal({ open: false, city: null })}
        handleSave={handleSaveCity}
        isSaving={saving}
      />
      <AreaModal
        open={areaModal.open}
        area={areaModal.area}
        cities={cities}
        defaultCityId={areaModal.cityId}
        handleClose={() => setAreaModal({ open: false, area: null, cityId: null })}
        handleSave={handleSaveArea}
        isSaving={saving}
      />
    </DashboardLayout>
  );
}

export default Locations;
