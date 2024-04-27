/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Box, VStack, Text, Avatar } from '@chakra-ui/react';
import axios from 'axios'; 
import Cookies from 'js-cookie';

const ChatItem = ({ chat, onClick }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      px="4"
      py="3"
      _hover={{ bg: 'gray.100', cursor: 'pointer' }}
      onClick={() => onClick(chat)}
    >
      <Avatar size="md" name={chat.chatName} src={chat.trip.imageUrl} mr="4" />
      <Box flex="1">
        <Text fontWeight="bold">{chat.chatName}</Text>
      </Box>
      <Text fontSize="xs" color="gray.500">
        {chat.date}
      </Text>
    </Box>
  );
};

const ChatList = ( {onClick }) => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);


  useEffect(() => {
    // Fetch user's chats using Axios
    const fetchChats = async () => {
      try {
        const sessionId = Cookies.get('sessionId'); 
        const response = await axios.get(`http://localhost:3000/api/chat/user/${sessionId}/chats`);
        setChats(response.data.userChats);
      } catch (error) {
        console.error('Error fetching user chats:', error);
      }
    };

    fetchChats();
  }, []); 

  const handleChatClick = (chat) => {
    setSelectedChatId(chat._id);
    onClick(chat._id);
  };

  return (
    <VStack spacing="0" align="stretch">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onClick={handleChatClick}
        />
      ))}
    </VStack>
  );
};

export default ChatList;
