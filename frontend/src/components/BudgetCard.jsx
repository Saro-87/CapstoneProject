import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

import api from "../services/api";

function BudgetCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [budget, setBudget] = useState({
    name: "Monthly Budget",
    budget: 0,
    spent: 0,
    remaining: 0,
    percentage: 0,
  });

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      const response = await api.get("/api/aws/budget");

      if (
        response.data.status === "success" &&
        response.data.budgets &&
        response.data.budgets.length > 0
      ) {
        const data = response.data.budgets[0];

        setBudget({
          name: data.name || "Monthly Budget",
          budget: Number(data.budget || 0),
          spent: Number(data.spent || 0),
          remaining: Number(data.remaining || 0),
          percentage: Number(data.percentage || 0),
        });

        setError("");
      } else {
        setError("No budget data available.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = () => {
    if (budget.percentage >= 90) return "error";
    if (budget.percentage >= 75) return "warning";
    return "success";
  };

  if (loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 220,
          }}
        >
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          💰 {budget.name}
        </Typography>

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mt: 1,
              }}
            >
              $
              {budget.spent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Budget: $
              {budget.budget.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(budget.percentage, 100)}
                color={getProgressColor()}
                sx={{
                  height: 12,
                  borderRadius: 6,
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                fontWeight: 600,
              }}
            >
              {budget.percentage.toFixed(1)}% Used
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Remaining: $
              {budget.remaining.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                fontWeight: "bold",
                color:
                  budget.percentage >= 90
                    ? "error.main"
                    : budget.percentage >= 75
                    ? "warning.main"
                    : "success.main",
              }}
            >
              {budget.percentage >= 90
                ? "⚠ Budget Critical"
                : budget.percentage >= 75
                ? "⚠ Budget Warning"
                : "✅ Budget Healthy"}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetCard;