import { Box, Typography } from "@mui/material";
import RecommendationPanel from "../RecommendationPanel";

function RecommendationSection() {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
      >
        Cost Optimization Recommendations
      </Typography>

      <RecommendationPanel />
    </Box>
  );
}

export default RecommendationSection;