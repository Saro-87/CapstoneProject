import { useEffect, useState } from "react";
import api from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF9900", "#0078D4", "#34A853"];

function CloudPieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/api/cloud-distribution")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error loading cloud distribution:", error);
      });
  }, []);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={120}
          label
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default CloudPieChart;