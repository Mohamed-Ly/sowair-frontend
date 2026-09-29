import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// API
import walletApi from "../services/walletApi";

// Context
import { useMaterialUIController } from "context";

const TYPE_META = {
  EARNING: { label: "عمولة توصيل", icon: "add_circle", color: "success" },
  SETTLEMENT: { label: "صرف رصيد", icon: "remove_circle", color: "error" },
  ADJUSTMENT: { label: "تصحيح يدوي", icon: "tune", color: "warning" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString("ar-LY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionsModal({ open, onClose, courier }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && courier) {
      setLoading(true);
      setError("");
      walletApi
        .getCourierTransactions(courier.courierId)
        .then((res) => {
          const data = res.data?.data || res.data;
          setTransactions(data?.transactions || []);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "حدث خطأ في جلب السجل");
          setTransactions([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, courier]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="medium" color={darkMode ? "white" : "dark"}>
            سجل حركات — {courier?.name || ""}
          </MDTypography>
          <MDButton variant="text" color="dark" onClick={onClose}>
            <Icon>close</Icon>
          </MDButton>
        </MDBox>
        <MDTypography variant="button" color="text">
          الرصيد الحالي: <b>{(courier?.wallet?.balanceCents || 0) / 100} د.ل</b>
        </MDTypography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="h6" color="text">
              جاري تحميل السجل...
            </MDTypography>
          </MDBox>
        ) : error ? (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="h6" color="error">
              {error}
            </MDTypography>
          </MDBox>
        ) : transactions.length === 0 ? (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="h6" color="text">
              لا توجد حركات بعد
            </MDTypography>
          </MDBox>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  }}
                >
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>التاريخ</TableCell>
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>النوع</TableCell>
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>المبلغ</TableCell>
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>المرجع</TableCell>
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                    الطريقة / الملاحظة
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((t) => {
                  const meta = TYPE_META[t.type] || TYPE_META.ADJUSTMENT;
                  const negative = t.amountCents < 0;
                  return (
                    <TableRow key={t.id} hover>
                      <TableCell style={{ textAlign: "center" }}>
                        <MDTypography variant="caption">{formatDate(t.createdAt)}</MDTypography>
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <MDTypography variant="caption" fontWeight="bold">
                          <Icon
                            sx={{
                              fontSize: "1rem",
                              verticalAlign: "middle",
                              mr: 0.5,
                              color: "currentColor",
                            }}
                          >
                            {meta.icon}
                          </Icon>
                          {meta.label}
                        </MDTypography>
                      </TableCell>
                      <TableCell
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: negative ? "#f44336" : "#4caf50",
                        }}
                      >
                        {negative ? "-" : "+"}
                        {Math.round(Math.abs(t.amountCents) / 100)} د.ل
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <MDTypography variant="caption">
                          {t.refType === "ORDER" ? `طلب ${t.orderNumber || t.refId}` : "—"}
                        </MDTypography>
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <MDTypography variant="caption" color="text">
                          {[t.note, t.type === "SETTLEMENT" ? t.method : null]
                            .filter(Boolean)
                            .join(" — ") || "—"}
                        </MDTypography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}

TransactionsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  courier: PropTypes.object,
};

export default TransactionsModal;
