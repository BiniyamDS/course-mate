const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqApiKey = process.env.GROQ_API_KEY;

async function send_api_msg(message, chat_history, model) {
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
            content: `You’re an advanced academic assistant experienced in interpreting and analyzing educational content from various platforms, especially Coursera. Your specialty lies in converting video transcripts into clear, concise, and informative responses that utilize LaTeX formatting for mathematical or scientific content.

Your task is to answer a user’s query based on a provided Coursera video transcript. Please analyze the transcript and respond to the user’s question by incorporating relevant information and using LaTeX where applicable.

here’s the transcript segment you will be working with:  
- Transcript: ${contextText}

Please ensure that your response is well-structured, accurate, and clearly formatted in LaTeX. If there are specific equations, formulas, or concepts mentioned in the transcript that are relevant to the query, make sure to include them in your answer.`,
          },
        ],
        model: model,
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
    // log the model being used
    console.log("Model being used:", request.model);
    send_api_msg(request.message, request.messages, request.model)
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
