import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

function CostCard({
  title,
  value,
  icon,
  color = "#1976d2",
  trend = 0,
  progress = 0,
  footer = "",
}) {
  const isPositive = trend >= 0;

  return (
    <Tooltip title={footer} arrow>
      <Card
        elevation={3}
        sx={{
          borderRadius: 4,
          height: "100%",
          transition: "all .3s ease",
          cursor: "pointer",
          borderTop: `5px solid ${color}`,
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: 8,
          },
        }}
      >
        <CardContent>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
              >
                {title}
              </Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
                mt={1}
              >
                {value}
              </Typography>
            </Box>

            <Avatar
              sx={{
                bgcolor: color,
                width: 58,
                height: 58,
              }}
            >
              {icon}
            </Avatar>
          </Box>

          {/* Trend */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mt={3}
          >
            <Chip
              size="small"
              color={isPositive ? "success" : "error"}
              icon={
                isPositive ? (
                  <TrendingUpIcon />
                ) : (
                  <TrendingDownIcon />
                )
              }
              label={`${isPositive ? "+" : ""}${trend}%`}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              vs Last Month
            </Typography>
          </Box>

          {/* Progress */}
          <Box mt={3}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Budget Used
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 5,
              }}
            />

            <Typography
              variant="body2"
              mt={1}
              fontWeight={600}
            >
              {progress}%
            </Typography>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={2}
          >
            {footer}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  );
}

export default CostCard;