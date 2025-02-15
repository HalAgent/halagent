import cssText from "data-text:~/contents/floatBtn/index.css"

import HAlphaImg from "raw:~/assets/HAlpha.svg"
import LogoImg from "raw:~/assets/icon.png"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}
const FloatBtn = () => {
    console.warn(111);

  return (
    <div className="hal-float-btn">
      <img src={LogoImg} className="hal-float-btn-icon"></img>
      <img src={HAlphaImg} className="hal-float-btn-text"></img>
    </div>
  )
}

export default FloatBtn
