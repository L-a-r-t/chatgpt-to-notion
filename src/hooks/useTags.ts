import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import type { StoredDatabase } from "~utils/types"
import type { SelectPropertyResponse } from "~utils/types/notion"

const useTags = () => {
  const [selectedDB, setSelectedDB] = useStorage<number>("selectedDB", 0)
  const [databases, setDatabases] = useStorage<StoredDatabase[]>(
    "databases",
    []
  )

  const [db, setCurrentDB] = useState<StoredDatabase>(null)
  const [tagProp, setCurrentTagProp] = useState<{
    options: SelectPropertyResponse[]
    name: string
    id: string
    type: "select" | "multi_select"
  }>(null)
  const [tag, setCurrentTag] = useState<SelectPropertyResponse>(null)

  useEffect(() => {
    if (!databases || databases.length == 0) return

    const _db = databases[selectedDB]
    setCurrentDB(_db)

    if (!_db.tags || _db.tags.length == 0) return
    setCurrentTagProp(_db.tags[_db.tagPropertyIndex])

    if (_db.tagIndex === -1) {
      setCurrentTag(null)
      return
    }
    setCurrentTag(_db.tags[_db.tagPropertyIndex].options[_db.tagIndex])
  }, [databases, selectedDB])

  const selectTagProp = (index: number) => {
    setDatabases((prev) => {
      const newDbs = [...prev]
      newDbs[selectedDB].tagPropertyIndex = index
      newDbs[selectedDB].tagIndex = 0
      return newDbs
    })
  }

  const selectTag = (index: number) => {
    setDatabases((prev) => {
      const newDatabases = [...prev]
      newDatabases[selectedDB].tagIndex = index
      return newDatabases
    })
  }

  return {
    db,
    tag,
    tagProp,
    selectTagProp,
    selectTag
  }
}

export default useTags
