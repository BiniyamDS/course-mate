import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import ReactMarkDown from "react-markdown";
import { ClipLoader } from "react-spinners";

function ChatSidebar({ isSubtitleLoaded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "ai" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const textareaRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: "user",
      };
      setMessages([...messages, newMessage]);

      browser.runtime
        .sendMessage({
          action: "sendMessage",
          message: inputMessage,
          messages: messages,
        })
        .then((response) => {
          const aiMessage = {
            id: messages.length + 2,
            text: response.message,
            sender: "ai",
          };
          setMessages((prevMessages) => [...prevMessages, aiMessage]);
          setInputMessage("");
        })
        .catch((error) => console.error("Error sending message:", error));

      setInputMessage("");
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed right-4 bottom-4 z-[10000]">
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-black text-white shadow-lg mr-20"
          aria-label="Open chat sidebar"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white border border-border rounded-lg shadow-lg w-80 h-[480px] flex flex-col overflow-hidden animate-slide-up">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg text-black font-semibold">Chat</h2>
            <button
              className="p-2"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
            <button
              className="p-2 text-red-500"
              onClick={() => setMessages([])}
              aria-label="Clear chat"
            >
              <Trash2 size={24} />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto" ref={scrollAreaRef}>
            {isSubtitleLoaded ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 p-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-black text-white ml-10"
                      : "bg-gray-200 text-black mr-10"
                  } max-w-[80%] break-words`}
                >
                  <ReactMarkDown>{message.text}</ReactMarkDown>
                </div>
              ))
            ) : (
              <div className="flex flex-col justify-center items-center h-full">
                <ClipLoader
                  color="#292416"
                  loading={!isSubtitleLoaded}
                  size={80}
                />
                <p className="text-black">Scraping subtiles...</p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-border"
          >
            <div className="flex items-end space-x-2">
              <textarea
                ref={textareaRef}
                placeholder="Type a message..."
                value={inputMessage}
                onChange={handleInputChange}
                className="flex-grow rounded-md text-black resize-none min-h-[40px] max-h-[120px] py-2 px-3 border border-gray-200"
                rows={1}
              />
              <button
                type="submit"
                className={`${
                  isSubtitleLoaded
                    ? "bg-black text-white"
                    : "bg-gray-200 text-white"
                } flex-shrink-0 p-2 rounded`}
                disabled={!isSubtitleLoaded}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatSidebar;
