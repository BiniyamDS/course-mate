import React, { useState } from "react";
import ReactMarkDown from 'react-markdown'

function ChatSidebar() {
  const [isHidden, setIsHidden] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Store all messages in an array

  const toggleSidebar = () => {
    setIsHidden(!isHidden);
  };

  const handleSendMessage = () => {
    if (message) {
      // Add the user's message to the messages array
      const userMessage = { text: message, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      chrome.runtime.sendMessage({ action: "sendMessage" ,message: message }, (response) => {
        const aiResponseHtml = response.message; // Convert markdown to HTML
        const aiMessage = { text: aiResponseHtml, sender: "ai" };

        // Add the AI's response to the messages array
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setMessage(""); // Clear the text box;
      });
      // Send the message to the background script
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-4">
      <div
        className={
          isHidden ? "hidden" : "bg-white shadow-lg rounded-lg p-4 max-w-md"
        }
      >
        <div className="text-gray-800">
          <div className="text-lg font-semibold">Course Mate</div>
          <hr className="mb-2" />
          <div className="overflow-y-auto max-h-60 mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-3 max-w-xs rounded-lg transition-all duration-300 ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white self-end rounded-br-none ml-10" // User message bubble
                    : "bg-gray-200 text-gray-800 self-start rounded-bl-none mr-10" // AI message bubble
                }`}
              >
                <div>
                  <ReactMarkDown>{msg.text}</ReactMarkDown>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="input-container mt-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 focus:outline-none resize-none"
          />
          <button
            className="bg-blue-500 text-white rounded mt-2 p-2 w-full"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
      <button
        className="bg-blue-500 text-white m-2 rounded-full p-3"
        onClick={toggleSidebar}
      >
        {isHidden ? "Chat" : "Close Chat"}
      </button>
    </div>
  );
}

export default ChatSidebar;
