import banner1 from "data-base64:../../assets/banner-1.png"

import { useStorage } from "@plasmohq/storage/hook"

import type { StoredDatabase } from "~utils/types"

import "~styles.css"

import { useState } from "react"

import { saveChat } from "~api/saveChat"
import DropdownPopup from "~common/components/Dropdown"
import NoTagButton from "~common/components/NoTagButton"
import Spinner from "~common/components/Spinner"
import useTags from "~hooks/useTags"
import { i18n } from "~utils/functions"

function IndexPopup() {
  const [selectedDB, setSelectedDB] = useStorage<number>("selectedDB", 0)
  const [databases] = useStorage<StoredDatabase[]>("databases", [])
  const [generateHeadings, setGenerateHeadings] = useStorage<boolean>(
    "generateHeadings",
    true
  )
  const { db, tag, tagProp, selectTag, selectTagProp } = useTags()

  const [authenticated] = useStorage("authenticated", false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<number | null>(null)

  const handleSave = async () => {
    try {
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
      const chat = await chrome.tabs.sendMessage(currentTab.id, {
        type: "fetchFullChat"
      })
      const database = db
      const req = {
        ...chat,
        database,
        generateHeadings
      }
      const res = await saveChat(req)
      if (!res) {
        setError(400)
        setLoading(false)
        return
      }
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError(err.status)
      setLoading(false)
    }
  }

  return !databases || databases.length == 0 ? (
    <p>{i18n("index_errRegister")}</p>
  ) : (
    <>
      {success ? (
        <div className="mb-4">
          <a
            className="link block text-center"
            href="https://theo-lartigau.notion.site/About-sponsors-daa97f9c85f74ceaabb37a68958d4c8a"
            target="_blank">
            {i18n("sponsored")}
          </a>
          <a
            href="https://www.usechatgpt.ai/install?ref=chatgpttonotion"
            target="_blank">
            <img
              src={banner1}
              className="w-full aspect-[2]"
              alt="Use ChatGPT.ai today!"
            />
          </a>
        </div>
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
        onClick={handleSave}>
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
          i18n("index_discussionSaved")
        ) : (
          i18n("index_saveFullChat")
        )}
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

export default IndexPopup
