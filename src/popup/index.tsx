import illustration from "data-base64:../../assets/illustration.png"

import { useStorage } from "@plasmohq/storage/hook"

import type { PopupEnum, StoredDatabase, ToBeSaved } from "~utils/types"

import IndexPopup from "./IndexPopup"
import SavePopup from "./SavePopup"

import "~styles.css"

import { useEffect } from "react"

import AboutPopup from "./AboutPopup"
import SettingsPopup from "./SettingsPopup"
import WrongPagePopup from "./WrongPagePopup"

export default function Wrapper() {
  const [databases] = useStorage<StoredDatabase[]>("databases", [])
  const [popup, setPopup] = useStorage<PopupEnum>("popup", "wrongpage")

  useEffect(() => {
    const handleCurrentTab = async () => {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tabs[0].url.match(/^(https:\/\/chat.openai.com).*/)) {
        if (!popup || popup === "index" || popup === "save")
          await setPopup("wrongpage")
      } else if (popup === "wrongpage") {
        await setPopup("index")
      }
    }
    handleCurrentTab()
  }, [popup])

  const showPopup = async (popup: "settings" | "about" | "index") => {
    await setPopup(popup)
  }

  const popups = {
    index: <IndexPopup />,
    save: <SavePopup />,
    settings: <SettingsPopup />,
    about: <AboutPopup />,
    wrongpage: <WrongPagePopup />
  }

  const nav = {
    index: "Home",
    settings: "Settings",
    about: "About"
  }

  if (databases.length == 0) {
    return (
      <div className="flex flex-col p-3 w-64 text-base">
        <img src={illustration} alt="ChatGPT to Notion" />
        <SettingsPopup />
      </div>
    )
  }

  return (
    <div className="flex flex-col p-3 w-64 text-base">
      <img src={illustration} alt="ChatGPT to Notion" />
      {popup !== "wrongpage" && (
        <div className="grid grid-cols-3 gap-1 mb-1">
          {Object.keys(nav).map((key) => (
            <button
              key={key}
              className={`button-small-outline ${
                popup === key ? "font-bold" : ""
              } border-none`}
              onClick={() => showPopup(key as "settings" | "about" | "index")}>
              {nav[key]}
            </button>
          ))}
        </div>
      )}
      {popups[popup]}
    </div>
  )
}
