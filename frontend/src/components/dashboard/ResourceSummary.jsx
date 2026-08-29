import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import api from "../../services/api";

export default function ResourceSummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    ec2: 0,
    s3: 0,
    rds: 0,
    lambda: 0,
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await api.get("/api/aws/resources");

      if (response.data.summary) {
        setSummary(response.data.summary);
      }
    } catch (err) {
      console.error("Resource Summary Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AWS Resource Summary
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2">EC2</Typography>
            <Typography variant="h5">{summary.ec2}</Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2">S3</Typography>
            <Typography variant="h5">{summary.s3}</Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2">RDS</Typography>
            <Typography variant="h5">{summary.rds}</Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2">Lambda</Typography>
            <Typography variant="h5">{summary.lambda}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}