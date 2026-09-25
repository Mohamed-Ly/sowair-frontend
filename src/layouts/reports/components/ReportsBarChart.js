// components/ReportsBarChart.js
import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ReportsBarChart({ labels, datasets, loading, title, ySuffix = "" }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const chartData = {
    labels: labels || [],
    datasets: (datasets || []).map((ds, i) => ({
      label: ds.label,
      data: ds.data || [],
      backgroundColor: darkMode
        ? ["rgba(33, 150, 243, 0.7)", "rgba(76, 175, 80, 0.7)"][i % 2]
        : ["rgba(33, 150, 243, 0.8)", "rgba(76, 175, 80, 0.8)"][i % 2],
      borderColor: ["rgba(33, 150, 243, 1)", "rgba(76, 175, 80, 1)"][i % 2],
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        rtl: true,
        labels: {
          color: darkMode ? "#fff" : "#333",
          font: { size: 12, family: "'Cairo', 'Arial', sans-serif" },
          padding: 20,
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
    scales: {
      x: {
        ticks: {
          color: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
          font: { size: 11, family: "'Cairo', 'Arial', sans-serif" },
          maxRotation: 60,
          minRotation: 0,
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        border: {
          color: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
          font: { size: 11, family: "'Cairo', 'Arial', sans-serif" },
          callback(value) {
            return value.toLocaleString() + ySuffix;
          },
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        border: {
          color: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    interaction: { intersect: false, mode: "index" },
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
        }}
      >
        {loading ? (
          <MDBox display="flex" alignItems="center" justifyContent="center" height="100%">
            <MDTypography variant="body2" color={darkMode ? "text.secondary" : "text.primary"}>
              جاري تحميل البيانات...
            </MDTypography>
          </MDBox>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </MDBox>
    </Card>
  );
}

ReportsBarChart.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string),
  datasets: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      data: PropTypes.arrayOf(PropTypes.number),
    })
  ),
  loading: PropTypes.bool,
  title: PropTypes.string,
  ySuffix: PropTypes.string,
};

ReportsBarChart.defaultProps = {
  labels: [],
  datasets: [],
  loading: false,
  title: "",
  ySuffix: "",
};

export default ReportsBarChart;
