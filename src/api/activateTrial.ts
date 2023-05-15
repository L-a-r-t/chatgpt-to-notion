import { Storage } from "@plasmohq/storage"

export const activateTrial = async () => {
  try {
    const storage = new Storage()
    const workspace_id = await storage.get("workspace_id")
    const user_id = await storage.get("user_id")

    const response = await fetch(
      "https://chatgpt-to-notion.onrender.com/premium/get-trial",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspace_id,
          user_id
        })
      }
    )
    const res = await response.json()
    return res
  } catch (err) {
    console.error(err)
    throw err
  }
}
