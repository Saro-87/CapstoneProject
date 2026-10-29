import { Card, CardContent, Typography, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

function ForecastCard() {
  const forecast = 9420;
  const budget = 10000;

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>

        <Typography variant="h6" gutterBottom>
          📈 Forecast
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 2,
          }}
        >
          ${forecast.toLocaleString()}
        </Typography>

        <Typography color="text.secondary">
          Predicted End of Month
        </Typography>

        <Chip
          icon={<TrendingUpIcon />}
          label={
            forecast < budget
              ? "Within Budget"
              : "Budget Exceeded"
          }
          color={forecast < budget ? "success" : "error"}
          sx={{ mt: 3 }}
        />

      </CardContent>
    </Card>
  );
}

export default ForecastCard;