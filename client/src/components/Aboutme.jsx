/* eslint-disable react/prop-types */
import { Box, Text } from '@chakra-ui/react';

const AboutMe = ({ userData }) => {
  if (!userData) {
    return <div>Loading...</div>; 
  }
  return (
    <Box marginLeft={['0', '20px']} marginTop={['20px', '20px']}>
      <Text as='b' fontSize={['xl', '4xl']}>{userData.firstName} {userData.lastName}</Text>
      <Text fontSize={['l', 'xl']}>{userData.age} years old</Text>
      <Text fontSize={['sm', 'l']}>@{userData.username}</Text>
      {userData && <Text>{userData.bio}</Text>}
    </Box>
  );
};

export default AboutMe;
