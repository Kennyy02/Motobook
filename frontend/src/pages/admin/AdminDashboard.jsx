import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/admin/AdminDashboard.css";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]); // NEW: Store businesses
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchUsers();
    fetchBusinesses(); // NEW: Fetch businesses on mount
  }, []);

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

  const businessServiceBaseURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${userServiceBaseURL}/api/auth/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(
        `${businessServiceBaseURL}/api/business/business`
      );
      setBusinesses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching businesses:", err);
    }
  };

  const DashboardCard = ({ icon, label, value, bgColor, color }) => (
    <Card
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        height: "100%",
        backgroundColor: bgColor,
        borderRadius: 3,
      }}
    >
      <Box sx={{ mr: 2, color }}>{icon}</Box>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <div className="dashboard-container">
      <AdminHeader />
      <div className="dashboard-main">
        <AdminSidebar />
        <div className="dashboard-content">
          {location.pathname === "/admin/dashboard" && (
            <Box
              sx={{
                width: "100%",
                p: isSmallScreen ? 2 : 4,
                backgroundColor: "transparent", // ✅ ADDED: Force transparent background
              }}
            >
              <Typography
                variant="h5"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 3, color: "#ffffff" }} // ✅ ADDED: White text color
              >
                Admin Overview
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <DashboardCard
                    icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                    label="Total Users"
                    value={users.length}
                    bgColor="#E3F2FD"
                    color="#1976D2"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <DashboardCard
                    icon={<BusinessIcon sx={{ fontSize: 40 }} />}
                    label="Total Businesses"
                    value={businesses.length}
                    bgColor="#F3E5F5"
                    color="#7B1FA2"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ✅ WRAPPED Outlet in a transparent Box */}
          <Box sx={{ backgroundColor: "transparent" }}>
            <Outlet />
          </Box>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
