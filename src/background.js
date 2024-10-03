const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqApiKey = process.env.GROQ_API_KEY;

async function send_api_msg(message) {
  console.log("in msg");
  
  // Return a Promise
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
      const params = {
        messages: [
          {
            role: "user",
            content: message,
          },
          {
            role: "system",
            content: `Answer the query using this context ${contextText}`,
          },
        ],
        model: "llama3-8b-8192",
      };

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
    send_api_msg(request.message)
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
