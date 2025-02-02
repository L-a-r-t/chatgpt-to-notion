import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import DropdownPopup from "~common/components/Dropdown"
import Spinner from "~common/components/Spinner"
import RefreshIcon from "~common/refresh"
import TrashIcon from "~common/trash"
import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"
import { formatDB, getIcon, getTagColor } from "~utils/functions/notion"
import type { PopupEnum, StoredDatabase } from "~utils/types"
import type { Property, SelectPropertyResponse } from "~utils/types/notion"

function DatabaseSettingsPopup() {
  const [popup, setPopup] = useStorage<PopupEnum>(
    STORAGE_KEYS.popup,
    "dbsettings"
  )
  const [databases, setDatabases] = useStorage<StoredDatabase[]>(
    STORAGE_KEYS.databases,
    []
  )
  const [selectedDB, setSelectedDB] = useStorage<number>(
    STORAGE_KEYS.selectedDB,
    0
  )
  const [db, setCurrentDB] = useState<StoredDatabase | null>(null)
  const [currentProp, setCurrentProp] = useState<{
    options: SelectPropertyResponse[]
    name: string
    id: string
    type: "select" | "multi_select"
  } | null>(null)

  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!databases || databases.length == 0 || !databases[selectedDB]) return
    setCurrentDB(databases[selectedDB])
    if (databases[selectedDB].tags.length == 0) return
    setCurrentProp(
      databases[selectedDB].tags[databases[selectedDB].tagPropertyIndex]
    )
  }, [databases, selectedDB])

  const refreshDatabase = async () => {
    setRefreshing(true)
    const db: DatabaseObjectResponse = await sendToBackground({
      name: "getDB",
      body: {
        id: databases[selectedDB].id
      }
    })
    await setDatabases((prev) =>
      prev
        ? [
            ...prev.slice(0, selectedDB),
            formatDB(db)!,
            ...prev.slice(selectedDB + 1)
          ]
        : [formatDB(db)!]
    )
    setRefreshing(false)
  }

  const selectTagProp = (index: number) => {
    setDatabases((prev) => {
      if (!prev) return []
      const newDbs = [...prev]
      newDbs[selectedDB].tagPropertyIndex = index
      newDbs[selectedDB].tagIndex = -1
      return newDbs
    })
  }

  const getTagStyle = (tag: SelectPropertyResponse) => {
    return `text-xs font-semibold ${getTagColor(tag)} rounded-full py-1 px-2`
  }

  const handleRemove = async () => {
    const db = databases[selectedDB]
    await setDatabases(databases.filter((d) => d.id !== db.id))
    setSelectedDB(0)
    setPopup("settings")
  }

  return (
    <>
      {!db || refreshing ? (
        <span className="flex flex-row items-center gap-4">
          <Spinner small />
          <span>{i18n("dbsettings_loading")}</span>
        </span>
      ) : (
        <>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-2 items-center">
              {getIcon(db.icon)}
              <h2 className="text-lg font-bold">{db.title}</h2>
            </div>
            <div className="flex flex-row gap-2">
              <button onClick={refreshDatabase}>
                <RefreshIcon />
              </button>
              <button onClick={handleRemove}>
                <TrashIcon />
              </button>
            </div>
          </div>
          {db.tags.length == 0 ? (
            <p>{i18n("dbsettings_noTags")}</p>
          ) : (
            <>
              <h3 className="font-semibold my-2">
                {i18n("dbsettings_tagsProperty")}
              </h3>
              <DropdownPopup
                className="px-1 border border-main rounded min-w-[4rem]"
                position="up"
                items={db.tags.map((tag, index) => (
                  <button
                    className="py-1 px-3"
                    key={tag.id}
                    onClick={() => selectTagProp(index)}>
                    {tag.name}
                  </button>
                ))}>
                {currentProp?.name}
              </DropdownPopup>
              <h3 className="font-semibold my-2">{i18n("dbsettings_tags")}</h3>
              {currentProp && (
                <>
                  {currentProp.options.length == 0 && (
                    <p className="text-sm mb-4">
                      {i18n("dbsettings_noOptions")}
                    </p>
                  )}
                  <div className="flex flex-row gap-1 flex-wrap">
                    {currentProp.options.map((tag) => (
                      <span key={tag.id} className={getTagStyle(tag)}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <p className="text-xs text-center">
                {i18n("dbsettings_explainer")}
              </p>
            </>
          )}
        </>
      )}
    </>
  )
}

export default DatabaseSettingsPopup
