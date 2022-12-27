import { useEffect, useState } from "react"
import { decompress } from "shrink-string"

import { useStorage } from "@plasmohq/storage/hook"

import type { StoredDatabase, ToBeSaved } from "~utils/types"

import "~styles.css"

import DropdownPopup from "~common/components/Dropdown"
import Spinner from "~common/components/Spinner"

export default function SavePopup() {
  const [showPopup, setShowPopup] = useStorage<boolean>("showPopup")
  const [toBeSaved, setToBeSaved] = useStorage<ToBeSaved>("toBeSaved")
  const [databases] = useStorage<StoredDatabase[]>("databases", [])
  const [selectedDB, setSelectedDB] = useStorage<number>("selectedDB", 0)

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

  const save = async (id: string) => {
    if (!toBeSaved) return
    setLoading(true)
    await chrome.runtime.sendMessage({
      type: "saveAnswer",
      body: {
        database_id: id,
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

  return (
    <>
      <h4 className="font-bold">Page title</h4>
      <p className="text-xs">{toBeSaved.title}</p>
      <h4 className="font-bold">Prompt</h4>
      <p className="text-xs">
        {prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt}
      </p>
      <h4 className="font-bold">Answer</h4>
      <p className="text-xs">
        {answer.length > 80
          ? answer.replace(/(<.+?>)/g, "").substring(0, 80) + "..."
          : answer}
      </p>
      <div className="flex justify-between items-center my-3">
        <p className="font-bold">Save to :</p>
        <DropdownPopup
          className="px-1 border border-main rounded"
          position="up"
          items={databases.map((db, index) => (
            <button key={db.id} onClick={() => setSelectedDB(index)}>
              {db.title}
            </button>
          ))}>
          {databases[selectedDB].title}
        </DropdownPopup>
      </div>
      <button
        disabled={loading || success}
        className="button w-full disabled:bg-main"
        onClick={() => save(databases[selectedDB].id)}>
        {success ? "Saved!" : "Save"} {loading && <Spinner white small />}
      </button>
    </>
  )
}
