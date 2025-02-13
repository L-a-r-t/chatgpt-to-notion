import illustration from "data-base64:../../assets/illustration.png"
import styleText from "data-text:~styles.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import useSavePercentage from "~hooks/useSavePercentage"
import ErrorPopup from "~popup/ErrorPopup"
import SavePopup from "~popup/SavePopup"
import SettingsPopup from "~popup/SettingsPopup"
import { STORAGE_KEYS } from "~utils/consts"
import type { PopupEnum, SaveStatus, StoredDatabase } from "~utils/types"

export const config: PlasmoCSConfig = {
  matches: [
    "https://chat.deepseek.com/*",
    "https://chatgpt.com/*",
    "https://chat.mistral.ai/*"
  ]
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "chatgpt-to-notion_alert") alert(message.body)
})

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const Wrapper = () => {
  const [popup, setShowPopup] = useStorage<PopupEnum | false>(
    STORAGE_KEYS.showPopup,
    false
  )
  const [saveStatus, setSaveStatus] = useStorage<SaveStatus>(
    STORAGE_KEYS.saveStatus,
    null
  )
  const [toBeSaved, setToBeSaved] = useStorage(STORAGE_KEYS.toBeSaved)

  const savePercent = useSavePercentage(saveStatus)

  const hidePopup = async () => {
    await setShowPopup(false)
    await setSaveStatus(null)
    await setToBeSaved(null)
  }

  if (!popup && !saveStatus) return null
  if (popup === "history") return null

  if (popup == "save" || popup == "error" || saveStatus == "error")
    return (
      <div
        className="z-20 fixed top-0 left-0 w-full h-full"
        onPointerDown={hidePopup}>
        <div
          className="absolute top-3 right-3 rounded bg-white text-black shadow-lg"
          onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex flex-col p-3 w-64 text-base">
            <img src={illustration} alt="ChatGPT to Notion" />
            {popup === "error" || saveStatus === "error" ? (
              <ErrorPopup />
            ) : (
              <Popup />
            )}
          </div>
        </div>
      </div>
    )

  if (saveStatus)
    return (
      <div
        className={`z-20 fixed top-0 left-0 w-full h-full ${
          saveStatus === "saved" ? "" : "pointer-events-none"
        }`}
        onPointerDown={saveStatus === "saved" ? hidePopup : undefined}>
        <div className="absolute top-3 right-3 rounded bg-white text-black shadow-lg">
          <div className="flex flex-col p-3 w-64 text-base">
            <img src={illustration} alt="ChatGPT to Notion" />
            <p className="font-semibold">
              {saveStatus === "fetching" && "Fetching conversation..."}
              {saveStatus.includes("saving") &&
                "Saving... " + String(savePercent) + "%"}
              {saveStatus === "saved" && "Saved successfully!"}
            </p>
          </div>
        </div>
      </div>
    )

  return null
}

const Popup = () => {
  const [databases] = useStorage<StoredDatabase[]>(STORAGE_KEYS.databases, [])

  return <div>{databases.length == 0 ? <SettingsPopup /> : <SavePopup />}</div>
}
export default Wrapper
