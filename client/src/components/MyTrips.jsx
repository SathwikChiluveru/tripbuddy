import { Box, Text, Grid } from '@chakra-ui/react';
import TripComponent from './TripComponent';

const MyTrips = ({ trips }) => {
  return (
    <Box mt={8} ml={2} maxHeight="100vh" overflowY="auto">
      <Text fontSize="4xl" textAlign="center" fontWeight="bold">Trips Created</Text>
      <Grid ml={10} templateColumns="repeat(2, 1fr)" gap={0} mt={4}>
        {trips.map((trip, index) => (
          <TripComponent key={index} trip={trip} />
        ))}
      </Grid>
    </Box>
  );
};

export default MyTrips;
