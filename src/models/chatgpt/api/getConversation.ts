import type { Conversation } from "~utils/types"

export const getConversation = async ({
  convId,
  headers
}: {
  convId: string
  headers: any
}) => {
  try {
    const res = await fetch(
      "https://chatgpt.com/backend-api/conversation/" + convId,
      {
        method: "GET",
        headers: headers,
        credentials: "include"
      }
    )
    const data = await res.json()

    return data as Conversation["chatgpt"]
  } catch (err) {
    console.error(err)

    return null
  }
}
