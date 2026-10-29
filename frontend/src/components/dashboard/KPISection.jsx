import { Grid } from "@mui/material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import PublicIcon from "@mui/icons-material/Public";

import CostCard from "../CostCard";

function KPISection({ dashboard }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} lg={3}>
        <CostCard
          title="Total Cost"
          value={`₹${dashboard.total_cost.toLocaleString()}`}
          icon={<AttachMoneyIcon />}
          color="#1565C0"
          trend={12}
          progress={82}
          footer="Overall monthly cloud spending"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <CostCard
          title="AWS"
          value={`₹${dashboard.aws.toLocaleString()}`}
          icon={<CloudQueueIcon />}
          color="#FF9900"
          trend={6}
          progress={74}
          footer="Amazon Web Services"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <CostCard
          title="Azure"
          value={`₹${dashboard.azure.toLocaleString()}`}
          icon={<CloudDoneIcon />}
          color="#0078D4"
          trend={10}
          progress={68}
          footer="Microsoft Azure"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <CostCard
          title="GCP"
          value={`₹${dashboard.gcp.toLocaleString()}`}
          icon={<PublicIcon />}
          color="#34A853"
          trend={-2}
          progress={54}
          footer="Google Cloud Platform"
        />
      </Grid>
    </Grid>
  );
}

export default KPISection;