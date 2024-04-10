import { Card, CardBody, Box, Text, Flex, Heading, Avatar } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons'

export const TripParticipants = () => {
  return (
    <Box>
      <Card _hover={{background: "gray.50", color: "gray.700"}} direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline'>
        <Flex alignItems="center" justifyContent="space-between" marginLeft={2} width="100%">
          <Flex alignItems="center">
            <Avatar size='lg' name='Oshigaki Kisame' src='https://bit.ly/broken-link' />
            <CardBody>
              <Heading size='md'>FirstName + LastName</Heading>
              <Text marginTop={-2} py={2}>@username</Text>
            </CardBody>
          </Flex>
          <ChevronRightIcon marginRight={'5'} />
        </Flex>
      </Card>
    </Box>
  );
};
