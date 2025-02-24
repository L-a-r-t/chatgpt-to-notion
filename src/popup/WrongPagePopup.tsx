import { useStorage } from "@plasmohq/storage/hook"

import "~styles.css"

import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"
import type { PopupEnum } from "~utils/types"

function WrongPagePopup() {
  const [p, setPopup] = useStorage<PopupEnum>(STORAGE_KEYS.popup)

  const showPopup = async (popup: "settings" | "about") => {
    await setPopup(popup)
  }

  return (
    <>
      <p className="text-center py-2 flex justify-center gap-2 text-sm">
        <a href="https://chatgpt.com" target="_blank" className="link">
          ChatGPT
        </a>
        <a href="https://claide.ai" target="_blank" className="link">
          Claude
        </a>
        <a href="https://chat.deepseek.com" target="_blank" className="link">
          Deepseek
        </a>
        <a href="https://chat.mistral.ai" target="_blank" className="link">
          Mistral
        </a>
      </p>
      <div className="grid gap-3 grid-cols-2">
        <button
          className="button-outline"
          onClick={() => showPopup("settings")}>
          {i18n("nav_settings")}
        </button>
        <button
          className="button-outline w-max"
          onClick={() => showPopup("about")}>
          {i18n("nav_about")}
        </button>
      </div>
    </>
  )
}

export default WrongPagePopup
