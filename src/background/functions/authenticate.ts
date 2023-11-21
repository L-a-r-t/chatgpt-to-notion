import { Storage } from "@plasmohq/storage"

import { getToken } from "~api/getToken"
import { STORAGE_KEYS } from "~utils/consts"

const authenticate = async () => {
  const session = new Storage({
    area: "session",
    secretKeyList: ["token"]
  })
  const storage = new Storage()
  await storage.set(STORAGE_KEYS.authenticated, false)
  const _token = await session.get(STORAGE_KEYS.token)
  if (_token) {
    console.log("token already exists")
    await storage.set(STORAGE_KEYS.authenticated, true)
    return true
  }
  // await session.set("token", null)
  // await storage.set("workspace_id", null)
  // await storage.set("user_id", null)
  // return
  const [workspace_id, user_id] = await Promise.all([
    storage.get(STORAGE_KEYS.workspace_id),
    storage.get(STORAGE_KEYS.user_id)
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
    session.set(STORAGE_KEYS.token, token),
    storage.set(STORAGE_KEYS.isPremium, isPremium),
    storage.set(STORAGE_KEYS.activeTrial, activeTrial && trial_end),
    storage.set(STORAGE_KEYS.trialEnd, trial_end ?? 0),
    storage.set(STORAGE_KEYS.authenticated, true)
  ])
  console.log("authenticated")
  return true
}

export default authenticate
