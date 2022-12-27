import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import useDebounce from "~hooks/useDebounce"
import { getIcon } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

import "~styles.css"

import type { IconResponse } from "~utils/types/notion"

function SettingsPopup() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{
    databases: DatabaseObjectResponse[]
  } | null>(null)

  const [selectedDB, setSelectedDB] = useStorage("selectedDB", 0)
  const [databases, setDatabases] = useStorage<StoredDatabase[]>(
    "databases",
    []
  )
  const [mirroredDBs, setMirroredDBs] = useState<{
    [id: string]: IconResponse
  }>({})

  useDebounce(
    async () => {
      const response = await chrome.runtime.sendMessage({
        type: "search",
        body: {
          query
        }
      })
      setResults(response)
    },
    500,
    [query]
  )

  const handleSelect = async (db: DatabaseObjectResponse) => {
    if (databases.map((d) => d.id).includes(db.id)) return
    await setDatabases([
      ...databases,
      {
        id: db.id,
        title: db.title[0].plain_text,
        icon: db.icon ?? null
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
        {databases.length === 0 ? "No linked DB" : "Linked Databases"}
      </h3>
      {databases.map((db) => (
        <div key={db.id} className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            {db.icon && getIcon(db.icon)}
            <p className="font-bold">{db.title}</p>
          </div>
          <button onClick={() => handleRemove(db)}>Remove</button>
        </div>
      ))}
      <input
        name="search"
        className="input mt-3"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search DB title"
      />
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
  )
}

export default SettingsPopup
