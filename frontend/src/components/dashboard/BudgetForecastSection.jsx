import { Grid, Typography } from "@mui/material";

import BudgetCard from "../BudgetCard";
import ForecastCard from "../ForecastCard";

function BudgetForecastSection() {
  return (
    <>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mt: 4, mb: 2 }}
      >
        Budget & Forecast
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <BudgetCard />
        </Grid>

        <Grid item xs={12} md={6}>
          <ForecastCard />
        </Grid>
      </Grid>
    </>
  );
}

export default BudgetForecastSection;