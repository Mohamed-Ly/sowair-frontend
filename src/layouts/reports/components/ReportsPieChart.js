// components/ReportsPieChart.js
import React from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = [
  "rgba(33, 150, 243, 0.85)", // PENDING
  "rgba(255, 193, 7, 0.85)", // CONFIRMED
  "rgba(156, 39, 176, 0.85)", // SHIPPING
  "rgba(76, 175, 80, 0.85)", // DELIVERED
  "rgba(244, 67, 54, 0.85)", // CANCELLED
];

const STATUS_LABELS = {
  PENDING: "قيد المراجعة",
  CONFIRMED: "مؤكد",
  SHIPPING: "قيد الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

function ReportsPieChart({ data, loading, title }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const labels = Object.keys(data || {}).map((s) => STATUS_LABELS[s] || s);
  const values = Object.keys(data || {}).map((s) => data[s]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: STATUS_COLORS,
        borderColor: darkMode ? "rgba(0,0,0,0.4)" : "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        rtl: true,
        labels: {
          color: darkMode ? "#fff" : "#333",
          font: { size: 12, family: "'Cairo', 'Arial', sans-serif" },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        rtl: true,
        backgroundColor: darkMode ? "rgba(33, 33, 33, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: darkMode ? "#fff" : "#333",
        bodyColor: darkMode ? "#fff" : "#333",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <Card>
      <MDBox
        mx={2}
        mt={-3}
        py={2}
        px={2}
        variant="gradient"
        bgColor="info"
        borderRadius="lg"
        coloredShadow="info"
      >
        <MDTypography variant="h6" color="white" fontWeight="bold" textAlign="center">
          {title}
        </MDTypography>
      </MDBox>
      <MDBox
        p={2}
        sx={{
          height: 320,
          direction: "ltr",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <MDTypography variant="body2" color={darkMode ? "text.secondary" : "text.primary"}>
            جاري تحميل البيانات...
          </MDTypography>
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </MDBox>
    </Card>
  );
}

ReportsPieChart.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool,
  title: PropTypes.string,
};

ReportsPieChart.defaultProps = {
  data: {},
  loading: false,
  title: "",
};

export default ReportsPieChart;
