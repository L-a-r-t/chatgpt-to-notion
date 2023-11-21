import illustration from "data-base64:../../assets/illustration.png"

import { useStorage } from "@plasmohq/storage/hook"

import type {
  HistorySaveError,
  PopupEnum,
  StoredDatabase,
  ToBeSaved
} from "~utils/types"

import IndexPopup from "./IndexPopup"
import SavePopup from "./SavePopup"

import "~styles.css"

import { useEffect } from "react"

import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"

import AboutPopup from "./AboutPopup"
import DatabaseSettingsPopup from "./DatabaseSettings"
import HistorySavePopup from "./HistorySavePopup"
import PremiumPopup from "./PremiumPopup"
import SettingsPopup from "./SettingsPopup"
import WrongPagePopup from "./WrongPagePopup"

export default function Wrapper() {
  const [databases] = useStorage<StoredDatabase[]>(STORAGE_KEYS.databases, [])
  const [popup, setPopup] = useStorage<PopupEnum>(
    STORAGE_KEYS.popup,
    "wrongpage"
  )
  const [token] = useStorage({ key: STORAGE_KEYS.token, area: "session" })
  const [workspace_id] = useStorage(STORAGE_KEYS.workspace_id)
  const [historySaveProgress] = useStorage(STORAGE_KEYS.historySaveProgress, -1)
  const [historySaveErrors] = useStorage<HistorySaveError[]>(
    STORAGE_KEYS.historySaveErrors,
    []
  )
  const [historyLength] = useStorage(STORAGE_KEYS.historyLength, 0)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (!token && !workspace_id)
      timeout = setTimeout(() => {
        chrome.tabs.create({
          url: "https://api.notion.com/v1/oauth/authorize?client_id=323a93e9-98a0-4f5a-a194-af728f1b817e&response_type=code&owner=user&redirect_uri=https%3A%2F%2Ftheo-lartigau.notion.site%2FChatGPT-to-Notion-af29d9538dca4493a15bb4ed0fde7f91"
        })
      }, 100)
    return () => clearTimeout(timeout)
  }, [token, workspace_id])

  useEffect(() => {
    if (
      historySaveProgress !== -1 &&
      historySaveProgress + historySaveErrors.length < historyLength
    ) {
      if (popup !== "history") setPopup("history")
      return
    }
    const handleCurrentTab = async () => {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tabs[0].url?.match(/^(https:\/\/chat.openai.com).*/)) {
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
    dbsettings: <DatabaseSettingsPopup />,
    about: <AboutPopup />,
    wrongpage: <WrongPagePopup />,
    premium: <PremiumPopup />,
    history: <HistorySavePopup />
  }

  const nav = {
    index: i18n("nav_home"),
    settings: i18n("nav_settings"),
    about: i18n("nav_about")
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
        <div className="grid grid-cols-3 mb-1">
          {Object.keys(nav).map((key) => (
            <button
              key={key}
              className={`button-small-outline ${
                popup === key ? "font-bold" : ""
              } border-none w-full`}
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
