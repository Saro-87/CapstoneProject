import { Box, Typography } from "@mui/material";
import ResourceTable from "../ResourceTable";

function ResourcesSection() {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Resource Summary
      </Typography>

      <ResourceTable />
    </Box>
  );
}

export default ResourcesSection;