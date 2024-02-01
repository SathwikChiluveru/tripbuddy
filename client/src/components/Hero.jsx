import {
  Flex,
  Container,
  Heading,
  Stack,
  Text,
  Button,
  Icon,
  Box
} from '@chakra-ui/react'

import backgroundImage from '../assets/photo-1507525428034-b723cf961d3e.png'

export default function Hero() {
  return (
    <Box
      bgImage={`url(${backgroundImage})`}
      bgSize="cover"
      minH="500px"
      blur={'2px'}
    >
    <Container maxW={'5xl'} minH={'500px'}>
      <Stack
        textAlign={'center'}
        align={'center'}
        spacing={{ base: '200px', md: '45px' }}
        py={{ base: 24, md: '182px'}}
        minH={'100%'}>
        <Heading
          fontWeight={700}
          fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
          lineHeight={'110%'}>
          FIND YOUR{' '}
          <Text as={'span'} color={'blue.600'}>
            TRIP BUDDIES!
          </Text>
        </Heading>
        <Text color={'black.500'} maxW={'3xl'}>
        Embark on unforgettable journeys with like-minded adventurers. Discover your perfect travel companions and make every trip a shared experience. Explore new destinations together, creating memories that last a lifetime. Find your trip buddies now!
        </Text>
        <Stack spacing={6} direction={'row'}>
          <Button
            rounded={'full'}
            px={6}
            colorScheme={'blue.400'}
            bg={'blue.400'}
            _hover={{ bg: 'blue.500' }}>
            Get started
          </Button>
          <Button rounded={'full'} px={6}>
            Learn more
          </Button>
        </Stack>
      </Stack>
    </Container>
    </Box>
  )
}