import { Card, CardContent, Skeleton, Stack } from "@mui/material";

const LoadingCard = () => {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="text" width="45%" height={30} />
          <Skeleton variant="text" width="70%" height={45} />
          <Skeleton variant="rounded" height={40} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LoadingCard;