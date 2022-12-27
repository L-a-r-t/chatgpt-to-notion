import { useStorage } from "@plasmohq/storage/hook"

import type { StoredDatabase } from "~utils/types"

import "~styles.css"

import { useState } from "react"

import { saveChat } from "~api/saveChat"
import DropdownPopup from "~common/components/Dropdown"
import Spinner from "~common/components/Spinner"

function IndexPopup() {
  const [selectedDB, setSelectedDB] = useStorage<number>("selectedDB", 0)
  const [databases, setDatabases] = useStorage<StoredDatabase[]>(
    "databases",
    []
  )

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    const currentTab = tabs[0]
    const chat = await chrome.tabs.sendMessage(currentTab.id, {
      type: "fetchFullChat"
    })
    const database_id = databases[selectedDB].id
    const req = {
      ...chat,
      database_id
    }
    await saveChat(req)
    setSuccess(true)
    setLoading(false)
  }

  return !databases || databases.length == 0 ? (
    <p>Please register a database in the settings</p>
  ) : (
    <>
      <div className="flex justify-between items-center mb-3">
        <p className="font-bold">Save to :</p>
        <DropdownPopup
          className="px-1 border border-main rounded"
          position="up"
          items={databases.map((db, index) => (
            <button key={db.id} onClick={() => setSelectedDB(index)}>
              {db.title}
            </button>
          ))}>
          {databases[selectedDB]?.title}
        </DropdownPopup>
      </div>
      <button
        disabled={loading || success}
        className="button disabled:bg-main"
        onClick={handleSave}>
        {success ? "Discussion saved!" : "Save full chat"}{" "}
        {loading && <Spinner white small />}
      </button>
    </>
  )
}

export default IndexPopup
