import banner2 from "data-base64:../../assets/banner-2.png"
import bannerEco2 from "data-base64:../../assets/banner-eco-2.png"
import { useEffect, useState } from "react"
import { decompress } from "shrink-string"

import { useStorage } from "@plasmohq/storage/hook"

import type {
  Error,
  PopupEnum,
  SaveBehavior,
  SaveStatus,
  StoredDatabase,
  ToBeSaved
} from "~utils/types"

import "~styles.css"

import { sendToBackground } from "@plasmohq/messaging"

import { checkSaveConflict } from "~api/checkSaveConflict"
import { parseSave } from "~api/parseSave"
import DropdownPopup from "~common/components/Dropdown"
import NoTagButton from "~common/components/NoTagButton"
import Spinner from "~common/components/Spinner"
import useSavePercentage from "~hooks/useSavePercentage"
import useTags from "~hooks/useTags"
import { STORAGE_KEYS } from "~utils/consts"
import { getConsiseErrMessage, i18n } from "~utils/functions"
import { getConversationIdFromUrl } from "~utils/functions/llms"

import ConflictPopup from "./ConflictPopup"

export default function SavePopup() {
  const [showPopup, setShowPopup] = useStorage<PopupEnum | false>(
    STORAGE_KEYS.showPopup
  )
  const [toBeSaved, setToBeSaved] = useStorage<ToBeSaved>(
    STORAGE_KEYS.toBeSaved
  )
  const [databases] = useStorage<StoredDatabase[]>(STORAGE_KEYS.databases, [])
  const [selectedDB, setSelectedDB] = useStorage<number>(
    STORAGE_KEYS.selectedDB,
    0
  )
  const [generateHeadings, setGenerateHeadings] = useStorage<boolean>(
    STORAGE_KEYS.generateHeadings,
    true
  )
  const [openInNotion, setOpenInNotion] = useStorage<boolean>(
    STORAGE_KEYS.openInNotion,
    false
  )
  const { db, tag, tagProp, selectTag, selectTagProp } = useTags()

  const [authenticated] = useStorage(STORAGE_KEYS.authenticated, false)
  const [isPremium] = useStorage(STORAGE_KEYS.isPremium, false)
  const [activeTrial] = useStorage(STORAGE_KEYS.activeTrial, false)
  const [ecoModeActive] = useStorage(STORAGE_KEYS.ecoModeActive, true)
  const [chatID, setChatID] = useStorage(STORAGE_KEYS.chatID)
  const [cacheHeaders] = useStorage<boolean>(
    STORAGE_KEYS.hasCacheHeaders,
    false
  )

  const [titleType, setTitleType] = useStorage<"title" | "prompt" | "custom">(
    STORAGE_KEYS.pinTitleType,
    "title"
  )
  const [titleValue, setTitleValue] = useState("")
  const [prompt, setPrompt] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [conflictingPageId, setConflictingPageId] = useState<
    string | undefined
  >()

  const [saveStatus] = useStorage<SaveStatus>(STORAGE_KEYS.saveStatus)
  const savePercent = useSavePercentage(saveStatus, 3000)

  useEffect(() => {
    sendToBackground({ name: "getCurrentTab" }).then(({ tabUrl, model }) => {
      setChatID(getConversationIdFromUrl(model, tabUrl))
    })
  }, [])

  useEffect(() => {
    if (!toBeSaved) return
    const updateState = async () => {
      const _prompt = await decompress(toBeSaved.prompt)
      const _answer = await decompress(toBeSaved.answer)
      setPrompt(_prompt)
      setAnswer(_answer)
    }
    updateState()
  }, [toBeSaved])

  const handleSave = async (database: StoredDatabase) => {
    try {
      if (!toBeSaved) return
      setLoading(true)
      let title = ""
      if (titleType === "title") title = toBeSaved.title
      else if (titleType === "prompt")
        title = prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt
      else title = titleValue

      const database = db!
      const checkRes = await sendToBackground({
        name: "checkSaveConflit",
        body: {
          title,
          database
        }
      })
      if (checkRes.conflict) {
        setError({ status: 409 })
        setConflictingPageId(checkRes.conflictingPageId)
        return
      }
      save("override")
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  const save = async (saveBehavior: SaveBehavior) => {
    try {
      setError(null)
      setLoading(true)
      const res = await sendToBackground({
        name: "save",
        body: {
          saveBehavior,
          conflictingPageId: conflictingPageId,
          convId: chatID,
          turn: toBeSaved!.pin
        }
      })
      if (!res) {
        setError({ status: 400 })
        return
      }
      if (res.err) {
        setError(res.err)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(err)
    } finally {
      setConflictingPageId(undefined)
      setLoading(false)
    }
  }

  const formatAnswer = (answer: string) => {
    return answer
      .replace(/(<.+?>)/g, "")
      .replace(/%%CHATGPT_TO_NOTION_WORK(.*)%%/g, "[ChatGPT code]")
      .replace(/%%CHATGPT_TO_NOTION_IMAGE(.*)%%/g, "[DALL-E 3 Image]")
  }

  if (!success && !toBeSaved) return null

  if (error?.status === 409) return <ConflictPopup save={save} pin />

  return !databases || databases.length == 0 ? (
    <p>{i18n("index_errRegister")}</p>
  ) : (
    <>
      {success || loading ? (
        isPremium || activeTrial ? (
          <div />
        ) : ecoModeActive ? (
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
                src={banner2}
                className="w-full aspect-square"
                alt="Leave a review!"
              />
            </a>
          </div>
        ) : (
          <div className="mb-4">
            <a
              href="https://theo-lartigau.notion.site/FAQ-50befa31f01a495b9d634e3f575dd4ba"
              target="_blank">
              <img
                src={bannerEco2}
                className="w-full aspect-square"
                alt="Enable eco-friendly mode!"
              />
            </a>
          </div>
        )
      ) : (
        <>
          <div className="flex">
            <h4 className="font-bold">{i18n("save_pageTitle")}</h4>
            <DropdownPopup
              className="px-2 py-[1px] border border-main rounded ml-2 text-sm"
              position="down"
              items={[
                <button
                  className="py-1 px-3"
                  onClick={() => setTitleType("title")}>
                  {i18n("save_pageDropdown_title")}
                </button>,
                <button
                  className="py-1 px-3"
                  onClick={() => setTitleType("prompt")}>
                  {i18n("save_pageDropdown_prompt")}
                </button>,
                <button
                  onClick={() => setTitleType("custom")}
                  className="text-sm py-1 px-3">
                  {i18n("save_pageDropdown_custom")}
                </button>
              ]}>
              {i18n(`save_pageDropdown_${titleType}`)}
            </DropdownPopup>
          </div>
          {titleType === "custom" ? (
            <input
              className="input"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              maxLength={60}
              placeholder={toBeSaved?.title}
            />
          ) : (
            <p className="text-xs">
              {titleType === "title"
                ? toBeSaved?.title
                : prompt.length > 60
                ? prompt.substring(0, 60) + "..."
                : prompt}
            </p>
          )}
          <h4 className="font-bold">{i18n("save_prompt")}</h4>
          <p className="text-xs">
            {prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt}
          </p>
          <h4 className="font-bold">{i18n("save_answer")}</h4>
          <p className="text-xs">
            {answer.length > 80
              ? formatAnswer(answer).substring(0, 80) + "..."
              : formatAnswer(answer)}
          </p>
          <div className="flex justify-between items-center my-3">
            <p className="font-bold">{i18n("save_saveTo")}</p>
            <DropdownPopup
              className="px-1 border border-main rounded"
              position="up"
              items={databases.map((db, index) => (
                <button
                  className="py-1 px-3"
                  key={db.id}
                  onClick={() => setSelectedDB(index)}>
                  {db.title}
                </button>
              ))}>
              {db?.title}
            </DropdownPopup>
          </div>
          <div className="border mb-3" />
          {db && db.tags.length > 0 ? (
            <div className="flex justify-between items-center mb-3">
              <DropdownPopup
                className="font-bold min-w-[4rem] text-left"
                position="up"
                items={db.tags.map((tag, index) => (
                  <button
                    className="py-1 px-3"
                    key={tag.id}
                    onClick={() => selectTagProp(index)}>
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
                          <button
                            className="py-1 px-3"
                            key={tag.id}
                            onClick={() => selectTag(index)}>
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
        disabled={
          loading || success || !cacheHeaders || !authenticated || !chatID
        }
        className="button w-full disabled:bg-main"
        onClick={() => handleSave(db!)}>
        {!authenticated ? (
          <>
            <span>{i18n("authenticating")}</span>
            <Spinner white small />
          </>
        ) : error ? (
          getConsiseErrMessage(error)
        ) : success ? (
          i18n("save_saved")
        ) : !(cacheHeaders && chatID) ? (
          i18n("refresh")
        ) : (
          i18n("save_save")
        )}{" "}
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
          <div className="mt-1">
            <input
              id="openInNotion"
              type="checkbox"
              defaultChecked={openInNotion}
              className="mr-2"
              onChange={(e) => setOpenInNotion(e.target.checked)}
            />
            <label htmlFor="openInNotion">Open in Notion</label>
          </div>
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
      {loading && (
        <div className="flex items-center gap-4">
          <div className="flex-grow h-2 rounded-full bg-neutral-300">
            <div
              style={{ width: String(savePercent) + "%" }}
              className="h-full rounded-full bg-black"
            />
          </div>
          <p className="text-sm font-bold mt-1">{savePercent}%</p>
        </div>
      )}
    </>
  )
}
