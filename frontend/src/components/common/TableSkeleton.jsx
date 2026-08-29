import { Card, CardContent, Skeleton, Stack } from "@mui/material";

const TableSkeleton = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Skeleton width="30%" height={35} />

        <Stack spacing={1.5} mt={2}>
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={45}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TableSkeleton;