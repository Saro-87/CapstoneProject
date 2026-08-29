import { Grid, Typography } from "@mui/material";

import CloudHealthCard from "../CloudHealthCard";
import TopServicesCard from "../TopServicesCard";
import DailySpendCard from "../DailySpendCard";
import RegionCostCard from "../RegionCostCard";
import ServiceCostChart from "../ServiceCostChart";

function AnalyticsSection() {
  return (
    <>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mt: 4, mb: 2 }}
      >
        Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CloudHealthCard />
        </Grid>

        <Grid item xs={12} md={6}>
          <TopServicesCard />
        </Grid>

        <Grid item xs={12} md={6}>
          <DailySpendCard />
        </Grid>

        <Grid item xs={12} md={6}>
          <RegionCostCard />
        </Grid>

        <Grid item xs={12}>
          <ServiceCostChart />
        </Grid>
      </Grid>
    </>
  );
}

export default AnalyticsSection;