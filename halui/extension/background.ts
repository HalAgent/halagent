let sidePanelOpen = false
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error(error))

chrome.action.onClicked.addListener((sender) => {
  console.warn(sender.windowId)
  openSidePanel(sender.windowId)
})

// 接收消息切换状态
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "open_side_panel") {
    openSidePanel(sender.tab.windowId)
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
