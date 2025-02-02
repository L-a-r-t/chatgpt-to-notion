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
      "https://chat.deepseek.com/api/v0/chat/history_messages?chat_session_id=" +
        convId,
      {
        method: "GET",
        headers: headers,
        credentials: "include"
      }
    )
    const data = await res.json()

    return data as Conversation
  } catch (err) {
    console.error(err)

    return null
  }
}
