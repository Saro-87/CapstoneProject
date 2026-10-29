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

import PublicIcon from "@mui/icons-material/Public";

import api from "../services/api";

function RegionCostCard() {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await api.get("/api/aws/region-cost");

      if (response.data.status === "success") {
        const sortedRegions = response.data.regions
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 10);

        setRegions(sortedRegions);
      }
    } catch (error) {
      console.error("Error loading region cost:", error);
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🌍 AWS Cost by Region
        </Typography>

        {regions.length === 0 ? (
          <Typography color="text.secondary">
            No region billing data available.
          </Typography>
        ) : (
          <List>
            {regions.map((region, index) => (
              <Box key={region.region}>
                <ListItem
                  secondaryAction={
                    <Chip
                      icon={<PublicIcon />}
                      label={`$${region.cost.toFixed(2)}`}
                      color="primary"
                      size="small"
                    />
                  }
                >
                  <ListItemText
                    primary={region.region}
                    secondary={`Region #${index + 1}`}
                  />
                </ListItem>

                {index !== regions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default RegionCostCard;