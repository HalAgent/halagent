import type { CacheData } from "~type";

console.log("Content script loaded!");

const container = document.createElement("div");
container.id = "plasmo-shadow-container";
container.style.display = "none";
document.body.appendChild(container);

const shadowRoot = container.attachShadow({ mode: "open" });

function createStyles() {
  const style = document.createElement("style");
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
      background-color: rgba(255, 255, 255);
    }
    .plasmo-shadow-container-loading::after {
      content: "";
      width: 40px;
      height: 40px;
      border: 4px solid #ccc;
      border-top: 4px solid #000;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  shadowRoot.appendChild(style);
}

function createMainContainer() {
  const main = document.createElement("div");
  main.className = "plasmo-shadow-container-main";
  shadowRoot.appendChild(main);
  return main;
}

function createIframe(): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.src = "http://localhost:5173/watchlist?extension=1";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  return iframe;
}

function toggleShadowDOM() {
  container.style.display = container.style.display === "none" ? "block" : "none";
  document.body.style.width = container.style.display === "none" ? "100vw" : "calc(100vw - 375px)";
}

function handleCacheInit(iframe: HTMLIFrameElement, main: HTMLElement) {
  const loading = document.createElement("div");
  loading.className = "plasmo-shadow-container-loading";
  main.appendChild(loading);
  main.appendChild(iframe);

  iframe.onload = () => {
    loading.remove();
    chrome.storage.local.get(["localStorage", "cookie"], (result) => {
      const data = result as CacheData;
      const timer = setInterval(() => {
        iframe.contentWindow?.postMessage({ type: "cacheInit", data }, "*");
      }, 200);

      function messageHandler(event: MessageEvent) {
        const message = event.data;
        if (message.type === "cacheInitOk") {
          clearInterval(timer);
        } else if (message.type === "cacheSave") {
          chrome.storage.local.set(message.data as CacheData, () => {
            console.log("Data saved successfully");
          });
        }
      }

      window.addEventListener("message", messageHandler);
      window.addEventListener("beforeunload", () => {
        window.removeEventListener("message", messageHandler);
      });
    });
  };
}

createStyles();
const main = createMainContainer();
const iframe = createIframe();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "close") {
    container.style.display = "none";
    document.body.style.width = "100vw";
    main.innerHTML = "";
    sendResponse();
  } else if (message.action === "injectShadowDOM") {
    if (!main.querySelector("iframe")) {
      handleCacheInit(iframe, main);
    }
    toggleShadowDOM();
    sendResponse();
  }
});
