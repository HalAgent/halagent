import cssText from "data-text:~/sidepanel/index.css"
import { useEffect, useRef, useState } from "react"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}
function IndexSidePanel() {
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const style = getStyle()
    document.head.appendChild(style)
  }, [])
  useEffect(() => {
    if (!iframeRef.current) return
    iframeRef.current.onload = () => {
      setLoading(false)
    }
  }, [iframeRef.current])
  return (
    <div>
      {loading && (
        <div className="hal-page-loading">
          <div className="hal-page-loading-spinner" />
        </div>
      )}
      <iframe ref={iframeRef} src="https://halpha.halagent.org/watchlist"></iframe>
    </div>
  )
}

export default IndexSidePanel
