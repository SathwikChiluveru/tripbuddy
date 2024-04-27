import { Flex } from "@chakra-ui/react";
import ChatList from "./ChatList";

const LeftPanel = ({ onChatSelect }) => {
  return (
    <Flex direction="column" w="30%">
      <ChatList onClick={onChatSelect} flex="1" overflow="auto" />
    </Flex>
  );
};

export default LeftPanel;