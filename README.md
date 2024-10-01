# Course Mate

## Overview
**Course Mate** is a Chrome extension that adds a collapsible chat interface to any webpage. It allows users to interact with an AI chatbot, sending messages and receiving responses in markdown format.

## TODOS
- [x] Fix toggle button
- [x] Fix up UI
- [x] Pull context automatically from subtitles
- [ ] Add continuity to chat
- [ ] Restrict to use of only coursera
- [ ] Add feature to choose between models
- [ ] Add Ability to add your own key to the extension

## Features
- **Collapsible Chat Sidebar**: A toggleable chat interface that opens on the right side of any webpage.
- **Markdown Support**: AI responses are rendered in markdown format, supporting lists, bold, italics, and more.
- **Simple UI**: Textbox for typing messages, a send button for submitting, and a results area for displaying chat history.
- **Customizable**: You can modify the width of the sidebar and the position of the toggle button.

## Usage
1. Open the chat sidebar by clicking the **Chat** button at the bottom right of the screen.
2. Type your message in the text box and click **Send**.
3. The AI's response will appear in the results area.
4. Click **Close Chat** to hide the sidebar.

## How It Works
The extension injects a chat sidebar and a floating toggle button into any webpage. The user can send messages to the AI, which responds with messages formatted in markdown. These responses are converted into HTML and displayed in the chat window. The sidebar can be opened and closed using the toggle button.

## License
This project is licensed under the MIT License.
