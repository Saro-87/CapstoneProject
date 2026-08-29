import { useState } from "react";
import { Box } from "@mui/material";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleString()
  );

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleRefresh = () => {
    // Update timestamp
    setLastUpdated(new Date().toLocaleString());

    // Dashboard refresh will be connected later
    console.log("Dashboard Refresh");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <Header
          onDrawerToggle={handleDrawerToggle}
          onRefresh={handleRefresh}
          lastUpdated={lastUpdated}
        />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            bgcolor: "background.default",
            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            py: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;