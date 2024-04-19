/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  Avatar,
  AvatarBadge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,  
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  IconButton
} from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon, EditIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom'

export default function Navbar({ sessionId }) {
  const { colorMode, toggleColorMode } = useColorMode()
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      axios.get(`http://localhost:3000/api/user/getUserById/${sessionId}`)
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [sessionId]);

  const handleLogout = () => {
    // Perform logout logic here, such as clearing session token
    // For example, if you're using cookies:
    Cookies.remove('sessionId');
  
    // Redirect user to login page
    navigate('/')

  };

  return (
    
      <Box bg={useColorModeValue('gray.50', 'gray.900')} zIndex={'5'} px={4} top={'0'} position={'sticky'}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Link to="/main">TRIPBUDDY</Link>
          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button bg={useColorModeValue('gray.50', 'gray.900')} onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={userData ? userData.imageUrl : 'https://bit.ly/broken-link'}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar
                      size={'2xl'}
                      src={userData ? userData.imageUrl : 'https://bit.ly/broken-link'}
                    >
                    <Link to="/editprofile">
                      <AvatarBadge
                        as={IconButton}
                        size="sm"
                        rounded="full"
                        top="-10px"
                        colorScheme="orange"
                        aria-label="Edit Profile"
                        icon={<EditIcon />}
                      />
                    </Link>
                  </Avatar>
                  </Center>
                  <br />
                  <Center>
                    <Link to="/profile">{userData ? userData.username : 'Username'}</Link>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem>My Trips</MenuItem>
                  <MenuItem>Chat</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
              <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}>
        </Stack>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    
  )
}