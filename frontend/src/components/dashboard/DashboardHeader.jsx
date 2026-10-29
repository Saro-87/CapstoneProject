import { Box, Typography } from "@mui/material";

function DashboardHeader() {
  return (
    <Box
      sx={{
        mb: 4,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
      >
        Dashboard Overview
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
      >
        Monitor and optimize your cloud spending across AWS, Azure, and GCP.
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Welcome back! Here's a real-time overview of your cloud infrastructure,
        costs, budgets, and optimization opportunities.
      </Typography>
    </Box>
  );
}

export default DashboardHeader;