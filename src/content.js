import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./assets/style.css";
import ChatSidebar from "./ChatSideBar.js";

// Create a container for the React component
const container = document.createElement("div");
document.body.appendChild(container);

let observer; // Declare the observer variable

function scrapeAndUpdateLinksForCoursera(setSubLoaded) {
  // Scrape anchor tags with a download attribute set to "transcript.txt" and get their href attributes
  const anchorTags = document.querySelectorAll('a[download="transcript.txt"]');
  let hrefList = [];

  anchorTags.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (href) {
      hrefList.push(href); // Add href to the list
      downloadAndStoreSubtitle(href, setSubLoaded);
    }
  });
}

async function saveSubtitleContent(textContent) {
  try {
      await browser.storage.local.set({ subtitleContent: textContent });
      console.log("Subtitle content saved successfully.");
  } catch (error) {
      console.error("Error saving subtitle content:", error);
  }
}

function scrapeAndStoreLecturioSubtitles(setSubLoaded) {
  console.log("Extracting subtitles from Lecturio...");

  // new code
  const container = document.querySelector(
    "div.MuiList-root.MuiList-dense.css-1uzmcsd"
  );

  // Check if the container exists
  if (!container) {
    console.error("Transcript container not found.");
    return "";
  }

  // Find all the subtitle text spans
  const subtitles = container.querySelectorAll(
    "span.MuiTypography-root.MuiTypography-inherit.MuiLink-root.MuiLink-underlineHover.css-gw8ftq"
  );
  console.log(subtitles);

  // Extract and concatenate the text content
  let transcript = "";
  subtitles.forEach((element) => {
    transcript += element.textContent.trim() + " ";
  });

  // Return the combined transcript
  // new code

  // Store the subtitles in local storage
  saveSubtitleContent(transcript)
  console.log("Subtitles stored in local storage under 'subtitleContent'.");
  if (observer) {
    observer.disconnect();
    console.log("Stopped observing DOM changes.");
  }

  // Trigger the subtitles loaded state
  setSubLoaded(true);
}

async function updateSubtitles(setSubLoaded) {
  try {
    // console.log(`Deleted value with key: subtitleContent`);
    // localStorage.removeItem("subtitleContent"); // Clear existing subtitles

    // Check the current domain and scrape accordingly
    const currentSite = window.location.hostname;
    if (currentSite.includes("lecturio.com")) {
      console.log("Site detected: Lecturio");
      scrapeAndStoreLecturioSubtitles(setSubLoaded);
    } else if (currentSite.includes("coursera.org")) {
      console.log("Site detected: Coursera");
      scrapeAndUpdateLinksForCoursera(setSubLoaded);
    } else {
      console.log("Site not supported.");
    }
  } catch (error) {
    console.error("Error updating storage:", error);
  }
}

function downloadAndStoreSubtitle(href, setSubLoaded) {
  console.log(`Requesting to download subtitle file from: ${href}`);

  // Stop observing the DOM
  if (observer) {
    observer.disconnect();
    console.log("Stopped observing DOM changes.");
  }

  // Fetch the subtitle content
  browser.runtime
    .sendMessage({ action: "fetchSubtitle", href: href })
    .then((response) => {
      if (response.success) {
        console.log("Subtitle file downloaded and stored successfully.");
        setSubLoaded(true); // Indicate that subtitles are loaded
      } else {
        console.error("Failed to download subtitle file:", response.error);
      }
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

const App = () => {
  const [subLoaded, setSubLoaded] = useState(false);

  useEffect(() => {
    // Inject the div when the DOM is fully loaded, and scrape links
    if (document.readyState === "complete") {
      console.log("Document is already fully loaded.");
      updateSubtitles(setSubLoaded);
    } else {
      console.log(
        "Document is not fully loaded yet. Adding load event listener..."
      );
      window.addEventListener("load", () => {
        console.log("Window loaded, running updateSubtitles...");
        updateSubtitles(setSubLoaded);
      });
    }

    // Start observing for dynamically loaded content
    observeDOMChanges(setSubLoaded);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [setSubLoaded]);

  // Create a root and render the component
  return (
    <React.StrictMode>
      <ChatSidebar
        isSubtitleLoaded={subLoaded}
        updateSub={updateSubtitles}
        setLoaded={setSubLoaded}
      />
    </React.StrictMode>
  );
};

function observeDOMChanges(setSubLoaded) {
  console.log("Setting up MutationObserver...");

  // Set up the MutationObserver to detect changes in the DOM
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        updateSubtitles(setSubLoaded);
      }
    }
  });

  // Start observing the body for changes
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("MutationObserver is now observing DOM changes.");
}

const root = createRoot(container);
root.render(<App />);
