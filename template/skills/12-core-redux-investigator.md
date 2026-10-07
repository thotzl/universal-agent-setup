---
name: core-redux-investigator
description: Investigate and manipulate live Redux state in the browser using JavaScript evaluation. Use when instructed to analyze Redux state or dispatch actions like the Redux DevTools extension.
---

# Redux Investigator

This skill provides workflows and scripts for analyzing and interacting with a live Redux store within a web application via the `chrome-devtools-mcp` MCP server.

Because coding agents cannot directly interface with browser extensions (like the Redux DevTools UI panel), this skill leverages JavaScript evaluation to achieve similar functionality programmatically.

## Prerequisites

- The web application must be running and accessible.
- A Chrome page must be selected via the server's `select_page` tool.
- **Crucial:** The application MUST expose its Redux store to the global `window` object.

## Core Workflows

You can interact with Redux by executing JavaScript in the browser using the server's `evaluate_script` tool.

### 1. Finding the Redux Store

If the store isn't located at a default variable like `window.store`, scan the `window` object.

**Script Path:** `scripts/find_stores.js`

### 2. Retrieving the State

To get the full Redux state, read and execute `get_state.js`.

**Script Path:** `scripts/get_state.js`

### 3. Dispatching Actions

To dispatch an action to the store, use `dispatch_action.js`.

**Script Path:** `scripts/dispatch_action.js`

### 4. Recording Actions (Observer Mode)

You can monkey-patch the store's `dispatch` function to record all actions triggered by the user interacting with the UI. This is useful for observing what happens when a user clicks a button.

**Workflow:**

1. **Start Recording:** Read and execute `scripts/start_recording.js`. This will wrap the `dispatch` function and start saving actions to an internal array.
2. **Wait for User:** Tell the user "Recording started. Please interact with the app, then tell me to read the recording."
3. **Read Recording:** Read and execute `scripts/get_recording.js` to fetch all actions dispatched since the recording started. (By default, this clears the history array).
4. **Stop Recording:** When done debugging, read and execute `scripts/stop_recording.js` to restore the original `dispatch` function.

## Troubleshooting

- **"Redux store not found" Error:** If `find_stores.js` returns empty, the target application does not expose the store to the `window` object.
  - **Action:** Ask the user to add `window.store = store;` (or similar) in their application's entry point immediately after the store is created. Once they have done so and reloaded the page, try again.
