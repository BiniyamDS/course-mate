import React, { useState } from "react";

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black bg-opacity-50">
      {console.log("hello there")}
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Enter API Key</h2>
        <p className="text-gray-600 mb-4">
          To use the chat functionality, you need to provide your API key.
          <br />
          <a
            href="https://youtube.com/dummy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Click here for instructions on how to get an API key.
          </a>
        </p>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-black rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleApiKeySubmit}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Save API Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default APIModal;
