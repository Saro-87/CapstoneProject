import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import PublicIcon from "@mui/icons-material/Public";
import StorageIcon from "@mui/icons-material/Storage";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SettingsIcon from "@mui/icons-material/Settings";

import { Link, useLocation } from "react-router-dom";

const drawerWidth = 250;

function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "AWS", icon: <CloudQueueIcon />, path: "/aws" },
    { text: "Azure", icon: <CloudDoneIcon />, path: "/azure" },
    { text: "GCP", icon: <PublicIcon />, path: "/gcp" },
    { text: "Resources", icon: <StorageIcon />, path: "/resources" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    { text: "Alerts", icon: <WarningAmberIcon />, path: "/alerts" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const drawer = (
    <>
      <Toolbar
        sx={{
          flexDirection: "column",
          py: 3,
        }}
      >
        <Typography variant="h3">☁️</Typography>

        <Typography variant="h6" fontWeight="bold">
          FinOps Dashboard
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Multi-Cloud Monitoring
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            selected={location.pathname === item.path}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 2,
              transition: "0.25s",

              "&:hover": {
                transform: "translateX(6px)",
              },

              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#fff",
              },

              "&.Mui-selected .MuiListItemIcon-root": {
                color: "#fff",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          gap: 2,
        }}
      >
        <Avatar>S</Avatar>

        <Box>
          <Typography fontWeight="bold">
            Saravanan
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Administrator
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            borderRight: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {drawer}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
}

export default Sidebar;