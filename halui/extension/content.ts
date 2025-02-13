console.log("Content script loaded!")
const container = document.createElement("div")
container.id = "plasmo-shadow-container"
container.style.display = "none"
document.body.appendChild(container)

const shadowRoot = container.attachShadow({ mode: "open" })

const style = document.createElement("style")
style.textContent = `
    .plasmo-shadow-container-main {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 375px;
      height: 100vh;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
       z-index: 2147483647;
    }
    .plasmo-shadow-container-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255); /* 半透明背景 */
}

.plasmo-shadow-container-loading::after {
    content: "";
    width: 40px;
    height: 40px;
    border: 4px solid #ccc; /* 圆圈颜色 */
    border-top: 4px solid #000; /* 顶部颜色，表示旋转部分 */
    border-radius: 50%;
    animation: spin 1s linear infinite; /* 旋转动画 */
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
  `
shadowRoot.appendChild(style)

const main = document.createElement("div")
main.className = "plasmo-shadow-container-main"
shadowRoot.appendChild(main)

const iframe = document.createElement("iframe")
iframe.src = "https://host.halagent.org/watchlist"
iframe.style.width = "100%"
iframe.style.height = "100%"
iframe.style.border = "none"

function injectShadowDOM() {
  if (container.style.display === "none") {
    container.style.display = "block"
    document.body.style.width = "calc(100vw - 375px)"
  } else {
    container.style.display = "none"
    document.body.style.width = "100vw"
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "close") {
    container.style.display = "none"
    document.body.style.width = "100vw"
    if (main.querySelector("iframe")) {
      main.querySelector("iframe")?.remove()
    }
    sendResponse()
  } else if (message.action === "injectShadowDOM") {
    if (!main.querySelector("iframe")) {
      // loading
      const loading = document.createElement("div")
      loading.className = "plasmo-shadow-container-loading"
      main.appendChild(loading)
      main.appendChild(iframe)
      iframe.onload = () => {
        loading.remove()
      }
    }
    injectShadowDOM()
    sendResponse()
  }
})
