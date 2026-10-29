import { Box, Typography } from "@mui/material";

import CostChart from "../CostChart";
import CloudPieChart from "../CloudPieChart";

function ChartsSection() {
  return (
    <>
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Monthly Cost Trend
        </Typography>

        <CostChart />
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Cloud Cost Distribution
        </Typography>

        <CloudPieChart />
      </Box>
    </>
  );
}

export default ChartsSection;