import { useEffect, useState } from "react"
import { decompress } from "shrink-string"

import { useStorage } from "@plasmohq/storage/hook"

import type { StoredDatabase, ToBeSaved } from "~utils/types"

import "~styles.css"

import DropdownPopup from "~common/components/Dropdown"
import Spinner from "~common/components/Spinner"
import useTags from "~hooks/useTags"
import { i18n } from "~utils/functions"

export default function SavePopup() {
  const [showPopup, setShowPopup] = useStorage<boolean>("showPopup")
  const [toBeSaved, setToBeSaved] = useStorage<ToBeSaved>("toBeSaved")
  const [databases] = useStorage<StoredDatabase[]>("databases", [])
  const [selectedDB, setSelectedDB] = useStorage<number>("selectedDB", 0)
  const { db, tag, tagProp, selectTag, selectTagProp } = useTags()

  const [authenticated] = useStorage("authenticated", false)

  const [prompt, setPrompt] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
    await chrome.runtime.sendMessage({
      type: "saveAnswer",
      body: {
        database,
        ...toBeSaved
      }
    })
    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      setShowPopup(false)
      setToBeSaved(false)
    }, 1000)
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
            items={[
              ...tagProp?.options.map((tag, index) => (
                <button key={tag.id} onClick={() => selectTag(index)}>
                  {tag.name}
                </button>
              )),
              <button
                key={"notag"}
                className="font-bold"
                onClick={() => selectTag(-1)}>
                {i18n("save_noTag")}
              </button>
            ]}>
            {tag === null ? i18n("save_noTag") : tag?.name}
          </DropdownPopup>
        </div>
      ) : (
        <p className="text-sm mb-3">{i18n("dbsettings_noTags")}</p>
      )}
      <button
        disabled={loading || success || !authenticated}
        className="button w-full disabled:bg-main"
        onClick={() => save(db)}>
        {!authenticated && (
          <>
            <span>{i18n("authenticating")}</span>
            <Spinner white small />
          </>
        )}
        {authenticated && (success ? i18n("save_saved") : i18n("save_save"))}
        {loading && <Spinner white small />}
      </button>
    </>
  )
}
