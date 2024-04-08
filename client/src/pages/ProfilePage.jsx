import { Stack, Image, Box, Text, Flex } from '@chakra-ui/react';
import ProfileMap from '../components/ProfileMap'; 

export default function ProfilePage() {
  return (
    <>
      <Flex
        w={'full'}
        h={['auto', '40vh']} 
        backgroundImage={
          'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
        }
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
              src='https://bit.ly/dan-abramov'
              alt='Dan Abramov'
              marginLeft={['0', '100px']} 
              marginTop={['10px', '50px']} 
            />
            <Box marginLeft={['0', '50px']} marginTop={['20px', '120px']}>
              <Text fontSize={['xl', '3xl']}>Dan Abramov</Text>
              <Text fontSize={['sm', 'l']}>Web Developer</Text>
            </Box>
          </Flex>
        </Stack>
      </Flex>
      <Box mt={8} ml={8}>
        <Text fontSize="2xl" fontWeight="bold">Trips Created</Text>
      </Box>
      <Box>
        <Text mt={8} ml={8} fontSize="2xl" fontWeight="bold">Places Visited</Text>
        <ProfileMap /> 
      </Box>
    </>
  );
}
