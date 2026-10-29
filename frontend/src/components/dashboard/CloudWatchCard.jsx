import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../../services/api";

export default function CloudWatchCard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [message, setMessage] = useState("");

  const loadMetrics = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/aws/cloudwatch");

      setMetrics(response.data.metrics || []);
      setMessage(response.data.message || "");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading)
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>

        <Grid container justifyContent="space-between" alignItems="center">

          <Typography variant="h6">
            AWS CloudWatch Monitoring
          </Typography>

          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadMetrics}
          >
            Refresh
          </Button>

        </Grid>

        {metrics.length === 0 ? (

          <Typography sx={{ mt: 2 }} color="text.secondary">
            {message}
          </Typography>

        ) : (

          metrics.map((metric) => (

            <Card
              key={metric.instance_id}
              sx={{ mt: 2, p: 2 }}
            >

              <Typography variant="subtitle1">
                {metric.instance_id}
              </Typography>

              <Typography>
                CPU Utilization : {metric.cpu} %
              </Typography>

              <Chip
                label="Healthy"
                color="success"
                sx={{ mt: 1 }}
              />

            </Card>

          ))

        )}

      </CardContent>
    </Card>
  );
}