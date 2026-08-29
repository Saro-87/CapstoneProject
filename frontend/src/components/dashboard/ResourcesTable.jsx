import { useEffect, useState } from "react";
import api from "../../services/api";

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";

function ResourcesTable() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get("/api/resources");
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "running":
      case "available":
        return "success";

      case "stopped":
        return "error";

      case "pending":
        return "warning";

      default:
        return "default";
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>

        <Typography variant="h6" gutterBottom>
          Cloud Resources
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>

            <TableHead>
              <TableRow>
                <TableCell><b>Provider</b></TableCell>
                <TableCell><b>Resource</b></TableCell>
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Region</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="right"><b>Monthly Cost ($)</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>

              {resources.map((row, index) => (

                <TableRow key={index} hover>

                  <TableCell>{row.provider}</TableCell>

                  <TableCell>{row.resource_name}</TableCell>

                  <TableCell>{row.resource_type}</TableCell>

                  <TableCell>{row.region}</TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      color={getStatusColor(row.status)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="right">
                    ${Number(row.monthly_cost).toFixed(2)}
                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>
        )}

      </CardContent>
    </Card>
  );
}

export default ResourcesTable;