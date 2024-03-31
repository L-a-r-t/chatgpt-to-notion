import illustration from "data-base64:../../assets/illustration.png"
import styleText from "data-text:~styles.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { STORAGE_KEYS } from "~utils/consts"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const Popup = () => {
  const [wasShown, update] = useStorage(STORAGE_KEYS.ecoModePopup, true)
  const [active] = useStorage(STORAGE_KEYS.ecoModeActive, true)

  const [show, showPopup] = useState(!wasShown && !active)

  useEffect(() => {
    if (!wasShown && !active) {
      showPopup(true)
    }
  }, [wasShown, active])

  useEffect(() => {
    if (show) {
      update(true)
    }
  }, [show])

  const hidePopup = () => {
    showPopup(false)
  }

  const enable = async () => {
    chrome.storage.local.set({ permissionsGranted: true }, async function () {
      // check if the extension enough permissions
      chrome.runtime.sendMessage(
        { permAction: "checkIfHasEnough" },
        function (response) {
          console.log(response.permStatus)
          const hasEnough = response.permStatus

          if (!hasEnough) {
            // if not enough then we should request it
            chrome.runtime.sendMessage({
              permAction: "getPerm",
              agreement: true
            })
          }
        }
      )
    })
    hidePopup()
  }

  if (!show) return <div className="pointer-events-none" />

  return (
    <div
      className="z-20 fixed top-0 left-0 w-full h-full flex justify-center items-center"
      onPointerDown={hidePopup}>
      <div
        className="rounded-xl bg-white text-black shadow-lg p-6"
        onPointerDown={(e) => e.stopPropagation()}>
        <div className="w-full flex justify-center items-center">
          <img className="w-1/2" src={illustration} alt="ChatGPT to Notion" />
        </div>
        <p className="text-center font-semibold text-lg">
          Enable Eco Mode for free?
        </p>
        <p>
          We'll plant trees at no cost to you.{" "}
          <a
            href="https://impacthero.co/ecomode/"
            className="link"
            target="_blank">
            Learn more.
          </a>
        </p>
        <p>You just need to allow additional permissions.</p>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={hidePopup}
            className="button bg-gray-200 text-black flex-[1]">
            Decline
          </button>
          <button onClick={enable} className="button flex-[1]">
            Agree & Continue
          </button>
        </div>
        <p className="text-sm">Note: This is a one-time popup.</p>
      </div>
    </div>
  )
}

export default Popup
