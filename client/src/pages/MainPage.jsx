import { Box, Flex } from '@chakra-ui/react'
import SearchBar from '../components/SearchBar'
// import TripCard from '../components/TripCard'
import Navbar from './../components/Navbar';

const MainPage = () => {
  return (
    <>
    <Navbar/>
    <Box>
        <Flex justifyContent='center' paddingTop='10px'>
              <SearchBar />
          </Flex>
    </Box>
    
    </>
  )
}

export default MainPage
