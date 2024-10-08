const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqApiKey = process.env.GROQ_API_KEY;

async function send_api_msg(message, chat_history) {
  console.log("in msg");

  return new Promise((resolve, reject) => {
    let contextText = `the user is watching a lecture on coursera`;

    // Retrieve subtitleContent from local storage
    browser.storage.local.get("subtitleContent").then((data) => {
      if (data["subtitleContent"]) {
        contextText = data["subtitleContent"];
        console.log(`in local: ${contextText}`);
      }

      const url = new URL(groqApiUrl);
      console.log(`context: ${contextText}`);

      // Convert your stored chat history to the required format for the API
      const formattedHistory = chat_history.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      // Build the API request params
      const params = {
        messages: [
          ...formattedHistory, // Include the converted chat history
          {
            role: "user",
            content: message, // Current user message
          },
          {
            role: "system",
            content: `Using the following lecture video transcript as context, please provide a detailed answer to the user's query. Ensure that your response is directly related to the content of the transcript and highlights relevant information. Context: ${contextText}`,
          },
        ],
        model: "llama-3.1-8b-instant",
      };

      // Make the API request
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("API response data:", data); // Log the response data

          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error("Invalid response format");
          }

          // Resolve the Promise with the content
          resolve(data.choices[0].message.content);
        })
        .catch((error) => {
          console.error("Error in send_api_msg:", error); // Log the error
          reject(error); // Reject the Promise with the error
        });
    });
  });
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendMessage") {
    console.log(request.message);
    console.log("Received message:", request);
    send_api_msg(request.message, request.messages)
      .then((data) => {
        console.log("Sending response:", data);
        sendResponse({ message: data });
      })
      .catch((error) => {
        console.error("Error sending response:", error);
        sendResponse({ error: error.message });
      });
    return true; // Keep the message channel open for sendResponse
  }
});

browser.runtime.onMessage.addListener((request, sender, sendSubtitles) => {
  if (request.action === "fetchSubtitle") {
    fetch(
      `https://cors-anywhere.herokuapp.com/https://coursera.org${request.href}`,
      {
        method: "GET",
        headers: {
          Origin: "https://emamomplhfebhhcmekcomflnehijdadi.chromiumapp.org", // Replace with your extension's origin
          "x-requested-with": "XMLHttpRequest",
        },
      }
    )
      .then((response) => response.text())
      .then((textContent) => {
        // Store the content in Firefox storage
        browser.storage.local.set({ subtitleContent: textContent }).then(() => {
          console.log("Subtitle content stored in Firefox storage.");
          console.log(textContent);
          sendSubtitles({ success: true });
        });
      })
      .catch((error) => {
        console.error("Error downloading or storing subtitle file:", error);
        sendSubtitles({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for sendResponse
  }
});

// Note: Firefox does not support setUninstallURL
