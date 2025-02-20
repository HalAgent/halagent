import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"]
}

const XKolList = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [path, setPath] = useState<string>(window.location.pathname)
  const [kolList, setKolList] = useState<string[]>([])

  useEffect(() => {
    console.warn("XKolList 当前路径:", path)
    if (path) {
      fetch(
        "https://host.halagent.org/dev/91edd400-9c4a-0eb5-80ce-9d32973f2c49/twitter_labels",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            xnamelist: [
              window.location.pathname.substring(
                1,
                window.location.pathname.length
              )
            ]
          })
        }
      ).then((res) => {
        res.json().then((data) => {
          console.warn(data)
          setKolList([
            data.data[
              window.location.pathname.substring(
                1,
                window.location.pathname.length
              )
            ].kollabel
          ])
        })
      })
    }
    const findContainer = () => {
      const dom = document.querySelector(
        '[data-testid="UserName"]'
      ) as HTMLElement | null
      if (dom) {
        console.warn("找到目标 DOM:", dom)
        setContainer(dom.parentElement)
        return true
      }
      return false
    }

    if (findContainer()) return

    const observer = new MutationObserver(() => {
      if (findContainer()) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [path])

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.location.pathname !== path) {
        console.warn("路径变化:", window.location.pathname)
        setPath(window.location.pathname)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [path])

  useEffect(() => {
    // 创建 <style> 标签
    const style = document.createElement("style")
    style.textContent = `
      .hal-kol {
        margin-top: 12px;
      }
      .hal-kol-header {
        margin-bottom: 12px;
      }
      .hal-kol-content {
        display: flex;
      }
      .hal-kol-content-item {
        margin-bottom:12px;
        display: flex;
        align-items: center;
        margin-right: 12px;
        padding: 4px 8px;
        border-radius: 12px;
        border-color: rgba(0, 0, 0, 0);
        background-color: rgb(239, 243, 244);
      }
      .hal-kol-content-item-avatar {

        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: skyblue;
        margin-right: 8px;
      }
      .hal-kol-content-item-name {
        color: rgb(0, 0, 0);
        font-size: 12px;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return container
    ? createPortal(
        <div className="hal-kol">
          <div className="hal-kol-header">Follow KOLs ({kolList.length}).</div>
          <div className="hal-kol-content">
            {kolList.map((_, index) => (
              <div key={index} className="hal-kol-content-item">
                <div className="hal-kol-content-item-avatar"></div>
                <div className="hal-kol-content-item-name">{_}</div>
              </div>
            ))}
          </div>
        </div>,
        container
      )
    : null
}

export default XKolList
