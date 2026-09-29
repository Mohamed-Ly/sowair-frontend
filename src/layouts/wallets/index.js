import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";

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

// API
import walletApi from "./services/walletApi";

// Components
import SettleModal from "./components/SettleModal";
import AdjustModal from "./components/AdjustModal";
import TransactionsModal from "./components/TransactionsModal";

function formatMoney(cents) {
  return (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-LY");
}

function Wallets() {
  const [controller, dispatch] = useMaterialUIController();
  const { darkMode } = controller;

  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);

  useEffect(() => {
    setDirection(dispatch, "rtl");
    return () => setDirection(dispatch, "ltr");
  }, [dispatch]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await walletApi.getAdminWallets();
      const data = res.data?.data || res.data;
      setWallets(data?.wallets || []);
    } catch (error) {
      console.error("❌ Error fetching wallets:", error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const openSettle = (courier) => {
    setSelectedCourier(courier);
    setSettleModalOpen(true);
  };

  const openAdjust = (courier) => {
    setSelectedCourier(courier);
    setAdjustModalOpen(true);
  };

  const openTransactions = (courier) => {
    setSelectedCourier(courier);
    setTransactionsModalOpen(true);
  };

  const handleSettle = async (data) => {
    await walletApi.settleWallet(selectedCourier.courierId, data);
    await fetchWallets();
    showMessage(`تم تحصيل ${formatMoney(data.amountCents)} د.ل من عهدة ${selectedCourier.name}`);
  };

  const handleAdjust = async (data) => {
    await walletApi.adjustWallet(selectedCourier.courierId, data);
    await fetchWallets();
    showMessage(
      data.direction === "REMOVE"
        ? `تم خصم ${formatMoney(data.amountCents)} د.ل من ${selectedCourier.name}`
        : `تمت إضافة ${formatMoney(data.amountCents)} د.ل لـ ${selectedCourier.name}`
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white" sx={{ fontWeight: "bold" }}>
                  إدارة المندوبين والمحافظ
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color={darkMode ? "light" : "dark"}
                  onClick={fetchWallets}
                  startIcon={<Icon>refresh</Icon>}
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: "bold" }}
                >
                  تحديث البيانات
                </MDButton>
              </MDBox>

              {message && (
                <MDBox pt={3} px={3}>
                  <Collapse in={!!message}>
                    <Alert severity="success" onClose={() => setMessage("")}>
                      {message}
                    </Alert>
                  </Collapse>
                </MDBox>
              )}

              <MDBox pt={1} pb={2}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      جاري تحميل البيانات...
                    </MDTypography>
                  </MDBox>
                ) : wallets.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      لا يوجد مندوبون
                    </MDTypography>
                  </MDBox>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{
                            backgroundColor: darkMode
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.02)",
                            borderBottom: "2px solid",
                            borderBottomColor: darkMode
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.1)",
                          }}
                        >
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            المندوب
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            الهاتف
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            تسليمات
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            منتجات مسلّمة
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            المحصّل (د.ل)
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            مسلَّم للمتجر
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            العهدة المتبقية (د.ل)
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            آخر تسليم
                          </TableCell>
                          <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                            الإجراءات
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {wallets.map((w, index) => (
                          <TableRow
                            key={w.courierId}
                            sx={{
                              backgroundColor:
                                index % 2 === 0
                                  ? darkMode
                                    ? "rgba(255,255,255,0.02)"
                                    : "rgba(0,0,0,0.01)"
                                  : "transparent",
                              "&:hover": {
                                backgroundColor: darkMode
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)",
                              },
                            }}
                          >
                            <TableCell style={{ textAlign: "center" }}>
                              <MDTypography variant="button" fontWeight="bold">
                                {w.name}
                              </MDTypography>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDTypography variant="button">{w.phone || "-"}</MDTypography>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDTypography variant="button">{w.deliveries || 0}</MDTypography>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDTypography variant="button">
                                {w.deliveredProducts || 0}
                              </MDTypography>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDTypography variant="button">
                                {formatMoney(w.collectedCents || 0)}
                              </MDTypography>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDTypography variant="button">
                                {formatMoney(Math.abs(w.wallet?.settledCents || 0))}
                              </MDTypography>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDBox
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: "6px",
                                  backgroundColor:
                                    (w.wallet?.balanceCents || 0) > 0
                                      ? darkMode
                                        ? "rgba(76, 175, 80, 0.15)"
                                        : "rgba(76, 175, 80, 0.1)"
                                      : darkMode
                                      ? "rgba(158,158,158,0.15)"
                                      : "rgba(158,158,158,0.1)",
                                }}
                              >
                                <MDTypography
                                  variant="button"
                                  fontWeight="bold"
                                  color={(w.wallet?.balanceCents || 0) > 0 ? "success" : "text"}
                                >
                                  {formatMoney(w.wallet?.balanceCents || 0)}
                                </MDTypography>
                              </MDBox>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDTypography variant="caption" color="text">
                                {formatDate(w.lastSettledAt)}
                              </MDTypography>
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <MDBox display="flex" gap={0.5} justifyContent="center">
                                <Tooltip title="سجل الحركات">
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => openTransactions(w)}
                                  >
                                    <Icon fontSize="small">history</Icon>
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="تحصيل عهدة">
                                  <span>
                                    <IconButton
                                      color="success"
                                      size="small"
                                      disabled={(w.wallet?.balanceCents || 0) <= 0}
                                      onClick={() => openSettle(w)}
                                    >
                                      <Icon fontSize="small">paid</Icon>
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="تصحيح يدوي">
                                  <IconButton
                                    color="warning"
                                    size="small"
                                    onClick={() => openAdjust(w)}
                                  >
                                    <Icon fontSize="small">tune</Icon>
                                  </IconButton>
                                </Tooltip>
                              </MDBox>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <SettleModal
        open={settleModalOpen}
        onClose={() => {
          setSettleModalOpen(false);
          setSelectedCourier(null);
        }}
        onSubmit={handleSettle}
        courier={selectedCourier}
      />

      <AdjustModal
        open={adjustModalOpen}
        onClose={() => {
          setAdjustModalOpen(false);
          setSelectedCourier(null);
        }}
        onSubmit={handleAdjust}
        courier={selectedCourier}
      />

      <TransactionsModal
        open={transactionsModalOpen}
        onClose={() => {
          setTransactionsModalOpen(false);
          setSelectedCourier(null);
        }}
        courier={selectedCourier}
      />
    </DashboardLayout>
  );
}

export default Wallets;
