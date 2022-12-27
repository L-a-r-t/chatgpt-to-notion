import { Storage } from "@plasmohq/storage"

import { generateToken } from "~api/generateToken"
import { getToken } from "~api/getToken"
import { saveAnswer } from "~api/saveAnswer"
import { searchNotion } from "~api/search"

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
      generateToken(message.body.code).then((res) => {
        sendResponse(res)
      })
      break
    default:
      return true
  }
  return true
})

const authenticate = async () => {
  const storage = new Storage({
    secretKeyList: ["token"]
  })
  const [workspace_id, user_id] = await Promise.all([
    storage.get("workspace_id"),
    storage.get("user_id")
  ])
  const token = await getToken({
    workspace_id,
    user_id
  })
  await storage.set("token", token)
}

authenticate()

export default {}
