import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Key,
  Lock,
  RefreshCcw,
  Sun,
  Moon,
} from "lucide-react"; // Import Sun and Moon icons
import ReactMarkDown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { ClipLoader } from "react-spinners";
import Tooltip from "./Tooltip"; // Import the Tooltip component
import APIModal from "./APIModal";
import NotFound from "./NotFound";

function ChatSidebar({ isSubtitleLoaded, updateSub, setLoaded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Add state for dark mode
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "ai" },
  ]);
  const models = {
    "Gemma 2 9B": "gemma2-9b-it",
    "Llama 3.1 70B Versatile": "llama-3.1-70b-versatile",
    "Llama 3.1 8B Instant": "llama-3.1-8b-instant",
  };
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(models["Gemma 2 9B"]);
  const textareaRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [api_key, setApiKey] = useState(localStorage.getItem("apiKey") || "");

  useEffect(() => {
    if (api_key) {
      console.log("Found API key in local storage");
      store_api_key(api_key);
    }
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode); // Add function to toggle dark mode

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: "user",
      };
      setMessages([...messages, newMessage]);
      console.log(selectedModel);
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

  function store_api_key(apiKey) {
    browser.runtime
      .sendMessage({ action: "storeKey", api_key: apiKey })
      .then((response) => {
        if (response.success) {
          console.log("API key stored successfully");
        } else {
          console.error("Failed to store API key:", response.error);
        }
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  }

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
      {/* Button to toggle sidebar */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-black text-white shadow-lg z-[10000]"
          aria-label="Open chat sidebar"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Sidebar */}
      {isOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none bg-transparent`}
        >
          <div
            className={`border rounded-lg shadow-lg w-1/2 h-4/5 flex flex-col overflow-hidden pointer-events-auto ${
              isDarkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-border"
            }`}
          >
            <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-border'}`}>
              <h2 className="text-lg font-semibold">Chat</h2>
              <div className="flex items-center space-x-4">
                <Tooltip text="Toggle Dark Mode">
                  <button
                    className="p-2"
                    onClick={toggleDarkMode}
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                  </button>
                </Tooltip>
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
                <Tooltip text="Update subtitles">
                  <button
                    className="p-2 text-blue-500"
                    onClick={() => updateSub(setLoaded)}
                    aria-label="Update subtitles"
                  >
                    <RefreshCcw size={24} />
                  </button>
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
                <Tooltip text="API Key">
                  <button
                    className={`p-2 ${
                      localStorage.getItem("apiKey")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                    onClick={() => setIsApiKeyModalOpen(true)}
                    aria-label="API Key"
                  >
                    {localStorage.getItem("apiKey") ? (
                      <Key size={24} />
                    ) : (
                      <Lock size={24} />
                    )}
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
              {localStorage.getItem("apiKey") ? (
                isSubtitleLoaded ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 p-2 rounded-lg ${
                        message.sender === "user"
                          ? `${
                              isDarkMode
                                ? "bg-blue-700 text-white"
                                : "bg-black text-white"
                            } ml-10`
                          : `${
                              isDarkMode
                                ? "bg-gray-600 text-white"
                                : "bg-gray-200 text-black"
                            } mr-10`
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
                )
              ) : (
                <NotFound />
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className={`p-4 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-border'}`}
            >
              <div className="flex items-end space-x-2">
                <textarea
                  ref={textareaRef}
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  className={`flex-grow rounded-md resize-none min-h-[40px] max-h-[120px] py-2 px-3 border ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-black border-gray-200"
                  }`}
                  rows={1}
                />
                <button
                  type="submit"
                  className={`${
                    isSubtitleLoaded
                      ? `${
                          isDarkMode
                            ? "bg-blue-700 text-white"
                            : "bg-black text-white"
                        }`
                      : `${
                          isDarkMode
                            ? "bg-gray-600 text-white"
                            : "bg-gray-200 text-white"
                        }`
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
      {isApiKeyModalOpen ? (
        <APIModal
          handleClose={() => setIsApiKeyModalOpen(false)}
          store_key={store_api_key}
        />
      ) : (
        // console.log('hi')
        console.log("hello")
      )}
    </>
  );
}

export default ChatSidebar;
