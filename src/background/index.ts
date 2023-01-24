import { Storage } from "@plasmohq/storage"

import { generateToken } from "~api/generateToken"
import { getDatabase } from "~api/getDatabase"
import { getToken } from "~api/getToken"
import { saveAnswer } from "~api/saveAnswer"
import { searchNotion } from "~api/search"
import { formatDB } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

// API calls that can be made from content scripts transit trough the background script
// This is done to prevent CORS errors
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "search":
      searchNotion(message.body.query).then((res) => {
        sendResponse(res)
      })
      break
    case "saveAnswer":
      saveAnswer(message.body).then((res) => {
        sendResponse(res)
      })
      break
    case "generateToken":
      // using two means of checking if user is logged in just to be sure
      const session = new Storage({
        area: "session",
        secretKeyList: ["token"]
      })
      session.get("token").then((token) => {
        if (token) return
        generateToken(message.body.code).then((res) => {
          sendResponse(res)
        })
      })
      break
    case "getDB":
      getDatabase(message.body.id).then((res) => {
        sendResponse(res)
      })
      break
    default:
      return true
  }
  return true
})

const authenticate = async () => {
  const session = new Storage({
    area: "session",
    secretKeyList: ["token"]
  })
  const storage = new Storage()
  await storage.set("authenticated", false)
  const _token = await session.get("token")
  if (_token) {
    console.log("token already exists")
    await storage.set("authenticated", true)
    return true
  }
  // await session.set("token", null)
  // await storage.set("workspace_id", null)
  // await storage.set("user_id", null)
  // return
  const [workspace_id, user_id] = await Promise.all([
    storage.get("workspace_id"),
    storage.get("user_id")
  ])
  if (!workspace_id || !user_id) {
    console.log("no ids found")
    return false
  }
  const token = await getToken({
    workspace_id,
    user_id
  })
  await session.set("token", token)
  await storage.set("authenticated", true)
  console.log("authenticated")
  return true
}

const refreshIcons = async () => {
  const storage = new Storage()
  const databases = await storage.get<StoredDatabase[]>("databases")
  if (!databases) return
  for (let i = 0; i < databases.length; i++) {
    const icon = databases[i].icon
    if (!icon) continue
    if (icon.type === "file") {
      const expiryTime = icon.file.expiry_time
      if (new Date(expiryTime).getTime() < Date.now()) {
        console.log("refreshing icon for", databases[i].title)
        const db = await getDatabase(databases[i].id)
        databases[i].icon = db.icon
        await storage.set("databases", databases)
      }
    }
  }
}

const refreshDatabases = async () => {
  console.log("refreshing databases")
  const storage = new Storage()
  const databases = await storage.get<StoredDatabase[]>("databases")
  if (!databases) return

  const apiCalls = databases.map((db) => getDatabase(db.id))
  const fullDatabases = await Promise.all(apiCalls)

  let refreshedDatabases: StoredDatabase[] = []
  for (let i = 0; i < fullDatabases.length; i++) {
    const db = fullDatabases[i]
    if (!db) continue
    const formattedDB = formatDB(db)
    if (!formattedDB) continue
    refreshedDatabases.push(formattedDB)
  }

  const selectedDB = await storage.get<number>("selectedDB")
  if (!!selectedDB && selectedDB >= refreshedDatabases.length) {
    await storage.set("selectedDB", 0)
  }
  await storage.set("databases", refreshedDatabases)
  await storage.set("refreshed", true)
}

const main = async () => {
  const authenticated = await authenticate()
  if (!authenticated) return
  await refreshDatabases()
  refreshIcons()
}

main()

export default {}
