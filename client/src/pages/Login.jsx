import {
    Center,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    InputGroup,
    InputRightElement
  } from '@chakra-ui/react'
  import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
  import { useNavigate } from 'react-router-dom';
  import { useState } from 'react';
  import { useGoogleLogin } from "@react-oauth/google";
  import axios from "axios";
  import Cookie from 'js-cookie'
  import bgImage from '../assets/sign-up.jpg'; 
  import { FcGoogle } from 'react-icons/fc'

  
  
  const SignIn = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handlePasswordVisibilityToggle = () => {
      setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleSignIn = async () => {
      try {
          const response = await axios.post("http://localhost:3000/api/auth/login", formData);
          // Handle the response
          console.log(response.data.session.id);
          Cookie.set('sessionId', response.data.session.id)
          // Redirect or perform other actions based on the response
          navigate("/main");
      } catch (error) {
          console.error('Axios Error:', error);
  
          if (error.response) {
              // The request was made, but the server responded with a status code that falls out of the range of 2xx
              console.error('Response Status:', error.response.status);
              console.error('Response Data:', error.response.data);
  
              // Display the specific error message received from the server
              alert(error.response.data.error || 'An error occurred');
          } else if (error.request) {
              // The request was made, but no response was received
              console.error('No Response Received:', error.request);
              alert('No response received from the server');
          } else {
              // Something happened in setting up the request that triggered an Error
              console.error('Error Message:', error.message);
              alert('An error occurred');
          }
      }
  };  

    const googleAuth = useGoogleLogin({
        onSuccess: async ({ code }) => {
          try {
            await new Promise ((resolve) => {
              setTimeout(resolve, 0);
            });
    
            const response = await axios.post("http://localhost:3000/api/auth/google/callback", {
              code,
            });
            console.log("Frontend:", response.data)
            
            Cookie.set('sessionId', response.data.session.id)
            // Handle the response using the provided function
            navigate("/profile");
          } catch (error) {
            console.log(error);
          }
        },
        onError: (error) => {
          console.log(error);
        },
        flow: "auth-code",
      });
    return (
      <Box
      bgImage={`url(${bgImage})`}
      bgSize="cover"
      bgPosition="center"
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    //   bg={useColorModeValue('red.50', 'gray.800')}
    >
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'}>Sign in to your account</Heading>
          </Stack>
          <Box
            rounded={'lg'}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={'lg'}
            p={8}>
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input type="email" onChange={handleChange} />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <InputGroup>
                <Input type={showPassword ? 'text' : 'password'}
                onChange={handleChange}/>
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={handlePasswordVisibilityToggle}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              </FormControl>
              <Stack spacing={5} mt={5}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align={'start'} mb={1}
                  justify={'space-between'}>
                  <Checkbox>Remember me</Checkbox>
                  <Text color={'blue.400'}>Forgot password?</Text>
                </Stack>
                <Button
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleSignIn}
                  >
                  Sign in
                </Button>
              </Stack>
              <Button w={'full'} variant={'outline'} leftIcon={<FcGoogle />} onClick={googleAuth}>
                <Center>
                  <Text>Sign in with Google</Text>
                </Center>
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    )
  }

  export default SignIn;