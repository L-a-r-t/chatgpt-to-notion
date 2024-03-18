import { useStorage } from "@plasmohq/storage/hook"

import "~styles.css"

import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"

function EcologyPopup() {
  const [enabled] = useStorage(STORAGE_KEYS.ecoModeActive, false)

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
  }

  const disable = async () => {
    chrome.runtime.sendMessage({ action: "disable" })
  }

  return (
    <>
      <p className="text-sm">{i18n("eco_desc")}</p>
      <a
        className="link my-2"
        href="https://theo-lartigau.notion.site/FAQ-50befa31f01a495b9d634e3f575dd4ba"
        target="_blank">
        {i18n("eco_faq")}
      </a>
      {enabled ? (
        <button onClick={disable} className="button bg-red-600">
          {i18n("eco_disable")}
        </button>
      ) : (
        <button onClick={enable} className="button bg-green-600">
          {i18n("eco_enable")}
        </button>
      )}
    </>
  )
}

export default EcologyPopup
