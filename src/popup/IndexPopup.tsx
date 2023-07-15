import banner1 from "data-base64:../../assets/banner-1.png"

import { useStorage } from "@plasmohq/storage/hook"

import type {
  AutosaveStatus,
  Error,
  PopupEnum,
  SaveBehavior,
  StoredDatabase
} from "~utils/types"

import "~styles.css"

import { useEffect, useState } from "react"
import { compress } from "shrink-string"

import { checkSaveConflict } from "~api/checkSaveConflict"
import { parseSave } from "~api/parseSave"
import { saveChat } from "~api/saveChat"
import DropdownPopup from "~common/components/Dropdown"
import NoTagButton from "~common/components/NoTagButton"
import Spinner from "~common/components/Spinner"
import LogoIcon from "~common/logo"
import StarIcon from "~common/star"
import useTags from "~hooks/useTags"
import {
  getChatConfig,
  getConsiseErrMessage,
  i18n,
  updateChatConfig
} from "~utils/functions"

import ConflictPopup from "./ConflictPopup"

function IndexPopup() {
  const [popup, setPopup] = useStorage<PopupEnum>("popup", "index")
  const [selectedDB, setSelectedDB] = useStorage<number>("selectedDB", 0)
  const [databases] = useStorage<StoredDatabase[]>("databases", [])
  const [generateHeadings, setGenerateHeadings] = useStorage<boolean>(
    "generateHeadings",
    true
  )
  const { db, tag, tagProp, selectTag, selectTagProp } = useTags()

  const [authenticated] = useStorage("authenticated", false)
  const [isPremium] = useStorage("isPremium", false)
  const [activeTrial] = useStorage("activeTrial", false)
  const [s, setAutosaveStatus] = useStorage<AutosaveStatus>("autosaveStatus")
  const [chatID] = useStorage("chatID", null)
  const [autoSaveEnabled, setAutoSave] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [conflictingPageId, setConflictingPageId] = useState<
    string | undefined
  >()

  useEffect(() => {
    const checkAutosave = async () => {
      if (!chatID) return
      const config = await getChatConfig(chatID)
      if (!config) return
      setAutoSave(config.enabled)
    }
    checkAutosave()
  }, [chatID])

  const handleSave = async (autosave?: boolean) => {
    try {
      if (autosave && autoSaveEnabled) {
        if (!chatID) return
        await updateChatConfig(chatID, {
          enabled: false
        })

        setAutoSave(false)
        setAutosaveStatus("disabled")
        return
      }

      setLoading(true)
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      const currentTab = tabs[0]
      if (!currentTab.id) {
        setLoading(false)
        return
      }
      const database = db!
      const checkRes = await checkSaveConflict({
        title: currentTab.title ?? "",
        database
      })
      if (checkRes.conflict) {
        setConflictingPageId(checkRes.conflictingPageId)
        if (!autosave) {
          setError({ status: 409 })
          return
        }
      }
      save("override", autosave, checkRes.conflictingPageId)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  const save = async (
    saveBehavior: SaveBehavior,
    autosave?: boolean,
    conflictingPage?: string
  ) => {
    try {
      setError(null)
      setLoading(true)
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      const currentTab = tabs[0]
      if (!currentTab.id) {
        setConflictingPageId(undefined)
        setLoading(false)
        return
      }
      const database = db!
      const chat: {
        title: string
        prompts: string[]
        answers: string[]
        url: string
      } = await chrome.tabs.sendMessage(currentTab.id, {
        type: "chatgpt-to-notion_fetchFullChat"
      })
      const req = {
        ...chat,
        // compression helps with having a single saveChat api function
        // it is very fast and does not affect the user experience
        prompts: await Promise.all(chat.prompts.map((p) => compress(p))),
        answers: await Promise.all(chat.answers.map((a) => compress(a))),
        database,
        generateHeadings
      }
      const parsedReq = await parseSave(req)
      const res = await saveChat({
        ...parsedReq,
        conflictingPageId: conflictingPage ?? conflictingPageId,
        generateHeadings,
        saveBehavior
      })
      if (!res) {
        setError({ status: 400 })
        setConflictingPageId(undefined)
        setLoading(false)
        return
      }

      if (autosave) {
        const chatID = currentTab?.url?.split("/c/").pop()
        if (!chatID) return

        updateChatConfig(chatID, {
          enabled: true,
          targetPageId: res.object == "page" ? res.id : conflictingPage,
          lastSaveStatus: "success",
          lastError: null,
          database
        })

        setAutoSave(true)
        setAutosaveStatus("saved")
      }

      setSuccess(true)
    } catch (err) {
      setError(err)
    } finally {
      setConflictingPageId(undefined)
      setLoading(false)
    }
  }

  if (error?.status === 409) return <ConflictPopup save={save} />

  return !databases || databases.length == 0 ? (
    <p>{i18n("index_errRegister")}</p>
  ) : (
    <>
      {success ? (
        autoSaveEnabled ? (
          <div className="mb-4">
            <p className="font-bold">{i18n("autosave_enabled")}</p>
            <p className="text-sm">{i18n("autosave_enabled_desc")}</p>
            <div className="flex flex-col items-left p-4 border rounded">
              <div className="flex gap-2 items-center">
                <LogoIcon loading />
                <p className="text-sm">{i18n("autosave_enabled_saving")}</p>
              </div>
              <div className="flex gap-2 items-center">
                <LogoIcon error />
                <p className="text-sm">{i18n("autosave_enabled_error")}</p>
              </div>
              <div className="flex gap-2 items-center">
                <LogoIcon />
                <p className="text-sm">{i18n("autosave_enabled_success")}</p>
              </div>
            </div>
          </div>
        ) : isPremium || activeTrial ? (
          <div />
        ) : (
          <div className="mb-4">
            {/* <a
              className="link block text-center"
              href="https://theo-lartigau.notion.site/About-sponsors-daa97f9c85f74ceaabb37a68958d4c8a"
              target="_blank">
              {i18n("sponsored")}
            </a> */}
            <a
              href="https://chrome.google.com/webstore/detail/chatgpt-to-notion/oojndninaelbpllebamcojkdecjjhcle"
              target="_blank">
              <img
                src={banner1}
                className="w-full aspect-[2]"
                alt="Leave a review!"
              />
            </a>
          </div>
        )
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="font-bold">{i18n("index_saveTo")}</p>
            <DropdownPopup
              className="px-2 py-0.5 border border-main rounded"
              position="up"
              items={databases.map((db, index) => (
                <button key={db.id} onClick={() => setSelectedDB(index)}>
                  {db.title}
                </button>
              ))}>
              {db?.title}
            </DropdownPopup>
          </div>
          <div className="border mb-3" />
          {db?.tags && db?.tags.length > 0 ? (
            <div className="flex justify-between items-center mb-3">
              <DropdownPopup
                className="font-bold min-w-[4rem] text-left"
                position="up"
                items={db.tags.map((tag, index) => (
                  <button key={tag.id} onClick={() => selectTagProp(index)}>
                    {tag.name}
                  </button>
                ))}>
                {tagProp?.name}
              </DropdownPopup>
              <DropdownPopup
                className={`px-2 py-0.5 border border-main rounded ${
                  tag === null ? "italic font-bold" : ""
                }`}
                position="up"
                items={
                  tagProp
                    ? [
                        ...tagProp.options.map((tag, index) => (
                          <button key={tag.id} onClick={() => selectTag(index)}>
                            {tag.name}
                          </button>
                        )),
                        <NoTagButton selectTag={selectTag} />
                      ]
                    : [<NoTagButton selectTag={selectTag} />]
                }>
                {tag === null ? i18n("save_noTag") : tag?.name}
              </DropdownPopup>
            </div>
          ) : (
            <p className="text-sm mb-3">{i18n("dbsettings_noTags")}</p>
          )}
        </>
      )}
      <button
        disabled={loading || success || !authenticated}
        className="button disabled:bg-main"
        onClick={() => handleSave()}>
        {!authenticated ? (
          <>
            <span>{i18n("authenticating")}</span>
            <Spinner white small />
          </>
        ) : error ? (
          getConsiseErrMessage(error)
        ) : success ? (
          i18n("index_discussionSaved")
        ) : (
          i18n("index_saveFullChat")
        )}
        {loading && <Spinner white small />}
      </button>
      {!success && !error && !loading && (
        <>
          <div className="mt-1">
            <input
              id="generateHeadings"
              type="checkbox"
              defaultChecked={generateHeadings}
              className="mr-2"
              onChange={(e) => setGenerateHeadings(e.target.checked)}
            />
            <label htmlFor="generateHeadings">
              {i18n("save_generateHeadings")}
            </label>
          </div>
          <button
            disabled={!chatID && !(isPremium || activeTrial)}
            onClick={() =>
              isPremium || activeTrial ? handleSave(true) : setPopup("premium")
            }
            className={`button-outline ${
              !chatID && !(isPremium || activeTrial)
                ? "text-sm font-normal"
                : ""
            }`}>
            {!(isPremium || activeTrial) && <StarIcon />}
            {!(isPremium || activeTrial) && i18n("autosave_try")}
            {(isPremium || activeTrial) &&
              (chatID
                ? autoSaveEnabled
                  ? i18n("autosave_disable")
                  : i18n("autosave_enable")
                : i18n("autosave_wrongpage"))}
          </button>
        </>
      )}
      {error?.message && (
        <p className="text-sm text-red-400">{error.message}</p>
      )}
      {error?.status === 401 && (
        <a
          className="link text-sm"
          href="https://theo-lartigau.notion.site/FAQ-50befa31f01a495b9d634e3f575dd4ba"
          target="_blank">
          {i18n("about_FAQ")}
        </a>
      )}
    </>
  )
}

export default IndexPopup
