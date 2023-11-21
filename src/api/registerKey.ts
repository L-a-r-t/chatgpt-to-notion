import { Storage } from "@plasmohq/storage"

import { STORAGE_KEYS } from "~utils/consts"

export const registerKey = async (license_key: string) => {
  try {
    const storage = new Storage()
    const workspace_id = await storage.get(STORAGE_KEYS.workspace_id)
    const user_id = await storage.get(STORAGE_KEYS.user_id)

    const response = await fetch(
      "https://chatgpt-to-notion.onrender.com/premium/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspace_id,
          user_id,
          license_key
        })
      }
    )
    const res = await response.json()
    return res
  } catch (err) {
    console.error(err)
  }
}
