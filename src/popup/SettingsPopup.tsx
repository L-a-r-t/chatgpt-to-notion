import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import useDebounce from "~hooks/useDebounce"
import { formatDB, getDBTagsProperties, getIcon } from "~utils/functions/notion"
import type { PopupEnum, StoredDatabase } from "~utils/types"

import "~styles.css"

import Spinner from "~common/components/Spinner"
import GearIcon from "~common/gear"
import RefreshIcon from "~common/refresh"
import { i18n } from "~utils/functions"

function SettingsPopup() {
  const [query, setQuery] = useState("")
  const [popup, setPopup] = useStorage<PopupEnum>("popup", "settings")
  const [fetching, setFetching] = useState(false)
  const [results, setResults] = useState<{
    databases: DatabaseObjectResponse[]
  } | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)

  const [selectedDB, setSelectedDB] = useStorage("selectedDB", 0)
  const [databases, setDatabases] = useStorage<StoredDatabase[]>(
    "databases",
    []
  )

  const [authenticated] = useStorage("authenticated", false)

  const refreshSearch = useDebounce(
    async () => {
      setDbError(null)
      setFetching(true)
      const response = await chrome.runtime.sendMessage({
        type: "search",
        body: {
          query
        }
      })
      console.log(response)
      setFetching(false)
      if (response.status && [401, 403].includes(response.status)) {
        setDbError(i18n("settings_errUnauthorized"))
        return
      }
      setResults(response)
    },
    600,
    [query]
  )

  const handleSelect = async (db: DatabaseObjectResponse) => {
    setDbError((prev) => null)
    if (databases.map((d) => d.id).includes(db.id)) return
    const formattedDB = formatDB(db)
    if (!formattedDB) {
      setDbError(i18n("settings_noUrlProperty"))
      return
    }
    await setDatabases([...databases, formattedDB])
  }

  const handleSettings = async (i: number) => {
    await setSelectedDB(i)
    setPopup("dbsettings")
  }

  return (
    <>
      <h3 className="text-lg font-bold">
        {databases.length === 0
          ? i18n("settings_noLinkedDb")
          : i18n("settings_linkedDatabases")}
      </h3>
      {databases.length === 0 && (
        <a
          className="link text-sm"
          href="https://theo-lartigau.notion.site/4f096cd095aa422e9ee854c468e737d1?v=f257b6af4eb842428f7b7c413de08b95"
          target="_blank">
          {i18n("settings_exampleDB")}
        </a>
      )}
      {databases.map((db, i) => (
        <div key={db.id} className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            {db.icon && getIcon(db.icon)}
            <p className="font-bold">{db.title}</p>
          </div>
          <button onClick={() => handleSettings(i)}>
            <GearIcon />
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
          {dbError && <p className="text-red-500 text-sm">{dbError}</p>}
          {results && results.databases.length > 0 ? (
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
                      {getIcon(database?.icon ?? null)}
                      {database.title[0]?.plain_text ?? "..."}
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
          ) : (
            !fetching && (
              <>
                {!dbError && (
                  <p className="mt-1 text-sm">{i18n("settings_noDBFound")}</p>
                )}
                <a
                  className="link text-sm"
                  href="https://theo-lartigau.notion.site/FAQ-50befa31f01a495b9d634e3f575dd4ba"
                  target="_blank">
                  {i18n("about_FAQ")}
                </a>
              </>
            )
          )}
        </>
      )}
    </>
  )
}

export default SettingsPopup
