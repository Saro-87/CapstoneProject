import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

const providers = [
  {
    name: "AWS",
    score: 96,
    color: "success",
  },
  {
    name: "Azure",
    score: 91,
    color: "success",
  },
  {
    name: "GCP",
    score: 89,
    color: "warning",
  },
];

function CloudHealthCard() {
  const overall =
    Math.round(
      providers.reduce((a, b) => a + b.score, 0) /
      providers.length
    );

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <HealthAndSafetyIcon color="success" />

            <Typography
              variant="h6"
              fontWeight="bold"
            >
              Cloud Health Score
            </Typography>
          </Stack>

          <Chip
            color="success"
            label={`${overall}%`}
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
        >
          Overall Status: Excellent
        </Typography>

        {providers.map((item) => (
          <Box key={item.name} mb={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography fontWeight={600}>
                {item.name}
              </Typography>

              <Typography>
                {item.score}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={item.score}
              color={item.color}
              sx={{
                height: 10,
                borderRadius: 5,
                mt: 1,
              }}
            />
          </Box>
        ))}

        <Chip
          color="success"
          label="All critical services operational"
          sx={{ mt: 1 }}
        />

      </CardContent>
    </Card>
  );
}

export default CloudHealthCard;