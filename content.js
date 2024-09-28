function injectTextBox() {
    console.log("Found it");
    const containerDiv = document.createElement("div");
    containerDiv.id = "gemini-chat-container";
  
    const textBox = document.createElement("textarea");
    textBox.id = "gemini-chat-text-box";
    textBox.placeholder = "Type a message...";
    containerDiv.appendChild(textBox);
  
    const sendButton = document.createElement("button");
    sendButton.id = "gemini-chat-send-button";
    sendButton.textContent = "Send";
    containerDiv.appendChild(sendButton);
  
    const resultsDiv = document.createElement("div");
    resultsDiv.id = "gemini-chat-results";
    const sampleTextP = document.createElement("p");
    sampleTextP.textContent =
      "No messages yet. Type and send a message to start the conversation.";
    resultsDiv.appendChild(sampleTextP);
    containerDiv.appendChild(resultsDiv);
  
    document.body.appendChild(containerDiv);
  
    // Add event listener for the send button
    sendButton.addEventListener("click", async () => {
      const message = textBox.value;
      if (message) {
        // Call the background script
        const response = await chrome.runtime.sendMessage({ message: message });
        // Update the results div with the response
        console.log(response)
        sampleTextP.textContent = response.message;
        textBox.value = ""; // Clear the text box
      }
    });
  }
  
  injectTextBox();
  