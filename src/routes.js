/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import Categories from "layouts/categories";
import Brands from "layouts/brands";
import Products from "layouts/products";
import ProductVariants from "layouts/variants";
import Orders from "layouts/orders";
import Users from "layouts/users";
import Offers from "layouts/offers";
import Reports from "layouts/reports";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // ==============================
  // 1. القسم الرئيسي
  // ==============================
  {
    type: "collapse",
    name: "الرئيسية",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "title",
    title: "إدارة المتجر",
    key: "store-management-title",
  },

  // ==============================
  // 2. إدارة المنتجات
  // ==============================
  {
    type: "collapse",
    name: "المنتجات",
    key: "products",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/products",
    component: <Products />,
  },
  {
    type: "collapse",
    name: "متغيرات المنتج",
    key: "product-variants",
    icon: <Icon fontSize="small">format_list_bulleted</Icon>,
    route: "/product-variants",
    component: <ProductVariants />, // ستقوم بإنشاء هذا المكون لاحقاً
  },
  {
    type: "collapse",
    name: "الماركات",
    key: "brands",
    icon: <Icon fontSize="small">local_mall</Icon>,
    route: "/brands",
    component: <Brands />,
  },
  {
    type: "collapse",
    name: "التصنيفات",
    key: "categories",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/categories",
    component: <Categories />,
  },

  {
    type: "divider",
    key: "divider-1",
  },

  // ==============================
  // 3. إدارة العمليات
  // ==============================
  {
    type: "title",
    title: "العمليات والعملاء",
    key: "operations-title",
  },
  {
    type: "collapse",
    name: "الطلبات",
    key: "orders",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/orders",
    component: <Orders />,
  },
  {
    type: "collapse",
    name: "المستخدمون",
    key: "users",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/users",
    component: <Users />,
  },
  {
    type: "collapse",
    name: "التقارير",
    key: "reports",
    icon: <Icon fontSize="small">insert_chart</Icon>,
    route: "/reports",
    component: <Reports />,
  },

  {
    type: "divider",
    key: "divider-2",
  },

  // ==============================
  // 4. إدارة التسويق
  // ==============================
  {
    type: "title",
    title: "التسويق والعروض",
    key: "marketing-title",
  },
  {
    type: "collapse",
    name: "إدارة العروض",
    key: "offers",
    icon: <Icon fontSize="small">discount</Icon>,
    route: "/offers",
    component: <Offers />,
  },
  {
    type: "collapse",
    name: "الإشعارات",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },

  {
    type: "divider",
    key: "divider-3",
  },

  // ==============================
  // 5. الحساب والإعدادات
  // ==============================
  {
    type: "title",
    title: "إعدادات الحساب",
    key: "account-title",
  },
  {
    type: "collapse",
    name: "الملف الشخصي",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  // {
  //   type: "collapse",
  //   name: "تسجيل الخروج",
  //   key: "sign-in",
  //   icon: <Icon fontSize="small">logout</Icon>,
  //   route: "/authentication/sign-in",
  //   component: <SignIn />,
  // },
];

export default routes;
