import { Grid, Card, Box } from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function StatCard({ title, value, icon, color, loading, darkMode }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <MDBox display="flex" alignItems="center" p={2}>
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="4rem"
            height="4rem"
            borderRadius="md"
            variant="gradient"
            bgColor={color}
            color="white"
            shadow="md"
            mr={2}
          >
            <Icon fontSize="medium">{icon}</Icon>
          </MDBox>
          <MDBox>
            <MDTypography variant="button" color="text" fontWeight="medium">
              {title}
            </MDTypography>
            <MDTypography variant="h5" fontWeight="bold">
              {loading ? "..." : value}
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
    </Grid>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  darkMode: PropTypes.bool,
};

StatCard.defaultProps = {
  loading: false,
  darkMode: false,
};

function UserStatsCard({ stats, loading, darkMode }) {
  return (
    <>
      <StatCard
        title="إجمالي المستخدمين"
        value={stats?.total || 0}
        icon="people"
        color="info"
        loading={loading}
        darkMode={darkMode}
      />

      <StatCard
        title="العملاء"
        value={stats?.customers || 0}
        icon="person"
        color="success"
        loading={loading}
        darkMode={darkMode}
      />

      <StatCard
        title="المشرفين"
        value={stats?.admins || 0}
        icon="admin_panel_settings"
        color="warning"
        loading={loading}
        darkMode={darkMode}
      />

      <StatCard
        title="المندوبين"
        value={stats?.deliveries || 0}
        icon="delivery_dining"
        color="secondary"
        loading={loading}
        darkMode={darkMode}
      />

      <StatCard
        title="المستخدمين النشطين"
        value={stats?.total || 0}
        icon="group"
        color="primary"
        loading={loading}
        darkMode={darkMode}
      />
    </>
  );
}

UserStatsCard.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    customers: PropTypes.number,
    admins: PropTypes.number,
    deliveries: PropTypes.number,
  }),
  loading: PropTypes.bool,
  darkMode: PropTypes.bool,
};

UserStatsCard.defaultProps = {
  stats: {},
  loading: false,
  darkMode: false,
};

export default UserStatsCard;
