chrome.action.onClicked.addListener(() => {
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({ path: 'index.html' });
  } else {
    console.error('Side panel API is not available.');
  }
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isAuthenticated: false, lastActiveTime: null });
});

chrome.runtime.onSuspend.addListener(() => {
  chrome.storage.local.set({ lastActiveTime: Date.now() });
});

// Listener for messages from the web UI (e.g., button clicks)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_MAIN_UI") {
    chrome.windows.getCurrent((window) => {
      // Open the side panel for the current window
      chrome.sidePanel.open({ windowId: window.id });
    });
    sendResponse({ success: true });
  }
});
