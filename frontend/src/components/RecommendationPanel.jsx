import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import api from "../services/api";

export default function RecommendationPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/aws/optimization")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AWS Cost Optimization
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Estimated Savings: ${data.estimated_savings}/month
        </Typography>

        {data.recommendations.length === 0 ? (
          <Typography color="success.main">
            🎉 No optimization recommendations found.
          </Typography>
        ) : (
          <List>
            {data.recommendations.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.recommendation}
                  secondary={`${item.resource} (${item.resource_id}) | Priority: ${item.priority} | Savings: $${item.estimated_savings}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}