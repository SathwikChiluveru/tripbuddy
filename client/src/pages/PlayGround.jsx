import { Box } from '@chakra-ui/react';
import { TripParticipants } from '../components/TripParticipants';
import { ViewTrip } from './ViewTrip';


export const PlayGround = () => {
  return (
    <Box>
      <TripParticipants/>
      <TripParticipants/>
      <ViewTrip/>
    </Box>
  );
};
