import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socketUrl = 'http://localhost:3000';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const socket = io(socketUrl);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      socket.emit('chatMessage', inputMessage); 
      console.log(inputMessage)
      setInputMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
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
