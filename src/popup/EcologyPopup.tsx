import { useStorage } from "@plasmohq/storage/hook"

import "~styles.css"

import { STORAGE_KEYS } from "~utils/consts"

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
      <p className="text-sm">
        Eco-friendly mode allows us to plant a tree whenever you visit a partner
        website, while respecting your privacy and not changing anything with
        your web experience.
      </p>
      <a
        className="link my-2"
        href="https://theo-lartigau.notion.site/FAQ-50befa31f01a495b9d634e3f575dd4ba"
        target="_blank">
        Read the FAQ
      </a>
      {enabled ? (
        <button onClick={disable} className="button bg-red-600">
          Disable eco-friendly mode
        </button>
      ) : (
        <button onClick={enable} className="button bg-green-600">
          Enable eco-friendly mode
        </button>
      )}
    </>
  )
}

export default EcologyPopup
