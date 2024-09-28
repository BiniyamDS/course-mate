import { marked } from "marked";

function injectChatSidebar() {
  console.log("Injecting chat sidebar");

  // Create the sidebar container
  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "gemini-chat-sidebar";
  sidebarContainer.classList.add("hidden"); // Initially hidden
  document.body.appendChild(sidebarContainer);

  // Create the results div
  const resultsDiv = document.createElement("div");
  resultsDiv.id = "gemini-chat-results";
  const result_p = document.createElement('div');  // Changed from <p> to <div> to allow multiline content
  result_p.innerHTML = "No messages yet. Type and send a message to start the conversation.";  // Default message
  resultsDiv.appendChild(result_p);
  sidebarContainer.appendChild(resultsDiv);

  // Create the input container
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("input-container");

  const textBox = document.createElement("textarea");
  textBox.id = "gemini-chat-text-box";
  textBox.placeholder = "Type a message...";
  inputContainer.appendChild(textBox);

  const sendButton = document.createElement("button");
  sendButton.id = "gemini-chat-send-button";
  sendButton.textContent = "Send";
  inputContainer.appendChild(sendButton);

  sidebarContainer.appendChild(inputContainer);

  // Create the toggle button
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Chat";
  toggleButton.id = "gemini-chat-toggle-button";
  document.body.appendChild(toggleButton);

  // Toggle sidebar visibility
  toggleButton.addEventListener("click", () => {
      sidebarContainer.classList.toggle("hidden");
      if (sidebarContainer.classList.contains("hidden")) {
          toggleButton.textContent = "Chat";
      } else {
          toggleButton.textContent = "Close Chat";
      }
  });

  // Add event listener for the send button
  sendButton.addEventListener("click", async () => {
      const message = textBox.value;
      if (message) {
          // Call the background script
          const response = await chrome.runtime.sendMessage({ message: message });
          const aiResponseHtml = marked(response.message);  // Convert markdown to HTML

          // Update the results div with the response, preserving markdown formatting
          result_p.innerHTML = `<strong>You: </strong>${message}<p><strong>AI:</strong></p>${aiResponseHtml}`;
          textBox.value = ""; // Clear the text box
      }
  });
}

injectChatSidebar();
