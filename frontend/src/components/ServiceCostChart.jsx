import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import api from "../services/api";

function ServiceCostChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadServiceCost();
  }, []);

  const loadServiceCost = async () => {
    try {
      const response = await api.get("/api/aws/service-cost");

      if (response.data.status === "success") {
        const sortedData = response.data.services
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 10);

        setData(sortedData);
      }
    } catch (error) {
      console.error("Error loading AWS service cost:", error);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
        >
          📊 AWS Cost by Service
        </Typography>

        {data.length === 0 ? (
          <Box
            sx={{
              height: 350,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary">
              No AWS billing data available.
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 180,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" />

              <YAxis
                type="category"
                dataKey="service"
                width={180}
              />

              <Tooltip
                formatter={(value) => [`$${value}`, "Cost"]}
              />

              <Bar
                dataKey="cost"
                fill="#1976d2"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ServiceCostChart;