import { Box, Flex } from '@chakra-ui/react'
import SearchBar from '../components/SearchBar'
// import TripCard from '../components/TripCard'
import Navbar from './../components/Navbar';
import Cookies from 'js-cookie'

const MainPage = () => {

  const sessionId = Cookies.get('sessionId')
  return (
    <>
    <Navbar sessionId={sessionId}/>
    <Box>
        <Flex justifyContent='center' paddingTop='10px'>
              <SearchBar />
          </Flex>
    </Box>
    
    </>
  )
}

export default MainPage
