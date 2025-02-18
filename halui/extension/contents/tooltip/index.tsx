import {
    autoUpdate,
    flip,
    offset,
    shift,
    useFloating
  } from "@floating-ui/react-dom"
  import cssText from "data-text:~/contents/tooltip/index.css"
  import BookmarkImg from "raw:~/assets/Bookmark.svg"
  import ChatImg from "raw:~/assets/Chat.svg"
  import CloseImg from "raw:~/assets/Close.svg"
  import CopyImg from "raw:~/assets/Copy.svg"
  import FixedImg from "raw:~/assets/Fixed.svg"
  import RefreshImg from "raw:~/assets/refresh.svg"
  import { useCallback, useEffect, useRef, useState } from "react"

  import type { PlasmoCSConfig } from "~node_modules/plasmo/dist/type"

  export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
  }

  export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = cssText
    return style
  }

  const TextSelectionPopup = () => {
    const [selectedText, setSelectedText] = useState("")
    const [isPopupVisible, setIsPopupVisible] = useState(false)
    const [kolModal, setKolModal] = useState(false)
    // Used to track modal position and its positioning style
    const [kolModalMap, setKolModalMap] = useState<{
      position: "absolute" | "fixed"
      x: number
      y: number
    }>({
      position: "absolute",
      x: 0,
      y: 0
    })
    const popupRef = useRef<HTMLDivElement>(null)

    // Floating UI configuration for text selection popup
    const { x, y, refs, strategy } = useFloating({
      placement: "bottom",
      whileElementsMounted: autoUpdate,
      middleware: [offset(10), flip(), shift()]
    })

    // Handle copy text operation
    const handleCopy = useCallback(
      async (event: React.MouseEvent) => {
        event.stopPropagation()
        try {
          await navigator.clipboard.writeText(selectedText)
          alert(`Copied: ${selectedText}`)
        } catch {
          // Fallback for older browsers
          const textArea = document.createElement("textarea")
          textArea.value = selectedText
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand("copy")
          document.body.removeChild(textArea)
          alert(`Copied (fallback): ${selectedText}`)
        }
        setIsPopupVisible(false)
      },
      [selectedText]
    )

    // Display modal and set the current popup position as the initial position
    const handleKol = () => {
      setIsPopupVisible(false)
      setKolModalMap({
        position: "absolute", // Initial positioning style, can toggle to Fixed
        x: x ?? 0,
        y: y ?? 0
      })
      setKolModal(true)
    }

    // Listen to mouseup event and show popup when text is selected
    const handleMouseUp = useCallback(
      (event: MouseEvent) => {
        if (kolModal) return
        if (popupRef.current?.contains(event.target as Node)) return

        const selection = window.getSelection()
        if (selection?.toString().length > 0) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()

          // Use floating-ui to set the position of the popup relative to the selection
          refs.setReference({
            getBoundingClientRect: () => rect
          })

          setSelectedText(selection.toString())
          setIsPopupVisible(true)
        } else {
          setIsPopupVisible(false)
        }
      },
      [refs, kolModal]
    )

    useEffect(() => {
      document.addEventListener("mouseup", handleMouseUp)
      return () => document.removeEventListener("mouseup", handleMouseUp)
    }, [handleMouseUp])

    // Implement modal dragging functionality — start dragging when clicking on the modal header
    const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const startX = event.clientX
      const startY = event.clientY
      const initialX = kolModalMap.x
      const initialY = kolModalMap.y

      const handleDragMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX
        const deltaY = moveEvent.clientY - startY

        setKolModalMap((prev) => ({
          ...prev,
          x: initialX + deltaX,
          y: initialY + deltaY
        }))
      }

      const handleDragEnd = () => {
        document.removeEventListener("mousemove", handleDragMove)
        document.removeEventListener("mouseup", handleDragEnd)
      }

      document.addEventListener("mousemove", handleDragMove)
      document.addEventListener("mouseup", handleDragEnd)
    }

    return (
      <>
        {/* Modal window */}
        {kolModal && (
          <div
            className="hal-tooltip-modal"
            style={{
              position: kolModalMap.position,
              top: kolModalMap.y,
              left: kolModalMap.x,
              zIndex: 9999,
              background: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
            }}>
            {/* Modal header with drag functionality */}
            <div
              className="hal-tooltip-modal-header"
              onMouseDown={handleDragStart}>
              <img
                src={ChatImg}
                className="hal-tooltip-modal-header-icon"
                style={{ color: "#222" }}
              />
              <div className="hal-tooltip-modal-header-title">Token Analysis</div>
              <img
                src={FixedImg}
                className="hal-tooltip-modal-header-icon"
                onClick={() => {
                  setKolModalMap({
                    position:
                      kolModalMap.position === "absolute" ? "fixed" : "absolute",
                    x: kolModalMap.x,
                    y: kolModalMap.y
                  })
                }}
              />
              <img
                src={CloseImg}
                className="hal-tooltip-modal-header-icon"
                onClick={() => {
                  setKolModal(false)
                }}
                style={{ cursor: "pointer" }}
              />
            </div>

            {/* Modal content */}
            <div className="hal-tooltip-modal-content">
              SHIB Analysis – The current price trend of SHIB reflects a
              combination of meme-driven speculation and community sentiment.
              Recent tweets indicate a strong belief in SHIB's potential to
              revolutionize the meme coin market. However, Kline data shows
              fluctuating trading volumes and price ranges, suggesting volatility.
              Despite low engagement metrics on Twitter, the community remains
              optimistic, hinting at potential upward momentum as new catalysts
              emerge. SHIB Prediction – Looking ahead, SHIB may experience a
              bullish trend if community enthusiasm translates into increased
              trading activity. If the price maintains above key support levels,
              we could see a gradual rise. However, caution is advised due to
              inherent market volatility, and investors should monitor broader
              market trends and sentiment closely.
            </div>

            {/* Modal footer with action buttons */}
            <div className="hal-tooltip-modal-footer hal-tooltip-modal-header">
              <img
                src={CopyImg}
                className="hal-tooltip-modal-header-icon"
                onClick={handleCopy}
              />
              <img src={RefreshImg} className="hal-tooltip-modal-header-icon" />
              <img src={BookmarkImg} className="hal-tooltip-modal-header-icon" />
            </div>
          </div>
        )}

        {/* Text selection popup */}
        {isPopupVisible && (
          <div
            className="hal-tooltip-container"
            ref={(el) => {
              popupRef.current = el
              refs.setFloating(el)
            }}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 9999
            }}
            // Prevent event bubbling inside the popup
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}>
            <div className="hal-tooltip-item" onClick={handleKol}>
              Kol
            </div>
            <div
              className="hal-tooltip-item"
              onClick={handleCopy}
              role="button"
              tabIndex={0}>
              Copy
            </div>
          </div>
        )}
      </>
    )
  }

  export default TextSelectionPopup
