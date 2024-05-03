import { useState, useEffect } from 'react';
import { Box, Flex, Text, Grid, Button, HStack } from '@chakra-ui/react';
import SearchBar from '../components/SearchBar';
import Navbar from './../components/Navbar';
import Cookies from 'js-cookie';
import axios from 'axios';
import TripComponent from './../components/TripComponent';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom'

const MainPage = () => {
  const sessionId = Cookies.get('sessionId');
  const [allTrips, setAllTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    setSearchResult(
      allTrips.filter(trip =>
        trip.country.toLowerCase().startsWith(searchTerm.toLowerCase())
      )
    );
  }, [allTrips, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleButton = () => {
    navigate('/createTrip');
};

  return (
    <>
      <Navbar sessionId={sessionId}/>
      <Box>
        <Flex justifyContent='center' flexDirection="column" paddingTop='10px' alignItems="center">
          <Text fontSize="4xl" fontWeight="bold" marginTop={'1%'} marginBottom={'1%'}>All Trips</Text>
          <HStack>
          <SearchBar setSearchTerm={handleSearch} />
          <Button rightIcon={<AddIcon/>} borderRadius="20" colorScheme='blue' variant='solid' onClick={handleButton}>Create Trip</Button>
          </HStack>
        </Flex>
        <Flex justifyContent='center'>
          <Box>
              <Grid templateColumns="repeat(3, 1fr)" gap={8} mt={4}>
                {searchResult.length > 0 ? (
                  searchResult.map((trip, index) => (
                    <TripComponent key={index} trip={trip} />
                  ))
                ) : (
                  <Flex alignItems="center" justifyContent="center" height="200px" maxWidth="700px" margin="0 auto">
                    <Text fontSize="3xl" fontWeight="bold" textAlign="center">No Results Found</Text>
                  </Flex>
                )}
              </Grid>
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default MainPage;
