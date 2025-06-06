import React, { useState, useEffect, useRef } from 'react';
import '../styles/chatbot.css';
import axios from 'axios';
import { BaseUrl, services } from './constants'
import BrowsingFlow from './BrowsingFlow';
import TypewriterMessage from './TypewriterMessage';

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
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [email, setEmail] = useState('');
  const [idea, setIdea] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; idea?: string }>({});
  const [isBrowsingFlowActive, setIsBrowsingFlowActive] = useState(false);

  const [buttonDisable, setButtonDisable] = useState(false);


  useEffect(() => {
    if (messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleUserInput = async (text: any = false) => {
    const trimmedInput = text || input.trim();
    if (!trimmedInput || loading) return;

    setMessages(prev => [...prev, { text: trimmedInput, sender: 'user', timestamp: new Date() }]);
    setInput('');
    setLoading(true);
    setIsBrowsingFlowActive(false)
    setShowServiceDropdown(false)


    try {
      await axios.post(`${BaseUrl}/submit_inquiry`, { inquiry: trimmedInput });
      setMessages(prev => [
        ...prev,
        { text: `You said: "${trimmedInput}". How can I assist further?`, sender: 'bot', timestamp: new Date() }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Something went wrong.', sender: 'bot', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const appendBotMessage = (msg: string, sender: string = 'bot') => {
    setMessages((prev: any) => [...prev, { text: msg, sender: sender, timestamp: new Date() }]);
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
    setButtonDisable(true)

    if (text.toLowerCase().includes('services')) {
      setMessages(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
      setShowServiceDropdown(true);
      setShowProjectForm(false);
      setIsBrowsingFlowActive(false);

      setTimeout(() => setMessages((prev: any) => [...prev, { text: "Which service would you like to know more about?", sender: 'bot', timestamp: new Date() }]), 200)
      return;
    }

    if (text.toLowerCase().includes('specific project')) {
      setLoading(true)
      setMessages(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
      setShowProjectForm(true);
      setShowServiceDropdown(false);
      setIsBrowsingFlowActive(false);

      setTimeout(() => {
        setLoading(false)
        setMessages((prev: any) => [...prev, { text: "That's great! Could you tell me more about your project?", sender: 'bot', timestamp: new Date() }])
      }, 300)
      return;
    }

    if (text.toLowerCase().includes('just browsing')) {
      setMessages(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
      setShowServiceDropdown(false);
      setShowProjectForm(false);
      setIsBrowsingFlowActive(true);

      return;
    }

    if (text.toLowerCase().includes('inquiries')) {
      setMessages(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
      setLoading(true)
      setShowServiceDropdown(false);
      setShowProjectForm(false);
      setIsBrowsingFlowActive(false);

      setTimeout(() => {
        setMessages((prev: any) => [...prev, { text: "Please let me know your question or the information you're looking for.", sender: 'bot', timestamp: new Date() }]);
        setLoading(false)
      }, 300)
      return;
    }


    setInput(text);
    setTimeout(() => handleUserInput(text), 50);
  };

  const handleServiceSubmit = async () => {
    if (!selectedService) return;

    setMessages(prev => [...prev, { text: selectedService, sender: 'user', timestamp: new Date() }]);
    setLoading(true);
    setShowServiceDropdown(false);

    try {
      const response = await axios.post(`${BaseUrl}/submit_service`, {
        service: selectedService,
      });

      const message = response.data?.message || 'Here are the details.';
      setMessages(prev => [...prev, { text: message, sender: 'bot', timestamp: new Date() }]);
    } catch (error) {
      console.error('Error submitting service:', error);
      setMessages(prev => [...prev, { text: 'Something went wrong.', sender: 'bot', timestamp: new Date() }]);
    } finally {
      setLoading(false);
      setSelectedService('');
    }
  };

  const handleServiceCancel = () => {
    setShowServiceDropdown(false);
    setSelectedService('');
  };

  const handleProjectSubmit = async () => {
    const errors: { email?: string; idea?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) errors.email = 'Email is required.';
    else if (!emailRegex.test(email)) errors.email = 'Invalid email format.';
    if (!idea) errors.idea = 'Idea is required.';

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setMessages(prev => [...prev, { text: `Email: ${email}\nIdea: ${idea}`, sender: 'user', timestamp: new Date() }]);
    setLoading(true);
    setShowProjectForm(false);

    try {
      const res = await axios.post(`${BaseUrl}/get_scope`, { email, idea });
      setMessages(prev => [...prev, { text: res.data.message || 'Thank you for sharing your idea!', sender: 'bot', timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Something went wrong. Please try again later.', sender: 'bot', timestamp: new Date() }]);
    } finally {
      setLoading(false);
      setEmail('');
      setIdea('');
      setFormErrors({});
    }
  };

  const handleProjectCancel = () => {
    setShowProjectForm(false);
    setEmail('');
    setIdea('');
    setFormErrors({});
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const onTypingDone = () => {
    setButtonDisable(false)
  }
  const onTypingStart = () => {
    setButtonDisable(true)
  }



  return (
    <section>
      <div className="container-fluid px-4 py-3">
        <div className="row">
          <div id="chat-bot" className="p-lg-5 p-sm-4 p-3 mx-lg-1">
            {/* Header */}
            <div className="mb-md-2 mb-0">
              <img className="logo mb-md-3 mb-2 img-fluid" src="/images/prakash_logo.png" alt="avatar" />
              <h2 className="mb-2"><b>Welcome to Prakash Software Solutions Pvt. Ltd.</b></h2>
              <h5 className="mb-2">Thanks for stopping by.</h5>
              <h5>
                I'm <b>Piri <img src="/images/bot.png" className="bot-img img-fluid" alt="bot" /></b>, your virtual assistant. Ask me anything!
              </h5>
            </div>

            {/* Quick Replies */}
            <div className="row mt-xl-4 mb-lg-2 mt-1 mb-0 p-sm-0 p-2">
              <ul className="list-group cs-list mb-4">
                <li className={`cs-btn ${buttonDisable ? 'btn-disabled' : ''}`} onClick={(e) => buttonDisable ? e.preventDefault() : handleQuickReply('Tell me about your services.')}>
                  Tell me about your services.
                </li>
                <li className={`cs-btn ${buttonDisable ? 'btn-disabled' : ''}`} onClick={(e) => buttonDisable ? e.preventDefault() : handleQuickReply('I need help with a specific project.')}>
                  I need help with a specific project.
                </li>
                <li className={`cs-btn ${buttonDisable ? 'btn-disabled' : ''}`} onClick={(e) => buttonDisable ? e.preventDefault() : handleQuickReply('I am just browsing.')}>
                  I am just browsing.
                </li>
                <li className={`cs-btn ${buttonDisable ? 'btn-disabled' : ''}`} onClick={(e) => buttonDisable ? e.preventDefault() : handleQuickReply('Other inquiries.')}>
                  Other inquiries.
                </li>
              </ul>
            </div>

            {/* Chat Messages */}
            <div className="chat-bot">
              <div id="chat-messages" className="row p-sm-0 p-2 pt-0">
                <div className="col-12">
                  {/* {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg?.sender}`}>
                      <div className="bubble">{msg?.text}</div>
                    </div>
                  ))} */}
                  {messages.map((msg: any, index) => (
                    <div key={index} className={`message-container ${msg.sender}`}>
                      <div className={`timestamp small mb-1 ${msg.sender === 'bot' ? 'text-start' : 'text-end'}`}>
                        {formatTime(new Date(msg.timestamp))}
                      </div>
                      <div className={`message ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
                        {/* <div className="bubble">{msg?.text}</div> */}
                        {msg.sender === 'bot' ? (
                          <TypewriterMessage text={msg.text} onStart={onTypingStart} onDone={onTypingDone} />
                        ) : (
                          <div className="bubble">{msg.text}</div>
                        )}
                      </div>
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
                  {!showServiceDropdown && !showProjectForm && !isBrowsingFlowActive && (<div style={{ height: '70px' }} />)}
                </div>
              </div>

              {/* Text Input */}
              {!loading && !showServiceDropdown && !showProjectForm && !isBrowsingFlowActive && (
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
                  {showServiceDropdown && (
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
                        <button className="submit-button btn btn-primary" onClick={handleServiceSubmit}>
                          Submit
                        </button>
                        <button className="submit-button btn btn-secondary" onClick={handleServiceCancel}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                  }
                </div>
              )}

              {!loading && showProjectForm && (
                <div className="row p-sm-0 p-2 pt-0">
                  <div className="w-100">
                    <input
                      type="email"
                      className={`form-control mb-2 ${formErrors.email ? 'is-invalid' : ''}`}
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {formErrors.email && <div className="invalid-feedback mr-10">{formErrors.email}</div>}

                    <textarea
                      className={`form-control mb-2 ${formErrors.idea ? 'is-invalid' : ''}`}
                      rows={3}
                      placeholder="Describe your idea..."
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                    />
                    {formErrors.idea && <div className="invalid-feedback">{formErrors.idea}</div>}

                    <div className="d-flex gap-2">
                      <button className="submit-button btn btn-primary" onClick={handleProjectSubmit}>Submit</button>
                      <button className="submit-button btn btn-secondary" onClick={handleProjectCancel}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {isBrowsingFlowActive && (
                <BrowsingFlow
                  onMessage={(msg, sender = 'bot') => {
                    appendBotMessage(msg, sender);
                    if (msg.includes("Thanks!")) {

                    }
                  }}
                  isLoading={loading}
                  setLoading={setLoading}
                  setIsBrowsingFlowActive={setIsBrowsingFlowActive}
                />
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatBot;
