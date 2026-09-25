/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

import jsCookie from "js-cookie";
import { toast } from "react-toastify";
import api from "../../../services/api/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/authSlice";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);

  const navigate = useNavigate();
  const reduxDispatch = useDispatch();

  const handleOpenLogoutDialog = () => {
    setLogoutDialog(true);
  };

  const handleCloseLogoutDialog = () => {
    if (!isLoggingOut) {
      setLogoutDialog(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // محاولة تسجيل الخروج من الخادم
      await api.post("/auth/logout-all");
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error) {
      console.error("Logout API error:", error);
      // حتى لو فشل الطلب، نكمل عملية التنظيف المحلي
      toast.info("تم تسجيل الخروج محلياً");
    }

    // تنظيف التخزين المحلي بغض النظر عن نتيجة API
    localStorage.removeItem("user");
    // هذا سيمسح كل شيء في localStorage
    // localStorage.clear();
    jsCookie.remove("accessToken");
    jsCookie.remove("refreshToken");

    // تحديث حالة Redux
    reduxDispatch(logout());

    // إغلاق الديالوج والتوجيه
    setLogoutDialog(false);
    setIsLoggingOut(false);
    navigate("/authentication/sign-in", { replace: true });
  };

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
  );

  // Render logout confirmation dialog
  const renderLogoutDialog = () => (
    <Dialog
      open={logoutDialog}
      onClose={handleCloseLogoutDialog}
      aria-labelledby="logout-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="logout-dialog-title">
        <MDTypography variant="h5" fontWeight="medium">
          تأكيد تسجيل الخروج
        </MDTypography>
      </DialogTitle>

      <DialogContent>
        <MDBox display="flex" alignItems="center" mb={2}>
          <Icon
            sx={{
              fontSize: "3rem",
              color: "warning.main",
              mr: 2,
            }}
          >
            warning
          </Icon>
          <MDTypography variant="body1">هل أنت متأكد من أنك تريد تسجيل الخروج؟</MDTypography>
        </MDBox>
        {/* التصحيح هنا - استبدال textSecondary بـ text */}
        <MDTypography variant="body2" color="text">
          سيتم إغلاق جلسة العمل الحالية وتوجيهك إلى صفحة تسجيل الدخول.
        </MDTypography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCloseLogoutDialog}
          disabled={isLoggingOut}
          color="secondary"
          sx={{ mr: 1 }}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          color="warning"
          variant="contained"
          startIcon={
            isLoggingOut ? (
              <Icon sx={{ animation: "spin 1s linear infinite" }}>refresh</Icon>
            ) : (
              <Icon>logout</Icon>
            )
          }
          sx={{
            "& .MuiSvgIcon-root": {
              animation: isLoggingOut ? "spin 1s linear infinite" : "none",
            },
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        >
          {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <>
      <AppBar
        position={absolute ? "absolute" : navbarType}
        color="inherit"
        sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
      >
        <Toolbar sx={(theme) => navbarContainer(theme)}>
          <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
            <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
          </MDBox>
          {isMini ? null : (
            <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
              {/* <MDBox pr={1}>
                <MDInput label="Search here" />
              </MDBox> */}
              <MDBox color={light ? "white" : "inherit"}>
                <Link to="/profile">
                  <IconButton sx={navbarIconButton} size="small" disableRipple>
                    <Icon sx={iconsStyle}>account_circle</Icon>
                  </IconButton>
                </Link>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarMobileMenu}
                  onClick={handleMiniSidenav}
                >
                  <Icon sx={iconsStyle} fontSize="medium">
                    {miniSidenav ? "menu_open" : "menu"}
                  </Icon>
                </IconButton>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleConfiguratorOpen}
                >
                  <Icon sx={iconsStyle}>settings</Icon>
                </IconButton>
                {/* <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}
                >
                  <Icon sx={iconsStyle}>notifications</Icon>
                </IconButton> */}
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleOpenLogoutDialog}
                >
                  <Icon sx={iconsStyle}>logout</Icon>
                </IconButton>

                {renderMenu()}
              </MDBox>
            </MDBox>
          )}
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      {renderLogoutDialog()}
    </>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
