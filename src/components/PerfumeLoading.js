import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const PerfumeLoadingElegant = () => {
  const primaryColor = "#5f0b28";

  const productBoxes = [
    { bg: "linear-gradient(135deg, #d9a441 0%, #b8860b 100%)", delay: "0s" },
    { bg: "linear-gradient(135deg, #a33c5e 0%, #5f0b28 100%)", delay: "0.35s" },
    { bg: "linear-gradient(135deg, #4a9e7f 0%, #1f6b4f 100%)", delay: "0.7s" },
  ];

  const sparkles = [
    { top: "-26px", left: "2px", size: "8px", delay: "0s" },
    { top: "-40px", left: "58px", size: "6px", delay: "0.6s" },
    { top: "-14px", left: "108px", size: "7px", delay: "1.1s" },
    { top: "34px", left: "122px", size: "5px", delay: "0.3s" },
  ];

  return (
    <MDBox
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 9999,
        backdropFilter: "blur(2px)",
      }}
    >
      <MDBox
        sx={{
          position: "relative",
          width: "140px",
          height: "150px",
          animation: "elegantFloat 2.5s ease-in-out infinite",
          "@keyframes elegantFloat": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-16px)" },
          },
        }}
      >
        <MDBox
          sx={{
            "@keyframes sparklePulse": {
              "0%, 100%": { opacity: 0, transform: "scale(0.5)" },
              "50%": { opacity: 0.9, transform: "scale(1.1)" },
            },
          }}
        />
        {sparkles.map((s, index) => (
          <MDBox
            key={index}
            sx={{
              position: "absolute",
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              backgroundColor: primaryColor,
              borderRadius: "50%",
              opacity: 0,
              animation: `sparklePulse 2s ease-in-out infinite ${s.delay}`,
            }}
          />
        ))}

        <MDBox
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "46px",
            height: "34px",
            border: "5px solid",
            borderBottom: "none",
            borderColor: primaryColor,
            borderRadius: "24px 24px 0 0",
          }}
        />

        <MDBox
          sx={{
            position: "absolute",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "flex-end",
            gap: "9px",
            "@keyframes productPop": {
              "0%, 100%": { transform: "translateY(0) scale(1)" },
              "50%": { transform: "translateY(-10px) scale(1.06)" },
            },
          }}
        >
          {productBoxes.map((box, index) => (
            <MDBox key={index} sx={{ position: "relative" }}>
              <MDBox
                sx={{
                  position: "absolute",
                  top: "-7px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "18px",
                  height: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  borderRadius: "3px",
                  animation: `productPop 2.2s ease-in-out infinite ${box.delay}`,
                }}
              />
              <MDBox
                sx={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: box.bg,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                  animation: `productPop 2.2s ease-in-out infinite ${box.delay}`,
                }}
              />
            </MDBox>
          ))}
        </MDBox>

        <MDBox
          sx={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "112px",
            height: "92px",
            background: `linear-gradient(180deg, ${primaryColor} 0%, #a33c5e 100%)`,
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(95, 11, 40, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
          }}
        >
          <MDBox
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "74px",
              height: "28px",
              backgroundColor: "rgba(255, 255, 255, 0.16)",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Cairo', 'Arial', sans-serif",
              fontWeight: "bold",
              fontSize: "15px",
              color: "#ffffff",
              letterSpacing: "1px",
            }}
          >
            سوير
          </MDBox>
        </MDBox>
      </MDBox>

      <MDTypography
        variant="h4"
        sx={{
          mt: 4,
          fontWeight: "bold",
          color: primaryColor,
          animation: "elegantPulse 1.8s ease-in-out infinite",
          "@keyframes elegantPulse": {
            "0%, 100%": { opacity: 0.85, transform: "scale(1)" },
            "50%": { opacity: 1, transform: "scale(1.04)" },
          },
        }}
      >
        متجر سوير
      </MDTypography>
      {/* <MDTypography variant="body2" color="text" mt={1}>
        متجر متعدد المنتجات — عطور، تجميل، والعناية الشخصية
      </MDTypography> */}
    </MDBox>
  );
};

export default PerfumeLoadingElegant;
