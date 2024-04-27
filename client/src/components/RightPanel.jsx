import { Center, Flex, Box, Heading, Text } from '@chakra-ui/react';
import ChatPanel from './ChatPanel';

const RightPanel = ({ selectedChatId }) => {
    console.log(selectedChatId)

  return (
    <Flex direction="column" w="100%">
      {selectedChatId ? (
        <Flex direction="column" w="100%">
        <ChatPanel selectedChatId={selectedChatId} />
    </Flex>
      ) : (
        <Center bg="gray.100" h="100%">
          <Flex direction="column" textAlign="center" color="gray.600">
            <Box>
              <Heading size="lg">Welcome to Chat App</Heading>
              <Text mt="4">Select a chat to start messaging.</Text>
            </Box>
          </Flex>
        </Center>
      )}
    </Flex>
  );
};

export default RightPanel;