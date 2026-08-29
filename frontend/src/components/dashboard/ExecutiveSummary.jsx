import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import SavingsIcon from "@mui/icons-material/Savings";

import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import api from "../../services/api";

export default function ExecutiveSummary() {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    monthlyCost: 0,
    budget: 0,
    savings: 0,
    resources: 0,
  });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const [cost, budget, optimization, resources] = await Promise.all([
        api.get("/api/aws/monthly-cost"),
        api.get("/api/aws/budget"),
        api.get("/api/aws/optimization"),
        api.get("/api/aws/resources"),
      ]);

      const budgetAmount =
        budget.data.budgets?.length > 0
          ? budget.data.budgets[0].budget
          : 0;

      const totalResources =
        (resources.data.summary?.ec2 || 0) +
        (resources.data.summary?.s3 || 0) +
        (resources.data.summary?.rds || 0) +
        (resources.data.summary?.lambda || 0);

      setSummary({
        monthlyCost: cost.data.amount || 0,
        budget: budgetAmount,
        savings: optimization.data.estimated_savings || 0,
        resources: totalResources,
      });
    } catch (err) {
      console.error("Executive Summary Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  const cards = [
    {
      title: "Monthly Cost",
      value: `$${summary.monthlyCost}`,
    },
    {
      title: "Budget",
      value: `$${summary.budget}`,
    },
    {
      title: "Estimated Savings",
      value: `$${summary.savings}`,
    },
    {
      title: "Resources",
      value: summary.resources,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card elevation={3}>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                {card.title}
              </Typography>

              <Typography variant="h4" sx={{ mt: 1 }}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}