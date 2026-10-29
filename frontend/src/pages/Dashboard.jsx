import { useEffect, useState } from "react";
import { Alert, Box, Grid } from "@mui/material";

import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

// Dashboard Components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import KPISection from "../components/dashboard/KPISection";
import StatisticsSection from "../components/dashboard/StatisticsSection";
import BudgetForecastSection from "../components/dashboard/BudgetForecastSection";
import ChartsSection from "../components/dashboard/ChartsSection";
import AnalyticsSection from "../components/dashboard/AnalyticsSection";
import ResourcesSection from "../components/dashboard/ResourcesSection";
import AlertsSection from "../components/dashboard/AlertsSection";
import RecommendationSection from "../components/dashboard/RecommendationSection";
import DashboardFooter from "../components/dashboard/DashboardFooter";

import ExecutiveSummary from "../components/dashboard/ExecutiveSummary";
import CloudHealthCard from "../components/dashboard/CloudHealthCard";
import ResourceSummary from "../components/dashboard/ResourceSummary";
import ResourcesTable from "../components/dashboard/ResourcesTable";

import CloudWatchCard from "../components/dashboard/CloudWatchCard";
import BudgetProgressCard from "../components/dashboard/BudgetProgressCard";
import CostAnomalyCard from "../components/dashboard/CostAnomalyCard";

// Skeleton Components
import LoadingCard from "../components/common/LoadingCard";
import ChartSkeleton from "../components/common/ChartSkeleton";
import TableSkeleton from "../components/common/TableSkeleton";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    total_cost: 0,
    aws: 0,
    azure: 0,
    gcp: 0,
  });

  const [filters, setFilters] = useState({
    cloud: "all",
    region: "all",
    service: "all",
    dateRange: "30",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (activeFilters = filters) => {
    try {
      setLoading(true);

      const [dashboardResponse, awsResponse] = await Promise.all([
        api.get("/api/dashboard", {
          params: activeFilters,
        }),
        api.get("/api/aws/monthly-cost"),
      ]);

      setDashboard({
        total_cost: dashboardResponse.data.total_cost || 0,
        aws: awsResponse.data.amount || 0,
        azure: dashboardResponse.data.azure || 0,
        gcp: dashboardResponse.data.gcp || 0,
      });

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleApplyFilters = () => {
    loadDashboard(filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      cloud: "all",
      region: "all",
      service: "all",
      dateRange: "30",
    };

    setFilters(defaultFilters);
    loadDashboard(defaultFilters);
  };

  return (
    <MainLayout>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <DashboardHeader onRefresh={loadDashboard} />

        {/* Filters */}
        <DashboardFilters
          filters={filters}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <>
            {/* KPI */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2,1fr)",
                  lg: "repeat(4,1fr)",
                },
                gap: 3,
                mb: 3,
              }}
            >
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </Box>

            <ChartSkeleton />
            <Box sx={{ height: 24 }} />

            <ChartSkeleton />
            <Box sx={{ height: 24 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2,1fr)",
                },
                gap: 3,
              }}
            >
              <ChartSkeleton />
              <ChartSkeleton />
            </Box>

            <Box sx={{ height: 24 }} />

            <ChartSkeleton />

            <Box sx={{ height: 24 }} />

            <TableSkeleton />

            <Box sx={{ height: 24 }} />

            <LoadingCard />

            <Box sx={{ height: 24 }} />

            <LoadingCard />

            <Box sx={{ height: 24 }} />

            <TableSkeleton />

            <Box sx={{ height: 24 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3,1fr)",
                },
                gap: 3,
              }}
            >
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </Box>
          </>
        ) : (
          <>
            {/* KPI Cards */}
            <KPISection dashboard={dashboard} />

            {/* Statistics */}
            <StatisticsSection />

            {/* Budget */}
            <BudgetForecastSection />

            {/* Charts */}
            <ChartsSection filters={filters} />

            {/* Executive Summary + Cloud Health */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <ExecutiveSummary />
              </Grid>

              <Grid item xs={12} md={6}>
                <CloudHealthCard />
              </Grid>
            </Grid>

            {/* Analytics */}
            <AnalyticsSection />

            {/* Resource Summary */}
            <ResourceSummary />

            {/* Resources */}
            <ResourcesSection />

            {/* Resources Table */}
            <ResourcesTable />

            {/* Alerts + Recommendations */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} lg={6}>
                <AlertsSection />
              </Grid>

              <Grid item xs={12} lg={6}>
                <RecommendationSection />
              </Grid>
            </Grid>

            {/* AWS Monitoring Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <CloudWatchCard />
              </Grid>

              <Grid item xs={12} md={4}>
                <BudgetProgressCard />
              </Grid>

              <Grid item xs={12} md={4}>
                <CostAnomalyCard />
              </Grid>
            </Grid>

            {/* Footer */}
            <DashboardFooter />
          </>
        )}
      </Box>
    </MainLayout>
  );
}

export default Dashboard;