import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Cookies from 'js-cookie';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const socket = io('localhost:3000');
  const sessionId = Cookies.get('sessionId');


  useEffect(() => {
    // Listen for incoming messages
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    return () => {
      // Clean up when component unmounts
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    // Prepare the message data
    const messageData = {
      tripId: "66155e88fc38d20761a08975", // Hardcoded for now
      sender: sessionId, // Hardcoded sender name for now
      content: inputMessage.trim()
    };
  
    // Emit the chatMessage event with the message data
    socket.emit('chatMessage', messageData);
  
    // Clear the input field after sending the message
    setInputMessage('');
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message.content}</div>
        ))}
      </div>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
