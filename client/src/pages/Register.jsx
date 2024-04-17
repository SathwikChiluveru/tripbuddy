import {
  Center,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useGoogleLogin } from "@react-oauth/google";
import bgImage from '../assets/sign-up.jpg'; 
import { FcGoogle } from 'react-icons/fc';
import axios from "axios";
import { Link } from 'react-router-dom';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName:'',
    username: '',
    email: '',
    password: '',
  });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  const generateRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    return result;
  };

  const googleAuth = useGoogleLogin({
    onSuccess: async ({ code }) => {
      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        const googleResponse = await axios.post("http://localhost:3000/api/auth/google/callback", {
          code,
        });
        console.log(googleResponse.data.data);

        // Extract user information from the Google response
        const { name, email, given_name, family_name  } = googleResponse.data.data;

        // Create a new user object
        const newUser = {
          firstName: given_name,
          lastName: family_name,
          username: name,
          email,
          password: generateRandomString(12),
        };

        // Store the user data in MongoDB
        const response = await fetch('http://localhost:3000/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });

        if (response.ok) {
          // Handle success, e.g., redirect or show a success message
          console.log('Account created successfully');
        } else {
          // Handle errors, e.g., show error messages to the user
          const errorData = await response.json();
          console.error('Failed to create account:', errorData.errors.join(', '));
        }
      } catch (error) {
        console.log('Error:', error);
      }
    },
    onError: (error) => {
      console.log('Error:', error);
    },
    flow: "auth-code",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleEmailChange = (e) => {
    const isValidEmail = validateEmail(e.target.value);
    setFormData({ ...formData, email: e.target.value });

    if (!isValidEmail) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordChange = (e) => {
    const isValidPassword = validatePassword(e.target.value);
    setFormData({ ...formData, password: e.target.value });

    if (!isValidPassword) {
      setPasswordError('Password must be at least 5 characters long');
    } else {
      setPasswordError('');
    }
  };

  const validatePassword = (password) => {
    return password.length >= 5;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError || passwordError) {
      // Skip form submission if there's an email validation error
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Handle success, e.g., redirect or show a success message
        console.log('Account created successfully');
      } else {
        // Handle errors, e.g., show error messages to the user
        console.error('Failed to create account');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box
      bgImage={`url(${bgImage})`}
      bgSize="cover"
      bgPosition="center"
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Sign up
          </Heading>
          <Text fontSize={'lg'} color={'gray.700'}>
            to find travel buddies and find a community you belong!
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8} minWidth={'400px'}>
          <Stack spacing={4}>
            <FormControl id="firstName" isRequired>
                <FormLabel>First Name</FormLabel>
                <Input type="text" onChange={handleChange} />
            </FormControl>
            <FormControl id="lastName" isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input type="text" onChange={handleChange} />
            </FormControl>
            <FormControl id="username" isRequired>
              <FormLabel>Username</FormLabel>
              <Input type="text" onChange={handleChange} />
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input type="email" onChange={handleEmailChange} />
              {emailError && <Text color="red.500">{emailError}</Text>}
            </FormControl>
            {/* <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" onChange={handlePasswordChange} />
              {passwordError && <Text color="red.500">{passwordError}</Text>}
            </FormControl> */}
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input type={showPassword ? 'text' : 'password'} onChange={handlePasswordChange}/>
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'} 
                    onClick={() => setShowPassword((showPassword) => !showPassword)}>
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {passwordError && (
                <Text color="red" fontSize="sm" mt="1">
                  {passwordError}
                </Text>
              )}
            </FormControl>
            <Stack spacing={5} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handleSubmit}
              >
                Sign up
              </Button>
              <Button w={'full'} variant={'outline'} leftIcon={<FcGoogle />} onClick={googleAuth}>
                <Center>
                  <Text>Sign Up with Google</Text>
                </Center>
              </Button>
            </Stack>
            <Stack pt={6}>
            <Text align={'center'}>
              Already a user?{' '}
              <Link to="/login" style={{ color: '#3182CE' }}>
                Login
              </Link>
            </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
