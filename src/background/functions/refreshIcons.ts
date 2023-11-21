import { Storage } from "@plasmohq/storage"

import { getDatabase } from "~api/getDatabase"
import { STORAGE_KEYS } from "~utils/consts"
import type { StoredDatabase } from "~utils/types"

const refreshIcons = async () => {
  const storage = new Storage()
  const databases = await storage.get<StoredDatabase[]>(STORAGE_KEYS.databases)
  if (!databases) return
  for (let i = 0; i < databases.length; i++) {
    const icon = databases[i].icon
    if (!icon) continue
    if (icon.type === "file") {
      const expiryTime = icon.file.expiry_time
      if (new Date(expiryTime).getTime() < Date.now()) {
        console.log("refreshing icon for", databases[i].title)
        const db = await getDatabase(databases[i].id)
        if (!db) continue
        databases[i].icon = db.icon
        await storage.set(STORAGE_KEYS.databases, databases)
      }
    }
  }
}

export default refreshIcons
