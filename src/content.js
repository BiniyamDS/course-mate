import React from "react";
import { createRoot } from "react-dom/client";
import "./assets/style.css";
import ChatSidebar from "./ChatSideBar.js";

// Create a container for the React component
const container = document.createElement("div");
document.body.appendChild(container);

let observer; // Declare the observer variable

function scrapeAndUpdateLinks() {
  // console.log("Scraping and updating links...");

  // Scrape anchor tags with a download attribute set to "transcript.txt" and get their href attributes
  const anchorTags = document.querySelectorAll('a[download="transcript.txt"]');
  let hrefList = [];

  // console.log(
  //   `Found ${anchorTags.length} anchor tags with download attribute set to "transcript.txt".`
  // );
  anchorTags.forEach((anchor, index) => {
    const href = anchor.getAttribute("href");
    // console.log(`Anchor ${index}: href="${href}"`);
    if (href) {
      hrefList.push(href); // Add href to the list
      downloadAndStoreSubtitle(href);
    }
  });
  console.log(hrefList);
}

function downloadAndStoreSubtitle(href) {
  console.log(`Requesting to download subtitle file from: ${href}`);

  // Stop observing the DOM
  if (observer) {
    observer.disconnect();
    console.log("Stopped observing DOM changes.");
  }

  // Fetch the subtitle content
  browser.runtime.sendMessage({ action: "fetchSubtitle", href: href }).then(response => {
    if (response.success) {
      console.log('Subtitle file downloaded and stored successfully.');
      browser.storage.local.set({ subtitleContent: response.subtitleContent }).then(() => {
        // Inject the subtitle into the page
        // console.log(response.subtitleContent);
      }).catch(error => {
        console.error('Error storing subtitle content:', error);
      });
    } else {
      console.error('Failed to download subtitle file:', response.error);
    }
  }).catch(error => {
    console.error('Error sending message:', error);
  });
}


function observeDOMChanges() {
  console.log("Setting up MutationObserver...");

  // Set up the MutationObserver to detect changes in the DOM
  observer = new MutationObserver((mutations) => {
    // console.log("MutationObserver detected changes...");
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        // console.log(
        //   "New nodes added to the DOM. Running scrapeAndUpdateLinks..."
        // );
        scrapeAndUpdateLinks();
      }
    }
  });

  // Start observing the body for changes
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("MutationObserver is now observing DOM changes.");
}

// Inject the div when the DOM is fully loaded, and scrape links
if (document.readyState === "complete") {
  console.log("Document is already fully loaded.");
  scrapeAndUpdateLinks();
} else {
  console.log(
    "Document is not fully loaded yet. Adding load event listener..."
  );
  window.addEventListener("load", () => {
    console.log(
      "Window loaded, running injectHelloWorldDiv and scrapeAndUpdateLinks..."
    );
    scrapeAndUpdateLinks();
  });
}

// Start observing for dynamically loaded content
observeDOMChanges();

// Create a root and render the component
const root = createRoot(container);
root.render(<ChatSidebar />);
