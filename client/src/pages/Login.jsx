import {
    Flex,
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
  } from '@chakra-ui/react'
  import { useNavigate } from 'react-router-dom';
  import { useGoogleLogin } from "@react-oauth/google";
  import axios from "axios";

  
  
  const SignIn = () => {
    const navigate = useNavigate();
    const googleAuth = useGoogleLogin({
        onSuccess: async ({ code }) => {
          try {
            await new Promise ((resolve) => {
              setTimeout(resolve, 0);
            });
    
            const response = await axios.post("http://localhost:3000/api/auth/google/callback", {
              code,
            });
            console.log(response.data)
            // Handle the response using the provided function
            navigate("/");
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
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'}>Sign in to your account</Heading>
            <Text fontSize={'lg'} color={'gray.600'}>
              to enjoy all of our cool <Text color={'blue.400'}>features</Text> ✌️
            </Text>
          </Stack>
          <Box
            rounded={'lg'}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={'lg'}
            p={8}>
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input type="email" />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input type="password" />
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align={'start'}
                  justify={'space-between'}>
                  <Checkbox>Remember me</Checkbox>
                  <Text color={'blue.400'}>Forgot password?</Text>
                </Stack>
                <Button
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}>
                  Sign in
                </Button>
              </Stack>
              <Button onClick={googleAuth}>
                Google Sign in
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    )
  }

  export default SignIn;