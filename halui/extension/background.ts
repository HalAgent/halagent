let sidePanelOpen = false
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error(error))

chrome.action.onClicked.addListener((sender) => {
  console.warn(sender.windowId)
  openSidePanel(sender.windowId)
})

chrome.runtime.onMessage.addListener((message, sender) => {
  console.warn(message)
  if (message.action === "open_side_panel") {
    openSidePanel(sender.tab.windowId)
  } else if (message.action === "to_chat_form_content") {
    if (!sidePanelOpen) {
      openSidePanel(sender.tab.windowId)
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: "to_chat_form_background"
        })
      }, 1000)
    } else {
      chrome.runtime.sendMessage({
        action: "to_chat_form_background"
      })
    }
  }
})

//

const openSidePanel = (windowId: number) => {
  if (sidePanelOpen) {
    chrome.sidePanel
      .setOptions({
        enabled: false,
        path: "sidepanel.html"
      })
      .then(() => {
        chrome.sidePanel
          .setOptions({ enabled: true, path: "sidepanel.html" })
          .then(() => {})
      })
  } else {
    chrome.sidePanel.open({ windowId }).then(() => {
      console.log("Side panel opened")
    })
  }
  sidePanelOpen = !sidePanelOpen
}
