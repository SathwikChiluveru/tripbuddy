import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios'; // Import Axios
import Cookies from 'js-cookie'

const ChatComponent = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('newMessage', ({ sender, content }) => {
      setMessages((prevMessages) => [...prevMessages, { sender, content }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    try {
      const sessionId = Cookies.get('sessionId'); 
      const response = await axios.post(
        `http://localhost:3000/api/chat/6622cd7324036e90a7e5af78/message`,
        { sender: sessionId, content: inputValue }
      );
      socket.emit('sendMessage', { chatId: '6622cd7324036e90a7e5af78', sender: sessionId, content: inputValue });
      console.log(response.data.message);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.sender}:</strong> {msg.content}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Type your message"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
