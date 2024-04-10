/* eslint-disable react/prop-types */
import { Card, Image, Stack, CardBody, Heading, Text, CardFooter, Button, Box, HStack, Tag, Flex, Link } from '@chakra-ui/react';

export default function TripCard({ userData }) {

  console.log(userData)

  return (
    <Box m={'auto'} width={'full'} minH={'260px'}>
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
              <Heading size='md'>{userData._id}</Heading>
              <Text py='2' noOfLines={[3]} pb={0}>
                Test Description
              </Text>
            </CardBody>
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
