import { useEffect, useState } from "react"
import { decompress } from "shrink-string"

import { useStorage } from "@plasmohq/storage/hook"

import type { StoredDatabase, ToBeSaved } from "~utils/types"

import "~styles.css"

import DropdownPopup from "~common/components/Dropdown"
import NoTagButton from "~common/components/NoTagButton"
import Spinner from "~common/components/Spinner"
import useTags from "~hooks/useTags"
import { i18n } from "~utils/functions"

export default function SavePopup() {
  const [showPopup, setShowPopup] = useStorage<boolean>("showPopup")
  const [toBeSaved, setToBeSaved] = useStorage<ToBeSaved>("toBeSaved")
  const [databases] = useStorage<StoredDatabase[]>("databases", [])
  const [selectedDB, setSelectedDB] = useStorage<number>("selectedDB", 0)
  const [generateHeadings, setGenerateHeadings] = useStorage<boolean>(
    "generateHeadings",
    true
  )
  const { db, tag, tagProp, selectTag, selectTagProp } = useTags()

  const [authenticated] = useStorage("authenticated", false)

  const [prompt, setPrompt] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<number | null>(null)

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

  const save = async (database: StoredDatabase) => {
    if (!toBeSaved) return
    setLoading(true)
    const res = await chrome.runtime.sendMessage({
      type: "saveAnswer",
      body: {
        generateHeadings,
        database,
        ...toBeSaved
      }
    })
    // if res is an error it will be the error code, a number
    if (isNaN(res)) {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        setShowPopup(false)
        setToBeSaved(false)
      }, 1000)
      return
    }
    setError(res)
    setLoading(false)
    setTimeout(() => {
      setShowPopup(false)
      setToBeSaved(false)
    }, 5000)
    return
  }

  if (!toBeSaved) return null

  return !databases || databases.length == 0 ? (
    <p>{i18n("index_errRegister")}</p>
  ) : (
    <>
      <h4 className="font-bold">{i18n("save_pageTitle")}</h4>
      <p className="text-xs">{toBeSaved.title}</p>
      <h4 className="font-bold">{i18n("save_prompt")}</h4>
      <p className="text-xs">
        {prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt}
      </p>
      <h4 className="font-bold">{i18n("save_answer")}</h4>
      <p className="text-xs">
        {answer.length > 80
          ? answer.replace(/(<.+?>)/g, "").substring(0, 80) + "..."
          : answer}
      </p>
      <div className="flex justify-between items-center my-3">
        <p className="font-bold">{i18n("save_saveTo")}</p>
        <DropdownPopup
          className="px-1 border border-main rounded"
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
      {db && db.tags.length > 0 ? (
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
      <button
        disabled={loading || success || !authenticated}
        className="button w-full disabled:bg-main"
        onClick={() => save(db!)}>
        {!authenticated ? (
          <>
            <span>{i18n("authenticating")}</span>
            <Spinner white small />
          </>
        ) : error ? (
          error === 401 ? (
            i18n("save_unauthorized")
          ) : (
            i18n("save_error")
          )
        ) : success ? (
          i18n("save_saved")
        ) : (
          i18n("save_save")
        )}{" "}
        {loading && <Spinner white small />}
      </button>
      {!success && !error && !loading && (
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
      )}
      {error === 401 && (
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
