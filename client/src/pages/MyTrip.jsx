import { Box, Flex } from '@chakra-ui/react'
import Navbar from './../components/Navbar';
import Cookies from 'js-cookie'

const MyTrip = () => {

  const sessionId = Cookies.get('sessionId')
  return (
    <>
    <Navbar sessionId={sessionId}/>
    <Box>
        <Flex justifyContent='center' paddingTop='10px'>
          </Flex>
    </Box>
    
    </>
  )
}

export default MyTrip
