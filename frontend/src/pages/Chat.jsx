import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true); // NEW
  const [chatId, setChatId] = useState(null);
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
      setLoadingQuestions(true);
      const response = await axios.post('/api/chat/start');
      setMessages(response.data.messages);
      setChatId(response.data.chatId);
    } catch (error) {
      toast.error('Failed to start chat: ' + error.response?.data?.message);
    } finally {
      setLoadingQuestions(false); // stop loader
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat/query', { message: input, chatId });

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        score: response.data.score,
        feedback: response.data.feedback,
        citations: response.data.citations,
      };

      setMessages(prev => [...prev, aiMessage]);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">AI Interview Practice</h1>

      <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingQuestions ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <span>Loading interview questions...</span>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl break-words ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.score && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <p className="font-semibold">Score: {msg.score}/10</p>
                      {msg.feedback && <p className="mt-1">{msg.feedback}</p>}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Citations:</p>
                          <ul className="list-disc list-inside text-xs text-gray-600">
                            {msg.citations.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && !loadingQuestions && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl">
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
        <div className="border-t p-4 bg-gray-50">
          <div className="flex space-x-2 items-end">
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              minRows={2}
              maxRows={6}
              disabled={loading || loadingQuestions} // disable input while loading questions
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || loadingQuestions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        Answer the questions above. You'll receive feedback and scores after each response.
      </div>
    </div>
  );
};

export default Chat;
