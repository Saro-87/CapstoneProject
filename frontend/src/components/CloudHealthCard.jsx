import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";

function CloudHealthCard() {
  const clouds = [
    { name: "AWS", status: "Healthy" },
    { name: "Azure", status: "Warning" },
    { name: "GCP", status: "Healthy" },
  ];

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ☁ Cloud Health
        </Typography>

        <List>
          {clouds.map((cloud) => (
            <ListItem key={cloud.name}>
              <ListItemText primary={cloud.name} />
              <Chip
                label={cloud.status}
                color={cloud.status === "Healthy" ? "success" : "warning"}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default CloudHealthCard;