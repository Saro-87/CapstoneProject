import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

function AlertPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api
      .get("/api/alerts")
      .then((response) => {
        setAlerts(response.data);
      })
      .catch((error) => {
        console.error("Error loading alerts:", error);
      });
  }, []);

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Alerts
      </Typography>

      <List>
        {alerts.map((alert) => (
          <ListItem key={alert.id} divider>
            <ListItemIcon>
              <WarningAmberIcon color="warning" />
            </ListItemIcon>

            <ListItemText
              primary={alert.message}
              secondary={`Provider: ${alert.provider}`}
            />

            <Chip
              label={alert.severity}
              color={
                alert.severity === "Critical"
                  ? "error"
                  : alert.severity === "High"
                  ? "warning"
                  : "success"
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default AlertPanel;