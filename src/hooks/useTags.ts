import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { STORAGE_KEYS } from "~utils/consts"
import type { StoredDatabase } from "~utils/types"
import type { SelectPropertyResponse } from "~utils/types/notion"

const useTags = () => {
  const [selectedDB, setSelectedDB] = useStorage<number>(
    STORAGE_KEYS.selectedDB,
    0
  )
  const [databases, setDatabases] = useStorage<StoredDatabase[]>(
    STORAGE_KEYS.databases,
    []
  )

  const [db, setCurrentDB] = useState<StoredDatabase | null>(null)
  const [tagProp, setCurrentTagProp] = useState<{
    options: SelectPropertyResponse[]
    name: string
    id: string
    type: "select" | "multi_select"
  } | null>(null)
  const [tag, setCurrentTag] = useState<SelectPropertyResponse | null>(null)

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
      if (!prev) return []
      const newDbs = [...prev]
      newDbs[selectedDB].tagPropertyIndex = index
      newDbs[selectedDB].tagIndex = -1
      return newDbs
    })
  }

  const selectTag = (index: number) => {
    setDatabases((prev) => {
      if (!prev) return []
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
