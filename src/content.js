import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import './assets/style.css'

function ChatSidebar() {
  const [isHidden, setIsHidden] = useState(true);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(
    "No messages yet. Type and send a message to start the conversation."
  );

  const toggleSidebar = () => {
    setIsHidden(!isHidden);
  };

  const handleSendMessage = () => {
    if (message) {
      chrome.runtime.sendMessage({ message: message }, (response) => {
        const aiResponseHtml = marked(response.message); // Convert markdown to HTML
        setResult(
          `<strong>You: </strong>${message}<p><strong>AI:</strong></p>${aiResponseHtml}`
        );
        setMessage(""); // Clear the text box
      });
    }
  };

  return (
    <>
      <button onClick={toggleSidebar}>
        {isHidden ? "Chat" : "Close Chat"}
      </button>
      <div id="gemini-chat-sidebar" className={isHidden ? "hidden" : ""}>
        <div id="gemini-chat-results">
          <div>{result}</div>
        </div>
        <div className="input-container">
          <textarea
            id="gemini-chat-text-box"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="bg-blue-500" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </>
  );
}
// Create a container for the React component
const container = document.createElement('div');
document.body.appendChild(container);

// Create a root and render the component
const root = createRoot(container);
root.render(<ChatSidebar />);

export default ChatSidebar;
