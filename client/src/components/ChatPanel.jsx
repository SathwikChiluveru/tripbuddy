/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { Box, Flex, Text, Input, Button } from '@chakra-ui/react';
import io from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie';

const ChatMessage = ({ message, isSent }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    const fetchSenderName = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/user/getUserById/${message.sender}`);
        setSenderName(response.data.username);
      } catch (error) {
        console.error('Error fetching sender name:', error);
      }
    };

    fetchSenderName();
  }, [message.sender]);

  return (
    <>
    <Box 
      bg={isSent ? 'blue.500' : 'purple.100'}
      color={isSent ? 'white' : 'black'}
      borderRadius="md"
      p="2"
      maxW="100%"
      alignSelf={isSent ? 'flex-end' : 'flex-start'}
      mb="1"
      alignItems={isSent ? 'flex-end' : 'flex-start'}
    > 
      <Text>{message.content}</Text>
      <Box marginTop="auto">
        <Text fontSize="xs">{formattedTime}</Text>
      </Box>
    </Box>
    <Text fontSize="xs">{isSent ? '' : senderName}</Text>
    </>
  );
};

const ChatPanel = ({ selectedChatId }) => {
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState();
  const sessionId = Cookies.get('sessionId');
  const [socket, setSocket] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (lastMessageRef && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      newSocket.emit('joinRoom', selectedChatId);
    });

    newSocket.on('newMessage', ({ sender, content }) => {
      setMessages((prevMessages) => [...prevMessages, { sender, content }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [selectedChatId]);

  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/chat/${selectedChatId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };

    if (selectedChatId) {
      fetchChatMessages();
    }
  }, [selectedChatId]);

  useEffect(() => {
    const fetchChatName = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/chat/${selectedChatId}/title`);
        setTitle(response.data);
        console.log(title)
      } catch (error) {
        console.error('Error fetching chat name:', error);
      }
    };

    if (selectedChatId) {
      fetchChatName();
    }
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (messageInput.trim() !== '') {
      try {
        await axios.post(`http://localhost:3000/api/chat/${selectedChatId}/message`, {
          sender: sessionId,
          content: messageInput.trim(),
        });
        socket.emit('sendMessage', { chatId: selectedChatId, sender: sessionId, content: messageInput.trim() });
        setMessageInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const [messageInput, setMessageInput] = useState('');


  return (
    <Flex direction="column" h="97vh">
      {/* {messages.length > 0 ? ( */}
        <>
          <Box bg={'gray.100'} width={'100%'} height={'7%'} mb={'2'} display="flex" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" ml="5">
              {title}
            </Text>
          </Box>
          <Box flex="1" mb="4" display="flex" flexDirection="column" style={{ overflowY: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isSent={message.sender === sessionId}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              />
            ))}
          </Box>

          <Flex>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              mr="2"
            />
            <Button colorScheme="blue" onClick={handleSendMessage}>
              Send
            </Button>
          </Flex>
        </>
      {/* ) : (
        <Box textAlign="center">
          <Text>No messages yet. Select a chat to start.</Text>
        </Box>
      )} */}
    </Flex>
  );
};

export default ChatPanel;
