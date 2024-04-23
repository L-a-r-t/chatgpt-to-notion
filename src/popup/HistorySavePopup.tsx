import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Disclosure from "~common/components/Disclosure"
import DropdownPopup from "~common/components/Dropdown"
import Spinner from "~common/components/Spinner"
import useTags from "~hooks/useTags"
import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"
import type { HistorySaveError, PopupEnum, StoredDatabase } from "~utils/types"

function HistorySavePopup() {
  const [isPremium] = useStorage(STORAGE_KEYS.isPremium, false)
  const [popup, setPopup] = useStorage<PopupEnum>(STORAGE_KEYS.popup, "history")

  const [cacheHeaders] = useStorage({
    key: STORAGE_KEYS.cacheHeaders,
    area: "session",
    isSecret: true
  })
  const [historySaveProgress] = useStorage(STORAGE_KEYS.historySaveProgress, -1)
  const [historySaveErrors] = useStorage<HistorySaveError[]>(
    STORAGE_KEYS.historySaveErrors,
    []
  )
  const [historyLength] = useStorage(STORAGE_KEYS.historyLength, 0)

  const [selectedDB, setSelectedDB] = useStorage<number>(
    STORAGE_KEYS.selectedDB,
    0
  )
  const [databases] = useStorage<StoredDatabase[]>(STORAGE_KEYS.databases, [])

  const { db, tag, tagProp, selectTag, selectTagProp } = useTags()

  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await chrome.runtime.sendMessage({
      type: "chatgpt-to-notion_saveHistory"
    })
  }

  if (!isPremium)
    return (
      <div>
        <p>{i18n("history_desc_trial")}</p>
        <button
          onClick={() => setPopup("premium")}
          className="button-outline text-sm font-normal w-full">
          {i18n("index_tryPremium")}
        </button>
      </div>
    )

  if (historySaveProgress === -1)
    return (
      <div>
        <p>{i18n("history_desc")}</p>
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold">{i18n("index_saveTo")}</p>
          <DropdownPopup
            className="px-2 py-0.5 border border-main rounded"
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
        <button
          disabled={!cacheHeaders || saving}
          className="button w-full"
          onClick={save}>
          {!cacheHeaders ? (
            i18n("history_reload")
          ) : saving ? (
            <>
              {i18n("history_fetching")}
              <Spinner white small />
            </>
          ) : (
            i18n("history_save")
          )}
        </button>
      </div>
    )

  if (historySaveProgress + historySaveErrors.length >= historyLength)
    return (
      <div>
        <p>
          <span className="font-semibold">{historySaveProgress}</span>{" "}
          {i18n("history_success")}
        </p>
        <p>
          {historySaveErrors.length} {i18n("history_fail")}
        </p>
        {historySaveErrors.length > 0 && (
          <Disclosure
            title={i18n("history_viewErrors")}
            className="w-full font-semibold text-center">
            <div className="flex flex-col h-36 overflow-y-scroll">
              {historySaveErrors.map((err) => (
                <div className="w-full">
                  <a className="link" href={err.url} target="_blank">
                    {err.title}
                  </a>
                  <p className="text-red-500">{err.message}</p>
                </div>
              ))}
            </div>
          </Disclosure>
        )}
      </div>
    )

  return (
    <div>
      <p>{i18n("history_dontClose")}</p>
      <p className="font-semibold">
        {`${historySaveProgress}/${historyLength} ${i18n("history_progress")}`}
      </p>
    </div>
  )
}

export default HistorySavePopup
