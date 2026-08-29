import { Box, Typography, Divider } from "@mui/material";

function DashboardFooter() {
  return (
    <>
      <Divider sx={{ mt: 6 }} />

      <Box
        sx={{
          py: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2026 Multi-Cloud FinOps Dashboard
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Version 1.0.0
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Powered by React • FastAPI • PostgreSQL
        </Typography>
      </Box>
    </>
  );
}

export default DashboardFooter;