import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Box,
} from "@mui/material";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

import api from "../services/api";

function TopServicesCard() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get("/api/aws/service-cost");

      if (response.data.status === "success") {
        const topServices = response.data.services
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 5);

        setServices(topServices);
      }
    } catch (error) {
      console.error("Error loading AWS services:", error);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
        >
          🔥 Top AWS Services
        </Typography>

        {services.length === 0 ? (
          <Typography color="text.secondary">
            No billing data available.
          </Typography>
        ) : (
          <List>
            {services.map((service, index) => (
              <Box key={service.service}>
                <ListItem
                  secondaryAction={
                    <Chip
                      icon={<LocalFireDepartmentIcon />}
                      label={`$${service.cost.toFixed(2)}`}
                      color="primary"
                      size="small"
                    />
                  }
                >
                  <ListItemText
                    primary={service.service}
                    secondary={`Rank #${index + 1}`}
                  />
                </ListItem>

                {index !== services.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default TopServicesCard;