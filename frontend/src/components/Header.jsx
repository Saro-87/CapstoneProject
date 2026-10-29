import { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Stack,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import { ColorModeContext } from "../context/ThemeContext";

import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircleIcon from "@mui/icons-material/Circle";

function Header({
  onDrawerToggle,
  onRefresh,
  lastUpdated,
}) {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          py: 1,
        }}
      >
        {/* LEFT */}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
        >
          {isMobile && (
            <IconButton
              onClick={onDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          )}

          <CloudQueueIcon
            sx={{
              fontSize: 40,
              color: "primary.main",
            }}
          />

          <Box>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="bold"
            >
              Multi-Cloud FinOps Dashboard
            </Typography>

            {!isMobile && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Real-Time AWS • Azure • GCP Cost Intelligence
              </Typography>
            )}
          </Box>
        </Box>

        {/* RIGHT */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          {!isMobile && (
            <TextField
              size="small"
              placeholder="Search..."
              sx={{ width: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {!isMobile && (
            <Chip
              icon={
                <CircleIcon
                  sx={{
                    color: "#4CAF50 !important",
                    fontSize: 12,
                  }}
                />
              }
              label="System Online"
              color="success"
              variant="outlined"
            />
          )}

          {!isMobile && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Last Updated
              <br />
              <strong>{lastUpdated}</strong>
            </Typography>
          )}

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>

          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={colorMode.toggleColorMode}
          >
            {theme.palette.mode === "dark"
              ? <LightModeIcon />
              : <DarkModeIcon />}
          </IconButton>

          <Avatar
            sx={{
              bgcolor: "primary.main",
            }}
          >
            S
          </Avatar>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;