import { Card, CardContent, Skeleton } from "@mui/material";

const ChartSkeleton = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Skeleton width="35%" height={35} />
        <Skeleton
          variant="rounded"
          height={320}
          sx={{ mt: 2 }}
        />
      </CardContent>
    </Card>
  );
};

export default ChartSkeleton;