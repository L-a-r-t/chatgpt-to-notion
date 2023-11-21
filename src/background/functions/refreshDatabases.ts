import { Storage } from "@plasmohq/storage"

import { getDatabase } from "~api/getDatabase"
import { STORAGE_KEYS } from "~utils/consts"
import { formatDB } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

const refreshDatabases = async () => {
  console.log("refreshing databases")
  const storage = new Storage()
  const databases = await storage.get<StoredDatabase[]>(STORAGE_KEYS.databases)
  if (!databases) return

  const apiCalls = databases.filter((db) => db).map((db) => getDatabase(db.id))
  const fullDatabases = await Promise.all(apiCalls)

  let refreshedDatabases: StoredDatabase[] = []
  for (let i = 0; i < fullDatabases.length; i++) {
    const db = fullDatabases[i]
    if (!db) continue
    const formattedDB = formatDB(db)
    if (!formattedDB) continue
    refreshedDatabases.push(formattedDB)
  }

  const selectedDB = await storage.get<number>(STORAGE_KEYS.selectedDB)
  if (!!selectedDB && selectedDB >= refreshedDatabases.length) {
    await storage.set(STORAGE_KEYS.selectedDB, 0)
  }
  await storage.set(STORAGE_KEYS.databases, refreshedDatabases)
  await storage.set(STORAGE_KEYS.refreshed, true)
}

export default refreshDatabases
