import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import api from "../../services/api";

export default function CostAnomalyCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/api/aws/anomaly");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <WarningAmberIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Cost Anomaly Detection
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography color="text.secondary">Yesterday</Typography>
            <Typography variant="h6">${data?.yesterday ?? 0}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Today</Typography>
            <Typography variant="h6">${data?.today ?? 0}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Difference</Typography>
            <Typography variant="h6">${data?.difference ?? 0}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Change</Typography>
            <Typography variant="h6">
              {data?.percentage ?? 0}%
            </Typography>
          </Grid>
        </Grid>

        <Chip
          sx={{ mt: 2 }}
          color={data?.anomaly ? "error" : "success"}
          label={data?.anomaly ? "Anomaly Detected" : "Normal Spending"}
        />
      </CardContent>
    </Card>
  );
}