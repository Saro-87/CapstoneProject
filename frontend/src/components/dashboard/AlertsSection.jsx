import { Box, Typography } from "@mui/material";
import AlertPanel from "../AlertPanel";

function AlertsSection() {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
      >
        Recent Alerts
      </Typography>

      <AlertPanel />
    </Box>
  );
}

export default AlertsSection;