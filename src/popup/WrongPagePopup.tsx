import { useStorage } from "@plasmohq/storage/hook"

import "~styles.css"

import type { PopupEnum } from "~utils/types"

function WrongPagePopup() {
  const [p, setPopup] = useStorage<PopupEnum>("popup")

  const showPopup = async (popup: "settings" | "about") => {
    await setPopup(popup)
  }

  return (
    <>
      <p className="text-center">
        Go to{" "}
        <a href="https://chat.openai.com/chat" target="_blank" className="link">
          ChatGPT's page
        </a>{" "}
        to start doing fancy stuff
      </p>
      <div className="grid gap-3 grid-cols-2">
        <button
          className="button-outline"
          onClick={() => showPopup("settings")}>
          Settings
        </button>
        <button className="button-outline" onClick={() => showPopup("about")}>
          About
        </button>
      </div>
    </>
  )
}

export default WrongPagePopup
