import { Storage } from "@plasmohq/storage"

import { getToken } from "~api/getToken"

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
  const { token, isPremium, activeTrial, trial_end } = await getToken({
    workspace_id,
    user_id
  })
  await Promise.all([
    session.set("token", token),
    storage.set("isPremium", isPremium),
    storage.set("activeTrial", activeTrial && trial_end),
    storage.set("trialEnd", trial_end ?? 0),
    storage.set("authenticated", true)
  ])
  console.log("authenticated")
  return true
}

export default authenticate
