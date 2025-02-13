chrome.action.onClicked.addListener((tab) => {
  console.warn(tab)

  if (tab.url && tab.url.startsWith("http")) {
    chrome.tabs.query({}, (tabs) => {
      tabs
        .filter((t) => t.id !== tab.id)
        .forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { action: "close" }, (response) => {
            if (response?.success) {
              console.log("close Ok!")
            }
          })
        })
    })
    chrome.tabs.sendMessage(
      tab.id,
      { action: "injectShadowDOM" },
      (response) => {
        if (response?.success) {
          console.log("Shadow DOM injected successfully!")
        }
      }
    )
  }
})
