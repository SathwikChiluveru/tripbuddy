import { Flex } from "@chakra-ui/react";
import ChatList from "./ChatList";
import Header from './Header';

const LeftPanel = ({ onChatSelect }) => {
  return (
    <Flex direction="column" w="30%">
      <Header/>
      <ChatList onClick={onChatSelect} flex="1" overflow="auto" />
    </Flex>
  );
};

export default LeftPanel;