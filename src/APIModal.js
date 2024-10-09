import React, { useState } from "react";
import { X, Trash2 } from "lucide-react"; // Import the close icon

const APIModal = ({ handleClose }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem("apiKey", apiKey);
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
      handleClose();
    }
  };

  const handleDeleteApiKey = () => {
    localStorage.removeItem("apiKey");
    setApiKey("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px] relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Enter API Key</h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          To use the chat functionality, you need to provide your API key.
          <br />
          <a
            href="https://www.youtube.com/watch?v=TTG7Uo8lS1M"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Click here for instructions on how to get an API key.
          </a>
        </p>

        {localStorage.getItem("apiKey") ? (
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <button
              onClick={handleDeleteApiKey}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md"
            >
              <Trash2 size={24} />
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleApiKeySubmit}
                className="px-4 py-2 bg-black text-white rounded-md"
              >
                Save API Key
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default APIModal;
