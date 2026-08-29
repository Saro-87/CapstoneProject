import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

function ResourceTable() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    api
      .get("/api/resources")
      .then((response) => {
        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          setResources(response.data);
        } else if (Array.isArray(response.data.resources)) {
          setResources(response.data.resources);
        } else {
          setResources([]);
        }
      })
      .catch((error) => {
        console.error("Error loading resources:", error);
        setResources([]);
      });
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Cloud Resources
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Provider</b></TableCell>
            <TableCell><b>Resource Name</b></TableCell>
            <TableCell><b>Type</b></TableCell>
            <TableCell><b>Region</b></TableCell>
            <TableCell><b>Status</b></TableCell>
            <TableCell align="right"><b>Monthly Cost ($)</b></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {resources.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.provider}</TableCell>
              <TableCell>{row.resource_name}</TableCell>
              <TableCell>{row.resource_type}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell align="right">
                ${row.monthly_cost}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ResourceTable;