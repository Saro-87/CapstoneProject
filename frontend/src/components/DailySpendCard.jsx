import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import api from "../services/api";

function DailySpendCard() {
  const [dailyCost, setDailyCost] = useState(0);
  const [date, setDate] = useState("");

  useEffect(() => {
    loadDailyCost();
  }, []);

  const loadDailyCost = async () => {
    try {
      const response = await api.get("/api/aws/daily-cost");

      if (response.data.status === "success") {
        setDailyCost(response.data.amount);
        setDate(response.data.date);
      }
    } catch (error) {
      console.error("Error loading daily cost:", error);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          💰 Daily AWS Spend
        </Typography>

        <Box
          sx={{
            textAlign: "center",
            py: 3,
          }}
        >
          <AttachMoneyIcon
            color="primary"
            sx={{ fontSize: 50 }}
          />

          <Typography
            variant="h3"
            fontWeight="bold"
            color="primary"
          >
            ${dailyCost.toFixed(2)}
          </Typography>

          <Typography color="text.secondary">
            {date}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DailySpendCard;