import React, { useState, useEffect, useRef } from 'react';
import '../styles/chatbot.css';
import axios from 'axios';
import { services } from './constants'

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleUserInput = (text: any = false) => {
    const trimmedInput = text || input.trim();
    if (!trimmedInput || loading) return;

    // Check for special phrase
    if (typeof trimmedInput === 'string' && trimmedInput?.toLowerCase()?.includes('tell me about your services')) {
      setMessages(prev => [...prev, { text: trimmedInput, sender: 'user' }]);
      setShowServiceDropdown(true);
      setInput('');
      return;
    }

    // Normal message flow
    setMessages(prev => [...prev, { text: trimmedInput, sender: 'user' }]);
    setInput('');
    setLoading(true);

    // Simulated bot reply
    setTimeout(() => {
      setMessages(prev => [...prev, { text: `You said: "${trimmedInput}". How can I assist further?`, sender: 'bot' }]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  // const handleQuickReply = (text: string) => {
  //   if (loading) return;
  //   setInput(text);
  //   setTimeout(() => handleUserInput(text), 50);
  // };

  const handleQuickReply = (text: string) => {
    if (loading) return;

    if (text.toLowerCase().includes('services')) {
      setMessages(prev => [...prev, { text, sender: 'user' }]);
      setShowServiceDropdown(true);
      return;
    }

    setInput(text);
    setTimeout(() => handleUserInput(text), 50);
  };

  const handleServiceSubmit = async () => {
  if (!selectedService) return;

  setMessages(prev => [...prev, { text: selectedService, sender: 'user' }]);
  setLoading(true);
  setShowServiceDropdown(false);

  try {
    const response = await axios.post('/submit_service', {
      service: selectedService,
    });

    const message = response.data?.message || 'Here are the details.';
    setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
  } catch (error) {
    console.error('Error submitting service:', error);
    setMessages(prev => [...prev, { text: 'Something went wrong.', sender: 'bot' }]);
  } finally {
    setLoading(false);
    setSelectedService('');
  }
};

  const handleServiceCancel = () => {
    setShowServiceDropdown(false);
    setSelectedService('');
  };


  return (
    <section>
      <div className="container-fluid px-4 py-3">
        <div className="row">
          <div id="chat-bot" className="p-lg-5 p-sm-4 p-3 mx-lg-1">
            {/* Header */}
            <div className="mb-md-2 mb-0">
              <img className="logo mb-md-3 mb-2 cb-img img-fluid" src="/images/prakash_logo.png" alt="avatar" />
              <h2 className="mb-2"><b>Welcome to Prakash Software Solutions Pvt. Ltd.</b></h2>
              <h5 className="mb-2">Thanks for stopping by.</h5>
              <h5>
                I'm <b>Piri <img src="/images/bot.png" className="bot-img img-fluid" alt="bot" /></b>, your virtual assistant. Ask me anything!
              </h5>
            </div>

            {/* Quick Replies */}
            <div className="row mt-xl-4 mb-lg-2 mt-1 mb-0 p-sm-0 p-2">
              <ul className="list-group cs-list mb-4">
                <li className="cs-btn" onClick={() => handleQuickReply('Tell me about your services.')}>
                  Tell me about your services.
                </li>
                <li className="cs-btn" onClick={() => handleQuickReply('I need help with a specific project.')}>
                  I need help with a specific project.
                </li>
                <li className="cs-btn" onClick={() => handleQuickReply('I am just browsing.')}>
                  I am just browsing.
                </li>
                <li className="cs-btn" onClick={() => handleQuickReply('Other inquiries.')}>
                  Other inquiries.
                </li>
              </ul>
            </div>

            {/* Chat Messages */}
            <div className="chat-bot">
              <div id="chat-messages" className="row p-sm-0 p-2 pt-0">
                <div className="col-12">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender}`}>
                      <div className="bubble">{msg.text}</div>
                    </div>
                  ))}
                  {loading && (
                    <div className="message bot">
                      <div className="loader">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                  <div style={{ height: '70px' }} />
                </div>
              </div>

              {/* Text Input */}
              {!loading && !showServiceDropdown && (
                <div className="row p-sm-0 p-2 pt-0" id="search-input-div">
                  <div className="textarea-div">
                    <div className="textarea-container">
                      <textarea
                        className="sr-btn form-control"
                        rows={2}
                        placeholder="Ask anything here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={loading}
                      />
                      <button className="send-btn" onClick={() => handleUserInput()} disabled={loading}>
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!loading && (
                <div className="row p-sm-0 p-2 pt-0" id="search-input-div">
                  {showServiceDropdown ? (
                    <div className="w-100">
                      <select
                        className="form-select mb-2"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                      >
                        <option value="">Select a service</option>
                        {services.map((service, idx) => (
                          <option key={idx} value={service.value}>
                            {service.label}
                          </option>
                        ))}
                      </select>
                      <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={handleServiceSubmit}>
                          Submit
                        </button>
                        <button className="btn btn-secondary" onClick={handleServiceCancel}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="textarea-div">
                      <div className="textarea-container">
                        <textarea
                          className="sr-btn form-control"
                          rows={2}
                          placeholder="Ask anything here..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          disabled={loading}
                        />
                        <button className="send-btn" onClick={handleUserInput} disabled={loading}>
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatBot;
