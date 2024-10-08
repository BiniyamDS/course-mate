const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqApiKey = process.env.GROQ_API_KEY;

async function send_api_msg(message) {
  console.log("in msg");
  
  // Return a Promise
  return new Promise((resolve, reject) => {
    let contextText = `the user is watching a lecture on coursera`;

    // Retrieve subtitleContent from local storage
    chrome.storage.local.get("subtitleContent", async (data) => {
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

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response data:", data); // Log the response data

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error("Invalid response format");
        }

        // Resolve the Promise with the content
        resolve(data.choices[0].message.content);
      } catch (error) {
        console.error("Error in send_api_msg:", error); // Log the error
        reject(error); // Reject the Promise with the error
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendMessage") {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
        // Store the content in Chrome storage
        chrome.storage.local.set({ subtitleContent: textContent }, () => {
          console.log("Subtitle content stored in Chrome storage.");
          sendResponse({ success: true });
        });
      })
      .catch((error) => {
        console.error("Error downloading or storing subtitle file:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for sendResponse
  }
});

chrome.runtime.setUninstallURL("https://example.com/uninstall");
