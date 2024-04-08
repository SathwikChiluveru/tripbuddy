import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  AvatarBadge,
  IconButton,
  Spacer,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  useToast
} from '@chakra-ui/react'
import { SmallCloseIcon } from '@chakra-ui/icons'
import { useState } from 'react';
import axios from 'axios';
import { Link}  from 'react-router-dom'

export default function EditProfile() {
  const [countriesVisited, setCountriesVisited] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    bio: '',
    countriesVisited: [],
  });

  const handleChange = (e) => {
    if (e.target.id === 'CountriesVisited') {
      // For countries visited input field
      setNewCountry(e.target.value);
    } else if (e.target.id === 'Bio') {
      // For bio textarea
      setFormData({ ...formData, bio: e.target.value });
    } else {
      // For other input fields
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    try {
      const updatedFormData = { ...formData, countriesVisited };
      console.log(updatedFormData)
      await axios.put(`http://localhost:3000/api/user/6613ac4dc6160cf638d224d4/editProfile`, updatedFormData);
      
      toast({
        title: 'Profile Updated Successfully.',
        status: 'success',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');

      toast({
        title: 'Error occurred while updating profile',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      })

    }
  };


  const handleCountryInputKeyDown = (event) => {
    if (event.key === 'Enter' && newCountry.trim() !== '') {
      setCountriesVisited(prev => [...prev, newCountry.trim()]);
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (countryToRemove) => {
    setCountriesVisited(prev => prev.filter(country => country !== countryToRemove));
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack
        spacing={4}
        w={'full'}
        maxW={'4xl'}
        bg={useColorModeValue('white', 'gray.700')}
        rounded={'xl'}
        boxShadow={'lg'}
        width={'100%'}
        p={6}
        my={12}>
        <FormControl id="userName">
          <Stack direction={['column', 'row']} spacing={6} alignItems="center">
            <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
              User Profile Edit
            </Heading>
            <Spacer />
            <Avatar size="xl" src="https://bit.ly/dan-abramov">
              <AvatarBadge
                as={IconButton}
                size="sm"
                rounded="full"
                top="-10px"
                colorScheme="red"
                aria-label="remove Image"
                icon={<SmallCloseIcon />}
              />
            </Avatar>
          </Stack>
        </FormControl>
        <Stack direction={['column', 'row']} spacing={4}>
          <FormControl id="firstName" isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              placeholder="First Name"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={handleChange}
              value={formData.firstName}
            />
          </FormControl>
          <FormControl id="lastName" isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              placeholder="Last Name"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={handleChange}
              value={formData.lastName}
            />
          </FormControl>
        </Stack>
        <Stack direction={['column', 'row']} spacing={4}>
          <FormControl id="age" isRequired>
            <FormLabel>Age</FormLabel>
            <NumberInput>
              <NumberInputField onChange={handleChange}
              value={formData.age}/>
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl id="Bio">
            <FormLabel>Bio</FormLabel>
            <Textarea
              placeholder="Bio"
              _placeholder={{ color: 'gray.500' }}
              w="100%"
              type="text"
              onChange={handleChange}
              value={formData.bio}
            />
          </FormControl>
        </Stack>
        <FormControl id="CountriesVisited" isRequired>
          <FormLabel>Countries Visited</FormLabel>
          <Input
            placeholder="Type a country and press Enter"
            _placeholder={{ color: 'gray.500' }}
            w="100%"
            type="text"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            onKeyDown={handleCountryInputKeyDown}

          />
        </FormControl>
        <Stack direction="row" flexWrap="wrap">
          {countriesVisited.map(country => (
            <Tag key={country} size="md" variant="solid" colorScheme="teal" m={1}>
              <TagLabel>{country}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveCountry(country)} />
            </Tag>
          ))}
        </Stack>
        <Stack spacing={6} direction={['column', 'row']}>
          <Link to="/profile">
            <Button
              bg={'red.400'}
              color={'white'}
              w="full"

              _hover={{
                bg: 'red.500',
              }}>
              Cancel
            </Button>
          </Link>
          
          <Link to="/profile">
            <Button
              bg={'blue.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'blue.500',
              }}
              onClick={handleSubmit}>
              Submit
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Flex>
  )
}
