export default defineBackground(() => {
  // Open side panel when extension icon is clicked
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // Relay messages between content script and sidebar
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_TAB_INFO") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab) {
          sendResponse({ url: tab.url, title: tab.title });
        } else {
          sendResponse({ url: null, title: null });
        }
      });
      return true; // async response
    }

    if (message.type === "HIGHLIGHT_ANCHORS") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, message);
        }
      });
    }
  });
});
