import { Box } from '@chakra-ui/react';
import { TripParticipants } from '../components/TripParticipants';
import TripComponent from './../components/TripComponent';


export const PlayGround = () => {
  return (
    <Box>
      <TripParticipants/>
      <TripParticipants/>
      <TripComponent/>
    </Box>
  );
};
