import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating
} from "@floating-ui/react-dom"
import cssText from "data-text:~/contents/tooltip/index.css"
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
  const popupRef = useRef<HTMLDivElement>(null) // Add ref

  // Floating UI configuration
  const { x, y, refs, strategy } = useFloating({
    placement: "bottom",
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift()]
  })

  // Handle copy operation (optimized using useCallback)
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

  // Handle mouse events (core fix)
  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (popupRef.current?.contains(event.target as Node)) {
        return
      }

      const selection = window.getSelection()
      if (selection?.toString().length > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        refs.setReference({
          getBoundingClientRect: () => rect
        })

        setSelectedText(selection.toString())
        setIsPopupVisible(true)
      } else {
        setIsPopupVisible(false)
      }
    },
    [refs]
  )

  // Event listeners and style injection
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => document.removeEventListener("mouseup", handleMouseUp)
  }, [handleMouseUp])

  if (!isPopupVisible) return null

  return (
    <div
      className="hal-tooltip-container"
      ref={(el) => {
        popupRef.current = el // Bind ref
        refs.setFloating(el)
      }}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex: 9999
      }}
      // Prevent all internal events from bubbling
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}>
      <div className="hal-tooltip-item" onClick={handleCopy}>
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
  )
}

export default TextSelectionPopup
