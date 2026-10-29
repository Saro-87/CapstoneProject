import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, Typography } from "@mui/material";
import api from "../services/api";

function CostChart({ filters }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    try {
      const response = await api.get("/api/dashboard/monthly-history", {
        params: filters,
      });

      if (response.data.status === "success") {
        const chartData = response.data.history.map((item) => ({
          month: new Date(item.month + "-01").toLocaleString("default", {
            month: "short",
          }),
          cost: item.cost,
        }));

        setData(chartData);
      }
    } catch (error) {
      console.error("Error loading monthly history:", error);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📈 Monthly Cloud Cost Trend
        </Typography>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />

            <Line
              type="monotone"
              dataKey="cost"
              stroke="#1976d2"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default CostChart;