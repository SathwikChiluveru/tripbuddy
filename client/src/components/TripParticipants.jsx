/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Card, Box, Text, Flex, Heading, Avatar } from '@chakra-ui/react';
import axios from 'axios';
import { ChevronRightIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom';


export const TripParticipants = ({ userId }) => {

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/user/getUserById/${userId}`);
            if (!response.data) {
                throw new Error('User data not found');
            }
            setUserData(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchUserData();
  }, [userId]);

  console.log(userData)


  return (
    <Box mb={4}>
    {userData && (
        <Link to={`/profile/${userData._id}`}>
        <Card _hover={{background: "gray.50", color: "gray.700"}} height={'20'} width={'100%'} direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline'>
            <Flex alignItems="center" justifyContent="space-between" marginLeft={2} width="100%">
                <Flex alignItems="center">
                    <Avatar size="lg" name={`${userData.firstName} ${userData.lastName}`} src={userData.profileImage} />
                    <Box marginLeft={3}>
                        <Heading size="md">{`${userData.firstName} ${userData.lastName}`}</Heading>
                        <Text marginTop={-2} py={2}>{`@${userData.username}`}</Text>
                    </Box>
                </Flex>
                <ChevronRightIcon marginRight={5} />
            </Flex>
        </Card>
        </Link>
    )}
    </Box>
  );
};
