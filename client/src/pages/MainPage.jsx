import { useState, useEffect } from 'react'
import { Box, Flex, Text, Grid } from '@chakra-ui/react'
import SearchBar from '../components/SearchBar'
import Navbar from './../components/Navbar';
import Cookies from 'js-cookie'
import axios from 'axios'
import TripComponent from './../components/TripComponent';

const MainPage = () => {

  const sessionId = Cookies.get('sessionId')
  console.log("SessionID:", sessionId)
  const [allTrips, setAllTrips] = useState([])


  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/trip/getAllTrips`);
        setAllTrips(response.data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);
  
  return (
    <>
    <Navbar sessionId={sessionId}/>
    <Box>
      <Flex justifyContent='center' flexDirection="column" paddingTop='10px' alignItems="center">
        <Text fontSize="3xl" fontWeight="bold" marginTop={'1%'} marginBottom={'1%'}>All Trips</Text>
        <SearchBar />
      </Flex>
      <Flex justifyContent='center' paddingTop='10px'>
        <Box>
            <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={4}>
              {allTrips.map((trip, index) => (
                <TripComponent key={index} trip={trip} />
              ))}
            </Grid>
        </Box>
      </Flex>
    </Box>
    
    </>
  )
}

export default MainPage
