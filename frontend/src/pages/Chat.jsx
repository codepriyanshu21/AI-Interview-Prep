import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    startChat();
  }, []);

  const startChat = async () => {
    try {
      const response = await axios.post('/api/chat/start');
      setMessages(response.data.messages);
      setChatId(response.data.chatId);
    } catch (error) {
      toast.error('Failed to start chat: ' + error.response?.data?.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat/query', {
        message: input,
        chatId,
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        score: response.data.score,
        feedback: response.data.feedback,
        citations: response.data.citations,
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentQuestionIndex(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to send message: ' + error.response?.data?.message);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getCurrentQuestion = () => {
    const questionMessages = messages.filter(msg => msg.role === 'assistant' && !msg.score);
    return questionMessages[currentQuestionIndex];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">AI Interview Practice</h1>

      <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.score && (
                  <div className="mt-2 text-sm">
                    <p className="font-semibold">Score: {message.score}/10</p>
                    {message.feedback && (
                      <p className="mt-1">{message.feedback}</p>
                    )}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Citations:</p>
                        <ul className="list-disc list-inside">
                          {message.citations.map((citation, i) => (
                            <li key={i} className="text-xs">{citation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {getCurrentQuestion() && (
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Current Question:</strong> {getCurrentQuestion().content}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Answer the questions above. You'll receive feedback and scores after each response.
      </div>
    </div>
  );
};

export default Chat;
