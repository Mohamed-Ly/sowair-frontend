/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
* صفحة الأرباح وقيمة المخزون
=========================================================
*/

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AppBar from "@mui/material/AppBar";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Context
import { useMaterialUIController, setDirection } from "context";

// API
import profitabilityApi from "./services/profitabilityApi";

function formatMoney(cents) {
  if (cents === null || cents === undefined) return "—";
  return (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getInitialRange() {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - 29);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(today) };
}

// بطاقة رقم — نفس نمط كروت الإحصائيات في صفحة التقارير
function StatBox({ title, value, icon, color, sub }) {
  return (
    <Card>
      <MDBox
        mx={2}
        mt={-3}
        py={2}
        px={2}
        variant="gradient"
        bgColor={color}
        borderRadius="lg"
        coloredShadow={color}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon fontSize="large" color="white">
          {icon}
        </Icon>
      </MDBox>
      <MDBox pt={2} pb={3} px={2} textAlign="center">
        <MDTypography variant="h4" fontWeight="bold">
          {value}
        </MDTypography>
        <MDTypography variant="body2" fontWeight="medium" color="text" sx={{ opacity: 0.7 }}>
          {title}
        </MDTypography>
        {sub && (
          <MDTypography variant="caption" color="text" display="block" sx={{ opacity: 0.6 }}>
            {sub}
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

StatBox.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
  sub: PropTypes.string,
};

function Profitability() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const initial = getInitialRange();
  const [tab, setTab] = useState(0);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [loading, setLoading] = useState(true);

  const [profit, setProfit] = useState(null);
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    setDirection(dispatch, "rtl");
    return () => setDirection(dispatch, "ltr");
  }, [dispatch]);

  const fetchProfit = async () => {
    setLoading(true);
    try {
      const res = await profitabilityApi.getProfit({ from, to, limit: 100 });
      setProfit(res.data?.data?.report || null);
    } catch (error) {
      console.error("Failed to fetch profit report:", error);
      setProfit(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await profitabilityApi.getInventoryValue();
      setInventory(res.data?.data?.report || null);
    } catch (error) {
      console.error("Failed to fetch inventory value:", error);
      setInventory(null);
    } finally {
      setLoading(false);
    }
  };

  // نحمّل التقريرين مرة واحدة — الفلتر بالتاريخ affects الأرباح فقط
  useEffect(() => {
    fetchProfit();
  }, [from, to]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const t = profit?.totals;
  const inv = inventory?.totals;

  // نسبة التغطية: كم من المبيعات ربحها معروف
  const coveragePercent =
    t && t.revenueCents > 0
      ? Number((((t.revenueCents - t.unknownRevenueCents) / t.revenueCents) * 100).toFixed(1))
      : 0;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* التابات */}
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={2}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
              >
                <MDTypography variant="h6" color="white" fontWeight="bold">
                  الأرباح والمخزون
                </MDTypography>
              </MDBox>
              <MDBox p={2}>
                <AppBar position="static" color="transparent">
                  <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    variant="fullWidth"
                    sx={{
                      "& .MuiTab-root": {
                        color: darkMode ? "#fff" : "text.primary",
                        fontWeight: "bold",
                      },
                      "& .Mui-selected": {
                        color: darkMode ? "#fff" : "primary.main !important",
                      },
                    }}
                  >
                    <Tab label="صافي الربح" icon={<Icon fontSize="small">trending_up</Icon>} />
                    <Tab label="قيمة المخزون" icon={<Icon fontSize="small">inventory</Icon>} />
                  </Tabs>
                </AppBar>
              </MDBox>
            </Card>
          </Grid>

          {/* ============ تاب صافي الربح ============ */}
          {tab === 0 && (
            <>
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      الفترة
                    </MDTypography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="من تاريخ"
                          type="date"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="إلى تاريخ"
                          type="date"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>

              {loading && !profit && (
                <Grid item xs={12}>
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      جاري التحميل...
                    </MDTypography>
                  </MDBox>
                </Grid>
              )}

              {t && (
                <>
                  {/* تحذير التكلفة الناقصة — أهم شيء في الصفحة */}
                  {t.isPartial && (
                    <Grid item xs={12}>
                      <Card>
                        <MDBox
                          p={2}
                          mx={2}
                          my={1}
                          display="flex"
                          alignItems="center"
                          sx={{
                            borderRadius: "10px",
                            backgroundColor: darkMode
                              ? "rgba(237, 108, 2, 0.12)"
                              : "rgba(237, 108, 2, 0.08)",
                            border: "1px solid",
                            borderColor: darkMode
                              ? "rgba(237, 108, 2, 0.35)"
                              : "rgba(237, 108, 2, 0.25)",
                          }}
                        >
                          <Icon sx={{ color: "warning.main", mr: 1.5 }}>warning</Icon>
                          <MDBox>
                            <MDTypography
                              variant="button"
                              color="warning"
                              fontWeight="bold"
                              display="block"
                            >
                              الأرقام دي ناقصة مش كاملة
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              color={darkMode ? "text.main" : "text.secondary"}
                              display="block"
                            >
                              {t.unknownCostItems} من بنود الطلبات ما عندهاش سعر شراء مسجل، منها{" "}
                              {formatMoney(t.unknownRevenueCents)} د.ل مبيعات (
                              {t.unknownRevenuePercent}%). الأدمن يقدر يدخل سعر الشراء من صفحة
                              المتغيرات عشان الأرقام تكتمل.
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </Card>
                    </Grid>
                  )}

                  <Grid item xs={12} md={4}>
                    <StatBox
                      title="إجمالي المبيعات (صافي بعد الخصم)"
                      value={`${formatMoney(t.revenueCents)} د.ل`}
                      icon="payments"
                      color="info"
                      sub="على الطلبات المسلّمة فقط"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StatBox
                      title="تكلفة البضاعة المباعة"
                      value={`${formatMoney(t.costCents)} د.ل`}
                      icon="inventory"
                      color="secondary"
                      sub={t.isPartial ? "ناقصة — مش كل المنتجات" : "كاملة"}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StatBox
                      title="صافي الربح"
                      value={`${formatMoney(t.profitCents)} د.ل`}
                      icon="trending_up"
                      color="success"
                      sub={`هامش الربح ${t.marginPercent}%`}
                    />
                  </Grid>

                  {/* حسب المنتج */}
                  <Grid item xs={12} mt={3}>
                    <Card>
                      <MDBox p={3} pb={1}>
                        <MDTypography variant="h6" fontWeight="medium">
                          الأرباح حسب المنتج
                        </MDTypography>
                      </MDBox>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>المنتج</TableCell>
                              <TableCell>المتغير</TableCell>
                              <TableCell align="center">الكمية</TableCell>
                              <TableCell align="center">المبيعات</TableCell>
                              <TableCell align="center">التكلفة</TableCell>
                              <TableCell align="center">الربح</TableCell>
                              <TableCell align="center">الهامش</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(profit.products || []).map((p, i) => (
                              <TableRow key={`${p.productId}-${i}`}>
                                <TableCell>
                                  <MDTypography variant="button" fontWeight="medium">
                                    {p.name}
                                  </MDTypography>
                                </TableCell>
                                <TableCell>
                                  <MDTypography variant="caption" color="text">
                                    {p.variant}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">{p.qty}</TableCell>
                                <TableCell align="center">{formatMoney(p.revenueCents)}</TableCell>
                                <TableCell align="center">
                                  {p.unknownCostItems > 0 ? (
                                    <MDTypography variant="caption" color="warning">
                                      ناقص
                                    </MDTypography>
                                  ) : (
                                    formatMoney(p.costCents)
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <MDTypography
                                    variant="button"
                                    fontWeight="bold"
                                    color={p.profitCents >= 0 ? "success" : "error"}
                                  >
                                    {formatMoney(p.profitCents)}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">
                                  <MDTypography variant="caption" color="text">
                                    {p.marginPercent}%
                                  </MDTypography>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(profit.products || []).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={7} align="center">
                                  <MDTypography variant="button" color="text">
                                    لا توجد مبيعات مسلّمة في هذه الفترة
                                  </MDTypography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>

                  {/* حسب المورد */}
                  <Grid item xs={12} mt={3}>
                    <Card>
                      <MDBox p={3} pb={1}>
                        <MDTypography variant="h6" fontWeight="medium">
                          الأرباح حسب المورد
                        </MDTypography>
                      </MDBox>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>المورد</TableCell>
                              <TableCell align="center">الكمية المباعة</TableCell>
                              <TableCell align="center">المبيعات</TableCell>
                              <TableCell align="center">التكلفة</TableCell>
                              <TableCell align="center">الربح</TableCell>
                              <TableCell align="center">الهامش</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(profit.suppliers || []).map((s) => (
                              <TableRow key={s.supplierId ?? "none"}>
                                <TableCell>
                                  <MDTypography variant="button" fontWeight="medium">
                                    {s.supplierName}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">{s.qty}</TableCell>
                                <TableCell align="center">{formatMoney(s.revenueCents)}</TableCell>
                                <TableCell align="center">
                                  {s.unknownCostItems > 0 ? (
                                    <MDTypography variant="caption" color="warning">
                                      ناقص
                                    </MDTypography>
                                  ) : (
                                    formatMoney(s.costCents)
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <MDTypography
                                    variant="button"
                                    fontWeight="bold"
                                    color={s.profitCents >= 0 ? "success" : "error"}
                                  >
                                    {formatMoney(s.profitCents)}
                                  </MDTypography>
                                </TableCell>
                                <TableCell align="center">
                                  <MDTypography variant="caption" color="text">
                                    {s.marginPercent}%
                                  </MDTypography>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(profit.suppliers || []).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  <MDTypography variant="button" color="text">
                                    لا توجد بيانات
                                  </MDTypography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>

                  <Grid item xs={12} mt={1}>
                    <MDTypography variant="caption" color="text">
                      الربح محسوب على الطلبات المسلّمة فقط. نسبة التغطية الحالية {coveragePercent}%
                      من المبيعات.
                    </MDTypography>
                  </Grid>
                </>
              )}
            </>
          )}

          {/* ============ تاب قيمة المخزون ============ */}
          {tab === 1 && (
            <>
              {inv && inv.unknownCostVariants > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <MDBox
                      p={2}
                      mx={2}
                      my={1}
                      display="flex"
                      alignItems="center"
                      sx={{
                        borderRadius: "10px",
                        backgroundColor: darkMode
                          ? "rgba(237, 108, 2, 0.12)"
                          : "rgba(237, 108, 2, 0.08)",
                        border: "1px solid",
                        borderColor: darkMode
                          ? "rgba(237, 108, 2, 0.35)"
                          : "rgba(237, 108, 2, 0.25)",
                      }}
                    >
                      <Icon sx={{ color: "warning.main", mr: 1.5 }}>warning</Icon>
                      <MDBox>
                        <MDTypography
                          variant="button"
                          color="warning"
                          fontWeight="bold"
                          display="block"
                        >
                          تكلفة المخزون ناقصة
                        </MDTypography>
                        <MDTypography
                          variant="caption"
                          color={darkMode ? "text.main" : "text.secondary"}
                          display="block"
                        >
                          {inv.unknownCostVariants} متغير ما عندهوش سعر شراء، منها{" "}
                          {formatMoney(inv.unknownRetailValueCents)} د.ل قيمة بيع. الأرقام دي بتعتبر
                          تكلفتها صفر — لازم تتدخل من صفحة المتغيرات.
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12} md={4}>
                <StatBox
                  title="تكلفة المخزون بسعر الشراء"
                  value={`${formatMoney(inv?.costValueCents)} د.ل`}
                  icon="inventory"
                  color="secondary"
                  sub={inv?.isPartial ? "ناقصة" : "كاملة"}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatBox
                  title="قيمة المخزون بسعر البيع"
                  value={`${formatMoney(inv?.retailValueCents)} د.ل`}
                  icon="sell"
                  color="info"
                  sub={`${inv?.variants ?? 0} متغير`}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatBox
                  title="الربح المتوقع لو كله انباع"
                  value={`${formatMoney(inv?.potentialProfitCents)} د.ل`}
                  icon="trending_up"
                  color="success"
                  sub={inv?.isPartial ? "رقم مبالغ فيه" : "تقديري"}
                />
              </Grid>

              <Grid item xs={12} mt={3}>
                <Card>
                  <MDBox p={3} pb={1}>
                    <MDTypography variant="h6" fontWeight="medium">
                      تفاصيل المخزون
                    </MDTypography>
                  </MDBox>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>المنتج</TableCell>
                          <TableCell>المتغير</TableCell>
                          <TableCell>المورد</TableCell>
                          <TableCell align="center">المخزون</TableCell>
                          <TableCell align="center">سعر الشراء</TableCell>
                          <TableCell align="center">قيمة التكلفة</TableCell>
                          <TableCell align="center">قيمة البيع</TableCell>
                          <TableCell align="center">ربح متوقع</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(inventory?.items || []).map((it, i) => (
                          <TableRow key={`${it.productId}-${i}`}>
                            <TableCell>
                              <MDTypography variant="button" fontWeight="medium">
                                {it.name}
                              </MDTypography>
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="caption" color="text">
                                {it.variant}
                              </MDTypography>
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="caption" color="text">
                                {it.supplier}
                              </MDTypography>
                            </TableCell>
                            <TableCell align="center">{it.stockQty}</TableCell>
                            <TableCell align="center">
                              {it.costCents === null ? (
                                <MDTypography variant="caption" color="warning">
                                  غير مسجل
                                </MDTypography>
                              ) : (
                                formatMoney(it.costCents)
                              )}
                            </TableCell>
                            <TableCell align="center">{formatMoney(it.costValueCents)}</TableCell>
                            <TableCell align="center">{formatMoney(it.retailValueCents)}</TableCell>
                            <TableCell align="center">
                              <MDTypography
                                variant="button"
                                fontWeight="bold"
                                color={
                                  it.potentialProfitCents === null
                                    ? "text"
                                    : it.potentialProfitCents >= 0
                                    ? "success"
                                    : "error"
                                }
                              >
                                {it.potentialProfitCents === null
                                  ? "—"
                                  : formatMoney(it.potentialProfitCents)}
                              </MDTypography>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(inventory?.items || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} align="center">
                              <MDTypography variant="button" color="text">
                                لا يوجد مخزون
                              </MDTypography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Profitability;
