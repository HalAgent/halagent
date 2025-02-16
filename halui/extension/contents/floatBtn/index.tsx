import cssText from "data-text:~/contents/floatBtn/index.css"
import DocumentImg from "raw:~/assets/Document.svg"
import HAlphaImg from "raw:~/assets/HAlpha.svg"
import LogoImg from "raw:~/assets/icon.png"
import { useEffect, useState } from "react"

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
    const startBottom = buttons[index].bottom

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY
      const newBottom = startBottom + deltaY
      // 边界检查
      const minBottom = 0
      const maxBottom = window.innerHeight - 40
      let clampedBottom = Math.min(Math.max(newBottom, minBottom), maxBottom)

      // 防重叠检查
      const otherIndex = index === 0 ? 1 : 0
      const otherButton = buttons[otherIndex]
      const spacing = 50 // 按钮间最小间距

      if (index === 1) {
        clampedBottom = Math.min(clampedBottom, otherButton.bottom - spacing)
      } else {
        clampedBottom = Math.max(clampedBottom, otherButton.bottom + spacing)
      }

      setButtons((prev) =>
        prev.map((btn, i) =>
          i === index ? { ...btn, bottom: clampedBottom } : btn
        )
      )
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "default"

      setButtons((prev) =>
        prev.map((btn, i) =>
          i === index ? { ...btn, isDragging: false, isLocked: true } : btn
        )
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
      window.open("https://halpha.halagent.org")
    }
  }

  useEffect(() => {
    const updateInitialPositions = () => {
      setButtons(initDat)
    }

    updateInitialPositions()
    window.addEventListener("resize", updateInitialPositions)
    return () => window.removeEventListener("resize", updateInitialPositions)
  }, [])

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
