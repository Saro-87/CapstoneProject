import { Grid } from "@mui/material";

import StorageIcon from "@mui/icons-material/Storage";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SavingsIcon from "@mui/icons-material/Savings";
import CloudDoneIcon from "@mui/icons-material/CloudDone";

import StatsCard from "../StatsCard";

function StatisticsSection() {
  return (
    <Grid container spacing={3} sx={{ mt: 2, mb: 2 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Active Resources"
          value="6"
          icon={<StorageIcon />}
          color="#1976d2"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Active Alerts"
          value="3"
          icon={<WarningAmberIcon />}
          color="#ed6c02"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Potential Savings"
          value="$425"
          icon={<SavingsIcon />}
          color="#2e7d32"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Connected Clouds"
          value="3"
          icon={<CloudDoneIcon />}
          color="#6a1b9a"
        />
      </Grid>
    </Grid>
  );
}

export default StatisticsSection;