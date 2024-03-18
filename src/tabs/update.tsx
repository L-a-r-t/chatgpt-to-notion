import { useStorage } from "@plasmohq/storage/hook"

import "~styles.css"

import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"

export default function UpdatePage() {
  const [enabled] = useStorage(STORAGE_KEYS.ecoModeActive, false)

  const enableEco = () => {
    chrome.storage.local.set({ permissionsGranted: true }, async function () {
      // check if an extension enough permissions
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

  return (
    <div className="w-screen bg-white flex justify-center min-h-screen px-16 py-12">
      <div className="h-full max-w-3xl flex flex-col">
        <div className="flex justify-center">
          <img
            width={400}
            src={chrome.runtime.getURL("assets/illustration.png")}
          />
        </div>
        <h1 className="text-center text-5xl font-bold">
          {i18n("update_heading")}
        </h1>
        <p className="text-center p-2 border mt-6 rounded-xl text-base">
          {i18n("update_major")}
        </p>
        <h2 className="text-4xl font-bold mb-2 mt-8">Changelog (v 1.9.0)</h2>
        <a
          className="link mb-4"
          href="https://github.com/L-a-r-t/chatgpt-to-notion/blob/master/CHANGELOG.md"
          target="_blank">
          {i18n("update_changelog_link")}
        </a>
        <h3 className="text-2xl font-semibold mt-2">
          {i18n("update_changelog_features")}
        </h3>
        <ul className="list-disc pl-4 py-2 text-base">
          <li>{i18n("update_changelog_features_1")}</li>
          <li>{i18n("update_changelog_features_2")}</li>
          <li>{i18n("update_changelog_features_3")}</li>
        </ul>
        <h3 className="text-2xl font-semibold">
          {i18n("update_changelog_fixes")}
        </h3>
        <ul className="list-disc pl-4 py-2 text-base">
          <li>{i18n("update_changelog_fixes_1")}</li>
          <li>{i18n("update_changelog_fixes_2")}</li>
        </ul>
        <h3 className="text-4xl font-bold my-4">
          {i18n("update_eco_heading")}
        </h3>
        <p className="px-8 py-4 text-justify text-base">
          {i18n("update_eco_1")} <br />
          <br />
          {i18n("update_eco_2")} <br />
          <br />
          {i18n("update_eco_3")}
          <b>{i18n("update_eco_4")}</b>
          <br />
          <br />
          {i18n("update_eco_5")}
          <br />
          Théo Lartigau
        </p>
        <div className="flex justify-center">
          {enabled ? (
            <p className="font-semibold text-xl">
              {i18n("update_eco_enabled")}
            </p>
          ) : (
            <button
              onClick={enableEco}
              className="py-4 px-8 rounded-xl bg-green-600 text-white font-semibold text-base">
              {i18n("update_eco_enable")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
