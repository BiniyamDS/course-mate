import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import ReactMarkDown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { ClipLoader } from "react-spinners";
import Tooltip from "./Tooltip"; // Import the Tooltip component

function ChatSidebar({ isSubtitleLoaded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "ai" },
  ]);
  const models = {
    "Gemma 2 9B": "gemma2-9b-it",
    "Llama 3.1 70B Versatile": "llama-3.1-70b-versatile",
    "Llama 3.1 8B Instant": "llama-3.1-8b-instant",
  };
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);
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
          model: selectedModel,
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const latestMessage = scrollAreaRef.current.lastElementChild;
      if (latestMessage) {
        latestMessage.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [messages]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-black text-white shadow-lg z-[10000]"
          aria-label="Open chat sidebar"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none">
          <div className="bg-white border border-border rounded-lg shadow-lg w-1/2 h-4/5 flex flex-col overflow-hidden pointer-events-auto">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-lg text-black font-semibold">Chat</h2>
              <div className="flex items-center space-x-4">
                <Tooltip text="Select a model">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="p-2 border rounded-md bg-white text-black"
                  >
                    {Object.keys(models).map((model, index) => (
                      <option key={index} value={models[model]}>
                        {model}
                      </option>
                    ))}
                  </select>
                </Tooltip>
                <Tooltip text="Clear chat">
                  <button
                    className="p-2 text-red-500"
                    onClick={() => setMessages([])}
                    aria-label="Clear chat"
                  >
                    <Trash2 size={24} />
                  </button>
                </Tooltip>
                <Tooltip text="Close">
                  <button
                    className="p-2"
                    onClick={toggleSidebar}
                    aria-label="Close sidebar"
                  >
                    <X size={24} />
                  </button>
                </Tooltip>
              </div>
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
                    <ReactMarkDown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {message.text}
                    </ReactMarkDown>
                  </div>
                ))
              ) : (
                <div className="flex flex-col justify-center items-center h-full">
                  <ClipLoader
                    color="#292416"
                    loading={!isSubtitleLoaded}
                    size={80}
                  />
                  <p className="text-black">Scraping subtitles...</p>
                  <p className="text-grey-200">
                    Please click on the Downloads section
                  </p>
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
                  onKeyDown={handleKeyPress}
                  className="flex-grow rounded-md text-black resize-none min-h-[40px] max-h-[120px] py-2 px-3 border border-gray-200"
                  rows={1}
                />
                <button
                  type="submit"
                  className={`${
                    isSubtitleLoaded
                      ? "bg-black text-white"
                      : "bg-gray-200 text-white"
                  } flex-shrink-0 h-[40px] w-[40px] p-2 rounded`}
                  disabled={!isSubtitleLoaded}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatSidebar;
