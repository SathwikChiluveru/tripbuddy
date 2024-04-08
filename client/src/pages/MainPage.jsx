import { Box } from '@chakra-ui/react'
import SearchBar from '../components/SearchBar'
import TripCard from '../components/TripCard'
import Navbar from './../components/Navbar';

const MainPage = () => {
  return (
    <Box>
        <Navbar/>
        <SearchBar/>
        <TripCard/>
    </Box>
  )
}

export default MainPage
