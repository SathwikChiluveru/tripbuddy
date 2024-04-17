import { useState, useEffect } from 'react'
import { Stack, Image, Box, Text, Flex, Grid, useColorModeValue, useColorMode } from '@chakra-ui/react';
import ProfileMap from '../components/ProfileMap'; 
import axios  from 'axios';
import Cookies from 'js-cookie';
import TripComponent from './../components/TripComponent';
import Navbar from './../components/Navbar';
export default function ProfilePage() {

  const [userData, setUserData] = useState(null)
  const [trips, setTrips] = useState([]);
  const [sessionID, setSessionID] = useState();
  // eslint-disable-next-line no-unused-vars
  const { colorMode, toggleColorMode } = useColorMode()


  useEffect(() => {
    const sessionId = Cookies.get('sessionId')
    setSessionID(sessionId)
    console.log("Session ID:", sessionId)
    axios.get(`http://localhost:3000/api/user/getUserById/${sessionId}`)
      .then(response => {
        setUserData(response.data);
        fetchTrips(sessionId);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, []);

  const fetchTrips = async (sessionId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/trip/getTripById/${sessionId}`);
      setTrips(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  return (
    <>
      <Navbar sessionId={sessionID}/>
      {userData && (
        <Flex
          w={'full'}
          h={['auto', '40vh']} 
          // backgroundImage={
          //   'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
          // }
          bg={useColorModeValue('#0c6ff0', 'gray.900')}
          backgroundSize={'cover'}
          backgroundPosition={'center center'}
          alignItems="center"
        >
          <Stack alignItems={['center', 'start']} justifyItems="center" w="100%">
            <Flex flexDirection={['column', 'row']}>
              <Image
                border={['5px solid white', '5px solid white']} 
                borderRadius="10"
                boxSize={['120px', '150px']}
                objectFit='cover'
                src={userData.imageUrl} 
                alt='User Profile'
                marginLeft={['0', '30px']} 
                marginTop={['10px', '50px']} 
              />
              <Box marginLeft={['0', '50px']} marginTop={['20px', '120px']}>
                <Text as='b' fontSize={['xl', '4xl']}>{userData.firstName} {userData.lastName}, {userData.age}</Text>
                <Text fontSize={['sm', 'l']}>@{userData.username}</Text>
              </Box>
            </Flex>
          </Stack>
        </Flex>
      )}
      <Box mt={8} ml={8}>
        <Text fontSize="2xl" fontWeight="bold">About Me</Text>
        {userData && <Text>{userData.bio}</Text>}
      </Box>

      <Box mt={8} ml={8}>
        <Text fontSize="2xl" fontWeight="bold">Trips Created</Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={4}>
          {trips.map((trip, index) => (
            <TripComponent key={index} trip={trip} />
          ))}
        </Grid>
      </Box>
      <Box>
        <Text mt={8} ml={8} fontSize="2xl" fontWeight="bold">Places Visited</Text>
        {userData && <ProfileMap countriesVisited={userData.countriesVisited} />}
      </Box>
    </>
  );
}