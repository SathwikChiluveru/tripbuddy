import { Box } from '@chakra-ui/react';
import { TripParticipants } from '../components/TripParticipants';
import TripCard from './../components/TripCard';


export const PlayGround = () => {
  return (
    <Box>
      <TripParticipants/>
      <TripParticipants/>
      <TripCard/>
    </Box>
  );
};
