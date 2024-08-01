import tabDemo from "data-base64:../../assets/tab-demo.gif"
import styleText from "data-text:~styles.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

export default function Popup() {
  const [hidden, setHidden] = useStorage(
    { key: "hideIframeForever", area: "local" },
    false
  )
  const [show, showPopup] = useStorage(STORAGE_KEYS.ecoModeNotification, false)

  const hidePopup = () => {
    showPopup(false)
    setHidden(true)
    chrome.runtime.sendMessage({ action: "hideIframeForever" })
    window.parent.postMessage(
      {
        action: "hideIframeForever"
      },
      "*"
    )
  }

  const onLearnMore = () => {
    chrome.runtime.sendMessage({
      type: "chatgpt-to-notion_open-eco-about-page"
    })
  }

  if (!show || hidden) return null

  return (
    <div
      className="z-50 fixed top-0 left-0 w-full h-full font-sans"
      onPointerDown={hidePopup}>
      <div
        className="absolute top-3 right-3 rounded bg-white text-black shadow-lg border border-black p-4 max-w-[490px] max-h-[450px]"
        onPointerDown={(e) => e.stopPropagation()}>
        <div id="notif">
          <span id="closeButtonTop" onClick={hidePopup}>
            &times;
          </span>
          <h1 className="font-semibold text-lg">
            {i18n("eco_notification_title")}
          </h1>
          <span className="font-medium text-base">
            {i18n("eco_notification_subtitle")}
          </span>
          <p
            className="font-normal text-sm"
            dangerouslySetInnerHTML={{
              __html: i18n("eco_notification_message")
            }}
          />
          <div>
            <img className="h-24" src={tabDemo} />
            <br />
            <p className="font-semibold text-base">
              {i18n("eco_notification_congrats")}
            </p>
            <div className="flex gap-4">
              <button
                id="closeButton"
                className="button-small"
                onClick={hidePopup}>
                {i18n("eco_notification_button_close")}
              </button>
              <button
                id="learnMore"
                className="button-small"
                onClick={onLearnMore}>
                {i18n("eco_notification_button_learn_more")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
