import {
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

function DashboardFilters({
  filters,
  onChange,
  onApply,
  onReset,
}) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Cloud</InputLabel>

            <Select
              name="cloud"
              value={filters.cloud}
              label="Cloud"
              onChange={onChange}
            >
              <MenuItem value="all">All Clouds</MenuItem>
              <MenuItem value="aws">AWS</MenuItem>
              <MenuItem value="azure">Azure</MenuItem>
              <MenuItem value="gcp">GCP</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Region</InputLabel>

            <Select
              name="region"
              value={filters.region}
              label="Region"
              onChange={onChange}
            >
              <MenuItem value="all">All Regions</MenuItem>
              <MenuItem value="us-east-1">US East</MenuItem>
              <MenuItem value="us-west-2">US West</MenuItem>
              <MenuItem value="eu-west-1">EU West</MenuItem>
              <MenuItem value="ap-south-1">Mumbai</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Service</InputLabel>

            <Select
              name="service"
              value={filters.service}
              label="Service"
              onChange={onChange}
            >
              <MenuItem value="all">All Services</MenuItem>
              <MenuItem value="ec2">EC2</MenuItem>
              <MenuItem value="s3">S3</MenuItem>
              <MenuItem value="rds">RDS</MenuItem>
              <MenuItem value="lambda">Lambda</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>

            <Select
              name="dateRange"
              value={filters.dateRange}
              label="Date Range"
              onChange={onChange}
            >
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 90 Days</MenuItem>
              <MenuItem value="365">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        mt={3}
      >
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
        >
          Reset
        </Button>

        <Button
          variant="contained"
          startIcon={<FilterAltIcon />}
          onClick={onApply}
        >
          Apply Filters
        </Button>
      </Stack>
    </Paper>
  );
}

export default DashboardFilters;