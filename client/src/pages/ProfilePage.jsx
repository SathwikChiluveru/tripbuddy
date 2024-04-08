import { useState, useEffect } from 'react'
import { Stack, Image, Box, Text, Flex } from '@chakra-ui/react';
import ProfileMap from '../components/ProfileMap'; 
import axios  from 'axios';

export default function ProfilePage() {

  const [userData, setUserData] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:3000/api/user/getUserById/6613ac4dc6160cf638d224d4')
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, []);

  return (
    <>
      {userData && (
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
      </Box>
      <Box>
        <Text mt={8} ml={8} fontSize="2xl" fontWeight="bold">Places Visited</Text>
        {userData && <ProfileMap countriesVisited={userData.countriesVisited} />}
      </Box>
    </>
  );
}