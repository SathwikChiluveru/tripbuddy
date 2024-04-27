import { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import LeftPanel from './../components/LeftPanel';
import RightPanel from '../components/RightPanel';

export const PlayGround = () => {
  const [selectedChatId, setSelectedChatId] = useState(null); // State to manage selected chat ID

  // Callback function to handle chat selection
  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId); // Update selected chat ID state
  };

  return (
    <Flex h="100vh">
      {/* Pass handleChatSelect as a prop to LeftPanel */}
      <LeftPanel onChatSelect={handleChatSelect} />
      {/* Pass selectedChatId as a prop to RightPanel */}
      <RightPanel selectedChatId={selectedChatId} />
    </Flex>
  );
};
