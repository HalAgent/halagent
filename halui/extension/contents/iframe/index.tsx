import cssText from "data-text:~/contents/iframe/index.css"
import type { PlasmoCSConfig } from "plasmo"
import { useCallback, useEffect, useRef, useState } from "react"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const HalPage = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const initCache = useCallback(() => {
    chrome.storage.local.get(["localStorage", "cookie"], (result) => {
      const timer = setInterval(() => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "cacheInit", data: result },
          "*"
        )
      }, 200)

      const messageHandler = (event: MessageEvent) => {
        const message = event.data
        if (message.type === "cacheInitOk") {
          clearInterval(timer)
          setLoading(false)
        } else if (message.type === "cacheSave") {
          chrome.storage.local.set(message.data, () => {
            console.log("Data saved successfully")
          })
        }
      }

      window.addEventListener("message", messageHandler)

      return () => {
        window.removeEventListener("message", messageHandler)
        clearInterval(timer)
      }
    })
  }, [])

  useEffect(() => {
    if (!iframeRef.current) return
    setLoading(true)
    iframeRef.current.onload = initCache
  }, [iframeRef.current])

  useEffect(() => {
    const messageHandler = (message, sender, sendResponse) => {
      if (message.action === "close") {
        setIsOpen(false)
        setShowIframe(false)
        document.body.style.width = "100vw"
      } else if (message.action === "injectShadowDOM") {
        console.warn("injectShadowDOM")

        setIsOpen((prev) => !prev)
        setShowIframe(true)
      }
      sendResponse()
    }

    chrome.runtime.onMessage.addListener(messageHandler)

    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler)
    }
  }, [])

  return (
    <div className="hal-page" style={{ display: isOpen ? "block" : "none" }}>
      {loading && (
        <div className="hal-page-loading">
          <div className="hal-page-loading-spinner" />
        </div>
      )}
      {showIframe && (
        <iframe
          ref={iframeRef}
          id="plasmo-iframe"
          src="https://host.halagent.org?extension=1"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      )}
    </div>
  )
}

export default HalPage
