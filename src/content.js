import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./assets/style.css";
import ChatSidebar from "./ChatSideBar.js";

// Create a container for the React component
const container = document.createElement("div");
document.body.appendChild(container);

let observer; // Declare the observer variable

function scrapeAndUpdateLinks(setSubLoaded) {

  // Scrape anchor tags with a download attribute set to "transcript.txt" and get their href attributes
  const anchorTags = document.querySelectorAll('a[download="transcript.txt"]');
  let hrefList = [];

  anchorTags.forEach((anchor, index) => {
    const href = anchor.getAttribute("href");
    if (href) {
      hrefList.push(href); // Add href to the list
      downloadAndStoreSubtitle(href, setSubLoaded);
    }
  });
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
      scrapeAndUpdateLinks(setSubLoaded);
    } else {
      console.log(
        "Document is not fully loaded yet. Adding load event listener..."
      );
      window.addEventListener("load", () => {
        console.log(
          "Window loaded, running injectHelloWorldDiv and scrapeAndUpdateLinks..."
        );
        scrapeAndUpdateLinks(setSubLoaded);
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
      <ChatSidebar isSubtitleLoaded={subLoaded} />
    </React.StrictMode>
  );
};

function observeDOMChanges(setSubLoaded) {
  console.log("Setting up MutationObserver...");

  // Set up the MutationObserver to detect changes in the DOM
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        scrapeAndUpdateLinks(setSubLoaded);
      }
    }
  });

  // Start observing the body for changes
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("MutationObserver is now observing DOM changes.");
}

const root = createRoot(container);
root.render(<App />);
