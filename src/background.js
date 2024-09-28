const groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
const groqApiKey = process.env.GROQ_API_KEY

async function send_api_msg(message) {
  console.log("in msg");
  const url = new URL(groqApiUrl);
  const params = {
    messages: [
      {
        role: "user",
        content: message,
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

    return data.choices[0].message.content; // Return the content
  } catch (error) {
    console.error("Error in send_api_msg:", error); // Log the error
    throw error; // Rethrow the error to be caught in the background script
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
});

chrome.runtime.setUninstallURL("https://example.com/uninstall");
