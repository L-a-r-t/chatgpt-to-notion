import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import useDebounce from "~hooks/useDebounce"
import { getIcon } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

import "~styles.css"

import Spinner from "~common/components/Spinner"
import RefreshIcon from "~common/refresh"
import { i18n } from "~utils/functions"

function SettingsPopup() {
  const [query, setQuery] = useState("")
  const [fetching, setFetching] = useState(false)
  const [results, setResults] = useState<{
    databases: DatabaseObjectResponse[]
  } | null>(null)

  const [selectedDB, setSelectedDB] = useStorage("selectedDB", 0)
  const [databases, setDatabases] = useStorage<StoredDatabase[]>(
    "databases",
    []
  )

  const [authenticated] = useStorage("authenticated", false)

  const refreshSearch = useDebounce(
    async () => {
      setFetching(true)
      const response = await chrome.runtime.sendMessage({
        type: "search",
        body: {
          query
        }
      })
      setFetching(false)
      setResults(response)
    },
    600,
    [query]
  )

  const handleSelect = async (db: DatabaseObjectResponse) => {
    if (databases.map((d) => d.id).includes(db.id)) return
    const titleID = Object.values(db.properties).filter(
      (val) => val.type === "title"
    )[0].id
    const urlID = Object.values(db.properties).filter(
      (val) => val.type === "url"
    )[0].id
    await setDatabases([
      ...databases,
      {
        id: db.id,
        title: db.title[0].plain_text,
        icon: db.icon ?? null,
        properties: {
          title: titleID,
          url: urlID
        }
      }
    ])
  }

  const handleRemove = async (db: StoredDatabase) => {
    await setDatabases(databases.filter((d) => d.id !== db.id))
    setSelectedDB(0)
  }

  return (
    <>
      <h3 className="text-lg font-bold">
        {databases.length === 0
          ? i18n("settings_noLinkedDb")
          : i18n("settings_linkedDatabases")}
      </h3>
      {databases.map((db) => (
        <div key={db.id} className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            {db.icon && getIcon(db.icon)}
            <p className="font-bold">{db.title}</p>
          </div>
          <button onClick={() => handleRemove(db)}>
            {i18n("settings_remove")}
          </button>
        </div>
      ))}
      {!authenticated && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <p>{i18n("authenticating")}</p>
          <div>
            <Spinner small />
          </div>
        </div>
      )}
      {authenticated && (
        <>
          <div className="relative mt-3">
            <input
              name="search"
              className="input pr-7"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={i18n("settings_searchPlaceholder")}
            />
            {fetching && (
              <div className="absolute inset-y-0 right-2 flex justify-center items-center">
                <Spinner small />
              </div>
            )}
            {!fetching && (
              <div className="absolute inset-y-0 right-2 flex justify-center items-center">
                <button onClick={refreshSearch}>
                  <RefreshIcon />
                </button>
              </div>
            )}
          </div>
          {fetching && <p>{i18n("settings_slowSearch")}</p>}
          {results && (
            <div className="mt-1">
              {/* <h3 className="text-lg font-bold">Databases</h3> */}
              {results.databases.reduce((acc, database) => {
                if (databases.map((d) => d.id).includes(database.id)) return acc
                return [
                  ...acc,
                  <div key={database.id}>
                    <button
                      className="flex gap-1 items-center w-full hover:bg-gray-200"
                      onClick={() => handleSelect(database)}>
                      {getIcon(database.icon)}
                      {database.title[0].plain_text}
                    </button>
                  </div>
                ]
              }, [] as JSX.Element[])}
              {/* <h3 className="text-lg font-bold">Pages</h3>
              {results.pages.reduce((acc, page) => {
                const title = (getProperty(page, "title", "title") ??
                  getProperty(page, "Name", "title"))[0]?.plain_text
                if (!title) return acc
                return [
                  ...acc,
                  <div key={page.id}>
                    <button className="flex gap-1 items-center">
                      {getIcon(page.icon)}
                      {title}
                    </button>
                  </div>
                ]
              }, [] as JSX.Element[])} */}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default SettingsPopup
