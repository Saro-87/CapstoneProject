import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";

function StatsCard({ title, value, icon, color }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" fontWeight="bold" mt={1}>
              {value}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: color,
              width: 50,
              height: 50,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatsCard;