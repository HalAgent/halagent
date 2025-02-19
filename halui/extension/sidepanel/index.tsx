import cssText from "data-text:~/sidepanel/index.css"
import { useEffect, useRef, useState } from "react"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

interface Message {
  action: string
  data: unknown
}

function IndexSidePanel() {
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const messageQueue = useRef<Message[]>([])

  useEffect(() => {
    const style = getStyle()
    document.head.appendChild(style)

    const handleMessage = (message: Message) => {
      console.warn(message)
      if (message.action === "to_chat_form_background") {
        if (iframeRef.current?.contentWindow) {
          console.warn("send")
          iframeRef.current.contentWindow.postMessage(
            {
              action: "to_chat_form_sidepanel",
              data: message.data
            },
            "*"
          )
        } else {
          messageQueue.current.push(message)
        }
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  useEffect(() => {
    if (!iframeRef.current) return

    iframeRef.current.onload = () => {
      messageQueue.current.forEach((message) => {
        console.warn(message)

        iframeRef.current?.contentWindow?.postMessage(message, "*")
      })

      messageQueue.current = []
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }, [])

  return (
    <div>
      {loading && (
        <div className="hal-page-loading">
          <div className="hal-page-loading-spinner" />
        </div>
      )}
      <iframe ref={iframeRef} src="https://halpha.halagent.org"></iframe>
    </div>
  )
}

export default IndexSidePanel
