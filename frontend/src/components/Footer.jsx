import { Box, Typography, Divider } from "@mui/material";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";

function Footer() {
  return (
    <Box sx={{ mt: 6 }}>
      <Divider />

      <Box
        sx={{
          py: 3,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left */}
        <Box display="flex" alignItems="center" gap={1}>
          <CloudQueueIcon color="primary" />

          <Typography variant="body2" color="text.secondary">
            © 2026 Multi-Cloud FinOps Dashboard
          </Typography>
        </Box>

        {/* Center */}
        <Typography variant="body2" color="text.secondary">
          Version 1.0.0
        </Typography>

        {/* Right */}
        <Typography variant="body2" color="text.secondary">
          Powered by React • FastAPI • PostgreSQL
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;