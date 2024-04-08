'use client'

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
import { MoonIcon, SunIcon, EditIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'


export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    
      <Box bg={useColorModeValue('gray.100', 'gray.900')} zIndex={'5'} px={4} top={'0'} position={'sticky'}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>Logo</Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode}>
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
                    src={'https://bit.ly/dan-abramov'}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar
                      size={'2xl'}
                      src={'https://bit.ly/dan-abramov'}
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
                    <Link to="/profile">Username</Link>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem>My Trips</MenuItem>
                  <MenuItem>Logout</MenuItem>
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