import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import api from "../../services/api";

export default function BudgetProgressCard() {
  const [loading, setLoading] = useState(true);

  const [budget, setBudget] = useState({
    budget: 0,
    spent: 0,
    remaining: 0,
    percentage: 0,
    name: "",
  });

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const response = await api.get("/api/aws/budget");

      if (
        response.data.status === "success" &&
        response.data.budgets.length > 0
      ) {
        setBudget(response.data.budgets[0]);
      }
    } catch (error) {
      console.error("Budget API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColor = () => {
    if (budget.percentage < 70) return "success";
    if (budget.percentage < 90) return "warning";
    return "error";
  };

  const getStatus = () => {
    if (budget.percentage < 70) return "Healthy";
    if (budget.percentage < 90) return "Warning";
    return "Critical";
  };

  if (loading) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardContent>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6">
            <AccountBalanceWalletIcon sx={{ mr: 1 }} />
            AWS Budget Progress
          </Typography>

          <Chip
            label={getStatus()}
            color={getColor()}
          />
        </Box>

        <Grid container spacing={2}>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Budget
            </Typography>

            <Typography variant="h5">
              ${budget.budget}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Spent
            </Typography>

            <Typography variant="h5">
              ${budget.spent}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Remaining
            </Typography>

            <Typography variant="h5">
              ${budget.remaining}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Usage
            </Typography>

            <Typography variant="h5">
              {budget.percentage}%
            </Typography>
          </Grid>

        </Grid>

        <Box mt={3}>

          <LinearProgress
            variant="determinate"
            value={budget.percentage}
            color={getColor()}
            sx={{
              height: 12,
              borderRadius: 5,
            }}
          />

        </Box>

      </CardContent>
    </Card>
  );
}