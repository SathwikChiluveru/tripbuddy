import { Card, Image, Stack, CardBody, Heading, Text, CardFooter, Button, Box, HStack, Tag, Spinner, Flex, Link } from '@chakra-ui/react';
import { ArrowForwardIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';

export default function TripCard() {
  return (
    <Box m={'auto'} width={'full'} minH={'260px'}>
        <Flex m={'auto'} justifyContent={'center'} minH={'inherit'} alignItems={'center'}>
          {/* <Spinner /> */}
        </Flex> 
        <Card
          direction={{ base: 'column', sm: 'row' }}
          overflow='hidden'
          variant='outline'
          minH={'inherit'}
          justifyContent={'space-between'}
        >
          <Stack>
            <CardBody>
              <HStack mb={2}>
                <Tag size={'sm'} variant='solid' colorScheme='teal'>
                  Sports
                </Tag>
              </HStack>
              <Heading size='md'>Test Post</Heading>
              <Text py='2' noOfLines={[3]} pb={0}>
                Test Description
              </Text>
            </CardBody>

            <CardFooter alignItems={'center'}>
              <Link>
                <Button variant='solid' colorScheme='red' mr={5}>
                  Check Buddies
                  <ArrowForwardIcon mt={0.5} ml={1} />
                </Button>
              </Link>
              <EditIcon boxSize={5} mr={'15px'} cursor={'pointer'}/>
              <DeleteIcon boxSize={5} cursor={'pointer'} />
            </CardFooter>
          </Stack>

          <Image
            objectFit='cover'
            maxW={{ base: '100%', sm: '200px' }}
            src={'https://placehold.co/200x200'}
            alt='Test Picture'
          />
        </Card>
    </Box >
  );
}
