import cssText from "data-text:~/contents/floatBtn/index.css"
import DocumentImg from "raw:~/assets/Document.svg"
import HAlphaImg from "raw:~/assets/HAlpha.svg"
import LogoImg from "raw:~/assets/icon.png"
import { useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

interface ButtonState {
  bottom: number
  isDragging: boolean
  isLocked: boolean
  hide: boolean
}
const initDat = [
  { bottom: 150, isDragging: false, isLocked: false, hide: false },
  { bottom: 100, isDragging: false, isLocked: false, hide: false }
]

const FloatBtn = () => {
  const [buttons, setButtons] = useState<ButtonState[]>(initDat)

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    document.body.style.cursor = "move"
    e.preventDefault()
    const startY = e.clientY
    // Record the initial positions of both buttons
    const startPositions = buttons.map((btn) => btn.bottom)

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY

      // Calculate the allowed movement range
      const minDelta = -startPositions[0] // Cannot go above the top
      const maxDelta = window.innerHeight - 40 - startPositions[1] // Cannot go below the bottom
      const clampedDelta = Math.max(minDelta, Math.min(deltaY, maxDelta))

      // Update the positions of both buttons simultaneously
      setButtons((prev) =>
        prev.map((btn, i) => ({
          ...btn,
          bottom: startPositions[i] + clampedDelta
        }))
      )
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "default"

      setButtons((prev) =>
        prev.map((btn) => ({
          ...btn,
          isDragging: false,
          isLocked: true
        }))
      )
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    setButtons((prev) =>
      prev.map((btn, i) => (i === index ? { ...btn, isDragging: true } : btn))
    )
  }

  const handlerClick = (index: number) => {
    console.warn(index)
    if (index === 0) {
      chrome.runtime.sendMessage({ action: "open_side_panel" })
      setButtons((prev) =>
        prev.map((btn, i) => (i === index ? { ...btn, hide: true } : btn))
      )
    } else {
      // to chat
      chrome.runtime.sendMessage({
        action: "to_chat_form_content",
        data: null
      })
    }
  }
  return (
    <div>
      {buttons.map((button, index) => (
        <div
          key={index}
          className="hal-float-btn"
          style={{
            bottom: `${button.bottom}px`,
            right: button.isDragging ? "0" : "-44px",
            transition: button.isDragging ? "none" : "all 0.3s"
          }}
          onMouseDown={(e) => handleMouseDown(e, index)}
          onClick={() => {
            handlerClick(index)
          }}>
          {index === 0 ? (
            <img src={DocumentImg} className="hal-float-btn-icon" />
          ) : (
            <>
              <img src={LogoImg} className="hal-float-btn-icon" />
              <img
                src={HAlphaImg}
                className="hal-float-btn-text"
                style={button.isDragging ? { opacity: 1 } : {}}
              />
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default FloatBtn
